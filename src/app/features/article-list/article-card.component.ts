import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleIndexEntry } from '../../core/models/article.model';
import { LanguageService } from '../../core/services/language.service';
import { ArticleService } from '../../core/services/article.service';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/', lang(), 'article', article().id]"
       (mouseenter)="onHover()"
       class="group block bg-white rounded-xl shadow-sm border border-gray-200
              hover:shadow-md hover:border-blue-200 transition-all duration-200 h-full">
      <div class="p-5 sm:p-6 flex flex-col h-full">
        <!-- Meta info -->
        <div class="flex items-center gap-2 mb-3 flex-wrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                       bg-blue-100 text-blue-800">
            {{ article().metadata.genres }}
          </span>
          @if (!article().metadata.difficultyLevel.toLowerCase().includes('không có thông tin')) {
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  [class]="difficultyClass()">
              {{ article().metadata.difficultyLevel }}
            </span>
          }
          <span class="text-xs text-gray-400 ml-auto">
            {{ formatDate(article().metadata.createdAt) }}
          </span>
        </div>

        <!-- Title -->
        <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600
                   transition-colors mb-2 line-clamp-2">
          {{ article()[lang()].title }}
        </h3>

        <!-- Description -->
        <p class="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
          {{ article()[lang()].description }}
        </p>

        <!-- Tags & Read more -->
        <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div class="flex gap-1.5 overflow-hidden">
            @for (tag of article()[lang()].tags.slice(0, 3); track tag) {
              <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                {{ tag }}
              </span>
            }
          </div>
          <span class="text-blue-600 text-sm font-medium group-hover:underline whitespace-nowrap ml-2">
            {{ langService.t('common.readMore') }} →
          </span>
        </div>
      </div>
    </a>
  `
})
export class ArticleCardComponent {
  langService = inject(LanguageService);
  private articleService = inject(ArticleService);

  article = input.required<ArticleIndexEntry>();

  lang = this.langService.currentLang;

  difficultyClass(): string {
    const level = this.article().metadata.difficultyLevel;
    if (level.includes('Cơ bản') || level.includes('Basic')) {
      return 'bg-green-100 text-green-800';
    }
    if (level.includes('Nâng cao') || level.includes('Chuyên sâu') || level.includes('Advanced')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-amber-100 text-amber-800';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(this.lang() === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onHover(): void {
    this.articleService.preloadArticle(this.article().id);
  }
}
