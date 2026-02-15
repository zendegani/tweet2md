# SPEC.md: X-to-Markdown

## 1. Core Objective

A Manifest V3 Chrome extension that converts tweets, threads, and articles (X Notes) on X.com into clean Markdown and downloads them as `.md` files.

## 2. Technical Stack

- **TypeScript** — type-safe DOM parsing
- **Turndown.js** — HTML → Markdown for tweet text
- **esbuild** — bundler (content script as IIFE, background as ESM)
- **Manifest V3** — content script auto-injected on `x.com/*/status/*` and `twitter.com/*/status/*`

## 3. DOM Detection & Parsing

X.com uses the `/status/` URL for tweets, threads, and articles. The content script detects which mode to use based on the DOM.

### A. Detection Logic

1. **Article?** — Presence of any of these selectors:
   - `[data-testid="twitter-article-title"]`
   - `[data-testid="twitterArticleRichTextView"]`
   - `[data-testid="longformRichTextComponent"]`
2. **Thread?** — Not an article, and multiple `article[role="article"]` elements exist by the same author.
3. **Tweet** — Default (single article element, not an article page).

### B. Key Selectors

| Element | Selector |
|---------|----------|
| Author/Username | `[data-testid="User-Name"]` |
| Tweet text | `[data-testid="tweetText"]` |
| Tweet images | `[data-testid="tweetPhoto"] img` |
| Article title | `[data-testid="twitter-article-title"]` |
| Article body | `[data-testid="twitterArticleRichTextView"]` |
| Article Draft.js content | `[data-testid="longformRichTextComponent"]` |
| Code blocks | `[data-testid="markdown-code-block"]` |

## 4. Extraction Logic

### Tweet / Thread Mode

- Uses **Turndown.js** with custom rules to convert tweet HTML to Markdown.
- Custom Turndown rules:
  - **t.co links** — resolved via `title` attribute or visible text
  - **Emoji images** — rendered as inline Unicode characters (alt text), not images
  - **@mentions** — rendered as plain `@handle` text, not markdown links
  - **Videos** — rendered as poster/thumbnail links
- Thread detection: collects all `article[role="article"]` elements, filters by the first article's author handle, joins with `---` separators.
- Post-processing: `cleanupMarkdown()` collapses spurious line breaks around @mentions and punctuation.

### Article Mode

- Uses **manual Draft.js block parsing** (not Turndown) for precise control.
- Supports: headings (h1, h2), paragraphs, unordered/ordered lists, code blocks with language labels, horizontal rules, bold, italic, and inline links.
- Article Draft.js classes: `.longform-unstyled`, `.longform-header-one`, `.longform-header-two`, `.longform-unordered-list-item`.

### Content Cleaning (shared)

Strips from DOM clones before conversion:

- `[role="group"]` (engagement counts)
- `[data-testid$="-follow"]` (follow buttons)
- `[data-testid="caret"]` (more menu)
- `[data-testid="tweet-text-show-more-link"]` (read more)
- Share, bookmark, and subscribe elements
- Buttons, nav, and `[aria-hidden="true"]` elements (except images)

## 5. Output

- **Filename**: `@handle-tweetId.md` (tweets/threads) or `@handle-article-slug.md` (articles)
- **Footer**: `> Source:` URL and `> Date:` timestamp appended to every file

## 6. Extension Flow

1. Content script auto-injects on `x.com/*/status/*` at `document_idle`.
2. User clicks extension icon → popup sends `EXTRACT` message to content script.
3. Content script detects mode → extracts and cleans DOM → returns Markdown.
4. Popup forwards `DOWNLOAD_MD` message to background service worker.
5. Background creates a `data:` URI and calls `chrome.downloads.download()`.

## 7. Project Structure

```text
tweet2md/
├── src/
│   ├── manifest.json       # Chrome MV3 manifest
│   ├── icons/              # Extension icons (16, 32, 48, 128px)
│   ├── content/
│   │   └── content.ts      # DOM extraction + Turndown + Draft.js parsing
│   ├── background/
│   │   └── background.ts   # Service worker — chrome.downloads
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.ts        # Button logic + message orchestration
│   └── types/
│       └── messages.ts     # Shared TypeScript interfaces
├── dist/                   # Build output (load this in Chrome)
├── build.mjs               # esbuild build script
├── package.json
└── tsconfig.json
```
