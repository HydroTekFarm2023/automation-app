import { Component, OnInit, Input } from '@angular/core';
import { Display } from 'src/app/dashboard/display';
import { VariableManagementService } from 'src/app/variable-management.service';
import { MqttInterfaceService } from 'src/app/Services/mqtt-interface.service';

@Component({
  selector: 'sensor-display',
  templateUrl: './sensor-display.component.html',
  styleUrls: ['./sensor-display.component.scss'],
})
export class SensorDisplayComponent implements OnInit {

  @Input() sensor: Display;

  constructor(private variableManagementService: VariableManagementService) {
    this.sensor = new Display("Untitled", "0", "0");
   }

  ngOnInit() { }

}
