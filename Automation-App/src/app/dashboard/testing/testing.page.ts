import { Component, OnInit } from "@angular/core";
import { filter, take } from "rxjs/operators";
import { ConnectionStatus, MqttInterfaceService } from "src/app/Services/mqtt-interface.service";
import { ClimateControllerString, FertigationSystemString, VariableManagementService } from 'src/app/Services/variable-management.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Devices } from 'src/app/Services/variable-management.service';
import { SensorTestingWidget } from 'src/app/components/sensor-testing/sensor-testing.component';
import { deviceStatusTopic, equipmentStatusTopic, fsTestReqTopic, fsTestResTopic, liveDataTopic, motorTestReqTopic, motorTestResTopic, outletTestReqTopic, outletTestResTopic, sensorTestReqTopic, sensorTestResTopic } from "src/app/Services/topicKeys";
import { Subscription } from "rxjs";
import { AlertController } from "@ionic/angular";
// import { Pump } from "src/app/models/pump-testing.model";
// import { OutletTest } from "src/app/models/outlet-testing.model";
// import { Sensor } from "src/app/models/sensor.model";
// import { stringify } from "querystring";

@Component({
  selector: 'app-testing',
  templateUrl: './testing.page.html',
  styleUrls: ['./testing.page.scss'],
})
export class TestingPage implements OnInit {

  private readonly defaultTimestamp: string = "N/A";

  currentDevice: Devices;
  currentDeviceType: string;
  currentDeviceIndex: number;
  currentDeviceSettings: SensorTestingWidget[];
  liveData: string[];
  noDevices: boolean;
  testState: boolean = false;
  mqttStatusSubscription: Subscription;
  equipmentStatusSubscription: Subscription;
  deviceLiveDataSubscription: Subscription;
  floatSwitches = [
    {
      "id":"1",
      "name":"Top",
      "logo":"beaker-outline",
      "currentValue":false,
      "currentState":0
    },
    {
      "id":"0",
      "name":"Bottom",
      "logo":"beaker-outline",
      "currentValue":false,
      "currentState":0
    }
  ];
  pumps = [
    {
      "id":"1",
      "name":"Motor 1",
      "logo":"water-outline",
      "currentValue":false,
      "currentState":0
    },
    {
      "id":"2",
      "name":"Motor 2",
      "logo":"water-outline",
      "currentValue":false,
      "currentState":0
    },
    {
      "id":"3",
      "name":"Motor 3",
      "logo":"water-outline",
      "currentValue":false,
      "currentState":0
    },
    {
      "id":"4",
      "name":"Motor 4",
      "logo":"water-outline",
      "currentValue":false,
      "currentState":0
    },
    {
      "id":"5",
      "name":"Motor 5",
      "logo":"water-outline",
      "currentValue":false,
      "currentState":0
    }
  ];
  
  
  timestamp: string = this.defaultTimestamp;

  constructor(public mqttService: MqttInterfaceService, public variableManagementService: VariableManagementService, public route: ActivatedRoute, private router: Router, private alertController: AlertController) { }

  onToggleTesting(){
    // this.currentDevice.device_started = false;
    let isDeviceStarted = false;
    this.testState = !this.testState;
    if(this.testState){
      this.mqttService.publishMessage(deviceStatusTopic + "/" + this.currentDevice.topicID, isDeviceStarted? "1" : "0").then(() => {
        this.variableManagementService.updateDeviceStartedStatus(isDeviceStarted, this.currentDeviceType, this.currentDevice._id, this.currentDeviceIndex).pipe(take(1)).subscribe(() => {
          
          console.log("Published Device Status");
          this.currentDevice.device_started = false;
        });
      }).catch(error => {
        console.warn(error);
        this.presentDeviceStartedError(isDeviceStarted);
      });
      console.log("testing mode initiated, currentDevice.device_started:", this.currentDevice.device_started);
    }
    else{
      for(let powerOutlet of this.currentDevice.power_outlets){
        if(powerOutlet.currentValue){
          powerOutlet.currentValue = false;
          let outletObj = {
            "choice":parseInt(powerOutlet.id),
            "switch_status":0
          }
          let outletJsonString = JSON.stringify(outletObj);
          this.mqttService.publishMessage(outletTestReqTopic+"/" + this.currentDevice.topicID, outletJsonString, 1, false)
        }
      };
      for(let pump of this.pumps){
        if(pump.currentValue){
          pump.currentValue = false;
          let outletObj = {
            "choice":parseInt(pump.id),
            "switch_status":0
          }
          let outletJsonString = JSON.stringify(outletObj);
          this.mqttService.publishMessage(motorTestReqTopic+"/" + this.currentDevice.topicID, outletJsonString, 1, false)
        }
      };
      for(let floatSwitch of this.floatSwitches){
        if(floatSwitch.currentValue){
          floatSwitch.currentValue = false;
          let outletObj = {
            "choice":parseInt(floatSwitch.id),
            "switch_status":0
          }
          let outletJsonString = JSON.stringify(outletObj);
          this.mqttService.publishMessage(fsTestReqTopic+"/" + this.currentDevice.topicID, outletJsonString, 1, false)
        }
      };
      for(let sensorSettings of this.currentDeviceSettings){
        if(sensorSettings.test_toggle){
          sensorSettings.test_toggle = false;
          let outletObj = {
            "choice":sensorSettings.name,
            "switch_status":0
          }
          let outletJsonString = JSON.stringify(outletObj);
          this.mqttService.publishMessage(sensorTestReqTopic+"/" + this.currentDevice.topicID, outletJsonString, 1, false)
        }
      };
      console.log("exiting testing mode");
    }
    
  }

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
              //tgt: this.currentDevice.settings[sensor].control.tgt,
              //alarm_min: this.currentDevice.settings[sensor].alarm_min,
              //alarm_max: this.currentDevice.settings[sensor].alarm_max,
              test_toggle: false,
              test_status: 0
             });
              
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
      this.currentDevice.power_outlets.forEach(outlet => outlet.currentState = 0);
      
      
      
    });
    //mqtt subscriptions
    this.mqttService.testPumpData.subscribe(message => {
     var messageJSON = JSON.parse(message);
      console.log(messageJSON);
      for(let i = 0; i < this.pumps.length; i++){
        if (this.pumps[i].id == messageJSON.choice.toString()){
          this.pumps[i].currentState = messageJSON.switch_status;
        }
      }
   });
   this.mqttService.testPOData.subscribe(message => {
    var messageJSON = JSON.parse(message);
     console.log(messageJSON);
     for(let i = 0; i < this.currentDevice.power_outlets.length; i++){
       if (this.currentDevice.power_outlets[i].id == messageJSON.choice.toString()){
         this.currentDevice.power_outlets[i].currentState = messageJSON.switch_status;
       }
     }
  });

  
  this.mqttService.testSensorData.subscribe(message => {
    var messageJSON = JSON.parse(message);
     console.log(messageJSON);
     for(let sensor of this.currentDeviceSettings){
       if(sensor.name == messageJSON.choice){
         sensor.test_status == messageJSON.switch_status;
       }
     }
  });

  this.mqttService.testFSData.subscribe(message => {
    var messageJSON = JSON.parse(message);
     console.log(messageJSON);
     for(let FloatSwitch of this.floatSwitches){
       if(FloatSwitch.name == messageJSON.choice){
         FloatSwitch.currentState == messageJSON.switch_status;
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
          this.mqttService.subscribeToTopic(motorTestResTopic+"/" + this.currentDevice.topicID,1).catch(error=> console.log(error));
          this.mqttService.subscribeToTopic(outletTestResTopic+"/" + this.currentDevice.topicID,1).catch(error=> console.log(error));
          this.mqttService.subscribeToTopic(sensorTestResTopic+"/" + this.currentDevice.topicID,1).catch(error=> console.log(error));
          this.mqttService.subscribeToTopic(fsTestResTopic+"/" + this.currentDevice.topicID,1).catch(error=> console.log(error));
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

  async presentDeviceStartedError(state: boolean) {
    let outletState = 'off';
    if(state) {
      outletState = 'on';
    } 

    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Unable to turn ' + outletState + ' device',
      buttons: ['OK']
    });
    await alert.present();
  }


  }



