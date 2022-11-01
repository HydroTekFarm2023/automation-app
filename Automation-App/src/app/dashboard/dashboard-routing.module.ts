import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardPage } from './dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    children:[
 //Routing for tabs  

 {
  path: 'notifications',
  loadChildren: () => import('./notifications/notifications.module').then( m => m.NotificationsPageModule)
},
  {
    path: 'monitoring',
    loadChildren: () => import('./monitoring/monitoring.module').then( m => m.MonitoringPageModule)
  },
  {
    path: 'monitoring/:deviceType/:deviceIndex',
    loadChildren: () => import('./monitoring/monitoring.module').then( m => m.MonitoringPageModule)
  },
  {
    path: 'control',
    loadChildren: () => import('./control/control.module').then( m => m.ControlPageModule)
  },
  {
    path: 'control/:deviceType/:deviceIndex',
    loadChildren: () => import('./control/control.module').then( m => m.ControlPageModule)
  },
  {
    path: 'cameras',
    loadChildren: () => import('./cameras/cameras.module').then( m => m.CamerasPageModule)
  },
  {
    path: 'analytics',
    loadChildren: () => import('./analytics/analytics.module').then( m => m.AnalyticsPageModule)
  },
  {
    path: 'testing',
    loadChildren: () => import('./testing/testing.module').then( m => m.TestingPageModule)
  },
  {
    path: '',
    redirectTo: '/dashboard/monitoring',
    pathMatch: 'full'
  }
 ]
  }
  

];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule {}
