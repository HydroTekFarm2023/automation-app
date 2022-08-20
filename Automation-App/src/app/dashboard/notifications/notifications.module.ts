import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationsPageRoutingModule } from './notifications-routing.module';

import { NotificationsPage } from './notifications.page';
import { clickedNotificationsPageModule } from './clickedNotifications/clickedNotifications.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationsPageRoutingModule,
    ComponentsModule,
    clickedNotificationsPageModule
  ],
  declarations: [NotificationsPage],
  exports:[NotificationsPage]
})
export class NotificationsPageModule {}
