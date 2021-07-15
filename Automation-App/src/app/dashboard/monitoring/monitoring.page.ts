import { Component, OnDestroy, OnInit } from "@angular/core";
import { filter } from "rxjs/operators";
import { ConnectionStatus, MqttInterfaceService } from "src/app/Services/mqtt-interface.service";
import { ClimateControllerString, FertigationSystemString, VariableManagementService } from 'src/app/Services/variable-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Devices } from 'src/app/Services/variable-management.service';
import { SensorMonitoringWidget } from 'src/app/components/sensor-display/sensor-display.component';
import { EquipmentStatus } from "src/app/models/equipment-status";
import { equipmentStatusTopic, liveDataTopic } from "src/app/Services/topicKeys";

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
  timestamp: string = "N/A";
  noDevices: boolean;

  equipmentStatus: EquipmentStatus;

  constructor(public mqttService: MqttInterfaceService, public variableManagementService: VariableManagementService, public route: ActivatedRoute, private router: Router) { }
 
  ngOnInit() {
    console.log("loaded");
    this.variableManagementService.fertigationSystemSettings.subscribe(resData =>{
      console.log(resData);
    });

    this.route.queryParams.subscribe(params => {
      let currentDeviceType = params['deviceType'];
      let currentDeviceIndex = params['deviceIndex'];

      if((currentDeviceType && currentDeviceIndex) != null) {
        this.currentDevice = this.variableManagementService.getCurrentDeviceSettings(currentDeviceType, currentDeviceIndex);
        this.currentDeviceSettings = [];
        for(let sensor in this.currentDevice.settings) {
          console.log(sensor);
          if(this.currentDevice.settings[sensor]['monit_only'] !== undefined) {
            console.log(this.currentDevice.settings[sensor]);
            this.currentDeviceSettings.push({ 
              name: sensor,
              display_name: this.currentDevice.settings[sensor].getDisplayName(),
              sensorUnit: this.currentDevice.settings[sensor].getSensorUnit(),
              monit_only: this.currentDevice.settings[sensor].monit_only,
              tgt: this.currentDevice.settings[sensor].control.tgt,
              alarm_min: this.currentDevice.settings[sensor].alarm_min,
              alarm_max: this.currentDevice.settings[sensor].alarm_max });
          }
        }

        this.mqttService.equipmentStatus.pipe(filter(equipmentStatus => equipmentStatus != null)).subscribe(equipmentStatus => {
          let rfArray = Object.keys(equipmentStatus.rf);
          this.currentDevice.power_outlets.forEach(powerOutlet => {
            for(let i = 0; i < rfArray.length; i++){
              if(powerOutlet.id == rfArray[i]) {
                powerOutlet.currentValue = equipmentStatus.rf[rfArray[i]];
                break;
              }
            }
          })
        });

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
      try {
        var jsonSensorData = JSON.parse(resData);
        // Store Time Stamp of Message
        let lastUpdatedTimeStamp = new Date(jsonSensorData["time"]);
        let lastUpdatedTime = lastUpdatedTimeStamp.toTimeString().slice(0, 9);
        
        let lastUpdatedDate;
        let currentDate = new Date();
        if(lastUpdatedTimeStamp.toDateString() == currentDate.toDateString()) {
          lastUpdatedDate = "Today";
        } else {
          lastUpdatedDate = lastUpdatedTimeStamp.toDateString();
        }
        console.log(lastUpdatedTimeStamp);
        console.log(lastUpdatedDate);
        this.timestamp = lastUpdatedDate + " " + lastUpdatedTime;
        
        // Store sensor values into Display Objects to update UI
        this.liveData = jsonSensorData["sensors"];
      }
      catch(error){
        console.log(error);
      }
    });
  }

  startMqttProcessing() {
    this.mqttService.mqttStatus.pipe().subscribe(status => {
      console.log(status);
      
      switch(status) {
        case ConnectionStatus.CONNECTED: {
          this.mqttService.unsubscribeToTopic(liveDataTopic + '/#');  // TODO: Unsubcribing to entire Wildcard does not work
          this.mqttService.unsubscribeToTopic(equipmentStatusTopic + '/#');
          console.log(this.currentDevice.topicID);
          this.mqttService.subscribeToTopic(liveDataTopic + '/' + this.currentDevice.topicID);
          this.mqttService.subscribeToTopic(equipmentStatusTopic + '/' + this.currentDevice.topicID);
          break;
        }
      }
    });
  }
}


