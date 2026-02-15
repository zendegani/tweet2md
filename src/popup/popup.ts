import type { ExtractResponse, DownloadRequest } from '../types/messages';

const btnDownload = document.getElementById('btn-download') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;

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

    // 2. Send extraction request to content script
    const response: ExtractResponse = await chrome.tabs.sendMessage(
      tab.id,
      { action: 'EXTRACT' }
    );

    if (!response.success || !response.data) {
      showStatus(
        response.error || 'Failed to extract content.',
        'error'
      );
      setLoading(false);
      return;
    }

    // 3. Send download request to background
    const downloadMsg: DownloadRequest = {
      action: 'DOWNLOAD_MD',
      content: response.data.markdown,
      filename: buildFilename(response.data),
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
