import { Component, OnInit } from "@angular/core";
import { Display } from "../display";
import { skip, filter } from "rxjs/operators";
import { MqttInterfaceService } from "src/app/Services/mqtt-interface.service";
import { VariableManagementService } from 'src/app/variable-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { AddGrowroomPage } from 'src/app/add-growroom/add-growroom.page';
import { AddSystemPage } from 'src/app/add-system/add-system.page';
import { AddSensorPage } from 'src/app/add-sensor/add-sensor.page';
import { CreateClusterPage } from 'src/app/create-cluster/create-cluster.page';

@Component({
  selector: "app-monitoring",
  templateUrl: "./monitoring.page.html",
  styleUrls: ["./monitoring.page.scss"],
})
export class MonitoringPage implements OnInit {

  deviceName: string;
  clusterName: string;
  timeStamp: string;

  public specifications = [
    "Humidifier",
    "Fan 2",
    "pH Probe",
    "Grow Lights",
    "EC Probe",
    "Water Temp Probe",
  ];

  MQTT_CONFIG: {
    host: string;
    port: number;
    clientId: string;
    path?: string;
  } = {
    host: "192.168.1.16",
    port: 9001,
    clientId: "Test",
  };

  deviceAlertOptions: any = {
    header: "Device Name"
  }

  clusterAlertOptions: any = {
    header: "Cluster Name"
  }

  TOPIC: string[] = ["#"];

  constructor(private mqttService: MqttInterfaceService, public variableManagentService: VariableManagementService, public route: ActivatedRoute, private actionSheetController: ActionSheetController, private modalController: ModalController) {

    // Log MQTT Status
    this.mqttService.mqttStatus.pipe(skip(1)).subscribe((status) => {
      console.log(status);
    });

    // Create MQTT Client, connect to broker and subscribe to topics
    this.mqttService.createClient(
      this.onConnectionLost,
      this.TOPIC,
      this.MQTT_CONFIG
    );

    // Fetch Display Data from Database
    this.variableManagentService.fetchClusters(false);
  }
 
  ngOnInit() {
    // Set Default Grow Room and System

    this.mqttService.deviceLiveData.subscribe(resData => {
      // Try parsing system MQTT string as JSON Data
      try{
        var jsonSensorData = JSON.parse(resData);
        console.log(jsonSensorData);
        // Store Time Stamp of Message
        this.timeStamp = Object.keys(jsonSensorData)[0];
        // Store sensor values into Display Objects to update UI
        for(var i = 0; i < this.variableManagentService.sensorDisplays.length; i++){
          if(jsonSensorData[this.timeStamp][this.variableManagentService.sensorDisplays[i].title]){
            this.variableManagentService.sensorDisplays[i].current_val = jsonSensorData[this.timeStamp][this.variableManagentService.sensorDisplays[i].title];
          }
        }
      }
      catch(error){
        console.log(error);
      }
    });

    // Subscribe to changes in System ID
    this.variableManagentService.selectedDevice.pipe(filter(str => str != null)).subscribe(resData => {
      console.log("monitoring page selected device");
      this.deviceName = resData;
    });
    
    // Update GrowRoom ID selection
    this.variableManagentService.selectedCluster.pipe(filter(str => str != null)).subscribe(resData => {
      console.log("monitoring page selected cluster");
      this.clusterName = resData;
    });
  }

  // Change System 
  changeDevice(deviceName : string){
    console.log("change device monitoring page");
    if(this.variableManagentService.selectedDevice.value != deviceName){
      this.variableManagentService.updateCurrentCluster(this.clusterName, deviceName);
    }
  }

  // Change Grow Room
  changeCluster(clusterName: string){
    console.log("change cluster monitoring page");
    this.variableManagentService.updateCurrentCluster(clusterName, null);
  }

  onConnectionLost(ResponseObject) {
    console.log(ResponseObject);
  }
  
  onPublishMessage() {
    // var name : number;
    // console.log('hello');
    // this.name = ['7']
    this.mqttService.publishMessage(this.TOPIC[0], "hello");
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Setup',
      buttons: [{
        text: 'Cluster',
        handler: () => {
          this.presentClusterModal();
        }
      },{
        text: 'Grow Room',
        handler: () => {
          this.presentGrowRoomModal();
        }
      }, {
        text: 'System',
        handler: () => {
          this.presentSystemModal();
        }
      }, {
        text: 'Sensor',
        handler: () => {
          this.presentSensorModal();
        }
      },{
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

  async presentSensorModal() {
    const modal = await this.modalController.create({
      component: AddSensorPage,
    });
    return await modal.present();
  }

  async presentClusterModal() {
    const modal = await this.modalController.create({
      component: CreateClusterPage,
    });
    return await modal.present();
  }
}
