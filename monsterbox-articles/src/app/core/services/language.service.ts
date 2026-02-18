import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Language, TranslationSet } from '../models/language.model';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private router = inject(Router);
  private http = inject(HttpClient);

  private _currentLang = signal<Language>('vi');
  private _translations = signal<TranslationSet | null>(null);

  readonly currentLang = this._currentLang.asReadonly();
  readonly isVietnamese = computed(() => this._currentLang() === 'vi');
  readonly isEnglish = computed(() => this._currentLang() === 'en');
  readonly translations = this._translations.asReadonly();

  constructor() {
    const urlLang = this.detectLanguageFromUrl();
    const savedLang = this.getSavedLang();
    const lang = urlLang || savedLang || 'vi';
    this._currentLang.set(lang);
    this.loadTranslations(lang);
  }

  switchLanguage(lang: Language): void {
    this._currentLang.set(lang);
    this.saveLang(lang);
    this.loadTranslations(lang);

    const currentUrl = this.router.url;
    const newUrl = currentUrl.replace(/^\/(vi|en)/, `/${lang}`);
    this.router.navigateByUrl(newUrl);
  }

  toggleLanguage(): void {
    const newLang = this._currentLang() === 'vi' ? 'en' : 'vi';
    this.switchLanguage(newLang);
  }

  setLanguageFromRoute(lang: string): void {
    if (lang === 'vi' || lang === 'en') {
      this._currentLang.set(lang);
      this.saveLang(lang);
      this.loadTranslations(lang);
    }
  }

  t(key: string): string {
    const translations = this._translations();
    if (!translations) return key;

    const keys = key.split('.');
    let result: unknown = translations;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof result === 'string' ? result : key;
  }

  private loadTranslations(lang: Language): void {
    this.http.get<TranslationSet>(`/assets/i18n/${lang}.json`).subscribe({
      next: (translations) => this._translations.set(translations),
      error: () => console.error(`Failed to load translations for ${lang}`)
    });
  }

  private detectLanguageFromUrl(): Language | null {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    if (path.startsWith('/vi')) return 'vi';
    if (path.startsWith('/en')) return 'en';
    return null;
  }

  private getSavedLang(): Language | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('preferredLang') as Language | null;
  }

  private saveLang(lang: Language): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferredLang', lang);
    }
  }
}
