export type Language = 'vi' | 'en';

export interface TranslationSet {
  nav: {
    home: string;
    articles: string;
    search: string;
  };
  common: {
    readMore: string;
    loading: string;
    noResults: string;
    search: string;
    switchLanguage: string;
    allArticles: string;
    featuredArticles: string;
    browseAll: string;
    totalArticles: string;
  };
  article: {
    relatedArticles: string;
    readingTime: string;
    publishedOn: string;
    author: string;
    difficulty: string;
    genre: string;
    tags: string;
    backToList: string;
  };
  search: {
    placeholder: string;
    resultsFor: string;
    noResults: string;
  };
  footer: {
    copyright: string;
    description: string;
  };
}
