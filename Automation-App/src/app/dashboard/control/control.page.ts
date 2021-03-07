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
        console.log(this.currentDevice);
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
      console.log(formValue);
      console.log(this.currentDevice.settings);
      console.log(this.currentDevice.settings["ph"]);
      
      this.isDirty = (_.isEqual(formValue, JSON.parse(JSON.stringify(this.currentDevice.settings))) == false);
      console.log(formValue);
      console.log(JSON.parse(JSON.stringify(this.currentDevice.settings)));
    });
  }

//   getObjectDiff(obj1, obj2) {
//     const diff = Object.keys(obj1).reduce((result, key) => {
//         if (!obj2.hasOwnProperty(key)) {
//             console.log(key);
//             result.push(key);
//         } else if (_.isEqual(obj1[key], obj2[key])) {
//             const resultKeyIndex = result.indexOf(key);
//             console.log(key);
//             result.splice(resultKeyIndex, 1);
//         }
//         return result;
//     }, Object.keys(obj2));

//     return diff;
// }

  onBootButtonClick() {
    this.currentDevice.device_started = !this.currentDevice.device_started;
    this.mqttService.publishMessage("device_status", this.currentDevice.device_started? "1" : "0");
    this.onSettingsFormSubmit();    
  }
  
  // update data in backend
  onSettingsFormSubmit(){
     var changedData = [];
     for(var key in this.settingsForm.value){
       console.log(key);
       if(!_.isEqual(this.settingsForm.value[key], this.currentDevice.settings[key])) {
        changedData.push({ [key]: this.settingsForm.value[key] });
      }
    }
    console.log(changedData);
    this.mqttService.publishMessage("device_settings/" + this.currentDevice.topicID, JSON.stringify({ data: changedData}), 1, false).then(() => {
    let device;
    device = {...this.currentDevice};
    device.settings = this.settingsForm.value;
    
    console.log("pushed changes");
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

