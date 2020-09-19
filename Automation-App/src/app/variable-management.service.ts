import { Injectable } from "@angular/core";
import { Display } from "./dashboard/display";

import * as moment from 'moment';
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: "root",
})
export class VariableManagementService {
 
  public datePipeString : string;

  public sensor_data_array: sensor_data[];
  
  public all_sensor_data_array: sensor_data[];
  public start_date: string;
  public end_date: string;

  public labelDate:string;
  public formatDate:string;

  public on_update=new Subject();
  
  public growRooms: string[] = [];
  public systems: string[] = [];
  public sensorsTimeData: string[]=[];
  public sensorsValueData:number[]=[];
  public phValueData: number[]=[];
  public ecValueData: number[]=[];
  public tempValueData: number[]=[];


  public clusters: cluster[] = [];
  public clusterNames: string[] = [];
  public sensorDisplays: Display[] = []; 
  public selectedCluster = new BehaviorSubject<string>(null);
  public selectedDevice = new BehaviorSubject<string>(null);
  public devices: string[] = [];

  public deviceSettingsSubject = new Subject();
  public deviceSettings: device_settings[] = [];
  public deviceSettingsIndex: number;

  public noClusters: boolean = true;
  public noDevices: boolean = true;

  public plants: plant[] = [];

  constructor(private http: HttpClient,private datePipe: DatePipe) {}

  // public getSensorData(){
  //   this.sensorsTimeData=[];
  //   this.sensorsValueData=[];
  //   this.http
  //     .get<sensor_info>("http://localhost:3000/sensors_data/GrowRoom1/system1/ph")
  //     .subscribe((resData) => {
        
  //       //console.log(resData.sensor_info);
  //       this.sensor_data_array = resData.sensor_info;

  //       //console.log(this.sensor_data_array);
  //       for(var i=0;i<this.sensor_data_array.length;i++)
  //       {
  //         //this.sensor_data_array[i]._id['name']==
  //         this.sensorsTimeData.push(this.sensor_data_array[i]._id['time'])
  //         this.sensorsValueData.push(parseFloat(this.sensor_data_array[i]._id['value']))
  //       }
  //       // return this.sensorsValueData;        
  //     });
  //     return [this.sensorsValueData,this.sensorsTimeData];
  //     //console.log(this.sensorsValueData);
  // }


  public getAllSensorsData(clusterName:string,deviceName:string,startdate:string, enddate: string,option:string)
  {
    this.sensorsTimeData=[];
    this.phValueData=[];
    this.ecValueData=[];
    this. tempValueData=[];

    // this.labelDate = new Date().toString();

    this.http
      .get<sensor_info>("http://localhost:3000/get_all/"+clusterName+"/"+deviceName+"/"+startdate+"/"+enddate+"/")
      .subscribe((resData) => {
        
        this.all_sensor_data_array = resData.sensor_info;
        for(var i=0;i<this.all_sensor_data_array.length;i++)
        {
          console.log("Date: "+moment.utc(this.all_sensor_data_array[i]['_id']).format("YYYY-MMM-DDTHH:mm"));
          //this.all_sensor_data_array[i]['_id']
          this.datePipeString = this.datePipe.transform(new Date(this.all_sensor_data_array[i]['_id']),'yyyy-MM-dd HH:mm');
          switch(option){
            case '0':
              this.labelDate = moment.utc(this.all_sensor_data_array[i]['_id']).format("MMM DD, HH:mm");
              break;
            case '1':
              this.labelDate = moment.utc(this.all_sensor_data_array[i]['_id']).format("MMM DD, HH:mm");
              break;
            case '2':
              this.labelDate = moment.utc(this.all_sensor_data_array[i]['_id']).format("MMM DD");
              break;           
          }
          
          // this.labelDate = moment(this.all_sensor_data_array[i]['_id'].toString()).format("MMM DD, HH:mm");
          
          console.log("Label data: "+this.datePipeString);
          this.sensorsTimeData.push(this.labelDate);
          for(var j=0;j<this.all_sensor_data_array[i].sensors.length;j++)
          {
             switch(this.all_sensor_data_array[i].sensors[j]['name']){
              case 'ph':
                this.phValueData.push(this.all_sensor_data_array[i].sensors[j]['value']);
                break;
              case 'ec':
                this.ecValueData.push(this.all_sensor_data_array[i].sensors[j]['value']);
                break;
              case 'temp':
                this.tempValueData.push(this.all_sensor_data_array[i].sensors[j]['value']);
            }
          }
        }

        //console.log(this.sensorsTimeData);
        //return[this.sensorsTimeData,this.phValueData,this.ecValueData]

        this.on_update.next();
      })
      //console.log(this.phValueData);
      //return[this.sensorsTimeData,this.phValueData,this.ecValueData]
  }

  public fetchClusters(repeat: boolean){
    if(repeat || (!repeat && this.clusters.length == 0)){
      this.http
      .get<clusters>("http://localhost:3000/clusters")
      .subscribe(resData => {
        this.clusters = resData.brief_info;
        this.clusters.forEach(element => {
          this.clusterNames.push(element.name);
        });
        if(this.clusterNames.length != 0){
          this.noClusters = false;
          this.updateCurrentCluster(null, null);
        } else {
          this.noClusters = true;
        } 
        console.log("Clusters Fetched");       
      });  
    }
  }

  public updateCurrentCluster(clusterName: string, deviceName: string) {
    console.log("Update Cluster")
    this.sensorDisplays = [];
    if (clusterName == null) {
      clusterName = this.clusterNames[0];
    }

    const clusterIndex = this.clusters.findIndex(({name}) => name === clusterName);
    if(this.clusters[clusterIndex].systems.length != 0 || this.clusters[clusterIndex].growRoom != null){
      console.log("Update Cluster and Device");
      this.noDevices = false;
      if(this.selectedCluster.value != clusterName){
        this.devices = [];
        this.clusters[clusterIndex].systems.forEach((element) => {
          this.devices.push(element.name);
        });
        if(this.clusters[clusterIndex].growRoom != null){
          this.devices.push(this.clusters[clusterIndex].growRoom.name);
        }
      }
  
      if(deviceName == null){
        deviceName = this.devices[0];
      }
  
      const deviceIndex = this.clusters[clusterIndex].systems.findIndex(({name}) => name === deviceName);
  
      if(deviceIndex != -1){
        this.clusters[clusterIndex].systems[deviceIndex].systemVariables.forEach((element) => {
          this.sensorDisplays.push(new Display(
            element.name,
            element.desired_range_low.toString() + " - " + element.desired_range_high.toString(),
            element.monitoring_only,
            element.target_value,
            element.day_and_night,
            element.day_target_value,
            element.night_target_value
          ));
        });
      } else {
        this.clusters[clusterIndex].growRoom.growRoomVariables.forEach((element) => {
          this.sensorDisplays.push(new Display(
            element.name,
            element.desired_range_low.toString() + " - " + element.desired_range_high.toString(),
            element.monitoring_only,
            element.target_value,
            element.day_and_night,
            element.day_target_value,
            element.night_target_value
          ));
        });
      }
      this.selectedCluster.next(clusterName);
      this.selectedDevice.next(deviceName);

    } else {
      this.noDevices = true;
      this.devices = [];
      this.selectedDevice.next(null);
      this.selectedCluster.next(clusterName);
    }
  }

  public createCluster(clusterForm: any): Observable<any> {
    return this.http.post("http://localhost:3000/create_cluster", { name: clusterForm.cluster_name })
    .pipe(map((resData: any) => {
      this.clusters.push({
        _id: resData._id,
        name: clusterForm.cluster_name,
        growRoom: null,
        systems: []
      });
      this.noClusters = false;
      this.clusterNames.push(clusterForm.cluster_name);
      this.updateCurrentCluster(clusterForm.cluster_name, null);
    }));
  }

  // Post grow room and system settings to backend
  public createGrowRoom(growRoomForm: any): Observable<any> {
    var sensorsArray = [];
    for(var key in growRoomForm.sensors){
        sensorsArray.push({
            name: key,
            monitoring_only: growRoomForm.sensors[key].monitoring_only,
            day_and_night: growRoomForm.sensors[key].monitoring_only? null: growRoomForm.sensors[key].control.day_and_night,
            target_value: growRoomForm.sensors[key].monitoring_only? null: growRoomForm.sensors[key].control.target_value,
            day_target_value: growRoomForm.sensors[key].monitoring_only? null: growRoomForm.sensors[key].control.day_and_night? growRoomForm.sensors[key].control.day_target_value: null,
            night_target_value: growRoomForm.sensors[key].monitoring_only? null: growRoomForm.sensors[key].control.day_and_night? growRoomForm.sensors[key].control.night_target_value: null,
            desired_range_low:  growRoomForm.sensors[key].alarm_min,
            desired_range_high: growRoomForm.sensors[key].alarm_max
        });
    }
    var data = {
      name: growRoomForm.grow_room_name,
      cluster_name: growRoomForm.cluster_name,
      settings: growRoomForm.sensors,
      brief_info: sensorsArray,
    }
    return this.http.post("http://localhost:3000/create_grow_room/", data)
    .pipe(map((resData: {_id: string}) => {
      this.deviceSettings.push({
        _id: resData._id,
        name: data.name,
        type: "growroom",
        clusterName: data.cluster_name,
        settings: data.settings
      });
      this.noDevices = false;
      const clusterIndex = this.clusters.findIndex(({name}) => name === data.cluster_name);
      this.clusters[clusterIndex].growRoom = {
        name: data.name,
        growRoomVariables: data.brief_info
      };
      this.devices.push(data.name);
      this.updateCurrentCluster(data.cluster_name, data.name);
    }));
  }

  public createSystem(systemForm: any): Observable<any> {
    var sensorsArray = [];
    for(var key in systemForm.sensors){
        sensorsArray.push({
            name: key,
            monitoring_only: systemForm.sensors[key].monitoring_only,
            day_and_night: systemForm.sensors[key].monitoring_only? null: systemForm.sensors[key].control.day_and_night,
            target_value: systemForm.sensors[key].monitoring_only? null: systemForm.sensors[key].control.target_value,
            day_target_value: systemForm.sensors[key].monitoring_only? null: systemForm.sensors[key].control.day_and_night? systemForm.sensors[key].control.day_target_value: null,
            night_target_value: systemForm.sensors[key].monitoring_only? null: systemForm.sensors[key].control.day_and_night? systemForm.sensors[key].control.night_target_value: null,
            desired_range_low: systemForm.sensors[key].alarm_min,
            desired_range_high: systemForm.sensors[key].alarm_max
        });
    }
    var data = {
      name: systemForm.system_name,
      cluster_name: systemForm.cluster_name,
      settings: systemForm.sensors,
      brief_info: sensorsArray
    }
    return this.http.post("http://localhost:3000/create_system/", data)
      .pipe(map((resData: {_id: string}) => {
        this.deviceSettings.push({
          _id: resData._id,
          name: data.name,
          type: "system",
          clusterName: data.cluster_name,
          settings: data.settings
        });
        this.noDevices = false;
        const clusterIndex = this.clusters.findIndex(({name}) => name === data.cluster_name);
        this.clusters[clusterIndex].systems.push({
          name: data.name,
          systemVariables: data.brief_info
        });
        this.devices.push(data.name);
        this.updateCurrentCluster(data.cluster_name, data.name);
      }));
  }

  // Update grow room and system settings in backend
  public updateDeviceSettings(deviceForm: any): Observable<any>{
    return this.http.put("http://localhost:3000/device_settings/" + this.deviceSettings[this.deviceSettingsIndex]._id, deviceForm)
      .pipe(map(() => {
        this.deviceSettings[this.deviceSettingsIndex].settings = deviceForm;
      }));
  }

  public getDeviceSettings(){
    console.log(this.selectedCluster.value);
    this.http.get<device_settings>("http://localhost:3000/device_settings/" + this.selectedCluster.value + "/" + this.selectedDevice.value).subscribe(resData => {
      this.deviceSettings.push(resData);
      this.deviceSettingsIndex = this.deviceSettings.length - 1;
      this.deviceSettingsSubject.next();
    });
  }

  public getPlants(){
    return this.http.get<plant[]>("http://localhost:3000/get_plants").pipe(map(plants => {
      this.plants = plants;
    }));
  }
}

// format of brief_info data coming from backend

interface sensor {
  name: string;
  monitoring_only: boolean;
  day_and_night: boolean;
  target_value: number;
  day_target_value: number;
  night_target_value: number;
  desired_range_low: number;
  desired_range_high: number;
}

interface grow_room_brief_info {
  name: string;
  growRoomVariables: sensor[];
}

interface system_brief_info {
  name: string;
  systemVariables: sensor[];
}

interface clusters {
  brief_info: [cluster];
} 

interface cluster {
  _id: string;
  name: string;
  growRoom: grow_room_brief_info;
  systems: system_brief_info[];
}

// Format of settings data coming from backend

interface device_settings {
  _id: string;
  name: string;
  type: string;
  clusterName: string;
  settings: any;
}

interface plant_settings {
  alarm_min: Number,
  alarm_max: Number,
  target_value: Number,
  day_and_night: Boolean,
  day_target_value: Number,
  night_target_value: Number 
}

export interface plant {
  _id: string;
  name: string;
  settings: {
    air_temperature: plant_settings,
    humidity: plant_settings,
    ec: plant_settings,
    ph: plant_settings,
    water_temperature: plant_settings
  }
}

interface sensor {
  _id: string;
  name: string;
  target_value: number;
  desired_range_low: number;
  desired_range_high: number;
}

interface sensor_info{
  //time: String,
  //value:Number,
  sensor_info:[sensor_data],
  //all_info:[all_info]
}

interface Sample{
  time: String,
  value: Number
}

interface sensor_data{
  //_id: [Sample],
  _id: Date,
  sensors:[sensor_array]
  //time: String,
  //value:Number
}


interface all_info{
  //
  // name:String,
  // value:Number
  sensors:[sensor_array]
}

interface sensor_array{
  // _id: Date,
  sensor_array:[sensor_details]
}

interface sensor_details{
  //_id:Date,
  name:String,
  value:Number
}
