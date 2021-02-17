import { Component, OnInit, Input } from '@angular/core';
import { Display } from 'src/app/dashboard/display';
import { VariableManagementService } from 'src/app/Services/variable-management.service';
import { MqttInterfaceService } from 'src/app/Services/mqtt-interface.service';
import { Devices } from 'src/app/Services/variable-management.service';

@Component({
  selector: 'sensor-display',
  templateUrl: './sensor-display.component.html',
  styleUrls: ['./sensor-display.component.scss'],
})
export class SensorDisplayComponent implements OnInit {

  @Input() sensor: SensorMonitoringWidget;
  @Input() currentValue = 0;

  constructor() {}

   getTime(): boolean {
    var date = new Date()
    return true;   
   }

  ngOnInit() { }
}

interface SensorMonitoringWidget {
  current_val?: number;
  title: string;
  monit_only: boolean;
  tgt: number;
  alarm_min: number;
  alarm_max: number;
}
