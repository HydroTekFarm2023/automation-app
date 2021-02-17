import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Devices, FertigationSystemString, ClimateControllerString, VariableManagementService } from 'src/app/Services/variable-management.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, filter } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import * as _ from "lodash";
import { MqttInterfaceService } from 'src/app/Services/mqtt-interface.service';
import { ActivatedRoute } from '@angular/router';

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

  ph: boolean = true;
  ec: boolean = true;
  water_temperature: boolean = true;

  humidity: boolean = true;
  air_temperature: boolean = true;

  formValue$: Observable<any>;
  isDirty: boolean = false;

  constructor(public variableManagementService: VariableManagementService, private fb: FormBuilder, private changeDetector: ChangeDetectorRef, private modalController: ModalController, private mqttService: MqttInterfaceService, private route: ActivatedRoute) { 
    this.mqttService.mqttStatus.subscribe((status) => {
      console.log(status);
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentDeviceType = params['deviceType'];
      this.currentDeviceIndex = params['deviceIndex'];

      if((this.currentDeviceType && this.currentDeviceIndex) != null) {
        console.log(this.variableManagementService.fertigationSystemSettings.value);
        this.currentDevice = this.variableManagementService.getCurrentDeviceSettings(this.currentDeviceType, this.currentDeviceIndex);
        this.changeDetector.detectChanges();
        this.settingsForm.patchValue(this.currentDevice.settings);
        console.log(this.settingsForm.value);
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
      this.isDirty = (_.isEqual(formValue, this.currentDevice.settings) == false);
    });
  }

  onBootButtonClick() {
    let device = {...this.currentDevice}
    device.settings = this.settingsForm.value;
    //this.mqttService.publishMessage();
    device.device_started = !this.currentDevice.device_started;
    this.onSettingsFormSubmit(device);    
  }
  
  // update data in backend
  onSettingsFormSubmit(currentDevice?: Devices){
     var changedData = [];
     for(var key in this.settingsForm.value){
       if(!_.isEqual(this.settingsForm.value[key], this.currentDevice.settings[key])) {
        changedData.push({ [key]: this.settingsForm.value[key] });
      }
    }
    console.log(changedData);
    // this.mqttService.publishMessage("D1000/device_settings", JSON.stringify({ data: changedData}), 1, false).then(() => {
    let device;
    if(currentDevice) {
        device = currentDevice
    } else {
      device = {...this.currentDevice}
      device.settings = this.settingsForm.value;
    }
      
    this.variableManagementService
      .updateDeviceSettings(device, this.currentDeviceType, this.currentDevice._id, this.currentDeviceIndex)
        .subscribe(() => {
          this.currentDevice = device;
          this.isDirty = false;
        }, (error) => {console.log(error)});
    // },
    // (error) => {
    //   console.log(error);
    // });
  }
}
