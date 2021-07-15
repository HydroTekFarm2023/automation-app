import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Plant } from 'src/app/models/plant';
import { VariableManagementService } from 'src/app/Services/variable-management.service';

@Component({
  selector: 'general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss'],
})
export class GeneralSettingsComponent implements OnInit {

  isOpen: boolean = false;
  isLoading: boolean = false;
  plantName: string;
  plants: Plant[] = [];

  @Input() parentForm: FormGroup;
  generalSettingsForm: FormGroup;

  plantAlertOptions: any = {
    header: "Plant"
  }
  
  constructor(private fb: FormBuilder, public variableManagementService: VariableManagementService) { }

  ngOnInit() {
    if(this.variableManagementService.plants.length == 0) {
      this.isLoading = true;
      this.variableManagementService.getPlants().subscribe(plantArray => {
        this.plants = plantArray;
      });
    } else {
      this.plants = this.variableManagementService.plants;
      this.isLoading = false;
    }

    this.generalSettingsForm = this.fb.group({
      'name': this.fb.control(null, [Validators.required]),
      'plant_name': this.fb.control(null)
    });

    this.parentForm.addControl('general_settings', this.generalSettingsForm);
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  addRecommendedSettings(plant: Plant){
    var temp = {};
    for(var sensor of plant.sensor_array){
      sensor = { ...sensor };
      temp[sensor.sensor_name] = {
        "monit_only": false,
        "alarm_min":  sensor.settings.alarm_min,
        "alarm_max": sensor.settings.alarm_max,
        "control": {
          "tgt": sensor.settings.target_value,
          "d_n_enabled": sensor.settings.day_and_night,
          "day_tgt": sensor.settings.day_target_value,
          "night_tgt": sensor.settings.night_target_value
        }
      }
    }
    this.parentForm.get("settings").patchValue(temp);
  }


  ngOnDestroy(){
    this.parentForm.removeControl('general_settings');
  }
}
