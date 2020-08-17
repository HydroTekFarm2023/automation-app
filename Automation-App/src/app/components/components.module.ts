import { NgModule, Component } from '@angular/core';
import { SensorDisplayComponent } from './sensor-display/sensor-display.component';
import { IonicModule } from '@ionic/angular';
import { PhComponent } from './ph/ph.component';
import { CommonModule } from '@angular/common';
import { EcComponent } from './ec/ec.component';
import { AirTemperatureComponent } from './air-temperature/air-temperature.component';
import { HumidityComponent } from './humidity/humidity.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WaterTempComponent } from './water-temp/water-temp.component';

@NgModule({
    declarations: [SensorDisplayComponent, PhComponent, EcComponent, AirTemperatureComponent, HumidityComponent, WaterTempComponent],
    imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
    exports: [SensorDisplayComponent, PhComponent, EcComponent, AirTemperatureComponent, HumidityComponent, WaterTempComponent]
})

export class ComponentsModule {}