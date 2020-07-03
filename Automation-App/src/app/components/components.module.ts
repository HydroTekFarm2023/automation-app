import { NgModule, Component } from '@angular/core';
import { SensorDisplayComponent } from './sensor-display/sensor-display.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
    declarations: [SensorDisplayComponent],
    imports: [IonicModule],
    exports: [SensorDisplayComponent]
})

export class ComponentsModule {}