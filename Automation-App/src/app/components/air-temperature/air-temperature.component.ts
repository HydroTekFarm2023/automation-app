import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { VariableManagementService } from 'src/app/variable-management.service';

@Component({
  selector: 'air-temperature',
  templateUrl: './air-temperature.component.html',
  styleUrls: ['./air-temperature.component.scss'],
})
export class AirTemperatureComponent implements OnInit, OnDestroy {
  isOpen: boolean = false;

  @Input() parentForm: FormGroup;
  airTemperatureForm: FormGroup;
  controlForm: FormGroup;
  day_and_night_targetForm: FormGroup;
  
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.controlForm = this.fb.group({
      'day_and_night': this.fb.control(true),
      'day_target_value': this.fb.control(null),
      'night_target_value': this.fb.control(null),
      'target_value': this.fb.control(null),
      'heater_enabled': this.fb.control(false),
      'cooler_enabled': this.fb.control(false)
    });

    this.airTemperatureForm = this.fb.group({
      'monitoring_only': this.fb.control(false),
      'control': this.controlForm,
      'alarm_min': this.fb.control(null),
      'alarm_max': this.fb.control(null)
    });

    this.parentForm.addControl('air_temperature', this.airTemperatureForm);

    this.airTemperatureForm.get('monitoring_only').valueChanges.subscribe(resData => {
      if(resData) {
        this.airTemperatureForm.removeControl('control');
      } else {
        this.airTemperatureForm.addControl('control', this.controlForm);
      }
    });
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy(){
    this.parentForm.removeControl('air_temperature');
  }
}
