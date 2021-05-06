import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddPowerOutletPage } from './add-power-outlet.page';

const routes: Routes = [
  {
    path: '',
    component: AddPowerOutletPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddPowerOutletPageRoutingModule {}
