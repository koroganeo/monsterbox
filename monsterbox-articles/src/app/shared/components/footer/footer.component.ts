import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-gray-900 text-gray-300 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Brand -->
          <div>
            <h3 class="text-white text-xl font-bold mb-3">MonsterBox</h3>
            <p class="text-gray-400 text-sm leading-relaxed">
              {{ langService.t('footer.description') }}
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              {{ langService.t('nav.home') }}
            </h4>
            <ul class="space-y-2">
              <li>
                <a [routerLink]="['/', langService.currentLang()]"
                   class="text-sm hover:text-white transition-colors">
                  {{ langService.t('nav.home') }}
                </a>
              </li>
              <li>
                <a [routerLink]="['/', langService.currentLang(), 'articles']"
                   class="text-sm hover:text-white transition-colors">
                  {{ langService.t('nav.articles') }}
                </a>
              </li>
              <li>
                <a [routerLink]="['/', langService.currentLang(), 'search']"
                   class="text-sm hover:text-white transition-colors">
                  {{ langService.t('nav.search') }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Language -->
          <div>
            <h4 class="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              {{ langService.t('common.switchLanguage') }}
            </h4>
            <div class="flex gap-2">
              <button
                (click)="langService.switchLanguage('vi')"
                [class]="langService.isVietnamese()
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                Tiếng Việt
              </button>
              <button
                (click)="langService.switchLanguage('en')"
                [class]="langService.isEnglish()
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                English
              </button>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          {{ langService.t('footer.copyright') }}
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  langService = inject(LanguageService);
}
