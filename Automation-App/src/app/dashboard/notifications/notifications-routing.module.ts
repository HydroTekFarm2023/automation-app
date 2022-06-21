import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificationsPage } from './notifications.page';

const routes: Routes = [
 
  {
    path: 'clickedNotifications',
    loadChildren: () => import('./clickedNotifications/clickedNotifications.module').then( m => m.clickedNotificationsPageModule)
  },

  {

    
    path: '',
    component: NotificationsPage,
    
    
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationsPageRoutingModule {}
