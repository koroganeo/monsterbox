# Master Prompt for Claude Code - MonsterBox Bilingual Article Website

## Project Overview

Create a high-performance bilingual (Vietnamese/English) article website using Angular 21 with the following specifications:

- **646 articles** with full Vietnamese and English translations
- **Split files architecture** for optimal performance (1.3MB index + lazy-loaded content)
- **Responsive design** with Tailwind CSS
- **SEO-optimized** with static site generation
- **Signal-based** reactive state management
- **URL-based language routing**: `/vi/*` and `/en/*`

---

## Technical Requirements

### Framework & Version
- **Angular 21** (latest stable with standalone components)
- **Node.js**: 18+ or 20+
- **Package Manager**: npm or pnpm

### Core Technologies
1. **Angular 21 Features:**
   - Standalone components (no NgModules)
   - Signals for state management
   - Built-in control flow (@if, @for, @switch)
   - SSR with hydration
   - Deferrable views (@defer)

2. **Styling:**
   - Tailwind CSS v4
   - Responsive design (mobile-first)
   - Dark mode support (optional)

3. **Content:**
   - Markdown rendering with `marked` library
   - HTML sanitization with `DOMPurify`

4. **Routing:**
   - URL-based language switching
   - Lazy loading of routes
   - Prerendering for SEO

---

## Data Structure (CRITICAL - Already Prepared)

### File Organization
```
src/assets/data/
├── articles-index.json          # 1.3 MB - Metadata + excerpts for all articles
└── articles/                    # 646 individual files
    ├── article-slug-1.json      # ~35 KB each - Full content
    ├── article-slug-2.json
    └── ... (646 files)
```

### Index File Structure (articles-index.json)
```typescript
{
  "meta": {
    "totalArticles": 646,
    "lastUpdated": "2025-02-15T00:00:00Z"
  },
  "articles": [
    {
      "id": "article-slug",
      "metadata": {
        "titleVi": "Vietnamese Title",
        "titleEn": "English Title",
        "genres": "Category",
        "difficultyLevel": "Cơ bản | Trung bình | Chuyên sâu",
        "tags": ["tag1", "tag2"],
        "creators": ["Author Name"],
        "createdAt": "2020-11-25T00:00:00",
        "length": 8187,
        "page": 1
      },
      "vi": {
        "title": "Vietnamese Title",
        "description": "Vietnamese description...",
        "excerpt": "First 200 chars of content...",
        "tags": ["tag1", "tag2"],
        "genres": ["Category"]
      },
      "en": {
        "title": "English Title",
        "description": "English description...",
        "excerpt": "First 200 chars of content...",
        "tags": ["tag1", "tag2"],
        "genres": ["Category"]
      }
    }
  ]
}
```

### Individual Article File Structure (articles/{slug}.json)
```typescript
{
  "id": "article-slug",
  "vi": {
    "content": "Full Vietnamese article content in markdown/HTML..."
  },
  "en": {
    "content": "Full English article content in markdown/HTML..."
  }
}
```

---

## Project Structure (Required)

```
monsterbox-articles/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   ├── article.model.ts
│   │   │   │   └── language.model.ts
│   │   │   ├── services/
│   │   │   │   ├── article.service.ts        # CRITICAL - Split files implementation
│   │   │   │   └── language.service.ts       # CRITICAL - i18n state
│   │   │   └── guards/
│   │   │       └── language.guard.ts
│   │   ├── features/
│   │   │   ├── home/
│   │   │   │   └── home.component.ts
│   │   │   ├── article-list/
│   │   │   │   ├── article-list.component.ts
│   │   │   │   └── article-card.component.ts
│   │   │   ├── article-detail/
│   │   │   │   ├── article-detail.component.ts
│   │   │   │   └── related-articles.component.ts
│   │   │   └── search/
│   │   │       └── search.component.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   │   ├── header.component.ts
│   │   │   │   │   └── language-toggle.component.ts
│   │   │   │   ├── footer/
│   │   │   │   │   └── footer.component.ts
│   │   │   │   └── breadcrumbs/
│   │   │   │       └── breadcrumbs.component.ts
│   │   │   ├── pipes/
│   │   │   │   ├── markdown.pipe.ts
│   │   │   │   └── safe-html.pipe.ts
│   │   │   └── directives/
│   │   │       └── prefetch.directive.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   │   ├── data/                            # USER WILL PROVIDE THIS
│   │   │   ├── articles-index.json
│   │   │   └── articles/
│   │   ├── images/
│   │   └── i18n/
│   │       ├── vi.json
│   │       └── en.json
│   ├── styles/
│   │   ├── tailwind.css
│   │   └── markdown.css
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
├── angular.json
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Critical Implementation Details

### 1. Article Service (MUST IMPLEMENT EXACTLY)

```typescript
// src/app/core/services/article.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private http = inject(HttpClient);
  private readonly BASE_PATH = '/assets/data';
  
  // Load index once (1.3MB)
  private indexData = toSignal(
    this.http.get<ArticlesIndex>(`${this.BASE_PATH}/articles-index.json`).pipe(
      catchError(() => of({ meta: { totalArticles: 0 }, articles: [] })),
      shareReplay(1)
    ),
    { initialValue: { meta: { totalArticles: 0 }, articles: [] } }
  );
  
  readonly articles = computed(() => this.indexData().articles);
  readonly totalArticles = computed(() => this.indexData().meta.totalArticles);
  
  private contentCache = new Map<string, Observable<ArticleContent>>();
  private loadedArticles = new Map<string, ArticleContent>();
  
  // Get article with lazy-loaded content
  getArticle(slug: string) {
    const cached = this.loadedArticles.get(slug);
    if (cached) {
      return signal(this.mergeWithIndex(slug, cached));
    }
    
    const content$ = this.loadArticleContent(slug);
    
    return toSignal(
      content$.pipe(
        map(content => {
          if (content) {
            this.loadedArticles.set(slug, content);
            return this.mergeWithIndex(slug, content);
          }
          return this.getIndexEntry(slug);
        })
      ),
      { initialValue: this.getIndexEntry(slug) }
    );
  }
  
  searchArticles(query: string, lang: 'vi' | 'en' = 'vi') {
    return computed(() => {
      const q = query.toLowerCase().trim();
      if (!q) return [];
      
      return this.articles().filter(article => {
        const content = article[lang];
        return (
          content.title.toLowerCase().includes(q) ||
          content.description.toLowerCase().includes(q) ||
          content.excerpt.toLowerCase().includes(q) ||
          content.tags.some(tag => tag.toLowerCase().includes(q))
        );
      });
    });
  }
  
  getArticlesByGenre(genre: string) {
    return computed(() =>
      this.articles().filter(a => a.metadata.genres.includes(genre))
    );
  }
  
  getRelatedArticles(articleId: string, limit = 5) {
    return computed(() => {
      const article = this.articles().find(a => a.id === articleId);
      if (!article) return [];
      
      const articleTags = new Set(article.metadata.tags);
      const genre = article.metadata.genres;
      
      return this.articles()
        .filter(a => a.id !== articleId)
        .map(a => ({
          article: a,
          score: this.calculateSimilarity(a, articleTags, genre)
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ article }) => article);
    });
  }
  
  preloadArticle(slug: string): void {
    if (!this.loadedArticles.has(slug) && !this.contentCache.has(slug)) {
      this.loadArticleContent(slug).subscribe();
    }
  }
  
  private loadArticleContent(slug: string): Observable<ArticleContent | null> {
    if (!this.contentCache.has(slug)) {
      const content$ = this.http
        .get<ArticleContent>(`${this.BASE_PATH}/articles/${slug}.json`)
        .pipe(
          catchError(() => of(null)),
          shareReplay(1)
        );
      
      this.contentCache.set(slug, content$);
    }
    
    return this.contentCache.get(slug)!;
  }
  
  private getIndexEntry(slug: string): Article | undefined {
    return this.articles().find(a => a.id === slug);
  }
  
  private mergeWithIndex(slug: string, content: ArticleContent): Article | undefined {
    const indexEntry = this.getIndexEntry(slug);
    if (!indexEntry) return undefined;
    
    return {
      ...indexEntry,
      vi: { ...indexEntry.vi, content: content.vi.content },
      en: { ...indexEntry.en, content: content.en.content }
    };
  }
  
  private calculateSimilarity(article: ArticleIndexEntry, tags: Set<string>, genre: string): number {
    let score = 0;
    if (article.metadata.genres === genre) score += 3;
    article.metadata.tags.forEach(tag => { if (tags.has(tag)) score += 1; });
    return score;
  }
}
```

### 2. Language Service (MUST IMPLEMENT EXACTLY)

```typescript
// src/app/core/services/language.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export type Language = 'vi' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private _currentLang = signal<Language>('vi');
  
  readonly currentLang = this._currentLang.asReadonly();
  readonly isVietnamese = computed(() => this._currentLang() === 'vi');
  readonly isEnglish = computed(() => this._currentLang() === 'en');
  
  constructor(private router: Router) {
    const urlLang = this.detectLanguageFromUrl();
    const savedLang = localStorage.getItem('preferredLang') as Language;
    this._currentLang.set(urlLang || savedLang || 'vi');
  }
  
  switchLanguage(lang: Language) {
    this._currentLang.set(lang);
    localStorage.setItem('preferredLang', lang);
    
    const currentUrl = this.router.url;
    const newUrl = currentUrl.replace(/^\/(vi|en)/, `/${lang}`);
    this.router.navigateByUrl(newUrl);
  }
  
  toggleLanguage() {
    const newLang = this._currentLang() === 'vi' ? 'en' : 'vi';
    this.switchLanguage(newLang);
  }
  
  private detectLanguageFromUrl(): Language | null {
    const path = window.location.pathname;
    if (path.startsWith('/vi')) return 'vi';
    if (path.startsWith('/en')) return 'en';
    return null;
  }
}
```

### 3. Routing Configuration (MUST IMPLEMENT)

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/vi',
    pathMatch: 'full'
  },
  {
    path: ':lang',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component')
          .then(m => m.HomeComponent)
      },
      {
        path: 'articles',
        loadComponent: () => import('./features/article-list/article-list.component')
          .then(m => m.ArticleListComponent)
      },
      {
        path: 'article/:slug',
        loadComponent: () => import('./features/article-detail/article-detail.component')
          .then(m => m.ArticleDetailComponent)
      },
      {
        path: 'search',
        loadComponent: () => import('./features/search/search.component')
          .then(m => m.SearchComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/vi'
  }
];
```

---

## UI/UX Requirements

### Responsive Design (CRITICAL)

All components must be fully responsive with these breakpoints:
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

### Layout Structure

```
┌─────────────────────────────────────────┐
│ HEADER                                  │
│ [Logo] [Navigation] [Language Toggle]   │
├─────────────────────────────────────────┤
│ BREADCRUMBS (if not home)               │
├─────────────────────────────────────────┤
│                                         │
│ MAIN CONTENT AREA                       │
│                                         │
│ - Responsive grid (1/2/3 columns)       │
│ - Mobile: 1 column                      │
│ - Tablet: 2 columns                     │
│ - Desktop: 3 columns                    │
│                                         │
├─────────────────────────────────────────┤
│ FOOTER                                  │
│ [Links] [Copyright] [Social]            │
└─────────────────────────────────────────┘
```

### Header Component Requirements

```typescript
// Must include:
- Logo/Brand (links to home)
- Navigation menu
  - Home (Trang chủ / Home)
  - Articles (Bài viết / Articles)
  - Search (Tìm kiếm / Search)
- Language toggle button
  - Shows "EN" when in Vietnamese
  - Shows "VI" when in English
  - Smooth transition
- Mobile hamburger menu
```

### Article List Requirements

```typescript
// Display:
- Grid layout (responsive)
- Each card shows:
  - Title (in current language)
  - Description (in current language)
  - Excerpt (first 200 chars)
  - Tags (max 3 visible)
  - Date
  - Genre badge
- Search/filter functionality
- Pagination or infinite scroll
- Loading states
```

### Article Detail Requirements

```typescript
// Display:
- Full article title
- Metadata (date, authors, reading time)
- Tags (all, clickable)
- Full content (markdown rendered)
- Language toggle button
- Related articles section
- Breadcrumbs navigation
- Social sharing buttons (optional)
```

---

## Translation Requirements (CRITICAL)

### Language Switching Behavior

1. **URL Changes:**
   ```
   /vi/articles → /en/articles (when switching to English)
   /en/article/slug → /vi/article/slug (when switching to Vietnamese)
   ```

2. **Content Updates:**
   - All UI elements switch language
   - Article content switches between vi/en
   - Metadata switches (titles, descriptions, tags)
   - Navigation menu switches
   - All text switches

3. **State Preservation:**
   - User stays on same page (just language changes)
   - Scroll position maintained
   - Search query preserved

### UI Translation Files

```typescript
// src/assets/i18n/vi.json
{
  "nav": {
    "home": "Trang chủ",
    "articles": "Bài viết",
    "search": "Tìm kiếm"
  },
  "common": {
    "readMore": "Đọc thêm",
    "loading": "Đang tải...",
    "noResults": "Không tìm thấy kết quả",
    "search": "Tìm kiếm...",
    "switchLanguage": "Read in English"
  },
  "article": {
    "relatedArticles": "Bài viết liên quan",
    "readingTime": "phút đọc",
    "publishedOn": "Xuất bản vào"
  }
}
```

```typescript
// src/assets/i18n/en.json
{
  "nav": {
    "home": "Home",
    "articles": "Articles",
    "search": "Search"
  },
  "common": {
    "readMore": "Read more",
    "loading": "Loading...",
    "noResults": "No results found",
    "search": "Search...",
    "switchLanguage": "Đọc bằng Tiếng Việt"
  },
  "article": {
    "relatedArticles": "Related Articles",
    "readingTime": "min read",
    "publishedOn": "Published on"
  }
}
```

---

## Styling Requirements

### Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',    // Blue
        secondary: '#10B981',   // Green
        accent: '#F59E0B',      // Amber
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        vietnamese: ['Noto Sans', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            a: { color: '#3B82F6' },
            h1: { color: '#111827' },
            h2: { color: '#1F2937' },
            h3: { color: '#374151' },
          }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ]
}
```

### Markdown Content Styling

```css
/* src/styles/markdown.css */
.prose {
  @apply max-w-none;
}

.prose h1 {
  @apply text-4xl font-bold mb-4 mt-8;
}

.prose h2 {
  @apply text-3xl font-bold mb-3 mt-6;
}

.prose h3 {
  @apply text-2xl font-bold mb-2 mt-4;
}

.prose p {
  @apply mb-4 leading-relaxed;
}

.prose ul, .prose ol {
  @apply mb-4 ml-6;
}

.prose code {
  @apply bg-gray-100 px-1 py-0.5 rounded text-sm;
}

.prose pre {
  @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto;
}

.prose blockquote {
  @apply border-l-4 border-blue-500 pl-4 italic my-4;
}
```

---

## Performance Requirements

### Must Achieve:
- ✅ Lighthouse Performance Score: > 90
- ✅ First Contentful Paint: < 1.5s
- ✅ Time to Interactive: < 3s
- ✅ Initial Load Size: < 2MB (index only)
- ✅ Individual Article Load: < 0.5s

### Optimization Strategies:
1. Lazy loading of routes
2. Deferrable views for below-fold content
3. Image optimization with NgOptimizedImage
4. Prefetching on hover
5. Browser caching of individual articles

---

## SEO Requirements

### Meta Tags (Dynamic per page)

```typescript
// Update these for each route
this.title.setTitle(`${articleTitle} | MonsterBox`);
this.meta.updateTag({ name: 'description', content: articleDescription });
this.meta.updateTag({ property: 'og:title', content: articleTitle });
this.meta.updateTag({ property: 'og:description', content: articleDescription });
this.meta.updateTag({ property: 'og:url', content: currentUrl });
```

### Sitemap Generation
Generate sitemap.xml with all article URLs:
- `/vi` and `/en` for home
- `/vi/articles` and `/en/articles`
- `/vi/article/{slug}` and `/en/article/{slug}` for all 646 articles

---

## Testing Requirements

### Unit Tests
- Test ArticleService loading mechanism
- Test LanguageService switching
- Test component rendering

### E2E Tests
- Test navigation flow
- Test language switching
- Test article loading
- Test search functionality

---

## Deployment Configuration

### Build Command
```bash
ng build --configuration production
```

### Output
```
dist/
└── browser/
    ├── index.html
    ├── main-[hash].js
    ├── assets/
    │   └── data/
    │       ├── articles-index.json
    │       └── articles/
    └── ...
```

### Environment Variables
```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: '', // Not needed for static files
  baseUrl: 'https://monsterbox.com'
};
```

---

## Dependencies (package.json)

```json
{
  "dependencies": {
    "@angular/animations": "^21.0.0",
    "@angular/common": "^21.0.0",
    "@angular/compiler": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/forms": "^21.0.0",
    "@angular/platform-browser": "^21.0.0",
    "@angular/platform-browser-dynamic": "^21.0.0",
    "@angular/platform-server": "^21.0.0",
    "@angular/router": "^21.0.0",
    "@angular/ssr": "^21.0.0",
    "marked": "^12.0.0",
    "dompurify": "^3.0.0",
    "rxjs": "^7.8.0",
    "tslib": "^2.6.0",
    "zone.js": "^0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^21.0.0",
    "@angular/cli": "^21.0.0",
    "@angular/compiler-cli": "^21.0.0",
    "@types/dompurify": "^3.0.0",
    "@types/marked": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/typography": "^0.5.0",
    "@tailwindcss/forms": "^0.5.0",
    "typescript": "~5.6.0"
  }
}
```

---

## Success Criteria

The project is complete when:

✅ All 646 articles load correctly in both languages  
✅ Language switching works on all pages  
✅ Responsive design works on mobile/tablet/desktop  
✅ Initial page load is < 2 seconds  
✅ Individual articles load in < 0.5 seconds  
✅ Search functionality works  
✅ Related articles appear correctly  
✅ All UI text is translated  
✅ Lighthouse score > 90  
✅ Build completes without errors  
✅ Can deploy to Vercel/Netlify  

---

## Important Notes for Claude Code

1. **Data files are already prepared** - User will provide the optimized-data.tar.gz
2. **Use the exact ArticleService implementation** provided above
3. **Use the exact LanguageService implementation** provided above
4. **Follow Angular 21 best practices** - standalone components, signals, new control flow
5. **Make it fully responsive** - mobile-first approach
6. **Ensure all text is translatable** - no hardcoded strings
7. **Performance is critical** - lazy load everything possible
8. **TypeScript strict mode** - all types must be defined

---

## Questions to Ask User Before Starting

1. What is your preferred color scheme? (Default: Blue/Green)
2. Do you want dark mode support?
3. Do you have a logo image?
4. Do you want social sharing buttons?
5. Do you want analytics integration (Google Analytics)?
6. Do you want a comments section (future feature)?

---

## Final Deliverable

A complete, production-ready Angular 21 application that:
- Loads fast (1.3MB initial, 35KB per article)
- Looks great on all devices
- Switches languages seamlessly
- Is SEO-optimized
- Is deployable to any static hosting service
- Achieves 90+ Lighthouse score

This is a high-quality, professional website ready for production use.
