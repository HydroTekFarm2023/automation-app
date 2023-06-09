import { Component, OnInit } from "@angular/core";
import { filter } from "rxjs/operators";
import { ConnectionStatus, MqttInterfaceService } from "src/app/Services/mqtt-interface.service";
import { ClimateControllerString, FertigationSystemString, VariableManagementService } from 'src/app/Services/variable-management.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Devices } from 'src/app/Services/variable-management.service';
import { SensorMonitoringWidget } from 'src/app/components/sensor-display/sensor-display.component';
import { equipmentStatusTopic, liveDataTopic } from "src/app/Services/topicKeys";
import { Subscription } from "rxjs";

@Component({
  selector: "app-monitoring",
  templateUrl: "./monitoring.page.html",
  styleUrls: ["./monitoring.page.scss"],
})
export class MonitoringPage implements OnInit {

  private readonly defaultTimestamp: string = "N/A";

  currentDevice: Devices;
  currentDeviceType: string;
  currentDeviceIndex: number;
  currentDeviceSettings: SensorMonitoringWidget[];
  liveData: string[];
  noDevices: boolean;
  mqttStatusSubscription: Subscription;
  equipmentStatusSubscription: Subscription;
  deviceLiveDataSubscription: Subscription;
  
  timestamp: string = this.defaultTimestamp;
  darkMode:boolean;
  constructor(public mqttService: MqttInterfaceService, public variableManagementService: VariableManagementService, public route: ActivatedRoute, private router: Router) { }

  // Reset monitoring class variables and unsubscribe from previous subscriptions
  resetPage() {
    this.currentDevice = null;
    this.currentDeviceType = null;
    this.currentDeviceIndex = null;
    this.currentDeviceSettings = null;
    this.liveData = null;
    this.timestamp = this.defaultTimestamp;
    this.noDevices = null;
    if(this.mqttStatusSubscription) this.mqttStatusSubscription.unsubscribe();
    if(this.equipmentStatusSubscription) this.equipmentStatusSubscription.unsubscribe();
  }
  
  // Check if query params have changed
  hasQueryParamsChanged = (params: Params) => {
    if(this.currentDeviceType != params['deviceType'] || this.currentDeviceIndex != params['deviceIndex']) {
      // Query Params have changed
      return true;
    } 
    // If query params are null return true as the user might be no devices
    if(params['deviceType'] == null || params['deviceIndex'] == null) return true;
    
    // Query Params have not changed
    return false;
  }

  ngOnInit() {
    this.route.queryParams.pipe(filter(this.hasQueryParamsChanged)).subscribe(params => {
      this.resetPage();
      this.currentDeviceType = params['deviceType'];
      this.currentDeviceIndex = params['deviceIndex'];

      if((this.currentDeviceType && this.currentDeviceIndex) != null) {
        this.currentDevice = this.variableManagementService.getCurrentDeviceSettings(this.currentDeviceType, this.currentDeviceIndex);
        this.currentDeviceSettings = [];
        for(let sensor in this.currentDevice.settings) {
          if(this.currentDevice.settings[sensor]['monit_only'] !== undefined) {
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

        this.equipmentStatusSubscription = this.mqttService.equipmentStatus.pipe(filter(equipmentStatus => equipmentStatus != null)).subscribe(equipmentStatus => {
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
      console.log("hereeeee");
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
    this.darkMode = JSON.parse(localStorage.getItem('darkMode'));
  }

  // TODO: If mqtt data is needed across dashboard tabs then move this function to dashboard page
  startMqttProcessing() {
    this.mqttStatusSubscription = this.mqttService.mqttStatus.subscribe(status => {
      console.log(status);
      console.log(this.currentDevice.topicID);
      
      switch(status) {
        case ConnectionStatus.CONNECTED: {
          // Unsubscribe from previous device data and subcribe to current device data
          this.unsubscribeFromPreviousDevice(this.currentDevice.topicID);
          this.mqttService.subscribeToTopic(liveDataTopic + '/' + this.currentDevice.topicID).catch(error => console.log(error));
          this.mqttService.subscribeToTopic(equipmentStatusTopic + '/' + this.currentDevice.topicID).catch(error => console.log(error));
          break;
        }
      }
    });
  }

  // Unsubscribe from all previous device topics as previous device mqtt data is no longer needed
  unsubscribeFromPreviousDevice(currentTopicId: string) {
    for(let topic of this.mqttService.subscribedTopics) {
      let topicArray = topic.split("/", 2);
      if((topicArray[0] == liveDataTopic || topicArray[0] == equipmentStatusTopic) && (topicArray[1] != currentTopicId)) {
        this.mqttService.unsubscribeFromTopic(topic).catch(error => console.log(error));
      } 
    }
  }
}


