import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import {
  ArticlesIndex,
  ArticleIndexEntry,
  ArticleContent,
  Article
} from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private http = inject(HttpClient);
  private readonly BASE_PATH = '/assets/data';

  private indexData = toSignal(
    this.http.get<ArticlesIndex>(`${this.BASE_PATH}/articles-index.json`).pipe(
      catchError(() => of({ meta: { totalArticles: 0 }, articles: [] } as ArticlesIndex)),
      shareReplay(1)
    ),
    { initialValue: { meta: { totalArticles: 0 }, articles: [] } as ArticlesIndex }
  );

  readonly articles = computed(() => this.indexData().articles);
  readonly totalArticles = computed(() => this.indexData().meta.totalArticles);

  private contentCache = new Map<string, Observable<ArticleContent | null>>();
  private loadedArticles = new Map<string, ArticleContent>();

  getArticle(slug: string) {
    const cached = this.loadedArticles.get(slug);
    if (cached) {
      return signal(this.mergeWithIndex(slug, cached));
    }

    const content$ = this.loadArticleContent(slug);

    return toSignal(
      content$.pipe(
        map(content => {
          if (content) {
            this.loadedArticles.set(slug, content);
            return this.mergeWithIndex(slug, content);
          }
          return this.getIndexEntry(slug);
        })
      ),
      { initialValue: this.getIndexEntry(slug) }
    );
  }

  searchArticles(query: string, lang: 'vi' | 'en' = 'vi') {
    return computed(() => {
      const q = query.toLowerCase().trim();
      if (!q) return [];

      return this.articles().filter(article => {
        const content = article[lang];
        return (
          content.title.toLowerCase().includes(q) ||
          content.description.toLowerCase().includes(q) ||
          content.excerpt.toLowerCase().includes(q) ||
          content.tags.some(tag => tag.toLowerCase().includes(q))
        );
      });
    });
  }

  getArticlesByGenre(genre: string) {
    return computed(() =>
      this.articles().filter(a => a.metadata.genres.includes(genre))
    );
  }

  getRelatedArticles(articleId: string, limit = 5) {
    return computed(() => {
      const article = this.articles().find(a => a.id === articleId);
      if (!article) return [];

      const articleTags = new Set(article.metadata.tags);
      const genre = article.metadata.genres;

      return this.articles()
        .filter(a => a.id !== articleId)
        .map(a => ({
          article: a,
          score: this.calculateSimilarity(a, articleTags, genre)
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ article }) => article);
    });
  }

  getUniqueGenres() {
    return computed(() => {
      const genres = new Set<string>();
      this.articles().forEach(a => {
        if (a.metadata.genres) {
          a.metadata.genres.split(',').forEach(g => genres.add(g.trim()));
        }
      });
      return Array.from(genres).sort();
    });
  }

  preloadArticle(slug: string): void {
    if (!this.loadedArticles.has(slug) && !this.contentCache.has(slug)) {
      this.loadArticleContent(slug).subscribe();
    }
  }

  private loadArticleContent(slug: string): Observable<ArticleContent | null> {
    if (!this.contentCache.has(slug)) {
      const content$ = this.http
        .get<ArticleContent>(`${this.BASE_PATH}/articles/${slug}.json`)
        .pipe(
          catchError(() => of(null)),
          shareReplay(1)
        );

      this.contentCache.set(slug, content$);
    }

    return this.contentCache.get(slug)!;
  }

  private getIndexEntry(slug: string): Article | undefined {
    return this.articles().find(a => a.id === slug) as Article | undefined;
  }

  private mergeWithIndex(slug: string, content: ArticleContent): Article | undefined {
    const indexEntry = this.getIndexEntry(slug);
    if (!indexEntry) return undefined;

    return {
      ...indexEntry,
      vi: { ...indexEntry.vi, content: content.vi.content },
      en: { ...indexEntry.en, content: content.en.content }
    };
  }

  private calculateSimilarity(article: ArticleIndexEntry, tags: Set<string>, genre: string): number {
    let score = 0;
    if (article.metadata.genres === genre) score += 3;
    article.metadata.tags.forEach(tag => { if (tags.has(tag)) score += 1; });
    return score;
  }
}
