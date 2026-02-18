import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  template: `
    <button
      (click)="langService.toggleLanguage()"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
             bg-white/10 hover:bg-white/20 text-white transition-all duration-200
             border border-white/20 hover:border-white/40 cursor-pointer"
      [attr.aria-label]="langService.isVietnamese() ? 'Switch to English' : 'Chuyển sang Tiếng Việt'"
    >
      <span class="text-xs">{{ langService.isVietnamese() ? '🇬🇧' : '🇻🇳' }}</span>
      <span>{{ langService.isVietnamese() ? 'EN' : 'VI' }}</span>
    </button>
  `
})
export class LanguageToggleComponent {
  langService = inject(LanguageService);
}
