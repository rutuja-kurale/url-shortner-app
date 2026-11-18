import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Dashboard } from './features/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Home, title: 'Shortly | URL Shortener' },
  { path: 'dashboard', component: Dashboard, title: 'Shortly | Dashboard' },
  { path: '**', redirectTo: '' },
];
