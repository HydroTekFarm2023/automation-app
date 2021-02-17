import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { VariableManagementService } from '../Services/variable-management.service';
import { plant } from '../Services/variable-management.service';
import { Router } from '@angular/router';
import { MqttInterfaceService } from '../Services/mqtt-interface.service';

@Component({
  selector: 'add-growroom',
  templateUrl: './add-growroom.page.html',
  styleUrls: ['./add-growroom.page.scss'],
})
export class AddGrowroomPage implements OnInit {

  humidity: boolean = true;
  air_temperature: boolean = true;
  clusters: string[];
  plantName: string;

  growRoomForm: FormGroup = new FormGroup({});
  sensorsForm: FormGroup = new FormGroup({});
  
  plantAlertOptions: any = {
    header: "Plant Name"
  }

  isLoading: boolean = false;

  constructor(private router: Router, public variableManagementService: VariableManagementService, private fb: FormBuilder, private mqttInterfaceService: MqttInterfaceService) { 
    if(this.variableManagementService.plants.length == 0){
      this.isLoading = true;
      this.variableManagementService.getPlants().subscribe(() => {
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
    }
    this.growRoomForm = this.fb.group({
      'grow_room_name': this.fb.control(null),
      'cluster_name': this.fb.control(null),
      'plant_name': this.fb.control(null),
      'sensors': this.sensorsForm
    });
  }

  ngOnInit() {}

  onSubmit(){
    console.log(this.growRoomForm.value);
    this.variableManagementService.createGrowRoom(this.growRoomForm.value).subscribe(() => {
  //    this.mqttInterfaceService.publishMessage()
//      this.dismiss();
    }, error => {
      console.log(error);
    });
  }

  addRecommendedSettings(value: plant){
    console.log(this.variableManagementService.plants);
    var temp = { ...value.settings };
    console.log(temp);
    for(var key of Object.keys(temp)){
      temp[key] = {
        "monitoring_only": false,
        "alarm_min":  temp[key].alarm_min,
        "alarm_max": temp[key].alarm_max,
        "control": {
          "target_value": temp[key].target_value,
          "day_and_night": temp[key].day_and_night,
          "day_target_value": temp[key].day_target_value,
          "night_target_value": temp[key].night_target_value
        }
      }
    }
    console.log(temp);
    this.sensorsForm.patchValue(temp);
  }

  dismiss(){
    this.router.navigate(['/dashboard']);
  }
}
