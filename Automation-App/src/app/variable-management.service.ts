import { Injectable } from '@angular/core';
import { Display } from './dashboard/display';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VariableManagementService {

  public data: any;

  public growRoomVariableDisplays: Display[] = []; 
  public systemVariableDisplays: Display[] = [];

  public growRooms: string[] = [];
  public systems: string[] = [];

  public selectedGrowRoom: string;
  public selectedSystem = new BehaviorSubject<String>("");

  constructor() { }

  public fetchBotData(){
    // Pull Data from Database
    //sampe JSON Data for Monitoring Page
    this.data = {
      "GrowRoom1": {
        "growRoomVariables": {
          "temperature": {
             "desiredRange": "25 - 40", 
             "targetValue": "35"
          },
          "humidity": {
             "desiredRange": "35 - 65", 
             "targetValue": "51"
          },
          "CO2": {
            "desiredRange": "2.8 - 3.5",
             "targetValue": "3.2"
          }
        },
        "systems": {
            "System1": {
              "ph": {
                "desiredRange": "3.5 - 6.0", 
                "targetValue": "3.5"
              },
              "ec": { 
                "desiredRange": "5.5 - 6.5", 
                "targetValue": "5.8"
              }
            },
            "System2": {
              "ph": { 
                "desiredRange": "1.5 - 4.0", 
                "targetValue": "2.7"
              },
              "water temp": { 
                "desiredRange": "1.8 - 3.0", 
                "targetValue": "2.2"
              },
              "Oxygen": { 
                "desiredRange": "4.0 - 6.0", 
                "targetValue": "5.2"
              }
            },
            "System3": {
              "ph": { 
                "desiredRange": "1.5 - 4.0", 
                "targetValue": "2.7"
              }
            }
        }
      },
      "GrowRoom2": {
        "growRoomVariables": {
          "temperature": {
             "desiredRange": "35 - 40", 
             "targetValue": "35"
          },
          "humidity": {
             "desiredRange": "55 - 65", 
             "targetValue": "51"
          },
          "CO2": {
            "desiredRange": "2.5 - 3.5",
             "targetValue": "2.8"
          },
          "DO": { 
            "desiredRange": "25 - 35", 
            "targetValue": "28"
          }
        },
        "systems": {
            "Zone_A": {
              "ph": {
                "desiredRange": "3.5 - 6.0", 
                "targetValue": "3.5"
              },
              "ec": { 
                "desiredRange": "5.5 - 6.5", 
                "targetValue": "5.8"
              },
              "water temp": { 
                "desiredRange": "4.0 - 6.0", 
                "targetValue": "5.2"
              },
              "Oxygen": { 
                "desiredRange": "20 - 60", 
                "targetValue": "52"
              }
            },
            "Zone_B": {
              "ph": { 
                "desiredRange": "2.5 - 3.0", 
                "targetValue": "2.7"
              },
              "water temp": { 
                "desiredRange": "1.0 - 3.0", 
                "targetValue": "2.2"
              },
              "Oxygen": { 
                "desiredRange": "4.0 - 6.0", 
                "targetValue": "5.2"
              }
            }
        }
      }      
    };

    // Update growRooms Array
    this.growRooms = [];
    for(var key in this.data){
      this.growRooms.push(key);
    }
  }

  public updateVariables(growRoomID: string, systemID: string){
    // Reset all arrays
    this.growRoomVariableDisplays = [];
    this.systemVariableDisplays = [];
    this.systems = [];

    // Set default growRoom if growRoomID is null
    if((growRoomID) == null){
      growRoomID = this.growRooms[0];
    } 

    // Push systemIDs into systems array
    for(var key in this.data[growRoomID].systems){
      this.systems.push(key);
    }

    // Push grow room display information into growRoomVariableDisplays Array
    for(var key in this.data[growRoomID].growRoomVariables){
      this.growRoomVariableDisplays.push(new Display(key, this.data[growRoomID].growRoomVariables[key].desiredRange, this.data[growRoomID].growRoomVariables[key].targetValue));
    }

    // set default systemID if systemID is null
    if((systemID) == null){
      systemID = this.systems[0];
    } 

    // Push system display information into systemVariableDisplays Array
    for(var key in this.data[growRoomID].systems[systemID]){
      this.systemVariableDisplays.push(new Display(key, this.data[growRoomID].systems[systemID][key].desiredRange, this.data[growRoomID].systems[systemID].targetValue));
    }

    // Update the selected Grow Room and System
    this.selectedGrowRoom = growRoomID;
    this.selectedSystem.next(systemID);
}
}

