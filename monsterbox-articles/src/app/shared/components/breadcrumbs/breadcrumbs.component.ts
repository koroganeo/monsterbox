import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../../core/services/language.service';

export interface Breadcrumb {
  label: string;
  route?: string[];
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav aria-label="Breadcrumb" class="bg-gray-50 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol class="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <li>
            <a [routerLink]="['/', lang()]"
               class="hover:text-blue-600 transition-colors">
              {{ langService.t('nav.home') }}
            </a>
          </li>
          @for (crumb of items(); track crumb.label; let last = $last) {
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              @if (!last && crumb.route) {
                <a [routerLink]="crumb.route"
                   class="hover:text-blue-600 transition-colors">
                  {{ crumb.label }}
                </a>
              } @else {
                <span class="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">
                  {{ crumb.label }}
                </span>
              }
            </li>
          }
        </ol>
      </div>
    </nav>
  `
})
export class BreadcrumbsComponent {
  langService = inject(LanguageService);
  items = input<Breadcrumb[]>([]);

  lang = this.langService.currentLang;
}
