import { describe, expect, it } from 'vitest';
import { postProcess } from '../src/shared/post-process';
import type { ExtractedContent } from '../src/types/messages';

function content(markdown: string): ExtractedContent {
  return {
    type: 'tweet',
    author: { name: 'Example', handle: '@example' },
    markdown,
    sourceUrl: 'https://x.com/example/status/123',
    date: '2026-05-11T00:00:00.000Z',
    tweetId: '123',
  };
}

describe('postProcess() image downloads', () => {
  it('emits Obsidian-friendly frontmatter when toggle is on', () => {
    const data: ExtractedContent = {
      type: 'thread',
      author: { name: 'Thariq', handle: '@trq212' },
      markdown: '# Thariq (@trq212)\n\nI put a lot of heart into my technical writing, I hope it\'s useful to you all. Here\'s a pinned thread of everything I\'ve written.',
      sourceUrl: 'https://x.com/trq212/status/2035372716820218141',
      date: '2026-03-21T15:07:25.000Z',
      tweetId: '2035372716820218141',
      metadata: { likes: 635, reposts: 45, replies: 6, bookmarks: 784, views: 169859 },
    };

    const result = postProcess(data, {
      includeMetadata: true,
      downloadImages: false,
      obsidianFriendly: true,
    });

    expect(result.markdown).toContain('title: "Thread by @trq212 on X"');
    expect(result.markdown).toContain('author: "[[@trq212]]"');
    expect(result.markdown).toContain('author_name: "Thariq"');
    expect(result.markdown).toContain('handle: "@trq212"');
    expect(result.markdown).toContain('published: 2026-03-21');
    expect(result.markdown).toMatch(/created: \d{4}-\d{2}-\d{2}/);
    expect(result.markdown).toContain('type: thread');
    expect(result.markdown).toContain('description: "I put a lot of heart into my technical writing');
    expect(result.markdown).toContain('tags: [clippings, x, thread]');
    expect(result.markdown).toContain('likes: 635');
    expect(result.markdown).not.toContain('\ndate: 2026-03-21T15:07:25.000Z');
  });

  it('leaves frontmatter unchanged when Obsidian toggle is off', () => {
    const data: ExtractedContent = {
      type: 'tweet',
      author: { name: 'Example', handle: '@example' },
      markdown: '# Example (@example)\n\nHello world.',
      sourceUrl: 'https://x.com/example/status/123',
      date: '2026-05-11T00:00:00.000Z',
      tweetId: '123',
    };

    const result = postProcess(data, { includeMetadata: true, downloadImages: false });

    expect(result.markdown).toContain('author: "Example"');
    expect(result.markdown).toContain('date: 2026-05-11T00:00:00.000Z');
    expect(result.markdown).not.toContain('published:');
    expect(result.markdown).not.toContain('tags:');
  });

  it('does not download link card preview images even on pbs.twimg.com', () => {
    const cardUrl = 'https://pbs.twimg.com/media/HEut_fPXkAA_Opf?format=jpg&name=large';
    const result = postProcess(
      content(`> ![Link card preview](${cardUrl})`),
      { includeMetadata: false, downloadImages: true }
    );

    expect(result.markdown).toContain(`![Link card preview](${cardUrl})`);
    expect(result.images).toEqual([]);
  });

  it('localizes only allowed X/Twitter media images', () => {
    const allowedUrl = 'https://pbs.twimg.com/media/example?format=jpg&name=large';
    const externalUrl = 'https://example.com/card.jpg';
    const result = postProcess(
      content(`![Allowed](${allowedUrl})\n![External](${externalUrl})`),
      { includeMetadata: false, downloadImages: true }
    );

    expect(result.markdown).toContain('![Allowed](example-123/example.jpg)');
    expect(result.markdown).toContain(`![External](${externalUrl})`);
    expect(result.images).toEqual([
      { url: allowedUrl, filename: 'example-123/example.jpg' },
    ]);
  });
});
