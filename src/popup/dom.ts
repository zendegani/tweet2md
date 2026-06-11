// Shared element references for the popup. Resolved once at module load — the
// popup script runs after the document is parsed, so getElementById is safe
// here. Both the settings form and the action flows import from this module so
// neither owns the DOM lookups.

// ─── Action buttons + status line ────────────────────────────────────
export const btnDownload = document.getElementById('btn-download') as HTMLButtonElement;
export const btnCopy = document.getElementById('btn-copy') as HTMLButtonElement;
export const btnPdf = document.getElementById('btn-pdf') as HTMLButtonElement;
export const btnObsidian = document.getElementById('btn-obsidian') as HTMLButtonElement;
export const statusEl = document.getElementById('status') as HTMLDivElement;

// ─── Settings checkboxes ─────────────────────────────────────────────
export const chkDownloadImages = document.getElementById('chk-download-images') as HTMLInputElement;
export const chkMetadata = document.getElementById('chk-include-metadata') as HTMLInputElement;
export const chkCloseTab = document.getElementById('chk-close-tab') as HTMLInputElement;
export const chkInlineCopies = document.getElementById('chk-inline-copies') as HTMLInputElement;
export const chkShowInline = document.getElementById('chk-show-inline') as HTMLInputElement;
export const chkInlineStats = document.getElementById('chk-inline-stats') as HTMLInputElement;
export const chkObsidianFriendly = document.getElementById('chk-obsidian-friendly') as HTMLInputElement;

// ─── Settings text inputs ────────────────────────────────────────────
export const txtObsidianVault = document.getElementById('txt-obsidian-vault') as HTMLInputElement;
export const txtDownloadFolder = document.getElementById('txt-download-folder') as HTMLInputElement;
export const txtObsidianFolder = document.getElementById('txt-obsidian-folder') as HTMLInputElement;
export const txtObsidianTags = document.getElementById('txt-obsidian-tags') as HTMLInputElement;
export const txtFilenameTemplate = document.getElementById('txt-filename-template') as HTMLInputElement;

// ─── Previews + tags controls ────────────────────────────────────────
export const tagsPreview = document.getElementById('obsidian-tags-preview') as HTMLElement;
export const btnTagsReset = document.getElementById('btn-obsidian-tags-reset') as HTMLButtonElement;
export const tagsAutocomplete = document.getElementById('obsidian-tags-autocomplete') as HTMLDivElement;
export const tagsFieldLabel = document.getElementById('obsidian-tags-label') as HTMLLabelElement;
export const filenamePreview = document.getElementById('filename-preview') as HTMLElement;
