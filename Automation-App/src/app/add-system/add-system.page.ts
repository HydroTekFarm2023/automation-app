import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { VariableManagementService, plant } from '../variable-management.service';

@Component({
  selector: 'add-system',
  templateUrl: './add-system.page.html',
  styleUrls: ['./add-system.page.scss'],
})
export class AddSystemPage implements OnInit {

  growLights = true;
  ph: boolean = true;
  ec: boolean = true;
  waterTemp: boolean = true;
  reservoir: boolean = true;

  plantName: string;

  systemForm: FormGroup = new FormGroup({});
  sensorsForm: FormGroup = new FormGroup({});

  plantAlertOptions: any = {
    header: "Plant Name"
  }

  isLoading: boolean = false;

  constructor(private modalController: ModalController, public variableManagementService: VariableManagementService, private fb: FormBuilder) { 
    if(this.variableManagementService.plants.length == 0){
      this.isLoading = true;
      this.variableManagementService.getPlants().subscribe(() => {
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
    }
    this.systemForm = this.fb.group({
      'system_name': this.fb.control(null),
      'cluster_name': this.fb.control(null),
      'plant_name': this.fb.control(null),
      'sensors': this.sensorsForm
    });
  }

  ngOnInit() {
  }

  onSubmit(){
    console.log(this.systemForm.value);
    this.variableManagementService.createSystem(this.systemForm.value).subscribe(() => {
      this.dismiss();
    }, error => {
      console.log(error);
    });
  }

  addRecommendedSettings(value: plant){
    var temp = { ...value.settings };
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
    this.sensorsForm.patchValue(temp);
  }

  dismiss(){
    this.modalController.dismiss();
  }
}
