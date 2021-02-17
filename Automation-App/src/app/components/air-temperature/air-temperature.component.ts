import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

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
  
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.controlForm = this.fb.group({
      'd_n_enabled': this.fb.control(true),
      'day_tgt': this.fb.control(null),
      'night_tgt': this.fb.control(null),
      'tgt': this.fb.control(null),
      'up_ctrl': this.fb.control(false),
      'down_ctrl': this.fb.control(false)
    });

    this.airTemperatureForm = this.fb.group({
      'monit_only': this.fb.control(false),
      'control': this.controlForm,
      'alarm_min': this.fb.control(null),
      'alarm_max': this.fb.control(null)
    });

    this.parentForm.addControl('air_temp', this.airTemperatureForm);
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy(){
    this.parentForm.removeControl('air_temp');
  }
}
