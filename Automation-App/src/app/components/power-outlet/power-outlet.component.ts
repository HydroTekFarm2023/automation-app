import { Component, Input, OnInit } from '@angular/core';
import { PowerOutlet } from 'src/app/models/power-outlet.model';
import { MqttInterfaceService } from 'src/app/Services/mqtt-interface.service';

@Component({
  selector: 'power-outlet',
  templateUrl: './power-outlet.component.html',
  styleUrls: ['./power-outlet.component.scss'],
})
export class PowerOutletComponent implements OnInit {

  @Input() data: PowerOutlet;

  constructor(private mqttService: MqttInterfaceService) { }

  ngOnInit() {}

  onToggleClick() {
    let outletObj = {
      [this.data.id]: !this.data.currentValue 
    }

    let outletJsonString = JSON.stringify(outletObj);
    this.mqttService.publishMessage("manual_rf_control/a23b5", outletJsonString, 1, false);
  }
}
