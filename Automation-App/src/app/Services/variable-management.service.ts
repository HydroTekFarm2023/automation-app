import { Injectable } from "@angular/core";
import { Display } from "../dashboard/display";

import { BehaviorSubject, forkJoin, Observable, of, Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, switchMap, tap } from 'rxjs/operators';
import * as _ from "lodash";
import { FertigationSystem } from "../models/fertigation-system.model";
import { ClimateController } from "../models/climate-controller.model";
import { IonicStorageService } from "./ionic-storage.service";

@Injectable({
  providedIn: "root",
})

export class VariableManagementService {

  private dbURL;

  public fertigationSystemSettings = new BehaviorSubject<FertigationSystem[]>(null);
  public climateControllerSettings = new BehaviorSubject<ClimateController[]>(null);
 
  public sensor_data_array: sensor_data[];
  
  public all_sensor_data_array: sensor_data[];
  public start_date: string;
  public end_date: string;

  public labelDate:string;

  public on_update=new Subject();
  
  public growRooms: string[] = [];
  public systems: string[] = [];
  public sensorsTimeData: string[]=[];
  public sensorsValueData:number[]=[];
  public phValueData: number[]=[];
  public ecValueData: number[]=[];


  // public clusters: cluster[] = [];
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

  constructor(private http: HttpClient, private storageService: IonicStorageService) {
    this.fertigationSystemSettings.subscribe(fertigationSystemArray => {
      if(fertigationSystemArray) {
        storageService.set("fertigationSystems", fertigationSystemArray)
      }
    });
    this.climateControllerSettings.subscribe(climateControllerArray => {
      if(climateControllerArray) {
        storageService.set("climateControllers", climateControllerArray)
      }
    });
  }

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
    return this.http.post(this.dbURL + "/create_grow_room/", data)
    .pipe(map((resData: {_id: string}) => {
      this.deviceSettings.push({
        _id: resData._id,
        name: data.name,
        type: "growroom",
        clusterName: data.cluster_name,
        settings: data.settings
      });
      this.noDevices = false;
      // const clusterIndex = this.clusters.findIndex(({name}) => name === data.cluster_name);
      // this.clusters[clusterIndex].growRoom = {
      //   name: data.name,
      //   growRoomVariables: data.brief_info
      // };
      // this.devices.push(data.name);
      // this.updateCurrentCluster(data.cluster_name, data.name);
    }));
  }

  public createFertigationSystem(fertigationSystem: FertigationSystem): Observable<any> {
    return this.http.post(this.dbURL + "/fertigation-system-settings/create", fertigationSystem)
      .pipe(map((resData: {_id: string}) => {
        console.log(resData);
        fertigationSystem._id = resData._id;
        let fertigationDevicesArray: FertigationSystem[] = this.fertigationSystemSettings.value;
        fertigationDevicesArray.push(fertigationSystem);
        this.fertigationSystemSettings.next(fertigationDevicesArray);
      }));
  } 

  public createClimateController(climateController: ClimateController): Observable<any> {
    return this.http.post(this.dbURL + "/climmate-controller-settings/create", climateController)
      .pipe(map((resData: {_id: string}) => {
        console.log(resData);
        climateController._id = resData._id;
        let climateControllerDevicesArray: ClimateController[] = this.climateControllerSettings.value;
        climateControllerDevicesArray.push(climateController);
        this.climateControllerSettings.next(climateControllerDevicesArray);
      }));
  } 

  // Update grow room and system settings in backend
  public updateDeviceSettings(device: Devices, deviceType: string, deviceID: string, deviceIndex: number): Observable<any> {
    let endPointURL = "";
    let localStorageKey = "";
    let deviceSubject: BehaviorSubject<Devices[]>;
    console.log(deviceType);
    switch(deviceType){
      case FertigationSystemString:
        localStorageKey = "fertigationSystems";
        endPointURL = FertigationSystemString;
        deviceSubject = this.fertigationSystemSettings;
        break;
      case ClimateControllerString:
        localStorageKey = "climateControllers";
        endPointURL = ClimateControllerString;
        deviceSubject = this.climateControllerSettings;
        break;
      // TODO Add error checking
    }
    return this.http.put(this.dbURL + "/" + endPointURL + "-settings/update/" + deviceID, device)
      .pipe(switchMap(() => {
        let updatedDevicesArray = deviceSubject.value;
        console.log(device);
        updatedDevicesArray[deviceIndex] = device;
        return this.storageService.set(localStorageKey, updatedDevicesArray).pipe(tap(() => {
          deviceSubject.next(updatedDevicesArray);
          console.log(deviceSubject.value);
        }))
      }));
  }

  public setRESTServerURL(ip: string) {
    this.dbURL = "http://" + ip;
  }

  public fetchDevices() {
    let $fertigationSystems: Observable<FertigationSystem[]> = this.storageService.get('fertigationSystems');
    let $climateControllers: Observable<ClimateController[]> = this.storageService.get('climateControllers');

    console.log("inside function");
    return forkJoin([$fertigationSystems, $climateControllers]).pipe(switchMap(settings => {
      let settingsObservables: [Observable<FertigationSystem[]>, Observable<ClimateController[]>] = [null, null];
      
      if(settings[0]) {
        settingsObservables[0] = of(settings[0]);
      } else {
        settingsObservables[0] = this.http.get<FertigationSystem[]>(this.dbURL + '/fertigation-system-settings/find').pipe(tap(data => {
          console.log(data);
          this.storageService.set('fertigationSystems', data);
        }));
      }

      if(settings[1]) {
        settingsObservables[1] = of(settings[1]);
      } else {
        settingsObservables[1] = this.http.get<ClimateController[]>(this.dbURL + '/climate-controller-settings/find').pipe(tap(data => {
          this.storageService.set('climateControllers', data);
        }));
      }

      return forkJoin(settingsObservables);
    }),
    tap(settings => {      
      console.log(settings);
      const fertigationSystemsDeserialized = settings[0].map(fertigationSystemJSON => new FertigationSystem().deserialize(fertigationSystemJSON));
      const climateControllerDeserialized = settings[1].map(climateControllerJSON => new ClimateController().deserialize(climateControllerJSON));

      this.fertigationSystemSettings.next(fertigationSystemsDeserialized);
      this.climateControllerSettings.next(climateControllerDeserialized);
      console.log(this.fertigationSystemSettings.value);
    }));
  }

  public getCurrentDeviceSettings(currentDeviceType: string, currentDeviceIndex: number): Devices {
    switch(currentDeviceType) {
      case FertigationSystemString:
        return this.fertigationSystemSettings.value[currentDeviceIndex];
      case ClimateControllerString:
        return this.climateControllerSettings.value[currentDeviceIndex];
      default:  // TODO add error handling code
        return null;
    }
  }

  public getDeviceTopicIds(): string[] {
    let deviceTopicIds: string[] = [];
    this.fertigationSystemSettings.value.forEach(element => {
      deviceTopicIds.push(element.topicID);
    });
    this.climateControllerSettings.value.forEach(element => {
      deviceTopicIds.push(element.topicID);
    });
    return deviceTopicIds;
  }

  public getPlants(){
    return this.http.get<plant[]>(this.dbURL + "/get_plants").pipe(map(plants => {
      this.plants = plants;
    }));
  }
}

// format of brief_info data coming from backend

export const FertigationSystemString = 'fertigation-system';
export const ClimateControllerString = 'climate-controller';

export type Devices = FertigationSystem | ClimateController;

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
