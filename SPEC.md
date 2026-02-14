# SPEC.md: X-to-Markdown (Dual Mode)

## 1. Core Objective

A Manifest V3 extension that converts both standard Tweets and the new "Status-based" Articles on X.com into clean Markdown and downloads them as `.md` files.

## 2. Technical Stack

- **TypeScript** (High Type Safety for DOM parsing)
- **Turndown.js** (Standard HTML to MD converter)
- **esbuild** (Bundler — content script as IIFE, background as ESM)
- **Architecture**: Content script auto-injected on `x.com/*/status/*`, triggered via Action Popup.

## 3. DOM Detection & Parsing (The 2026 Strategy)

X uses the `/status/` URL for both short tweets and long-form articles. The script must detect the presence of the "Article Reader" inside the status page.

### A. Detection Logic

1. **Is it an Article?** Look for `[data-testid="article-container"]` or a `div` containing multiple `h1`, `h2`, and structured `p` tags inside the main `article` tag.
2. **Is it a Tweet?** Default if the above is not found.

### B. Selector Mapping

- **Author/Username**: `[data-testid="User-Name"]`
- **Main Article Body**: `div[data-testid="article-container"]` or the specific inner wrapper for long-form content.
- **Tweet Body**: `div[data-testid="tweetText"]`
- **Media**: All `img` and `video` elements within the content container (included as URLs in output).

## 4. Functional Requirements

1. **Format - Article Mode**:
    - Extract the **Title** (usually the first `h1` or large bold text).
    - Convert rich text (bold, italics, headers) using Turndown.
    - Preserve image captions if present.
    - Include media as image URLs (highest quality).
2. **Format - Tweet Mode**:
    - Extract text, handle links (resolve `t.co` to display text / title attribute).
    - Include media as image/video URLs.
    - Append the original URL as a reference at the bottom.
3. **Refined Cleaning**:
    - Strip "Read more," "Subscribe," "Follow" buttons, and engagement counts from output.
    - Remove navigation, buttons, and hidden UI elements.
4. **Output**:
    - Download as `.md` file (no clipboard, no preview).
    - Filename: `@handle-tweetId.md` or `@handle-article-slug.md`.

## 5. Extension Flow

1. User navigates to a tweet/article on `x.com` or `twitter.com`.
2. User clicks the extension icon → Popup opens with a **"Download .md"** button.
3. Popup validates the URL, sends `EXTRACT` message to the content script.
4. Content script detects mode (article/tweet), extracts DOM, cleans it, converts to Markdown via Turndown.
5. Result is sent back to popup, which forwards a `DOWNLOAD_MD` message to the background service worker.
6. Background uses `chrome.downloads.download()` with a data URI to save the `.md` file.

## 6. Project Structure

```
tweet2md/
├── build.mjs              # esbuild multi-entry build script
├── package.json
├── tsconfig.json
├── SPEC.md
├── src/
│   ├── manifest.json       # Chrome MV3 manifest
│   ├── icons/              # Extension icons (16, 48, 128)
│   ├── background/
│   │   └── background.ts   # Service worker — handles chrome.downloads
│   ├── content/
│   │   └── content.ts      # DOM extraction + Turndown conversion
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.ts        # Button logic + message orchestration
│   └── types/
│       └── messages.ts      # Shared TypeScript interfaces
└── dist/                   # Build output → load this in Chrome
```
