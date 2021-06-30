import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { PowerOutlet } from '../models/power-outlet.model';
import { MqttInterfaceService } from '../Services/mqtt-interface.service';
import { manualRfControlTopic } from '../Services/topicKeys';

@Component({
  selector: 'app-add-power-outlet',
  templateUrl: './add-power-outlet.page.html',
  styleUrls: ['./add-power-outlet.page.scss'],
})
export class AddPowerOutletPage implements OnInit {

  @Input() powerOutletName: string;
  @Input() topicID: string;

  powerOutletIndex = -1;
  outletToggleVal = false;

  powerOutletStructure: PowerOutlet[] = 
  [
      // Fertigation System Power Outlets
      new PowerOutlet("0", "Water Cooler", "snow-outline"),
      new PowerOutlet("1", "Water Heater", "flame-outline"),
      new PowerOutlet("2", "Irrigation", "water-outline"),
      new PowerOutlet("3", "Reservoir Water In", "return-down-back-outline"),
      new PowerOutlet("4", "Reservoir Water Out", "return-down-forward-outline"),
      
      // Climate Controller Power Outlets
      new PowerOutlet("0", "CO2 Injector", "cloud-outline"),
      new PowerOutlet("1", "Air Heater", "flame-outline"),
      new PowerOutlet("2", "Air Cooler", "snow-outline"),
      new PowerOutlet("3", "Humidifier", "water-outline"),
      new PowerOutlet("4", "Dehumidifier", "umbrella-outline")
  ]

  constructor(public modalController: ModalController, private mqttService: MqttInterfaceService, private alertController: AlertController) { 
    for(var i = 1; i < 11; i++) {
      this.powerOutletStructure.push(new PowerOutlet((i + 4).toString(), "Grow Light " + i, "sunny-outline"));
    }
  }

  ngOnInit() {
    for (let i = 0; i < this.powerOutletStructure.length; i++) {
      if(this.powerOutletStructure[i].name == this.powerOutletName) {
        this.powerOutletIndex = i;
        break;
      } 
    }
  }

  toggleOutlet() {
    if(this.powerOutletIndex >= 0) {
      let outletObj = {
        [this.powerOutletStructure[this.powerOutletIndex].id]: this.outletToggleVal
      }
      let outletJsonString = JSON.stringify(outletObj);
      console.log(this.topicID);
      this.mqttService.publishMessage(manualRfControlTopic + "/" + this.topicID, outletJsonString, 1, false).catch((error) => {
        console.log(error);
        this.presentPowerOutletToggleError(this.outletToggleVal, this.powerOutletName);
        this.outletToggleVal = !this.outletToggleVal; 
      });
    } else {
      console.warn("Power Outlet Name Not Found. Current Index: " + this.powerOutletIndex);
    }

  }

  addPowerOutlet() {
    this.modalController.dismiss(this.powerOutletStructure[this.powerOutletIndex]);
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
