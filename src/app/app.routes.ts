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
