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
      [attr.aria-label]="
        langService.isVietnamese() ? 'Chuyển sang tiếng Anh' : 'Switch to Vietnamese'
      "
      [title]="langService.isVietnamese() ? 'Chuyển sang tiếng Anh' : 'Switch to Vietnamese'"
    >
      <span class="text-xs">{{ langService.isVietnamese() ? '🇻🇳' : '🇬🇧' }}</span>
      <span>{{ langService.isVietnamese() ? 'VI' : 'EN' }}</span>
    </button>
  `,
})
export class LanguageToggleComponent {
  langService = inject(LanguageService);
}
