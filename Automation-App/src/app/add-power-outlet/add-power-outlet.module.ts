import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddPowerOutletPageRoutingModule } from './add-power-outlet-routing.module';

import { AddPowerOutletPage } from './add-power-outlet.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddPowerOutletPageRoutingModule
  ],
  declarations: [AddPowerOutletPage]
})
export class AddPowerOutletPageModule {}
