export interface AuthorInfo {
  name: string;
  handle: string;
}

export interface ExtractedContent {
  type: 'tweet' | 'article';
  author: AuthorInfo;
  title?: string;
  markdown: string;
  sourceUrl: string;
  date: string;
  tweetId: string;
}

export interface ExtractRequest {
  action: 'EXTRACT';
}

export interface DownloadRequest {
  action: 'DOWNLOAD_MD';
  content: string;
  filename: string;
}

export interface ExtractResponse {
  success: boolean;
  data?: ExtractedContent;
  error?: string;
}

export type MessageRequest = ExtractRequest | DownloadRequest;
