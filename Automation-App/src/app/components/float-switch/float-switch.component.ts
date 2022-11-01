import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FloatSwitch } from 'src/app/models/float-switch.model';
import { MqttInterfaceService } from 'src/app/Services/mqtt-interface.service';
import { fsTestReqTopic } from 'src/app/Services/topicKeys';

@Component({
  selector: 'float-switch',
  templateUrl: './float-switch.component.html',
  styleUrls: ['./float-switch.component.scss'],
})
export class FloatSwitchComponent implements OnInit {

  @Input() data: FloatSwitch;
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
    this.mqttService.publishMessage(fsTestReqTopic+"/" + this.topicID, outletJsonString, 1, false).catch((error) => {
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
