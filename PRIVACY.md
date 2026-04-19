# Privacy Policy — tweet2md

**Last updated:** April 1, 2026

## Summary

tweet2md does **not** collect, store externally, or transmit any user data. Everything happens locally on your device.

## What this extension does

tweet2md accesses the visible content of supported X.com status pages only after the user explicitly clicks the extension and requests an action. It converts the visible page content (tweet, thread, or article text) into Markdown, which can be copied to your clipboard or saved to your local Downloads folder using Chrome's built-in download API.

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

| Permission   | Purpose                                              |
|-------------|------------------------------------------------------|
| `activeTab` | Allows reading the current tab's page content when you click the extension icon |
| `downloads` | Allows saving the generated Markdown file and images to your Downloads folder |
| `storage`   | Allows saving your popup configuration (toggle switches) locally on your device so settings are remembered between sessions |
| `host` (X.com) | The content script is injected on `x.com/*/status/*` pages to extract the visible post or article content. This conversion happens entirely in the browser when you initiate an action. No data is transmitted externally. |

These are the minimum permissions required for the extension to function. No additional permissions are requested.

## Third-party services

tweet2md does not use any third-party services, APIs, or analytics platforms.

## Changes to this policy

If this privacy policy changes, the updated version will be published in this repository and the Chrome Web Store listing will be updated accordingly.

## Contact

If you have questions about this privacy policy, please open an issue on the [GitHub repository](https://github.com/zendegani/tweet2md).
