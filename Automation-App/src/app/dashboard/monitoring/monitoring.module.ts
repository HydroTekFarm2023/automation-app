import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonitoringPageRoutingModule } from './monitoring-routing.module';

import { MonitoringPage } from './monitoring.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { AddClimateControllerPageModule } from 'src/app/add-climate-controller/add-climate-controller.module';
import { AddFertigationSystemPageModule } from 'src/app/add-fertigation-system/add-fertigation-system.module';
import { CreateClusterPageModule } from 'src/app/create-cluster/create-cluster.module';
import { IdentifyDevicePageModule } from 'src/app/add-device/identify-device/identify-device.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonitoringPageRoutingModule,
    ComponentsModule,
    AddClimateControllerPageModule,
    AddFertigationSystemPageModule,
    CreateClusterPageModule,
    IdentifyDevicePageModule
  ],
  declarations: [MonitoringPage]
})
export class MonitoringPageModule {}
