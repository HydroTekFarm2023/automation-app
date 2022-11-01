import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { MqttInterfaceService } from 'src/app/Services/mqtt-interface.service';
import { sensorTestReqTopic } from 'src/app/Services/topicKeys';

@Component({
  selector: 'sensor-testing',
  templateUrl: './sensor-testing.component.html',
  styleUrls: ['./sensor-testing.component.scss'],
})
export class SensorTestingComponent implements OnInit {
  num_state: number;
  @Input() topicID: string;
  @Input() sensor: SensorTestingWidget;
 

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

  constructor(private mqttService: MqttInterfaceService, private alertController: AlertController) { }

  ngOnInit() {}

  onToggleClick(){
    if(this.sensor.test_toggle == false){
      this.num_state = 1
    }
    else{
      this.num_state = 0
    }
    let outletObj = {
      "choice": this.sensor.name,
      "switch_status": this.num_state
    }
    console.log(this.sensor.test_toggle);
    
    let outletJsonString = JSON.stringify(outletObj);
    

    this.mqttService.publishMessage(sensorTestReqTopic+"/" + this.topicID, outletJsonString, 1, false).catch((error) => {
      console.log(error);
      this.presentSensorToggleError(this.sensor.test_toggle, this.sensor.name);
      this.sensor.test_toggle = !this.sensor.test_toggle; 
    });  

  }

  async presentSensorToggleError(state: boolean, outletName: string) {
    let outletState = 'off';
    if(state) {
      outletState = 'on';
    } 

    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Unable to turn ' + outletState + ' ' + outletName,
      buttons: ['OK']
    });
    await alert.present();
  }

}

export interface SensorTestingWidget {
  test_status: number;
  test_toggle: boolean;
  name: string,
  display_name: string;
  sensorUnit: string;
  monit_only: boolean;
  // tgt: number;
  // alarm_min: number;
  // alarm_max: number;
}
