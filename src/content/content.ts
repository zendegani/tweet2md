import TurndownService from 'turndown';
import type { ExtractedContent, ExtractResponse } from '../types/messages';

// ─── Turndown Instance ──────────────────────────────────────────────
const turndown = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined',
});

// Custom rule: resolve t.co links using visible text or title attribute
turndown.addRule('tcoLinks', {
  filter: (node) =>
    node.nodeName === 'A' &&
    !!(node as HTMLAnchorElement).getAttribute('href')?.includes('t.co'),
  replacement: (_content, node) => {
    const anchor = node as HTMLAnchorElement;
    const title = anchor.getAttribute('title');
    const visibleText = anchor.textContent?.trim() || '';

    // Prefer title (full URL), fall back to visible text
    const displayUrl = title && title.startsWith('http') ? title : visibleText;
    const targetUrl = title && title.startsWith('http') ? title : anchor.href;

    // If visible text looks like a URL, use it directly
    if (displayUrl.startsWith('http') || displayUrl.includes('.')) {
      return `[${displayUrl}](${targetUrl})`;
    }

    return `[${visibleText}](${targetUrl})`;
  },
});

// Custom rule: handle images with src extraction
turndown.addRule('xImages', {
  filter: 'img',
  replacement: (_content, node) => {
    const img = node as HTMLImageElement;
    const alt = img.getAttribute('alt') || 'Image';
    let src = img.getAttribute('src') || '';

    // Emoji images → just return the emoji character (alt text)
    if (src.includes('twimg.com/emoji') || src.includes('abs-0.twimg.com')) {
      return alt;
    }

    // Use the highest quality version available
    if (src.includes('pbs.twimg.com') && !src.includes('format=')) {
      src = src.replace(/&name=\w+/, '&name=large');
    }

    return src ? `![${alt}](${src})` : '';
  },
});

// Custom rule: handle videos → just output the poster/thumbnail URL
turndown.addRule('xVideos', {
  filter: 'video',
  replacement: (_content, node) => {
    const video = node as HTMLVideoElement;
    const poster = video.getAttribute('poster') || '';
    const src = video.querySelector('source')?.getAttribute('src') || '';
    const url = src || poster;
    return url ? `[🎥 Video](${url})` : '[🎥 Video]';
  },
});

// Custom rule: handle @mention links inline (no surrounding line breaks)
turndown.addRule('atMentions', {
  filter: (node) => {
    if (node.nodeName !== 'A') return false;
    const href = (node as HTMLAnchorElement).getAttribute('href') || '';
    // Match links like /username (internal profile links)
    return /^\/[A-Za-z0-9_]+$/.test(href);
  },
  replacement: (_content, node) => {
    const anchor = node as HTMLAnchorElement;
    const text = anchor.textContent?.trim() || '';
    // Return just @handle with no extra whitespace
    return text.startsWith('@') ? text : `@${text}`;
  },
});

/**
 * Clean up markdown output:
 * - Collapse line breaks around @mentions and trailing punctuation
 * - Remove blank lines between inline elements that should flow together
 */
function cleanupMarkdown(md: string): string {
  // Collapse: "text\n\n@handle\n\n, more text" → "text @handle, more text"
  // Step 1: Remove leading blank lines before @mentions
  let result = md.replace(/\n{2,}(@[A-Za-z0-9_]+)/g, ' $1');
  // Step 2: Remove trailing blank line + punctuation after @mentions  
  result = result.replace(/(@[A-Za-z0-9_]+)\n{2,}([.,;:!?])/g, '$1$2');
  // Step 3: Collapse remaining blank lines between @mentions
  result = result.replace(/(@[A-Za-z0-9_]+[.,;:!?]?)\n{2,}(@[A-Za-z0-9_]+)/g, '$1 $2');
  // Step 4: Collapse orphaned punctuation on its own line
  result = result.replace(/\n{2,}([.,;:!?])\s*\n/g, '$1\n');
  // Step 5: Collapse trailing punctuation (e.g. "." on its own line after a handle)
  result = result.replace(/(@[A-Za-z0-9_]+)\n{2,}([.,;:!?])\s*$/gm, '$1$2');
  return result;
}

// ─── DOM Selectors (2026 X.com) ─────────────────────────────────────

const SELECTORS = {
  // Article-specific (long-form / Notes)
  articleTitle: '[data-testid="twitter-article-title"]',
  articleRichText: '[data-testid="twitterArticleRichTextView"]',
  articleDraftContent: '[data-testid="longformRichTextComponent"]',
  articleCodeBlock: '[data-testid="markdown-code-block"]',
  // Tweet-specific
  tweetText: '[data-testid="tweetText"]',
  userName: '[data-testid="User-Name"]',
  tweetPhoto: '[data-testid="tweetPhoto"]',
  // Engagement & UI elements to strip
  engagementGroup: '[role="group"]',
  followButton: '[data-testid$="-follow"]',
  caret: '[data-testid="caret"]',
  readMore: '[data-testid="tweet-text-show-more-link"]',
} as const;

// ─── Detection ──────────────────────────────────────────────────────

function isArticlePage(): boolean {
  // Check for X.com Article/Notes specific elements
  return !!(
    document.querySelector(SELECTORS.articleTitle) ||
    document.querySelector(SELECTORS.articleRichText) ||
    document.querySelector(SELECTORS.articleDraftContent)
  );
}

// ─── Author Extraction ──────────────────────────────────────────────

function extractAuthor(): { name: string; handle: string } {
  const userNameEl = document.querySelector(SELECTORS.userName);
  if (!userNameEl) return { name: 'Unknown', handle: 'unknown' };

  // The User-Name testid typically has two child divs/spans:
  // first contains display name, second contains @handle
  const links = userNameEl.querySelectorAll('a');
  let name = 'Unknown';
  let handle = 'unknown';

  for (const link of links) {
    const text = link.textContent?.trim() || '';
    if (text.startsWith('@')) {
      handle = text;
    } else if (text && name === 'Unknown') {
      name = text;
    }
  }

  // If handle wasn't found with @, try extracting from href
  if (handle === 'unknown') {
    for (const link of links) {
      const href = link.getAttribute('href') || '';
      const match = href.match(/^\/([A-Za-z0-9_]+)$/);
      if (match) {
        handle = `@${match[1]}`;
        break;
      }
    }
  }

  return { name, handle };
}

// ─── Date Extraction ────────────────────────────────────────────────

function extractDate(): string {
  const timeEl = document.querySelector('article[role="article"] time');
  if (timeEl) {
    const datetime = timeEl.getAttribute('datetime');
    if (datetime) return datetime;
    return timeEl.textContent?.trim() || '';
  }
  return new Date().toISOString();
}

// ─── Tweet ID Extraction ────────────────────────────────────────────

function extractTweetId(): string {
  const match = window.location.pathname.match(/\/status\/(\d+)/);
  return match?.[1] || 'unknown';
}

// ─── HTML Cleaning ──────────────────────────────────────────────────

function cleanContentClone(container: Element): Element {
  const clone = container.cloneNode(true) as Element;

  // Remove engagement counts (likes, retweets, replies bar)
  clone.querySelectorAll('[role="group"]').forEach((el) => el.remove());

  // Remove follow buttons
  clone.querySelectorAll('[data-testid$="-follow"]').forEach((el) => el.remove());

  // Remove the caret/more menu
  clone.querySelectorAll('[data-testid="caret"]').forEach((el) => el.remove());

  // Remove "Read more" / "Show more" links
  clone
    .querySelectorAll('[data-testid="tweet-text-show-more-link"]')
    .forEach((el) => el.remove());

  // Remove share/bookmark buttons
  clone.querySelectorAll('[aria-label="Share post"]').forEach((el) => el.remove());
  clone.querySelectorAll('[aria-label="Bookmark"]').forEach((el) => el.remove());
  clone.querySelectorAll('[data-testid="bookmark"]').forEach((el) => el.remove());

  // Remove "Subscribe" CTA blocks
  clone.querySelectorAll('a[href*="/subscribe"]').forEach((el) => {
    // Remove the parent container if it looks like a CTA card
    const parent = el.closest('div[role="link"]') || el.parentElement;
    parent?.remove();
  });

  // Remove buttons and navigation elements
  clone.querySelectorAll('button, nav, [role="navigation"]').forEach((el) => el.remove());

  // Remove hidden elements
  clone.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
    // Keep images that are aria-hidden (X sometimes does this)
    if (!el.querySelector('img') && el.tagName !== 'IMG') {
      el.remove();
    }
  });

  return clone;
}

// ─── Per-Article Helpers ────────────────────────────────────────────

/**
 * Extract author info from a specific article element (not the global page).
 */
function extractAuthorFromArticle(
  article: Element
): { name: string; handle: string } {
  const userNameEl = article.querySelector(SELECTORS.userName);
  if (!userNameEl) return { name: 'Unknown', handle: 'unknown' };

  const links = userNameEl.querySelectorAll('a');
  let name = 'Unknown';
  let handle = 'unknown';

  for (const link of links) {
    const text = link.textContent?.trim() || '';
    if (text.startsWith('@')) {
      handle = text;
    } else if (text && name === 'Unknown') {
      name = text;
    }
  }

  if (handle === 'unknown') {
    for (const link of links) {
      const href = link.getAttribute('href') || '';
      const match = href.match(/^\/([A-Za-z0-9_]+)$/);
      if (match) {
        handle = `@${match[1]}`;
        break;
      }
    }
  }

  return { name, handle };
}

/**
 * Extract text + media markdown from a single article element.
 * Returns { text, media } where text is the tweet body markdown
 * and media is an array of media markdown strings.
 */
function extractSingleTweetFromArticle(
  article: Element
): { text: string; media: string[] } {
  // Extract tweet text
  const tweetTextEl = article.querySelector(SELECTORS.tweetText);
  let text = '';

  if (tweetTextEl) {
    const cleaned = cleanContentClone(tweetTextEl);
    text = cleanupMarkdown(turndown.turndown(cleaned.innerHTML)).trim();
  }

  // Extract media
  const media: string[] = [];

  // Images
  const photos = article.querySelectorAll(`${SELECTORS.tweetPhoto} img`);
  photos.forEach((img) => {
    let src = (img as HTMLImageElement).src;
    if (src && !src.includes('emoji') && !src.includes('profile_images')) {
      if (src.includes('pbs.twimg.com')) {
        src = src.replace(/&name=\w+/, '&name=large');
      }
      media.push(`![Image](${src})`);
    }
  });

  // Videos
  const videos = article.querySelectorAll('video');
  videos.forEach((video) => {
    const poster = video.getAttribute('poster');
    if (poster) {
      media.push(`[🎥 Video](${poster})`);
    }
  });

  return { text, media };
}

// ─── Tweet / Thread Extraction ──────────────────────────────────────

function extractTweet(): ExtractedContent {
  const date = extractDate();
  const tweetId = extractTweetId();
  const sourceUrl = window.location.href;

  // Collect all article elements on the page
  const allArticles = document.querySelectorAll('article[role="article"]');

  if (allArticles.length === 0) {
    // Fallback: no articles found
    const author = extractAuthor();
    return {
      type: 'tweet',
      author,
      markdown: `# ${author.name} (${author.handle})\n\n*Could not extract tweet content.*\n\n---\n\n> Source: ${sourceUrl}\n> Date: ${date}`,
      sourceUrl,
      date,
      tweetId,
    };
  }

  // Determine the thread author from the first article
  const threadAuthor = extractAuthorFromArticle(allArticles[0]);

  // Collect tweets from the same author (thread tweets)
  const threadTweets: { text: string; media: string[] }[] = [];

  for (const article of allArticles) {
    const articleAuthor = extractAuthorFromArticle(article);
    // Only include tweets by the thread author
    if (
      articleAuthor.handle.toLowerCase() ===
      threadAuthor.handle.toLowerCase()
    ) {
      threadTweets.push(extractSingleTweetFromArticle(article));
    }
  }

  // Build the final markdown
  const isThread = threadTweets.length > 1;
  const parts: string[] = [
    `# ${threadAuthor.name} (${threadAuthor.handle})`,
    '',
  ];

  threadTweets.forEach((tweet, idx) => {
    if (idx > 0) {
      parts.push('', '---', '');
    }
    if (tweet.text) {
      parts.push(tweet.text);
    }
    if (tweet.media.length > 0) {
      parts.push('', ...tweet.media);
    }
  });

  parts.push('', '---', '', `> Source: ${sourceUrl}`, `> Date: ${date}`);

  return {
    type: isThread ? 'thread' : 'tweet',
    author: threadAuthor,
    markdown: parts.join('\n'),
    sourceUrl,
    date,
    tweetId,
  };
}

// ─── Article Extraction ─────────────────────────────────────────────

/**
 * X.com Articles ("Notes") use Draft.js for rich text rendering.
 * Structure:
 *   [data-testid="twitter-article-title"] → Title
 *   [data-testid="twitterArticleRichTextView"] → Body container
 *     └─ [data-testid="longformRichTextComponent"] → Draft.js content
 *         ├─ .longform-unstyled  → paragraphs
 *         ├─ .longform-header-one / .longform-header-two → headings
 *         ├─ .longform-unordered-list-item → bullet lists
 *         ├─ section[role="separator"] → horizontal rules
 *         └─ [data-testid="markdown-code-block"] → code blocks
 */
function extractArticle(): ExtractedContent {
  const author = extractAuthor();
  const date = extractDate();
  const tweetId = extractTweetId();
  const sourceUrl = window.location.href;

  // ── Extract title ─────────────────────────────────────────────
  let title: string | undefined;
  const titleEl = document.querySelector(SELECTORS.articleTitle);
  if (titleEl) {
    title = titleEl.textContent?.trim();
  }

  // ── Extract rich text body ────────────────────────────────────
  const richTextView = document.querySelector(SELECTORS.articleRichText);
  if (!richTextView) {
    throw new Error(
      'Could not find the article body. The page may not have fully loaded.'
    );
  }

  // Build markdown manually from Draft.js blocks for better control
  const mdParts: string[] = [];
  const draftContent =
    richTextView.querySelector(SELECTORS.articleDraftContent) || richTextView;

  // Get direct children of [data-contents] or the content root
  const dataContents =
    draftContent.querySelector('[data-contents]') || draftContent;
  const blocks = dataContents.children;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i] as HTMLElement;

    // ── Code block (MUST check before separator — both use <section>) ──
    const codeBlock = block.querySelector('[data-testid="markdown-code-block"]');
    if (codeBlock || block.getAttribute('data-testid') === 'markdown-code-block') {
      const cb = codeBlock || block;
      // Language label: look for code tag's class or the label span
      const codeEl = cb.querySelector('code');
      const langFromClass = codeEl?.className?.match(/language-(\w+)/)?.[1] || '';
      // Fallback: the small label span above the code block
      const langLabel = cb.querySelector('[class*="r-1aiqnjv"]');
      const lang = langFromClass || langLabel?.textContent?.trim() || '';
      const preEl = cb.querySelector('pre');
      const codeSource = preEl?.querySelector('code') || preEl;
      const codeText = codeSource?.textContent || '';
      mdParts.push('', `\`\`\`${lang}`, codeText.trimEnd(), '\`\`\`', '');
      continue;
    }

    // ── Separator (horizontal rule) ──
    // Only match if the block contains [role="separator"] (not just any <section>)
    if (block.querySelector('[role="separator"]')) {
      mdParts.push('', '---', '');
      continue;
    }

    // ── Header (h1) ──
    const h1 = block.querySelector('.longform-header-one') || 
               (block.classList.contains('longform-header-one') ? block : null);
    if (h1 || block.querySelector('h1.longform-header-one')) {
      const heading = block.textContent?.trim() || '';
      if (heading) mdParts.push('', `# ${heading}`, '');
      continue;
    }

    // ── Header (h2) ──
    const h2 = block.querySelector('.longform-header-two') ||
               (block.classList.contains('longform-header-two') ? block : null);
    if (h2 || block.querySelector('h2.longform-header-two')) {
      const heading = block.textContent?.trim() || '';
      if (heading) mdParts.push('', `## ${heading}`, '');
      continue;
    }

    // ── Unordered list ──
    if (block.tagName === 'UL') {
      const items = block.querySelectorAll('.longform-unordered-list-item');
      items.forEach((li) => {
        const text = extractInlineText(li);
        if (text) mdParts.push(`- ${text}`);
      });
      continue;
    }

    // ── Single list item (sometimes not wrapped in UL) ──
    if (block.classList.contains('longform-unordered-list-item')) {
      const text = extractInlineText(block);
      if (text) mdParts.push(`- ${text}`);
      continue;
    }

    // ── Ordered list ──
    if (block.tagName === 'OL') {
      const items = block.querySelectorAll('li');
      items.forEach((li, idx) => {
        const text = extractInlineText(li);
        if (text) mdParts.push(`${idx + 1}. ${text}`);
      });
      continue;
    }

    // ── Regular paragraph (.longform-unstyled or generic div) ──
    const text = extractInlineText(block);
    if (text) {
      mdParts.push(text);
    } else if (block.textContent?.trim() === '') {
      // Empty paragraph → blank line
      mdParts.push('');
    }
  }

  let bodyMarkdown = mdParts.join('\n').replace(/\n{3,}/g, '\n\n').trim();

  // ── Compose final markdown ────────────────────────────────────
  const parts: string[] = [];

  if (title) {
    parts.push(`# ${title}`, '', `*By ${author.name} (${author.handle})*`, '');
  } else {
    parts.push(`# Article by ${author.name} (${author.handle})`, '');
  }

  parts.push(bodyMarkdown, '', '---', '', `> Source: ${sourceUrl}`, `> Date: ${date}`);

  return {
    type: 'article',
    author,
    title,
    markdown: parts.join('\n'),
    sourceUrl,
    date,
    tweetId,
  };
}

/**
 * Check if an element is a small inline wrapper for a link (not a content container).
 * X.com wraps links in <div class="css-175oi2r r-1loqt21 ..."> inline containers.
 * These only contain the <a> tag. A content container (like DraftStyleDefault-block)
 * will have multiple children: text spans + link divs + more text spans.
 */
function isInlineLinkWrapper(el: HTMLElement): boolean {
  // If it has a data-offset-key, it's a Draft.js content block, not a link wrapper
  if (el.hasAttribute('data-offset-key')) return false;
  // If it has Draft.js block classes, it's a content container
  if (el.className.includes('DraftStyleDefault')) return false;
  if (el.className.includes('longform-')) return false;

  // An inline link wrapper typically has only 1 child element (the <a>)
  // and no direct TEXT_NODE children with meaningful text
  const childElements = Array.from(el.children);
  const hasOnlyLink = childElements.length === 1 && childElements[0].tagName === 'A';
  const hasLink = childElements.some(c => c.tagName === 'A' || c.querySelector('a'));

  // If it only contains a link (no sibling text/span content), it's a wrapper
  if (hasOnlyLink) return true;

  // Also check: no text-bearing siblings alongside the link
  let textLen = 0;
  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      textLen += (child.textContent || '').trim().length;
    }
  }

  return hasLink && textLen === 0 && childElements.length <= 2;
}

/**
 * Extract inline text from a Draft.js block, preserving bold/italic/links.
 */
function extractInlineText(el: Element): string {
  let result = '';

  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent || '';
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const elem = child as HTMLElement;

    // ── Direct link ──
    if (elem.tagName === 'A') {
      const href = elem.getAttribute('href') || '';
      const linkText = elem.textContent?.trim() || '';
      const fullHref = href.startsWith('//')
        ? `https:${href}`
        : href.startsWith('/')
        ? `https://x.com${href}`
        : href;
      result += `[${linkText}](${fullHref})`;
      continue;
    }

    // ── Inline link wrapper (small div/span wrapping ONLY an <a>) ──
    // X.com wraps links in a <div class="css-175oi2r r-1loqt21 ..."> container
    // IMPORTANT: Don't match large container divs (like DraftStyleDefault-block)
    // that happen to contain a link somewhere deep inside alongside other content.
    if (elem.querySelector('a') && isInlineLinkWrapper(elem)) {
      const anchor = elem.querySelector('a')!;
      const href = anchor.getAttribute('href') || '';
      const linkText = anchor.textContent?.trim() || '';
      const fullHref = href.startsWith('//')
        ? `https:${href}`
        : href.startsWith('/')
        ? `https://x.com${href}`
        : href;
      result += `[${linkText}](${fullHref})`;
      continue;
    }

    // ── Bold ──
    if (elem.style.fontWeight === 'bold' || elem.tagName === 'STRONG' || elem.tagName === 'B') {
      const inner = extractInlineText(elem);
      result += `**${inner}**`;
      continue;
    }

    // ── Italic ──
    if (elem.style.fontStyle === 'italic' || elem.tagName === 'EM' || elem.tagName === 'I') {
      const inner = extractInlineText(elem);
      result += `*${inner}*`;
      continue;
    }

    // ── Recurse into other elements (spans, content wrapper divs, etc.) ──
    result += extractInlineText(elem);
  }

  return result;
}

// ─── Main Extraction Entry Point ────────────────────────────────────

function extract(): ExtractResponse {
  try {
    // Verify we're on a status page
    if (!window.location.pathname.includes('/status/')) {
      return {
        success: false,
        error: 'Not on an X.com status page. Navigate to a tweet or article first.',
      };
    }

    const isArticle = isArticlePage();
    const data = isArticle ? extractArticle() : extractTweet();

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─── Message Listener ───────────────────────────────────────────────

chrome.runtime.onMessage.addListener((_message, _sender, sendResponse) => {
  if (_message.action === 'EXTRACT') {
    const result = extract();
    sendResponse(result);
  }
  return true;
});
