import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { LanguageService } from '../services/language.service';

export const languageGuard: CanActivateFn = (route) => {
  const languageService = inject(LanguageService);
  const lang = route.paramMap.get('lang');

  if (lang === 'vi' || lang === 'en') {
    languageService.setLanguageFromRoute(lang);
    return true;
  }

  return true;
};
