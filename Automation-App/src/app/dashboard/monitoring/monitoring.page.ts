import { Component, OnInit } from "@angular/core";
import { skip } from "rxjs/operators";
import { MqttInterfaceService } from "src/app/Services/mqtt-interface.service";
import { ClimateControllerString, FertigationSystemString, VariableManagementService } from 'src/app/Services/variable-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { AddGrowroomPage } from 'src/app/add-growroom/add-growroom.page';
import { AddSystemPage } from 'src/app/add-system/add-system.page';
import { IdentifyDevicePage } from 'src/app/add-device/identify-device/identify-device.page';
import { Devices } from 'src/app/Services/variable-management.service';
import { SensorMonitoringWidget } from 'src/app/components/sensor-display/sensor-display.component';

@Component({
  selector: "app-monitoring",
  templateUrl: "./monitoring.page.html",
  styleUrls: ["./monitoring.page.scss"],
})
export class MonitoringPage implements OnInit {

  currentDevice: Devices;
  currentDeviceSettings: SensorMonitoringWidget[];
  liveData: string[];

  deviceName: string;
  timeStamp: string;
  noDevices: boolean;
  noMqttConnection: boolean;

  constructor(private mqttService: MqttInterfaceService, public variableManagementService: VariableManagementService, public route: ActivatedRoute, private actionSheetController: ActionSheetController, private modalController: ModalController, private router: Router) { }
 
  ngOnInit() {
    this.variableManagementService.fertigationSystemSettings.subscribe(resData =>{
      console.log(resData);
  })

    this.route.queryParams.subscribe(params => {
      let currentDeviceType = params['deviceType'];
      let currentDeviceIndex = params['deviceIndex'];

      if((currentDeviceType && currentDeviceIndex) != null) {
        this.currentDevice = this.variableManagementService.getCurrentDeviceSettings(currentDeviceType, currentDeviceIndex);
        this.currentDeviceSettings = [];
        for(let sensor in this.currentDevice.settings) {
          console.log(this.currentDevice.settings[sensor]);
          this.currentDeviceSettings.push({ 
            name: sensor,
            display_name: sensor,
            monit_only: this.currentDevice.settings[sensor].monit_only,
            tgt: this.currentDevice.settings[sensor].control.tgt,
            alarm_min: this.currentDevice.settings[sensor].alarm_min,
            alarm_max: this.currentDevice.settings[sensor].alarm_max });
        }
        console.log(this.currentDeviceSettings[0].display_name);
        this.startMqttProcessing();
      } else {
        console.log(this.variableManagementService.fertigationSystemSettings.value);
        if(this.variableManagementService.fertigationSystemSettings.value.length != 0) {
          this.router.navigate(['/dashboard/monitoring'], {queryParams: {deviceType: FertigationSystemString, deviceIndex: 0}});
        } else if(this.variableManagementService.climateControllerSettings.value.length != 0) {
          this.router.navigate(['/dashboard/monitoring'], {queryParams: {deviceType: ClimateControllerString, deviceIndex: 0}});
        } else {
          this.noDevices = true;
        }
      }
    });

    this.mqttService.deviceLiveData.subscribe(resData => {
      // Try parsing system MQTT string as JSON Data
      try{
        var jsonSensorData = JSON.parse(resData);
        // Store Time Stamp of Message
        this.timeStamp = jsonSensorData["time"];
        // Store sensor values into Display Objects to update UI
        this.liveData = jsonSensorData["sensors"];
      }
      catch(error){
        console.log(error);
      }
    });
  }

  startMqttProcessing() {
    this.mqttService.mqttStatus.pipe(skip(1)).subscribe(status => {
      console.log(status);
      switch(status) {
        case "connected": {
          this.mqttService.unsubscribeToTopic('live_data/#');
          this.mqttService.subscribeToTopic('live_data/' + this.currentDevice.topicID + '/#');
          break;
        }
        case "disconnected": {
          this.noMqttConnection = true;
          break;
        }
      }
    });
  }

  async presentModalIdentifyDevice() {
    const modal = await this.modalController.create({
      component: IdentifyDevicePage,
    });
    return await modal.present();
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Setup',
      buttons: [{
        text: 'Grow Room',
        handler: () => {
          this.presentGrowRoomModal();
        }
      }, 
      {
        text: 'System',
        handler: () => {
          this.presentSystemModal();
        }
      },
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  async presentGrowRoomModal() {
    const modal = await this.modalController.create({
      component: AddGrowroomPage,
    });
    return await modal.present();
  }

  async presentSystemModal() {
    const modal = await this.modalController.create({
      component: AddSystemPage,
    });
    return await modal.present();
  }
}
