import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { clickedNotificationsPage } from './clickedNotifications.page';

const routes: Routes = [
  
  {
    path: '',
    component: clickedNotificationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class clickedNotificationsPageRoutingModule {}
