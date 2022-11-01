import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  //Lazyloading is used to load pages.
  {
    path: 'auth', 
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'analytics',
    loadChildren:()=> import('./graphs/visualization/visualization.module').then( m => m.VisualizationPageModule),
    canLoad: [AuthGuard]
  }, 
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'add-power-outlet',
    loadChildren: () => import('./add-power-outlet/add-power-outlet.module').then( m => m.AddPowerOutletPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'add-camera',
    loadChildren: () => import('./add-camera/add-camera.module').then( m => m.AddCameraPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'testing',
    loadChildren: () => import('./testing/testing.module').then( m => m.TestingPageModule)
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
