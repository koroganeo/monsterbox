import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ArticleService } from '../../core/services/article.service';
import { LanguageService } from '../../core/services/language.service';
import { ArticleCardComponent } from '../article-list/article-card.component';
import { BreadcrumbsComponent, Breadcrumb } from '../../shared/components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, ArticleCardComponent, BreadcrumbsComponent],
  template: `
    <app-breadcrumbs [items]="breadcrumbs()" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search Header -->
      <div class="max-w-2xl mx-auto mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6">
          {{ langService.t('nav.search') }}
        </h1>

        <div class="relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            [placeholder]="langService.t('search.placeholder')"
            [ngModel]="query()"
            (ngModelChange)="onQueryChange($event)"
            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-lg
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   shadow-sm"
            autofocus
          />
          @if (query()) {
            <button
              (click)="clearSearch()"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          }
        </div>
      </div>

      <!-- Filter Sections: Tags & Authors -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <!-- Tags Section -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            {{ langService.t('article.tags') }}
          </h2>
          <div class="flex flex-wrap gap-2">
            @for (tag of popularTags(); track tag) {
              <button
                (click)="selectTag(tag)"
                [class]="activeTag() === tag
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'"
                class="text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer font-medium">
                {{ tag }}
              </button>
            }
          </div>
        </div>

        <!-- Authors Section -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            {{ langService.t('article.author') }}
          </h2>
          <div class="flex flex-wrap gap-2">
            @for (author of allAuthors(); track author) {
              <button
                (click)="selectAuthor(author)"
                [class]="activeAuthor() === author
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'"
                class="text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer font-medium">
                {{ author }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Results -->
      @if (query()) {
        <p class="text-gray-500 mb-6">
          {{ langService.t('search.resultsFor') }}
          "<span class="font-semibold text-gray-900">{{ query() }}</span>"
          — {{ results().length }} {{ langService.t('common.totalArticles') }}
        </p>

        @if (results().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (article of paginatedResults(); track article.id) {
              <app-article-card [article]="article" />
            }
          </div>

          @if (hasMore()) {
            <div class="text-center mt-8">
              <button
                (click)="loadMore()"
                class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 transition-colors cursor-pointer">
                {{ langService.t('common.readMore') }}
              </button>
            </div>
          }
        } @else {
          <div class="text-center py-16">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <p class="text-gray-500 text-lg">{{ langService.t('search.noResults') }}</p>
          </div>
        }
      } @else {
        <!-- No query yet - show prompt -->
        <div class="text-center py-16">
          <svg class="w-20 h-20 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p class="text-gray-400 text-lg">{{ langService.t('search.placeholder') }}</p>
        </div>
      }
    </div>
  `
})
export class SearchComponent implements OnInit {
  articleService = inject(ArticleService);
  langService = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);

  query = signal('');
  displayCount = signal(12);

  lang = this.langService.currentLang;

  breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: this.langService.t('nav.search') }
  ]);

  activeTag = signal('');
  activeAuthor = signal('');

  popularTags = computed(() => {
    const tagCount = new Map<string, number>();
    this.articleService.articles().forEach(article => {
      article.metadata.tags.forEach(tag => {
        const t = tag.trim();
        if (t) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
      });
    });
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag]) => tag);
  });

  allAuthors = computed(() => {
    const authorSet = new Set<string>();
    this.articleService.articles().forEach(article => {
      article.metadata.creators.forEach(creator => {
        const c = creator.trim();
        if (c) authorSet.add(c);
      });
    });
    return Array.from(authorSet).sort();
  });

  results = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return [];
    const lang = this.lang();

    return this.articleService.articles().filter(article => {
      const content = article[lang];
      const isTagMatch = article.metadata.tags.some(tag => tag.toLowerCase().includes(q));
      const isAuthorMatch = article.metadata.creators.some(c => c.toLowerCase().includes(q));
      return (
        content.title.toLowerCase().includes(q) ||
        content.description.toLowerCase().includes(q) ||
        content.excerpt.toLowerCase().includes(q) ||
        isTagMatch ||
        isAuthorMatch
      );
    });
  });

  paginatedResults = computed(() =>
    this.results().slice(0, this.displayCount())
  );

  hasMore = computed(() =>
    this.results().length > this.displayCount()
  );

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const lang = params.get('lang');
      if (lang) this.langService.setLanguageFromRoute(lang);
    });

    this.route.queryParamMap.subscribe(params => {
      const q = params.get('q');
      if (q) this.query.set(q);
    });

    this.titleService.setTitle(`${this.langService.t('nav.search')} | MonsterBox`);
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    this.displayCount.set(12);
    this.activeTag.set('');
    this.activeAuthor.set('');
    this.router.navigate([], {
      queryParams: value ? { q: value } : {},
      queryParamsHandling: 'merge'
    });
  }

  selectTag(tag: string): void {
    const isSame = this.activeTag() === tag;
    this.activeTag.set(isSame ? '' : tag);
    this.activeAuthor.set('');
    const value = isSame ? '' : tag;
    this.query.set(value);
    this.displayCount.set(12);
    this.router.navigate([], {
      queryParams: value ? { q: value } : {},
      queryParamsHandling: 'merge'
    });
  }

  selectAuthor(author: string): void {
    const isSame = this.activeAuthor() === author;
    this.activeAuthor.set(isSame ? '' : author);
    this.activeTag.set('');
    const value = isSame ? '' : author;
    this.query.set(value);
    this.displayCount.set(12);
    this.router.navigate([], {
      queryParams: value ? { q: value } : {},
      queryParamsHandling: 'merge'
    });
  }

  clearSearch(): void {
    this.query.set('');
    this.displayCount.set(12);
    this.activeTag.set('');
    this.activeAuthor.set('');
    this.router.navigate([], { queryParams: {}, queryParamsHandling: 'merge' });
  }

  loadMore(): void {
    this.displayCount.update(c => c + 12);
  }
}
