import { Component, inject, computed, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ArticleService } from '../../core/services/article.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            MonsterBox
          </h1>
          <p class="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            {{ langService.t('footer.description') }}
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a [routerLink]="['/', lang(), 'articles']"
               class="inline-flex items-center px-6 py-3 rounded-lg bg-white text-blue-700 font-semibold
                      hover:bg-blue-50 transition-colors shadow-lg">
              {{ langService.t('common.browseAll') }}
              <svg class="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
            <a [routerLink]="['/', lang(), 'search']"
               class="inline-flex items-center px-6 py-3 rounded-lg bg-white/10 text-white font-semibold
                      hover:bg-white/20 transition-colors border border-white/20">
              {{ langService.t('nav.search') }}
            </a>
          </div>
          <p class="mt-6 text-blue-200 text-sm">
            {{ articleService.totalArticles() }} {{ langService.t('common.totalArticles') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Featured Articles -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">
          {{ langService.t('common.featuredArticles') }}
        </h2>
        <a [routerLink]="['/', lang(), 'articles']"
           class="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
          {{ langService.t('common.browseAll') }}
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (article of featuredArticles(); track article.id) {
          <a [routerLink]="['/', lang(), 'article', article.id]"
             class="group block bg-white rounded-xl shadow-sm border border-gray-200
                    hover:shadow-md hover:border-blue-200 transition-all duration-200">
            <div class="p-6">
              <div class="flex items-center gap-2 mb-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                             bg-blue-100 text-blue-800">
                  {{ article.metadata.genres }}
                </span>
                <span class="text-xs text-gray-400">
                  {{ formatDate(article.metadata.createdAt) }}
                </span>
              </div>

              <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600
                         transition-colors mb-2 line-clamp-2">
                {{ article[lang()].title }}
              </h3>

              <p class="text-gray-600 text-sm line-clamp-3 mb-4">
                {{ article[lang()].description }}
              </p>

              <div class="flex items-center justify-between">
                <div class="flex gap-1.5">
                  @for (tag of article[lang()].tags.slice(0, 2); track tag) {
                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {{ tag }}
                    </span>
                  }
                </div>
                <span class="text-blue-600 text-sm font-medium group-hover:underline">
                  {{ langService.t('common.readMore') }} →
                </span>
              </div>
            </div>
          </a>
        }
      </div>
    </section>

    <!-- Stats Section -->
    <section class="bg-gray-50 border-t border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div class="text-3xl font-bold text-blue-600">{{ articleService.totalArticles() }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ langService.t('common.totalArticles') }}</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-green-600">{{ genreCount() }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ langService.t('article.genre') }}</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-amber-600">2</div>
            <div class="text-sm text-gray-500 mt-1">{{ langService.isVietnamese() ? 'Ngôn ngữ' : 'Languages' }}</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-purple-600">100%</div>
            <div class="text-sm text-gray-500 mt-1">{{ langService.isVietnamese() ? 'Dịch thuật' : 'Translated' }}</div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  articleService = inject(ArticleService);
  langService = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private title = inject(Title);
  private meta = inject(Meta);

  lang = this.langService.currentLang;

  featuredArticles = computed(() =>
    this.articleService.articles().slice(0, 6)
  );

  genreCount = computed(() =>
    this.articleService.getUniqueGenres()().length
  );

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const lang = params.get('lang');
      if (lang) this.langService.setLanguageFromRoute(lang);
    });

    this.title.setTitle('MonsterBox - Bilingual Articles');
    this.meta.updateTag({ name: 'description', content: 'Bilingual Vietnamese-English article platform' });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(this.lang() === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
