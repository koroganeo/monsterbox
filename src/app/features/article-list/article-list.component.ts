import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../core/services/article.service';
import { LanguageService } from '../../core/services/language.service';
import { ArticleCardComponent } from './article-card.component';
import { BreadcrumbsComponent, Breadcrumb } from '../../shared/components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [ArticleCardComponent, BreadcrumbsComponent, FormsModule],
  template: `
    <app-breadcrumbs [items]="breadcrumbs()" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header & Filters -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
            {{ langService.t('common.allArticles') }}
          </h1>
          <p class="text-gray-500 mt-1">
            {{ filteredArticles().length }} {{ langService.t('common.totalArticles') }}
          </p>
        </div>

        <!-- Filter controls -->
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            [placeholder]="langService.t('common.search')"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2
                   focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
          />
          <select
            [ngModel]="selectedGenre()"
            (ngModelChange)="onGenreChange($event)"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2
                   focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
          >
            <option value="">{{ langService.t('article.genre') }}: {{ langService.isVietnamese() ? 'Tất cả' : 'All' }}</option>
            @for (genre of genres(); track genre) {
              <option [value]="genre">{{ genre }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Articles Grid -->
      @if (paginatedArticles().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (article of paginatedArticles(); track article.id) {
            <app-article-card [article]="article" />
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-center gap-2 mt-10">
            <button
              (click)="goToPage(currentPage() - 1)"
              [disabled]="currentPage() === 1"
              class="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50
                     transition-colors cursor-pointer">
              ←
            </button>

            @for (page of visiblePages(); track page) {
              @if (page === -1) {
                <span class="px-2 text-gray-400">...</span>
              } @else {
                <button
                  (click)="goToPage(page)"
                  [class]="page === currentPage()
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                  class="px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer">
                  {{ page }}
                </button>
              }
            }

            <button
              (click)="goToPage(currentPage() + 1)"
              [disabled]="currentPage() === totalPages()"
              class="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50
                     transition-colors cursor-pointer">
              →
            </button>
          </div>
        }
      } @else {
        <div class="text-center py-16">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-gray-500 text-lg">{{ langService.t('common.noResults') }}</p>
        </div>
      }
    </div>
  `
})
export class ArticleListComponent implements OnInit {
  articleService = inject(ArticleService);
  langService = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);

  searchQuery = signal('');
  selectedGenre = signal('');
  currentPage = signal(1);
  readonly pageSize = 12;

  lang = this.langService.currentLang;

  genres = this.articleService.getUniqueGenres();

  breadcrumbs = computed<Breadcrumb[]>(() => [
    { label: this.langService.t('nav.articles') }
  ]);

  filteredArticles = computed(() => {
    let articles = this.articleService.articles();
    const query = this.searchQuery().toLowerCase().trim();
    const genre = this.selectedGenre();
    const lang = this.lang();

    if (query) {
      articles = articles.filter(a => {
        const content = a[lang];
        return (
          content.title.toLowerCase().includes(query) ||
          content.description.toLowerCase().includes(query) ||
          content.tags.some(t => t.toLowerCase().includes(query))
        );
      });
    }

    if (genre) {
      articles = articles.filter(a => a.metadata.genres.includes(genre));
    }

    return articles;
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredArticles().length / this.pageSize))
  );

  paginatedArticles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredArticles().slice(start, start + this.pageSize);
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const lang = params.get('lang');
      if (lang) this.langService.setLanguageFromRoute(lang);
    });
    this.titleService.setTitle(`${this.langService.t('nav.articles')} | Monster Box`);
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  onGenreChange(value: string): void {
    this.selectedGenre.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
