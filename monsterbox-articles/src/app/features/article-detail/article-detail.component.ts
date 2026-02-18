import { Component, inject, computed, OnInit, signal, DestroyRef, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ArticleService } from '../../core/services/article.service';
import { LanguageService } from '../../core/services/language.service';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { BreadcrumbsComponent, Breadcrumb } from '../../shared/components/breadcrumbs/breadcrumbs.component';
import { RelatedArticlesComponent } from './related-articles.component';
import { Article } from '../../core/models/article.model';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [RouterLink, MarkdownPipe, SafeHtmlPipe, BreadcrumbsComponent, RelatedArticlesComponent],
  template: `
    <app-breadcrumbs [items]="breadcrumbs()" />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      @if (loadError()) {
        <!-- Error state -->
        <div class="text-center py-16">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <p class="text-gray-500 text-lg">{{ langService.isVietnamese() ? 'Không tìm thấy bài viết.' : 'Article not found.' }}</p>
          <a [routerLink]="['/', lang(), 'articles']"
             class="mt-4 inline-block text-blue-600 hover:underline">
            ← {{ langService.t('article.backToList') }}
          </a>
        </div>
      } @else if (article()) {
        <!-- Article Header -->
        <header class="mb-8">
          <div class="flex items-center gap-2 mb-4 flex-wrap">
            <a [routerLink]="['/', lang(), 'articles']"
               class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
              ← {{ langService.t('article.backToList') }}
            </a>
          </div>

          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {{ article()![lang()].title }}
          </h1>

          <p class="text-lg text-gray-600 mb-6">
            {{ article()![lang()].description }}
          </p>

          <!-- Meta Info -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-200">
            @if (article()!.metadata.creators.length > 0) {
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span>{{ article()!.metadata.creators.join(', ') }}</span>
              </div>
            }

            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>{{ langService.t('article.publishedOn') }}: {{ formatDate(article()!.metadata.createdAt) }}</span>
            </div>

            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ readingTime() }} {{ langService.t('article.readingTime') }}</span>
            </div>

            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                         bg-blue-100 text-blue-800">
              {{ article()!.metadata.genres }}
            </span>

            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  [class]="difficultyClass()">
              {{ article()!.metadata.difficultyLevel }}
            </span>
          </div>
        </header>

        <!-- Tags -->
        @if (article()![lang()].tags.length > 0) {
          <div class="flex flex-wrap gap-2 mb-8">
            @for (tag of article()![lang()].tags; track tag) {
              <span class="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                {{ tag }}
              </span>
            }
          </div>
        }

        <!-- Article Content -->
        <article class="prose prose-lg max-w-none">
          @if (articleContent()) {
            <div [innerHTML]="articleContent()! | markdown | safeHtml"></div>
          } @else {
            <div class="text-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-gray-500">{{ langService.t('common.loading') }}</p>
            </div>
          }
        </article>

        <!-- Related Articles -->
        <app-related-articles [articles]="relatedArticles()" />
      } @else {
        <!-- Loading State -->
        <div class="text-center py-16">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-500 text-lg">{{ langService.t('common.loading') }}</p>
        </div>
      }
    </div>
  `
})
export class ArticleDetailComponent implements OnInit {
  private articleService = inject(ArticleService);
  langService = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private destroyRef = inject(DestroyRef);

  lang = this.langService.currentLang;

  // Plain signals — updated via direct subscriptions (no injection context issues)
  article = signal<Article | undefined>(undefined);
  loadError = signal(false);

  articleContent = computed(() => {
    const a = this.article();
    if (!a) return null;
    return a[this.lang()]?.content ?? null;
  });

  readingTime = computed(() => {
    const a = this.article();
    if (!a) return 0;
    return Math.max(1, Math.ceil((a.metadata.length || 0) / 1500));
  });

  relatedArticles = computed(() => {
    const a = this.article();
    if (!a) return [];
    return this.articleService.getRelatedArticles(a.id, 6)();
  });

  breadcrumbs = computed<Breadcrumb[]>(() => {
    const a = this.article();
    return [
      { label: this.langService.t('nav.articles'), route: ['/', this.lang(), 'articles'] },
      { label: a ? a[this.lang()].title : '...' }
    ];
  });

  constructor() {
    effect(() => {
      const a = this.article();
      if (a) {
        const lang = this.lang();
        this.titleService.setTitle(`${a[lang].title} | MonsterBox`);
        this.metaService.updateTag({ name: 'description', content: a[lang].description });
        this.metaService.updateTag({ property: 'og:title', content: a[lang].title });
        this.metaService.updateTag({ property: 'og:description', content: a[lang].description });
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const lang = params.get('lang');
        if (lang) this.langService.setLanguageFromRoute(lang);

        const slug = params.get('slug');
        if (slug) {
          // Reset state when navigating to a new article
          this.article.set(undefined);
          this.loadError.set(false);

          this.articleService.getArticle$(slug)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (art) => {
                if (art) {
                  this.article.set(art);
                } else {
                  this.loadError.set(true);
                }
              },
              error: () => this.loadError.set(true)
            });
        }
      });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(this.lang() === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  difficultyClass(): string {
    const a = this.article();
    if (!a) return '';
    const level = a.metadata.difficultyLevel;
    if (level.includes('Cơ bản') || level.includes('Basic')) return 'bg-green-100 text-green-800';
    if (level.includes('Nâng cao') || level.includes('Chuyên sâu') || level.includes('Advanced')) return 'bg-red-100 text-red-800';
    return 'bg-amber-100 text-amber-800';
  }
}
