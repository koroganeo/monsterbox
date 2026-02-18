export interface ArticleLocalizedContent {
  title: string;
  description: string;
  excerpt: string;
  tags: string[];
  genres: string[];
  content?: string;
}

export interface ArticleMetadata {
  titleVi: string;
  titleEn: string;
  genres: string;
  difficultyLevel: string;
  tags: string[];
  creators: string[];
  createdAt: string;
  length: number;
  page: number;
}

export interface ArticleIndexEntry {
  id: string;
  metadata: ArticleMetadata;
  vi: ArticleLocalizedContent;
  en: ArticleLocalizedContent;
}

export interface ArticlesIndex {
  meta: {
    totalArticles: number;
    generatedAt?: string;
    lastUpdated?: string;
    version?: string;
  };
  articles: ArticleIndexEntry[];
}

export interface ArticleContent {
  id: string;
  vi: { content: string };
  en: { content: string };
}

export interface Article extends ArticleIndexEntry {
  vi: ArticleLocalizedContent & { content?: string };
  en: ArticleLocalizedContent & { content?: string };
}
