import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    // Cuando la URL esté vacía, redirigir al dashboard
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    // Ruta principal para tu panel de control
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/dashboard')
      .then(m => m.DashboardComponent)
  },
];
