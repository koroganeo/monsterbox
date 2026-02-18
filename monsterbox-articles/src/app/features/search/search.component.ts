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
      <div class="max-w-2xl mx-auto mb-10">
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

  results = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return [];
    const lang = this.lang();

    return this.articleService.articles().filter(article => {
      const content = article[lang];
      return (
        content.title.toLowerCase().includes(q) ||
        content.description.toLowerCase().includes(q) ||
        content.excerpt.toLowerCase().includes(q) ||
        content.tags.some(tag => tag.toLowerCase().includes(q))
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
    this.router.navigate([], {
      queryParams: value ? { q: value } : {},
      queryParamsHandling: 'merge'
    });
  }

  clearSearch(): void {
    this.onQueryChange('');
  }

  loadMore(): void {
    this.displayCount.update(c => c + 12);
  }
}
