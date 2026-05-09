# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-05-09

### Added

- **Inline Save Button**: A download icon now sits next to the share button on every tweet's action bar. One click opens the tweet's permalink in a new tab and exports it automatically — no popup required. Long-form articles also get a button at the top so you don't have to scroll.
- **Right-Click Context Menu**: Right-click any tweet (body, image, or timestamp) and pick **Save tweet as Markdown** or **Copy tweet as Markdown**. Works across timeline, profile, and search pages.
- **Two New Toggles**: *Close tab after export* (auto-closes the new tab once extraction completes) and *Inline button copies instead* (makes the inline icon copy to clipboard rather than download).
- **Author Attribution on Quoted Tweets**: Quoted-tweet blocks now lead with the original author's name and handle (e.g., `**Spicy (@spicyofc)**`).
- **Automated Test Suite**: Vitest + JSDOM snapshot tests against saved HTML fixtures cover article, tweet, quoted-tweet, and thread cases — locking the extractor's output against regressions.

### Fixed

- **Article Image Extraction**: Long-form article body images (not just the banner) now extract reliably, including via inline button / context menu where image hydration was previously racing the extractor.
- **Right-Click on Permalink Pages**: Resolved a bug where right-clicking a long-form article that contained a quoted tweet would open the *quoted* tweet instead of the page's main one.
- **Article List Continuation**: Fixed bullet/numbered lists where the next paragraph was incorrectly folded into the last list item.
- **Copy vs. Save Image Settings**: The "Save images locally" toggle no longer rewrites image URLs to nonexistent local paths when copying to clipboard — copy now always emits absolute URLs.
- **Orphaned Script Errors**: Inline-button injector now silently disconnects when the extension is reloaded or disabled, eliminating "Extension context invalidated" console noise.

### Changed

- **Permission Added**: New `contextMenus` permission required for the right-click menu. No data collection, telemetry, or external requests are introduced — see [PRIVACY.md](PRIVACY.md).
- **Localization**: Added translations for the new settings and context-menu items across all 9 supported languages.

## [1.2.1] - 2026-04-19

### Added

- Added promotional web store assets to project repository.

### Changed

- **Popup UI**: Relocated the instruction hint to the header and updated the footer to include a direct link to the GitHub repository for issues and suggestions.
- **Localization**: Polished translations across 9 supported languages to ensure better native phrasing.
- **Manifest**: Updated extension metadata and localized descriptions for Web Store consistency.

## [1.2.0] - 2026-04-01

### Added

- **Copy to Clipboard**: Added a "Copy .md" button to the popup to copy generated markdown directly to your clipboard instead of downloading.
- **Multi-Language UI**: Popup interface now available in 9 languages — English, Spanish, German, French, Japanese, Portuguese (Brazil), Chinese (Simplified), Arabic, and Persian. The UI automatically matches your browser's language. Content extraction works on any language regardless of UI translation.
- **Dynamic Theming**: Added light and dark mode support to the popup UI, automatically respecting your system preferences.

### Fixed

- **Markdown Formatting**: Fixed a bug causing improper bold and italic rendering when text nodes contained trailing or leading whitespaces.

## [1.1.0] - 2026-03-22

### Added

- **Local Image Downloads**: Added a popup option to download all attached images locally into a subfolder next to the markdown file. The generated markdown automatically updates `![alt]` tags to reference the new local paths.
- **Tweet Metadata**: Added a toggle to include engagement metrics (likes, reposts, replies, bookmarks, views) as YAML frontmatter at the top of the generated markdown file.
- **Settings Persistence**: Popup toggles now remember your preferences between sessions.

### Improved

- **Quote Tweet Extraction**: Refined extraction logic to accurately differentiate between main tweet text and quoted tweet text, preventing messy or duplicated text in the output.
- **Popup UI**: Replaced basic checkboxes with modern, animated toggle switches with SVGs.
- **Path Sanitization**: Better handling of invalid characters in generated markdown and image filenames.

## [1.0.0] - 2026-02-15

### Initial Features

- Core extraction functionality for basic tweets, threads, and X Articles/Notes.
- Automatic DOM cleaning to strip follow buttons, engagement bars, and unwanted navigation.
- Turndown.js integration with custom rules for inline links, emojis, and @mentions.
