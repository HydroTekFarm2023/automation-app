import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import * as internal from 'assert';
import { PowerOutlet } from 'src/app/models/power-outlet.model';
import { MqttInterfaceService } from 'src/app/Services/mqtt-interface.service';
import { manualRfControlTopic, outletTestReqTopic } from 'src/app/Services/topicKeys';


@Component({
  selector: 'po-testing',
  templateUrl: './po-testing.component.html',
  styleUrls: ['./po-testing.component.scss'],
})
export class PoTestingComponent implements OnInit {
  @Input() data: PowerOutlet;
  @Input() topicID: string;
  //stateToggle: number;
  numState: number;
  //@Input() isTest: boolean;

  constructor(private mqttService: MqttInterfaceService, private alertController: AlertController) { }

  ngOnInit() {
    //this.stateToggle = 0;


  }

  onToggleClick() {
  
    //this.mqttService.subscribeToTopic();
    if(this.data.currentValue == false){
      this.numState = 1;
    }
    else{
      this.numState = 0;
    }

    let outletObj = {
      "choice":parseInt(this.data.id),
      //"switch_status":!this.data.currentValue
      "switch_status":this.numState,
      //"currentState":this.data.currentState
      //[this.data.id]: !this.data.currentValue 
    }

    let outletJsonString = JSON.stringify(outletObj);
    
    this.mqttService.publishMessage(outletTestReqTopic+"/" + this.topicID, outletJsonString, 1, false).catch((error) => {
      console.log(error);
      this.presentPowerOutletToggleError(this.data.currentValue, this.data.name);
      this.data.currentValue = !this.data.currentValue; 
    });

    // if (this.stateToggle == 0){
    //   this.stateToggle = 1;
    // }
    // else{
    //   this.stateToggle = 0;
    // }
  }

  async presentPowerOutletToggleError(state: boolean, outletName: string) {
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
