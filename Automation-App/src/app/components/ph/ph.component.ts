import { AtLeastOneEnableValidator } from './../../validators/atleastoneenable.validator';
import { DayNightTargetValidator } from 'src/app/validators/daynighttarget.validator';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { TwoValCompareValidator } from 'src/app/validators/twovalcompare.validator';

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
  
  constructor(private fb: FormBuilder,
    private twoValCompareVal : TwoValCompareValidator,
    private dayNightTargetValidator: DayNightTargetValidator,
    private atLeastOneEnableValidator: AtLeastOneEnableValidator) { }

  ngOnInit() {
    this.day_and_night_targetForm = this.fb.group({});

    this.controlForm = this.fb.group({
      'dose_time': this.fb.control(null, [Validators.required, Validators.min(1), Validators.max(7200)]),
      'dose_interv': this.fb.control(null, [Validators.required, Validators.min(1), Validators.max(14400)]),
      'd_n_enabled': this.fb.control(false),
      'day_tgt': this.fb.control(null, [Validators.min(0), Validators.max(14)]),
      'night_tgt': this.fb.control(null, [Validators.min(0), Validators.max(14)]),
      'tgt': this.fb.control(null, [Validators.min(0), Validators.max(14)]),
      'up_ctrl': this.fb.control(false),
      'down_ctrl': this.fb.control(false)
    });
    
    this.phForm = this.fb.group({
      'monit_only': this.fb.control(false),
      'control': this.controlForm,
      'alarm_min': this.fb.control(null, [Validators.required, Validators.min(0), Validators.max(13.9)]),
      'alarm_max': this.fb.control(null, [Validators.required, Validators.min(0.1), Validators.max(14)])
    }, {validators: [this.twoValCompareVal.twoValCompare('alarm_min', 'alarm_max'),
                     this.atLeastOneEnableValidator.atLeastOneEnable('monit_only', 'control', 'up_ctrl', 'down_ctrl'),
                     this.dayNightTargetValidator.dayNightTarget('monit_only', 'control', 'tgt', 'day_tgt', 'night_tgt', 'd_n_enabled')]});

    this.parentForm.addControl('ph', this.phForm);    
    this.manualCheckValidity(); //should take care of any errors on init
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
    this.manualCheckValidity();
  }

  ngOnDestroy(){
    this.parentForm.removeControl('ph');
  }

  manualCheckValidity(){
    for (let key in this.controlForm.controls) {
      this.controlForm.controls[key].updateValueAndValidity();
    }
    for (let key in this.phForm.controls) {
      this.phForm.controls[key].updateValueAndValidity();
    }
  }

}
