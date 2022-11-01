import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Pump } from 'src/app/models/pump-testing.model';
import { MqttInterfaceService } from 'src/app/Services/mqtt-interface.service';
import { manualRfControlTopic, motorTestReqTopic } from 'src/app/Services/topicKeys';

@Component({
  selector: 'pump-testing',
  templateUrl: './pump-testing.component.html',
  styleUrls: ['./pump-testing.component.scss'],
})
export class PumpTestingComponent implements OnInit {

  @Input() data: Pump;
  @Input() topicID: string;
  numState: number;
  stateToggle: number;
   
  constructor(private mqttService: MqttInterfaceService, private alertController: AlertController) { }

  ngOnInit() {
    this.stateToggle = 0;
  }

  onToggleClick() {
    
    if(this.data.currentValue == false){
      this.numState = 1;
    }
    else{
      this.numState = 0;
    }
    

    let outletObj = {
      "choice":parseInt(this.data.id),
      //"switch_status":!this.data.currentValue
      "switch_status":this.numState
      //[this.data.id]: !this.data.currentValue 
    }

    let outletJsonString = JSON.stringify(outletObj);
    //test_motor_request
    //test_motor_response
    this.mqttService.publishMessage(motorTestReqTopic+"/" + this.topicID, outletJsonString, 1, false).catch((error) => {
      console.log(error);
      this.presentPumpToggleError(this.data.currentValue, this.data.name);
      this.data.currentValue = !this.data.currentValue; 
    });
    /** 
    if (this.stateToggle == 0){
      this.stateToggle = 1;
    }
    else{
      this.stateToggle = 0;
    }
    */
  }

  async presentPumpToggleError(state: boolean, outletName: string) {
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
