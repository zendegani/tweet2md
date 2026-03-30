# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-03-31

### Added

- **Copy to Clipboard**: Added a "Copy .md" button to the popup to copy generated markdown directly to your clipboard instead of downloading.
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
