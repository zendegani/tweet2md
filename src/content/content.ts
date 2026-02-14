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

// ─── DOM Selectors (2026 X.com) ─────────────────────────────────────

const SELECTORS = {
  article: '[data-testid="article-container"]',
  tweetText: '[data-testid="tweetText"]',
  userName: '[data-testid="User-Name"]',
  tweetPhoto: '[data-testid="tweetPhoto"]',
  // Engagement & UI elements to strip
  engagementGroup: '[role="group"]',
  followButton: '[data-testid$="-follow"]',
  caret: '[data-testid="caret"]',
  // Additional UI noise
  readMore: '[data-testid="tweet-text-show-more-link"]',
} as const;

// ─── Detection ──────────────────────────────────────────────────────

function isArticlePage(): boolean {
  // Primary: look for the explicit article container
  if (document.querySelector(SELECTORS.article)) return true;

  // Fallback: detect structured long-form content inside the main article
  const articles = document.querySelectorAll('article[role="article"]');
  for (const article of articles) {
    const headings = article.querySelectorAll('h1, h2, h3');
    const paragraphs = article.querySelectorAll('p');
    if (headings.length >= 1 && paragraphs.length >= 3) return true;
  }

  return false;
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

// ─── Tweet Extraction ───────────────────────────────────────────────

function extractTweet(): ExtractedContent {
  const author = extractAuthor();
  const date = extractDate();
  const tweetId = extractTweetId();
  const sourceUrl = window.location.href;

  // Find the main tweet text
  const tweetTextEl = document.querySelector(SELECTORS.tweetText);
  let bodyMarkdown = '';

  if (tweetTextEl) {
    const cleaned = cleanContentClone(tweetTextEl);
    bodyMarkdown = turndown.turndown(cleaned.innerHTML).trim();
  }

  // Find media in the main article
  const article = document.querySelector('article[role="article"]');
  const mediaMarkdown: string[] = [];

  if (article) {
    // Images
    const photos = article.querySelectorAll(`${SELECTORS.tweetPhoto} img`);
    photos.forEach((img) => {
      let src = (img as HTMLImageElement).src;
      if (src && !src.includes('emoji') && !src.includes('profile_images')) {
        if (src.includes('pbs.twimg.com')) {
          src = src.replace(/&name=\w+/, '&name=large');
        }
        mediaMarkdown.push(`![Image](${src})`);
      }
    });

    // Videos
    const videos = article.querySelectorAll('video');
    videos.forEach((video) => {
      const poster = video.getAttribute('poster');
      if (poster) {
        mediaMarkdown.push(`[🎥 Video](${poster})`);
      }
    });
  }

  // Compose final markdown
  const parts: string[] = [
    `# ${author.name} (${author.handle})`,
    '',
    bodyMarkdown,
  ];

  if (mediaMarkdown.length > 0) {
    parts.push('', ...mediaMarkdown);
  }

  parts.push('', '---', '', `> Source: ${sourceUrl}`, `> Date: ${date}`);

  return {
    type: 'tweet',
    author,
    markdown: parts.join('\n'),
    sourceUrl,
    date,
    tweetId,
  };
}

// ─── Article Extraction ─────────────────────────────────────────────

function extractArticle(): ExtractedContent {
  const author = extractAuthor();
  const date = extractDate();
  const tweetId = extractTweetId();
  const sourceUrl = window.location.href;

  // Try the article container first, then fall back to first big article
  let articleContainer =
    document.querySelector(SELECTORS.article) ||
    document.querySelector('article[role="article"]');

  if (!articleContainer) {
    throw new Error('Could not find article content on this page.');
  }

  const cleaned = cleanContentClone(articleContainer);
  let bodyMarkdown = turndown.turndown(cleaned.innerHTML).trim();

  // Try to extract a title (first h1 or prominent heading)
  let title: string | undefined;
  const titleMatch = bodyMarkdown.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  const parts: string[] = [];

  if (title) {
    // Remove the title from body since we'll put it as the top heading
    bodyMarkdown = bodyMarkdown.replace(/^#\s+.+\n*/m, '').trim();
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
