import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { clickedNotificationsPageRoutingModule } from './clickedNotifications-routing.module';

import { clickedNotificationsPage } from './clickedNotifications.page';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    clickedNotificationsPageRoutingModule,
   
  ],
  declarations: [clickedNotificationsPage],
  exports: [clickedNotificationsPage]

})
export class clickedNotificationsPageModule {}
