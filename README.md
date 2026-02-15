# tweet2md

> Convert X.com (Twitter) posts and articles into clean Markdown files — one click.

<p align="center">
  <img src="src/icons/icon-128.png" alt="tweet2md logo" width="128" />
</p>

## What it does

**tweet2md** is a lightweight Chrome extension that extracts the content of any tweet or long-form article (X Notes) and downloads it as a well-formatted `.md` Markdown file.

### Supports

- **Tweets** — text, media URLs, author info, and timestamps
- **Articles / Notes** — full rich-text extraction including headings, bold/italic, bullet lists, code blocks, links, and horizontal rules
- **Clean output** — no UI clutter, engagement buttons, or tracking parameters in the Markdown

### Example output

```markdown
# Article Title

*By Author Name (@handle)*

Full article content with **bold**, *italic*, [links](https://example.com),
bullet lists, headings, and code blocks preserved.

---

> Source: https://x.com/user/status/1234567890
> Date: 2026-02-15T10:00:00.000Z
```

## Install

### From Chrome Web Store

*(Coming soon)*

### From source (developer mode)

1. Clone this repo:

   ```bash
   git clone https://github.com/zendegani/tweet2md.git
   cd tweet2md
   ```

2. Install dependencies and build:

   ```bash
   npm install
   npm run build
   ```

3. Open Chrome → `chrome://extensions/`
4. Enable **Developer mode** (top right)
5. Click **Load unpacked** → select the `dist/` folder

## Usage

1. Navigate to any tweet or article on **x.com**
2. Click the **tweet2md** extension icon in your toolbar
3. Click **Download .md**
4. The Markdown file is saved to your Downloads folder

The filename is generated automatically:

- Tweets → `@handle-tweetId.md`
- Articles → `@handle-article-slug.md`

## How it works

- **Content script** automatically injects on `x.com/*/status/*` pages
- Parses the live DOM using X.com's `data-testid` attributes and Draft.js class conventions
- Converts rich text to Markdown manually (headings, lists, bold/italic, code blocks, links)
- Uses [Turndown](https://github.com/mixmark-io/turndown) for general HTML-to-Markdown conversion of tweets
- Downloads via Chrome's `chrome.downloads` API — nothing leaves your browser

## Permissions

| Permission   | Why                                           |
|-------------|-----------------------------------------------|
| `activeTab` | Read the current page's DOM when you click     |
| `downloads` | Save the `.md` file to your Downloads folder   |

**No data is collected, transmitted, or stored.** See [PRIVACY.md](PRIVACY.md).

## Tech stack

- **TypeScript** — type-safe source code
- **esbuild** — fast bundling (content script as IIFE, background as ESM)
- **Turndown.js** — HTML → Markdown conversion for tweets
- **Manifest V3** — modern Chrome extension architecture

## Project structure

```
tweet2md/
├── src/
│   ├── content/        # Content script (DOM parsing + markdown generation)
│   ├── background/     # Service worker (handles file downloads)
│   ├── popup/          # Extension popup (UI + trigger)
│   ├── types/          # TypeScript interfaces
│   ├── icons/          # Extension icons (16, 32, 48, 128px)
│   └── manifest.json   # Chrome extension manifest (MV3)
├── dist/               # Build output (load this in Chrome)
├── build.mjs           # esbuild build script
├── package.json
└── tsconfig.json
```

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Build + watch for changes
npm run watch

# Package for Chrome Web Store (.zip)
npm run package

# Clean build output
npm run clean
```

## License

MIT
