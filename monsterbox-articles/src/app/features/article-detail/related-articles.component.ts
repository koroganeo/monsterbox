import { Component, inject, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleIndexEntry } from '../../core/models/article.model';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-related-articles',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (articles().length > 0) {
      <section class="mt-12 pt-8 border-t border-gray-200">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
          {{ langService.t('article.relatedArticles') }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (article of articles(); track article.id) {
            <a [routerLink]="['/', lang(), 'article', article.id]"
               class="group block p-4 bg-white rounded-lg border border-gray-200
                      hover:border-blue-200 hover:shadow-sm transition-all">
              <span class="text-xs text-blue-600 font-medium">{{ article.metadata.genres }}</span>
              <h3 class="mt-1 text-sm font-semibold text-gray-900 group-hover:text-blue-600
                         transition-colors line-clamp-2">
                {{ article[lang()].title }}
              </h3>
              <p class="mt-1 text-xs text-gray-500 line-clamp-2">
                {{ article[lang()].description }}
              </p>
            </a>
          }
        </div>
      </section>
    }
  `
})
export class RelatedArticlesComponent {
  langService = inject(LanguageService);
  articles = input<ArticleIndexEntry[]>([]);
  lang = this.langService.currentLang;
}
