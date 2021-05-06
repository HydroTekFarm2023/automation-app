import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { VariableManagementService } from 'src/app/Services/variable-management.service';
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
  
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.day_and_night_targetForm = this.fb.group({});

    this.controlForm = this.fb.group({
      'dose_time': this.fb.control(null),
      'dose_interv': this.fb.control(null),
      'd_n_enabled': this.fb.control(true),
      'day_tgt': this.fb.control(null),
      'night_tgt': this.fb.control(null),
      'tgt': this.fb.control(null),
      'up_ctrl': this.fb.control(false),
      'down_ctrl': this.fb.control(false)
    });

    this.phForm = this.fb.group({
      'monit_only': this.fb.control(false),
      'control': this.controlForm,
      'alarm_min': this.fb.control(null),
      'alarm_max': this.fb.control(null)
    });

    this.parentForm.addControl('ph', this.phForm);
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy(){
    this.parentForm.removeControl('ph');
  }

}
