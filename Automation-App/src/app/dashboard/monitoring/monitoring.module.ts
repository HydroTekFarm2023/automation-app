import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonitoringPageRoutingModule } from './monitoring-routing.module';

import { MonitoringPage } from './monitoring.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonitoringPageRoutingModule,
    ComponentsModule
  ],
  declarations: [MonitoringPage]
})
export class MonitoringPageModule {}
