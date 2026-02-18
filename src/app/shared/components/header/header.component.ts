import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../../core/services/language.service';
import { LanguageToggleComponent } from './language-toggle.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LanguageToggleComponent],
  template: `
    <header
      class="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a [routerLink]="['/', lang()]" class="flex items-center gap-2 group">
            <span
              class="text-2xl font-bold tracking-tight group-hover:text-blue-200 transition-colors"
            >
              Monster Box
            </span>
          </a>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            <a
              [routerLink]="['/', lang()]"
              routerLinkActive="bg-white/20"
              [routerLinkActiveOptions]="{ exact: true }"
              class="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {{ langService.t('nav.home') }}
            </a>
            <a
              [routerLink]="['/', lang(), 'articles']"
              routerLinkActive="bg-white/20"
              class="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {{ langService.t('nav.articles') }}
            </a>
            <a
              [routerLink]="['/', lang(), 'search']"
              routerLinkActive="bg-white/20"
              class="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {{ langService.t('nav.search') }}
            </a>
          </nav>

          <!-- Right side: Language Toggle + Mobile Menu -->
          <div class="flex items-center gap-3">
            <app-language-toggle />

            <!-- Mobile hamburger -->
            <button
              (click)="toggleMobileMenu()"
              class="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              @if (mobileMenuOpen()) {
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              } @else {
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              }
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen()) {
          <nav class="md:hidden pb-4 border-t border-white/10 pt-3 space-y-1">
            <a
              [routerLink]="['/', lang()]"
              (click)="closeMobileMenu()"
              routerLinkActive="bg-white/20"
              [routerLinkActiveOptions]="{ exact: true }"
              class="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {{ langService.t('nav.home') }}
            </a>
            <a
              [routerLink]="['/', lang(), 'articles']"
              (click)="closeMobileMenu()"
              routerLinkActive="bg-white/20"
              class="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {{ langService.t('nav.articles') }}
            </a>
            <a
              [routerLink]="['/', lang(), 'search']"
              (click)="closeMobileMenu()"
              routerLinkActive="bg-white/20"
              class="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {{ langService.t('nav.search') }}
            </a>
          </nav>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent {
  langService = inject(LanguageService);
  mobileMenuOpen = signal(false);

  lang = this.langService.currentLang;

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
