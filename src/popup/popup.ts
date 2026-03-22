import type { ExtractResponse, DownloadRequest } from '../types/messages';

const btnDownload = document.getElementById('btn-download') as HTMLButtonElement;
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
  btnDownload.classList.toggle('loading', loading);
  const label = btnDownload.querySelector('.btn-label');
  if (label) {
    label.textContent = loading ? 'Extracting…' : 'Download .md';
  }
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

// ─── Main Flow ──────────────────────────────────────────────────────

btnDownload.addEventListener('click', async () => {
  setLoading(true);
  statusEl.className = 'status hidden';

  try {
    // 1. Get the active tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) {
      showStatus('Unable to access the current tab.', 'error');
      setLoading(false);
      return;
    }

    // Verify URL is X.com or Twitter
    const url = tab.url || '';
    if (
      !url.includes('x.com/') &&
      !url.includes('twitter.com/')
    ) {
      showStatus(
        'Navigate to a tweet or article on X.com first.',
        'error'
      );
      setLoading(false);
      return;
    }

    if (!url.includes('/status/')) {
      showStatus(
        'Open a specific tweet or article page (with /status/ in the URL).',
        'error'
      );
      setLoading(false);
      return;
    }

    const includeMetadata = chkMetadata.checked;
    const isDownloadLocal = chkDownloadImages.checked;

    // 2. Send extraction request to content script
    const response: ExtractResponse = await chrome.tabs.sendMessage(
      tab.id,
      { action: 'EXTRACT', includeMetadata }
    );

    if (!response.success || !response.data) {
      showStatus(
        response.error || 'Failed to extract content.',
        'error'
      );
      setLoading(false);
      return;
    }

    const baseFilename = buildFilename(response.data);

    // Build markdown: optionally prepend frontmatter and strip footer
    let finalMarkdown = response.data.markdown;

    if (includeMetadata) {
      // Strip the "> Source: / > Date:" footer since it's now in frontmatter
      finalMarkdown = stripSourceFooter(finalMarkdown);

      // Prepend YAML frontmatter
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

      // Match markdown image syntax: ![alt](url)
      finalMarkdown = finalMarkdown.replace(
        /!\[(.*?)\]\((https:\/\/[^)]+)\)/g,
        (match, alt, url) => {
          try {
            const urlObj = new URL(url);
            let fname = urlObj.pathname.split('/').pop() || 'image';

            // Extract format parameter if present (e.g., format=jpg)
            const formatMatch = url.match(/format=([a-zA-Z0-9]+)/);
            if (formatMatch && !fname.includes('.')) {
              fname += `.${formatMatch[1]}`;
            }

            // Fallback for missing extension
            if (!fname.includes('.')) {
              fname += '.jpg';
            }

            fname = fname.replace(/[^a-zA-Z0-9_.-]/g, '_');
            const localPath = `${dirName}/${fname}`;

            if (!imagesToDownload.find((i) => i.url === url)) {
              imagesToDownload.push({ url, filename: localPath });
            }

            return `![${alt}](${localPath})`;
          } catch (e) {
            // URL parsing failed, leave URL as is
            return match;
          }
        }
      );
    }

    // 3. Send download request to background
    const downloadMsg: DownloadRequest = {
      action: 'DOWNLOAD_MD',
      content: finalMarkdown,
      filename: baseFilename,
      images: isDownloadLocal ? imagesToDownload : undefined,
    };

    chrome.runtime.sendMessage(downloadMsg, (downloadResponse) => {
      if (chrome.runtime.lastError || !downloadResponse?.success) {
        showStatus(
          downloadResponse?.error || 'Download failed.',
          'error'
        );
      } else {
        const typeLabels: Record<string, string> = {
          article: 'Article downloaded!',
          thread: 'Thread downloaded!',
          tweet: 'Tweet downloaded!',
        };
        const label = typeLabels[response.data!.type] || 'Downloaded!';
        showStatus(`✓ ${label}`, 'success');
      }
      setLoading(false);
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.';

    // Common case: content script not injected on the page
    if (message.includes('Receiving end does not exist')) {
      showStatus(
        'Reload the page and try again.',
        'error'
      );
    } else {
      showStatus(message, 'error');
    }
    setLoading(false);
  }
});
