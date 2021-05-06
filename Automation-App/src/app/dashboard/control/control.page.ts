import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Devices, FertigationSystemString, ClimateControllerString, VariableManagementService } from 'src/app/Services/variable-management.service';
import { FormGroup } from '@angular/forms';
import { debounceTime, filter } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import * as _ from "lodash";
import { MqttInterfaceService } from 'src/app/Services/mqtt-interface.service';
import { ActivatedRoute } from '@angular/router';
import { FertigationSystem } from 'src/app/models/fertigation-system.model';
import { ClimateController } from 'src/app/models/climate-controller.model';
import { PowerOutlet } from 'src/app/models/power-outlet.model';

@Component({
  selector: 'app-control',
  templateUrl: './control.page.html',
  styleUrls: ['./control.page.scss'],
})

export class ControlPage implements OnInit {

  FertigationSystemString = FertigationSystemString;
  ClimateControllerString = ClimateControllerString;

  startDeviceString = "Start Device";
  stopDeviceString = "Stop Device";

  currentDevice: Devices;
  noDevices: boolean;
  currentDeviceType: string;
  currentDeviceIndex: number;

  settingsForm: FormGroup = new FormGroup({});
  powerOutlets: PowerOutlet[] = [];
  growLightArray = [];

  ph: boolean = true;
  ec: boolean = true;
  waterTemperature: boolean = true;
  reservoir: boolean = true;
  growLights: boolean = true;
  irrigation: boolean = true;

  humidity: boolean = true;
  air_temperature: boolean = true;

  formValue$: Observable<any>;
  isDirty: boolean = false;

  constructor(public variableManagementService: VariableManagementService, private changeDetector: ChangeDetectorRef, private modalController: ModalController, private mqttService: MqttInterfaceService, private route: ActivatedRoute) { 
    this.mqttService.mqttStatus.subscribe((status) => {
      console.log(status);
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentDeviceType = params['deviceType'];
      this.currentDeviceIndex = params['deviceIndex'];

      if((this.currentDeviceType && this.currentDeviceIndex) != null) {
        this.currentDevice = this.variableManagementService.getCurrentDeviceSettings(this.currentDeviceType, this.currentDeviceIndex);
        this.changeDetector.detectChanges();
        this.settingsForm.patchValue(this.currentDevice.settings);
        this.growLightArray = this.currentDevice.settings['grow_lights']['power_outlets'];
        this.powerOutlets = this.currentDevice.power_outlets
      } else {
        let fertigationSystemCount = this.variableManagementService.fertigationSystemSettings.value.length;
        let climateControllerCount = this.variableManagementService.climateControllerSettings.value.length
        if((fertigationSystemCount && climateControllerCount) == 0) {
          this.noDevices = true;
        } 
      }
    });
    this.formValue$ = this.settingsForm.valueChanges.pipe(debounceTime(300), filter(() => this.noDevices != true));
    this.formValue$.subscribe((formValue) => {   
      let a = JSON.parse(JSON.stringify(formValue));
      let b = JSON.parse(JSON.stringify(this.currentDevice.settings));
      this.isDirty = (_.isEqual(a, b) == false);
    });
  }

  onAddPowerOutlet(newPowerOutlet: PowerOutlet) {
    this.currentDevice.power_outlets.push(newPowerOutlet);
    this.onSettingsFormSubmit();
    this.changeDetector.detectChanges();
  }

  onBootButtonClick() {
    this.currentDevice.device_started = !this.currentDevice.device_started;
    this.mqttService.publishMessage("device_status/" + this.currentDevice.topicID, this.currentDevice.device_started? "1" : "0");
    this.onSettingsFormSubmit();    
  }
   
  // update data in backend
  onSettingsFormSubmit() {
     var changedData = [];
     for(var key in this.settingsForm.value){
       if(!_.isMatch(this.settingsForm.value[key], this.currentDevice.settings[key])) {
        changedData.push({ [key]: this.settingsForm.value[key] });
      }
    }
    console.log(changedData);
    this.mqttService.publishMessage("device_settings/" + this.currentDevice.topicID, JSON.stringify({ data: changedData}), 1, false).then(() => {
    let device;
    device = { ...this.currentDevice };
    device.settings = this.settingsForm.value;
    if(this.currentDeviceType == FertigationSystemString) {
      device = new FertigationSystem().deserialize(device);
    } 
    else if(this.currentDeviceType == ClimateControllerString) {
      device = new ClimateController().deserialize(device);
    }

    this.variableManagementService
      .updateDeviceSettings(device, this.currentDeviceType, this.currentDevice._id, this.currentDeviceIndex)
        .subscribe(() => {
          this.currentDevice = device;
          this.isDirty = false;
        }, (error) => {console.log(error)});
    },
    (error) => {
      console.log(error);
    });
  }
}

