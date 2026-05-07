import type { DownloadRequest } from '../types/messages';

// ─── Context menu: "Save tweet as Markdown" ─────────────────────────

const MENU_ID = 'tweet2md-save';
const MARKER = 'tweet2md=1';
const STATUS_URL_PATTERN = /^https?:\/\/(?:www\.)?x\.com\/[^/]+\/status\/\d+/;

function registerContextMenu(): void {
  chrome.contextMenus.create(
    {
      id: MENU_ID,
      title: chrome.i18n.getMessage('ctx_save_tweet') || 'Save tweet as Markdown',
      contexts: ['link', 'page'],
      targetUrlPatterns: ['*://x.com/*/status/*'],
      documentUrlPatterns: ['*://x.com/*'],
    },
    () => void chrome.runtime.lastError, // ignore duplicate-id errors on reload
  );
}

chrome.runtime.onInstalled.addListener(registerContextMenu);
chrome.runtime.onStartup.addListener(registerContextMenu);

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== MENU_ID) return;
  const target = info.linkUrl || info.pageUrl || '';
  if (!STATUS_URL_PATTERN.test(target)) return;
  const sep = target.includes('#') ? '&' : '#';
  chrome.tabs.create({ url: target + sep + MARKER });
});

// ─── Download handler ───────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (message: DownloadRequest, _sender, sendResponse) => {
    if (message.action !== 'DOWNLOAD_MD') return false;

    // First download any required images
    if (message.images && message.images.length > 0) {
      for (const img of message.images) {
        chrome.downloads.download({
          url: img.url,
          filename: sanitizeFilePath(img.filename),
          saveAs: false,
        });
      }
    }

    const dataUrl =
      'data:text/markdown;charset=utf-8,' +
      encodeURIComponent(message.content);

    chrome.downloads.download(
      {
        url: dataUrl,
        filename: sanitizeFilePath(message.filename),
        saveAs: false,
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else {
          sendResponse({ success: true, downloadId });
        }
      }
    );

    return true; // keep channel open for async sendResponse
  }
);

/**
 * Remove characters that are invalid in filenames/paths.
 * Allows '/' to organize images into a folder next to markdown.
 */
function sanitizeFilePath(name: string): string {
  return name
    .replace(/[<>:"\\|?*\x00-\x1f]/g, '_') // removed '/' from invalid chars
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    // don't drop leading/trailing slash handling because we want folder structure
    .slice(0, 200); // Keep path length reasonable
}
