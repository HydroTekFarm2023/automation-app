import { AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { ClimateController } from '../models/climate-controller.model';
import { PowerOutlet } from '../models/power-outlet.model';
import { MqttInterfaceService } from '../Services/mqtt-interface.service';
import { deviceSettingsTopic } from '../Services/topicKeys';
import { VariableManagementService } from '../Services/variable-management.service';

@Component({
  selector: 'climate-controller',
  templateUrl: './add-climate-controller.page.html',
  styleUrls: ['./add-climate-controller.page.scss'],
})
export class AddClimateControllerPage implements OnInit, AfterViewInit {

  @Input() topicId: string;

  airTemperature: boolean = true;
  humidity: boolean = true;
  co2: boolean = true;

  powerOutlets: PowerOutlet[] = [];

  climateController: ClimateController;

  climateControllerForm: FormGroup = new FormGroup({});
  settingsForm: FormGroup = new FormGroup({});

  isLoading: boolean = false;

  constructor(public variableManagementService: VariableManagementService, private fb: FormBuilder, private mqttService: MqttInterfaceService, private modalController: ModalController, private alertController: AlertController, private changeDetectorRef: ChangeDetectorRef) { 
    this.climateControllerForm = this.fb.group({
      'settings': this.settingsForm
    });
  }

  ngOnInit() { }

  onSubmit() {
    console.log(this.climateControllerForm.value);
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
        let climateController = {
          name: this.climateControllerForm.get(["general_settings", "name"]).value,
          topicID: this.topicId,
          type: "climate-controller",
          settings: this.settingsForm.value,
          power_outlets: this.powerOutlets,
          device_started: false,
          cameras: []
        }

        this.variableManagementService.createClimateController(new ClimateController().deserialize(climateController)).subscribe(() => {
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

  onAddPowerOutlet(newPowerOutlet: PowerOutlet) {
    this.powerOutlets.push(newPowerOutlet);
  }

  // Close modal and return the index of the new device
  dismiss(){
    this.modalController.dismiss(this.variableManagementService.climateControllerSettings.value.length - 1);
  }

  ngAfterViewInit() {
    this.changeDetectorRef.detectChanges();
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
