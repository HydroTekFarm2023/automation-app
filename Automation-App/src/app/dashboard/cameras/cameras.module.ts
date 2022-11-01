import { ComponentsModule } from 'src/app/components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CamerasPageRoutingModule } from './cameras-routing.module';

import { CamerasPage } from './cameras.page';
import { UserPage } from '../user/user.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CamerasPageRoutingModule,
    ComponentsModule
  ],
  declarations: [CamerasPage],
  providers: [UserPage]
})
export class CamerasPageModule {}
