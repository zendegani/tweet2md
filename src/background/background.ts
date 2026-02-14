import type { DownloadRequest } from '../types/messages';

chrome.runtime.onMessage.addListener(
  (message: DownloadRequest, _sender, sendResponse) => {
    if (message.action !== 'DOWNLOAD_MD') return false;

    const dataUrl =
      'data:text/markdown;charset=utf-8,' +
      encodeURIComponent(message.content);

    chrome.downloads.download(
      {
        url: dataUrl,
        filename: sanitizeFilename(message.filename),
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
 * Remove characters that are invalid in filenames.
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200); // Keep filename length reasonable
}
