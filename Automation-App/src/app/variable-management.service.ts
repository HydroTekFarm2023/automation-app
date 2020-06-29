import { Injectable } from "@angular/core";
import { Display } from "./dashboard/display";
import { BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { element } from 'protractor';

@Injectable({
  providedIn: "root",
})
export class VariableManagementService {
  public brief_info_array: grow_room[];

  public growRoomVariableDisplays: Display[] = [];
  public systemVariableDisplays: Display[] = [];

  public growRooms: string[] = [];
  public systems: string[] = [];

  public selectedGrowRoom = new BehaviorSubject<string>("");
  public selectedSystem = new BehaviorSubject<string>("");

  constructor(private http: HttpClient) {}

  public fetchBotData() {
    // Pull Brief_Info Data from Database
    // Brief_Info is simply the data required for the dasboard page (number of growrooms, systems, and various sesnors the user has)
    this.http
      .get<brief_info>("http://localhost:3000/brief_info")
      .subscribe((resData) => {
        this.brief_info_array = resData.brief_info;
        // Update growRooms Array
        this.growRooms = [];
        this.brief_info_array.forEach((element) => {
          this.growRooms.push(element.name);
        });
        // Update the active grow room and system to the first one in array
        this.updateVariables(null, null);
      });
  }

  public updateVariables(growRoomID: string, systemID: string) {
    // Reset all arrays
    this.growRoomVariableDisplays = [];
    this.systemVariableDisplays = [];
    this.systems = [];

    // Set default growRoom if growRoomID is null
    if (growRoomID == null) {
      growRoomID = this.growRooms[0];
    }

    const growRoomIndex = this.brief_info_array.findIndex(({name}) => name === growRoomID);

    // Push systemIDs into systems array
    this.brief_info_array[growRoomIndex].systems.forEach((element) => {
      this.systems.push(element.name);
    })

    // Push grow room display information into growRoomVariableDisplays Array
    this.brief_info_array[growRoomIndex].growRoomVariables.forEach((element) => {
      this.growRoomVariableDisplays.push(
        new Display(
          element.name,
          element.desired_range_low.toString() + " - " + element.desired_range_high.toString(),
          element.target_value.toString()
        )
      );
    })

    // set default systemID if systemID is null
    if (systemID == null) {
      systemID = this.systems[0];
    }

    // Push system display information into systemVariableDisplays Array
    const systemIndex = this.brief_info_array[growRoomIndex].systems.findIndex(({name}) => name === systemID);

    this.brief_info_array[growRoomIndex].systems[systemIndex].systemVariables.forEach((element) => {
      this.systemVariableDisplays.push(
        new Display(
          element.name,
          element.desired_range_low.toString() + " - " + element.desired_range_high.toString(),
          element.target_value.toString()
        )
      );
    });

    // Update the selected Grow Room and System
    this.selectedGrowRoom.next(growRoomID);
    this.selectedSystem.next(systemID);
  }
}

// format of breif_info data coming from backend
interface brief_info {
  brief_info: [grow_room];
}

interface grow_room {
  _id: string;
  name: string;
  growRoomVariables: [sensor];
  systems: [systems];
  __v: 0;
}

interface systems {
  systemVariables: [sensor];
  _id: string;
  name: string;
}

interface sensor {
  _id: string;
  name: string;
  target_value: Number;
  desired_range_low: Number;
  desired_range_high: Number;
}
