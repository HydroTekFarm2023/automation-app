import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { VariableManagementService } from 'src/app/variable-management.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'ph',
  templateUrl: './ph.component.html',
  styleUrls: ['./ph.component.scss'],
})
export class PhComponent implements OnInit, OnDestroy {

  isOpen: boolean = false;

  @Input() parentForm: FormGroup;
  phForm: FormGroup;
  controlForm: FormGroup;
  day_and_night_targetForm: FormGroup;
  
  constructor(private variableManagementService: VariableManagementService, private fb: FormBuilder) { }

  ngOnInit() {
    this.day_and_night_targetForm = this.fb.group({});

    this.controlForm = this.fb.group({
      'ph_up_down': this.fb.control(null),
      'dosing_time': this.fb.control(null),
      'dosing_interval': this.fb.control(null),
      'day_and_night': this.fb.control(true),
      'day_target_value': this.fb.control(null),
      'night_target_value': this.fb.control(null),
      'target_value': this.fb.control(null),
      'pumps': this.fb.group({
        'pump_1_enabled': this.fb.control(false),
        'pump_2_enabled': this.fb.control(false)
      })
    });

    this.phForm = this.fb.group({
      'monitoring_only': this.fb.control(false),
      'control': this.controlForm,
      'alarm_min': this.fb.control(null),
      'alarm_max': this.fb.control(null)
    });

    this.parentForm.addControl('ph', this.phForm);
    console.log(this.parentForm.value);

    this.phForm.get('monitoring_only').valueChanges.subscribe(resData => {
      if(resData) {
        this.phForm.removeControl('control');
      } else {
        this.phForm.addControl('control', this.controlForm);
      }
    });
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy(){
    this.parentForm.removeControl('ph');
  }

}
