import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sensor-display',
  templateUrl: './sensor-display.component.html',
  styleUrls: ['./sensor-display.component.scss'],
})
export class SensorDisplayComponent implements OnInit {

  @Input() sensor: SensorMonitoringWidget;

  @Input() 
  set allLiveData(allLiveData: string[]) {
    if (allLiveData) {
      for(let i = 0; i < allLiveData.length; i++) {
        if(allLiveData[i]["name"] == this.sensor.name) {
          this.currentVal = allLiveData[i]["value"];
          break;
        }
      }
    }
  }

  currentVal: number = 0;

  constructor() { }

  ngOnInit() { }
}

export interface SensorMonitoringWidget {
  name: string,
  display_name: string;
  monit_only: boolean;
  tgt: number;
  alarm_min: number;
  alarm_max: number;
}
