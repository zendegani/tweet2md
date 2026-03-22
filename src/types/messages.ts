export interface AuthorInfo {
  name: string;
  handle: string;
}

export interface TweetMetadata {
  replies?: number;
  reposts?: number;
  likes?: number;
  bookmarks?: number;
  views?: number;
}

export interface ExtractedContent {
  type: 'tweet' | 'thread' | 'article';
  author: AuthorInfo;
  title?: string;
  markdown: string;
  sourceUrl: string;
  date: string;
  tweetId: string;
  metadata?: TweetMetadata;
}

export interface ExtractRequest {
  action: 'EXTRACT';
  includeMetadata?: boolean;
}

export interface DownloadRequest {
  action: 'DOWNLOAD_MD';
  content: string;
  filename: string;
  images?: { url: string; filename: string }[];
}

export interface ExtractResponse {
  success: boolean;
  data?: ExtractedContent;
  error?: string;
}

export type MessageRequest = ExtractRequest | DownloadRequest;
