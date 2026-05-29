tweet2md is an open-source Chrome extension that turns X/Twitter threads, posts, and articles into clean Markdown for Obsidian, research, AI workflows, and offline archiving.

Export content in one click:

- Save as Markdown
- Copy Markdown to clipboard
- Send directly to Obsidian
- Download images locally alongside your .md file

Works entirely locally in your browser. No API keys, no accounts, no tracking, no analytics.

Key features:

- Export tweets, threads, quote tweets, nested threads, and X Articles (formerly Notes)
- Clean Markdown that works with Obsidian, Logseq, Notion, Hugo, and other Markdown-based workflows
- One-click "Add to Obsidian" support via the obsidian:// URI scheme
- Rich YAML frontmatter with author, handle, dates, source URL, content type, and engagement stats
- Optional Obsidian-friendly frontmatter: wikilinked [[@handle]] authors, Dataview-friendly metadata, and synthesized titles and descriptions
- Download embedded images locally to prevent link rot
- Capture link cards with title, source domain, and preview image
- Capture polls with choices, result percentages, and the vote total/status line
- Preserve quote tweet structure and attribution
- Export a single tweet or an entire thread
- Inline export button directly inside x.com, plus toolbar popup and right-click context menu
- Custom filename templates using placeholders like {date}, {handle}, {slug}, and {type}
- Optional vault targeting and vault subfolder support for Obsidian
- Optional downloads subfolder for exported Markdown and media
- Multi-language UI: English, Spanish, German, French, Italian, Russian, Japanese, Portuguese (Brazil), Chinese (Simplified), Hindi, Arabic, and Persian
- Light and dark mode support

Great for:

- Obsidian and PKM workflows
- Research and reference archiving
- AI prompts and RAG pipelines
- Building a searchable second brain
- Preserving long-form X content offline

Current limitations:

- Videos and GIFs are not exported as playable media files
- Some functionality may break if x.com changes its page structure significantly
- If you install or update the extension while an x.com tab is already open, reload the tab before exporting — this is intentional, to avoid silent failures on an uninitialized page

Open source:
https://github.com/zendegani/tweet2md

Changelog:
https://github.com/zendegani/tweet2md/blob/main/CHANGELOG.md

tweet2md is an independent open-source project and is not affiliated with X or Twitter.
