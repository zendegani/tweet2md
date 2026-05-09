# Privacy Policy — tweet2md

**Last updated:** May 9, 2026

## Summary

tweet2md does **not** collect, store externally, or transmit any user data. Everything happens locally on your device.

## What this extension does

tweet2md accesses the visible content of supported X.com status pages only after the user explicitly requests an action — by clicking the toolbar icon, by clicking the inline download button on a tweet, or by selecting one of the **Save / Copy tweet as Markdown** items in the right-click menu. It converts the visible page content (tweet, thread, or article text) into Markdown, which can be copied to your clipboard or saved to your local Downloads folder using Chrome's built-in download API.

## Data collection

- **No personal data is collected.**
- The extension accesses website content (text and images on supported X.com/Twitter.com pages) solely to convert it into Markdown and image files at your request.
- **No browsing history is tracked.**
- **No analytics or telemetry is sent.**
- **No data is transmitted to any external server.**
- **No cookies are set or read.**
- **No user accounts or authentication is required.**

## Data processing

All data processing happens **entirely within your browser**:

1. The content script reads the DOM of the current X.com page
2. The page content is converted to Markdown format in-memory
3. The resulting Markdown is either copied to your clipboard or saved as a local file via `chrome.downloads`

No data leaves your browser at any point during this process. The extension does not store extracted content after the operation completes.

## Permissions explained

| Permission     | Purpose                                              |
|----------------|------------------------------------------------------|
| `activeTab`    | Allows reading the current tab's page content when you click the extension icon |
| `downloads`    | Allows saving the generated Markdown file and images to your Downloads folder |
| `storage`      | Allows saving your popup configuration (toggle switches) locally on your device so settings are remembered between sessions |
| `contextMenus` | Adds the **Save tweet as Markdown** and **Copy tweet as Markdown** items to the browser's right-click menu, scoped to X.com pages. The menu only fires when you click an item; no page content is read otherwise. |
| `host` (X.com) | A content script is injected on X.com pages to (a) extract the visible post or article content when you trigger an action, and (b) draw the inline download button on tweet action bars. The script reads the DOM locally and never transmits data externally. |

These are the minimum permissions required for the extension to function. No additional permissions are requested.

### About the new entry points (v1.3.0)

The inline download button and right-click context menu introduced in v1.3.0 are convenience triggers — they perform the **same local extraction** as the popup. They do not collect, transmit, or store anything beyond what the popup already does. When you activate one of them, tweet2md opens the tweet's permalink in a new tab, runs the extractor, then saves to Downloads or copies to your clipboard, all inside your browser.

## Third-party services

tweet2md does not use any third-party services, APIs, or analytics platforms.

## Changes to this policy

If this privacy policy changes, the updated version will be published in this repository and the Chrome Web Store listing will be updated accordingly.

## Contact

If you have questions about this privacy policy, please open an issue on the [GitHub repository](https://github.com/zendegani/tweet2md).
