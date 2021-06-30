import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { FertigationSystem } from '../models/fertigation-system.model';
import { PowerOutlet } from '../models/power-outlet.model';
import { MqttInterfaceService } from '../Services/mqtt-interface.service';
import { deviceSettingsTopic } from '../Services/topicKeys';
import { VariableManagementService, plant } from '../Services/variable-management.service';

@Component({
  selector: 'add-fertigation-system',
  templateUrl: './add-fertigation-system.page.html',
  styleUrls: ['./add-fertigation-system.page.scss'],
})
export class AddFertigationSystemPage implements OnInit {

  @Input() topicId: string;

  ph: boolean = true;
  ec: boolean = true;
  waterTemperature: boolean = true;
  reservoir: boolean = true;
  growLights: boolean = true;
  irrigation: boolean = true;

  powerOutlets: PowerOutlet[] = [];
  growLightArray: PowerOutlet[] = [];

  plantName: string;

  fertigationSystem: FertigationSystem;

  fertigationSystemForm: FormGroup = new FormGroup({});
  settingsForm: FormGroup = new FormGroup({});

  plantAlertOptions: any = {
    header: "Plant Name"
  }

  isLoading: boolean = false;

  constructor(public variableManagementService: VariableManagementService, private fb: FormBuilder, private mqttService: MqttInterfaceService, private modalController: ModalController, private alertController: AlertController) { 
    if(this.variableManagementService.plants.length == 0){
      this.isLoading = true;
      this.variableManagementService.getPlants().subscribe(() => {
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
    }
    this.fertigationSystemForm = this.fb.group({
      'name': this.fb.control(null),
     // 'plant_name': this.fb.control(null),
      'settings': this.settingsForm
    });
  }

  ngOnInit() {
  }

  onSubmit() {
    console.log(this.fertigationSystemForm.value);
    var messages = [];
    for(var key in this.settingsForm.value) {
      messages.push({
        topic: deviceSettingsTopic + "/" + this.topicId,
        payload: JSON.stringify({ [key]: this.settingsForm.value[key] }),
        qos: 1,
        retained: false
      });
    } 

    this.mqttService.publishMultipleMessages(messages).then((index) => {
      if(index == messages.length) {
        let fertigationSystem = {
          name: this.fertigationSystemForm.get("name").value,
          topicID: this.topicId,
          type: "fertigation-system",
          settings: this.settingsForm.value,
          power_outlets: this.powerOutlets,
          device_started: false,
          cameras: []
        }

        this.variableManagementService.createFertigationSystem(new FertigationSystem().deserialize(fertigationSystem)).subscribe(() => {
          this.dismiss();
        }, error => {
          console.warn(error);
          this.presentMongoPushError();
        });

      } else {
        console.log("only " + (index + 1) + " messages out of " + messages.length + " pushed");
        this.presentDevicePushError();
      }
    }).catch((error) => {
      console.warn(error);
      this.presentDevicePushError();
    });
  }

  // addRecommendedSettings(value: plant){
  //   var temp = { ...value.settings };
  //   for(var key of Object.keys(temp)){
  //     temp[key] = {
  //       "monitoring_only": false,
  //       "alarm_min":  temp[key].alarm_min,
  //       "alarm_max": temp[key].alarm_max,
  //       "control": {
  //         "target_value": temp[key].target_value,
  //         "day_and_night": temp[key].day_and_night,
  //         "day_target_value": temp[key].day_target_value,
  //         "night_target_value": temp[key].night_target_value
  //       }
  //     }
  //   }
  //   this.settingsForm.patchValue(temp);
  // }

  onAddPowerOutlet(newPowerOutlet: PowerOutlet) {
    this.powerOutlets.push(newPowerOutlet);
  }

  // Close modal and return the index of the new device
  dismiss(){
    this.modalController.dismiss(this.variableManagementService.fertigationSystemSettings.value.length - 1);
  }

  async presentDevicePushError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Unable to push settings to device',
      buttons: ['OK']
    });
    await alert.present();
  }

  async presentMongoPushError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Unable to connect to Hydrotek Cloud',
      buttons: ['OK']
    });
    await alert.present();
  }
}
