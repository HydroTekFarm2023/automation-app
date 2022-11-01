import { SensorGraphComponent } from './sensor-graph/sensor-graph.component';
import { CameraComponent } from './camera/camera.component';
import { NgModule } from '@angular/core';
import { SensorDisplayComponent } from './sensor-display/sensor-display.component';
import { IonicModule } from '@ionic/angular';
import { PhComponent } from './ph/ph.component';
import { CommonModule } from '@angular/common';
import { EcComponent } from './ec/ec.component';
import { AirTemperatureComponent } from './air-temperature/air-temperature.component';
import { HumidityComponent } from './humidity/humidity.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WaterTempComponent } from './water-temp/water-temp.component';
import { ReservoirComponent } from './reservoir/reservoir.component';
import { GrowLightsComponent } from './grow-lights/grow-lights.component';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import { IrrigationComponent } from './irrigation/irrigation.component';
import { PowerOutletComponent } from './power-outlet/power-outlet.component';
import { Co2Component } from './co2/co2.component';
import { ConnectionStatusComponent } from './connection-status/connection-status.component';
import { SensorTestingComponent } from './sensor-testing/sensor-testing.component';
import { PumpTestingComponent } from './pump-testing/pump-testing.component';
import { PoTestingComponent } from './po-testing/po-testing.component';
import { FloatSwitchComponent } from './float-switch/float-switch.component';

@NgModule({
    declarations: [SensorDisplayComponent, PhComponent, EcComponent, AirTemperatureComponent, HumidityComponent, WaterTempComponent, ReservoirComponent, GrowLightsComponent, GeneralSettingsComponent, IrrigationComponent, PowerOutletComponent, CameraComponent, Co2Component, ConnectionStatusComponent, SensorGraphComponent,SensorTestingComponent, PumpTestingComponent, FloatSwitchComponent, PoTestingComponent],
    imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
    exports: [SensorDisplayComponent, PhComponent, EcComponent, AirTemperatureComponent, HumidityComponent, WaterTempComponent, ReservoirComponent, GrowLightsComponent, GeneralSettingsComponent, IrrigationComponent, PowerOutletComponent, CameraComponent, Co2Component, ConnectionStatusComponent, SensorGraphComponent, SensorTestingComponent, PumpTestingComponent, PoTestingComponent, FloatSwitchComponent]
})

export class ComponentsModule {}