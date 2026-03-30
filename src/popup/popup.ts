import type { ExtractResponse, DownloadRequest } from '../types/messages';

const btnDownload = document.getElementById('btn-download') as HTMLButtonElement;
const btnCopy = document.getElementById('btn-copy') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;
const chkDownloadImages = document.getElementById(
  'chk-download-images'
) as HTMLInputElement;
const chkMetadata = document.getElementById(
  'chk-include-metadata'
) as HTMLInputElement;

// ─── Settings Persistence ───────────────────────────────────────────

const SETTINGS_KEY = 'tweet2md_settings';

interface Settings {
  downloadImages: boolean;
  includeMetadata: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  downloadImages: false,
  includeMetadata: true, // on by default
};

async function loadSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    chrome.storage.local.get(SETTINGS_KEY, (result) => {
      const saved = result[SETTINGS_KEY] as Partial<Settings> | undefined;
      resolve({ ...DEFAULT_SETTINGS, ...saved });
    });
  });
}

function saveSettings(settings: Settings): void {
  chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

// Restore toggle states on popup open
loadSettings().then((settings) => {
  chkDownloadImages.checked = settings.downloadImages;
  chkMetadata.checked = settings.includeMetadata;
});

// Persist on change
chkDownloadImages.addEventListener('change', () => {
  saveSettings({
    downloadImages: chkDownloadImages.checked,
    includeMetadata: chkMetadata.checked,
  });
});
chkMetadata.addEventListener('change', () => {
  saveSettings({
    downloadImages: chkDownloadImages.checked,
    includeMetadata: chkMetadata.checked,
  });
});

// ─── Helpers ────────────────────────────────────────────────────────

function showStatus(
  message: string,
  type: 'success' | 'error' | 'info'
): void {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;

  // Auto-hide success messages after 3 seconds
  if (type === 'success') {
    setTimeout(() => {
      statusEl.className = 'status hidden';
    }, 3000);
  }
}

function setLoading(loading: boolean): void {
  btnDownload.disabled = loading;
  btnCopy.disabled = loading;
  btnDownload.classList.toggle('loading', loading);
  btnCopy.classList.toggle('loading', loading);
  const dlLabel = btnDownload.querySelector('.btn-label');
  const cpLabel = btnCopy.querySelector('.btn-label');
  if (dlLabel) dlLabel.textContent = loading ? 'Extracting…' : 'Download .md';
  if (cpLabel) cpLabel.textContent = loading ? 'Extracting…' : 'Copy .md';
}

function buildFilename(data: ExtractResponse['data']): string {
  if (!data) return 'tweet.md';

  const handle = data.author.handle.replace('@', '');
  const id = data.tweetId;

  if (data.type === 'article' && data.title) {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
    return `${handle}-${slug}.md`;
  }

  return `${handle}-${id}.md`;
}

/**
 * Strip the trailing "> Source: …\n> Date: …" footer block from markdown.
 */
function stripSourceFooter(md: string): string {
  return md.replace(/\n+---\n+> Source:.*\n> Date:.*$/s, '');
}

// ─── Shared Extraction ──────────────────────────────────────────────

interface ExtractionResult {
  markdown: string;
  filename: string;
  type: string;
  images: { url: string; filename: string }[];
}

async function extractMarkdown(): Promise<ExtractionResult> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab?.id) {
    throw new Error('Unable to access the current tab.');
  }

  const url = tab.url || '';
  if (!url.includes('x.com/') && !url.includes('twitter.com/')) {
    throw new Error('Navigate to a tweet or article on X.com first.');
  }

  if (!url.includes('/status/')) {
    throw new Error(
      'Open a specific tweet or article page (with /status/ in the URL).'
    );
  }

  const includeMetadata = chkMetadata.checked;
  const isDownloadLocal = chkDownloadImages.checked;

  const response: ExtractResponse = await chrome.tabs.sendMessage(tab.id, {
    action: 'EXTRACT',
    includeMetadata,
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to extract content.');
  }

  const baseFilename = buildFilename(response.data);
  let finalMarkdown = response.data.markdown;

  if (includeMetadata) {
    finalMarkdown = stripSourceFooter(finalMarkdown);

    const m = response.data.metadata;
    const lines = ['---'];
    lines.push(`author: "${response.data.author.name}"`);
    lines.push(`handle: "${response.data.author.handle}"`);
    lines.push(`source: "${response.data.sourceUrl}"`);
    lines.push(`date: ${response.data.date}`);
    lines.push(`type: ${response.data.type}`);
    if (m) {
      if (m.likes !== undefined) lines.push(`likes: ${m.likes}`);
      if (m.reposts !== undefined) lines.push(`reposts: ${m.reposts}`);
      if (m.replies !== undefined) lines.push(`replies: ${m.replies}`);
      if (m.bookmarks !== undefined) lines.push(`bookmarks: ${m.bookmarks}`);
      if (m.views !== undefined) lines.push(`views: ${m.views}`);
    }
    lines.push('---', '');
    finalMarkdown = lines.join('\n') + finalMarkdown;
  }

  const imagesToDownload: { url: string; filename: string }[] = [];

  if (isDownloadLocal) {
    const dirName = baseFilename.replace('.md', '');

    finalMarkdown = finalMarkdown.replace(
      /!\[(.*?)\]\((https:\/\/[^)]+)\)/g,
      (match, alt, imgUrl) => {
        try {
          const urlObj = new URL(imgUrl);
          let fname = urlObj.pathname.split('/').pop() || 'image';

          const formatMatch = imgUrl.match(/format=([a-zA-Z0-9]+)/);
          if (formatMatch && !fname.includes('.')) {
            fname += `.${formatMatch[1]}`;
          }

          if (!fname.includes('.')) {
            fname += '.jpg';
          }

          fname = fname.replace(/[^a-zA-Z0-9_.-]/g, '_');
          const localPath = `${dirName}/${fname}`;

          if (!imagesToDownload.find((i) => i.url === imgUrl)) {
            imagesToDownload.push({ url: imgUrl, filename: localPath });
          }

          return `![${alt}](${localPath})`;
        } catch (e) {
          return match;
        }
      }
    );
  }

  return {
    markdown: finalMarkdown,
    filename: baseFilename,
    type: response.data.type,
    images: imagesToDownload,
  };
}

function handleExtractionError(err: unknown): void {
  const message =
    err instanceof Error ? err.message : 'An unexpected error occurred.';

  if (message.includes('Receiving end does not exist')) {
    showStatus('Reload the page and try again.', 'error');
  } else {
    showStatus(message, 'error');
  }
  setLoading(false);
}

// ─── Download Flow ──────────────────────────────────────────────────

btnDownload.addEventListener('click', async () => {
  setLoading(true);
  statusEl.className = 'status hidden';

  try {
    const result = await extractMarkdown();

    const downloadMsg: DownloadRequest = {
      action: 'DOWNLOAD_MD',
      content: result.markdown,
      filename: result.filename,
      images: result.images.length > 0 ? result.images : undefined,
    };

    chrome.runtime.sendMessage(downloadMsg, (downloadResponse) => {
      if (chrome.runtime.lastError || !downloadResponse?.success) {
        showStatus(downloadResponse?.error || 'Download failed.', 'error');
      } else {
        const typeLabels: Record<string, string> = {
          article: 'Article downloaded!',
          thread: 'Thread downloaded!',
          tweet: 'Tweet downloaded!',
        };
        const label = typeLabels[result.type] || 'Downloaded!';
        showStatus(`✓ ${label}`, 'success');
      }
      setLoading(false);
    });
  } catch (err) {
    handleExtractionError(err);
  }
});

// ─── Copy Flow ──────────────────────────────────────────────────────

btnCopy.addEventListener('click', async () => {
  setLoading(true);
  statusEl.className = 'status hidden';

  try {
    const result = await extractMarkdown();

    await navigator.clipboard.writeText(result.markdown);

    const typeLabels: Record<string, string> = {
      article: 'Article copied!',
      thread: 'Thread copied!',
      tweet: 'Tweet copied!',
    };
    const label = typeLabels[result.type] || 'Copied!';
    showStatus(`✓ ${label}`, 'success');
    setLoading(false);
  } catch (err) {
    handleExtractionError(err);
  }
});
