import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { VariableManagementService } from 'src/app/Services/variable-management.service';

@Component({
  selector: 'ec',
  templateUrl: './ec.component.html',
  styleUrls: ['./ec.component.scss'],
})
export class EcComponent implements OnInit, OnDestroy {
  
  isOpen: boolean = false;

  @Input() parentForm: FormGroup;
  ecForm: FormGroup;
  controlForm: FormGroup;
  day_and_night_targetForm: FormGroup;
  
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.controlForm = this.fb.group({
      'dose_time': this.fb.control(null),
      'dose_interv': this.fb.control(null),
      'd_n_enabled': this.fb.control(true),
      'day_tgt': this.fb.control(null),
      'night_tgt': this.fb.control(null),
      'tgt': this.fb.control(null),
      'pumps': this.fb.group({
        'pump_1': this.fb.group({
          'enabled': this.fb.control(false),
          'value': this.fb.control(null)
        }),
        'pump_2': this.fb.group({
          'enabled': this.fb.control(false),
          'value': this.fb.control(null)
        }),
        'pump_3': this.fb.group({
          'enabled': this.fb.control(false),
          'value': this.fb.control(null)
        }),
        'pump_4': this.fb.group({
          'enabled': this.fb.control(false),
          'value': this.fb.control(null)
        }),
        'pump_5': this.fb.group({
          'enabled': this.fb.control(false),
          'value': this.fb.control(null)
        })
      })
    });

    this.ecForm = this.fb.group({
      'monit_only': this.fb.control(false),
      'control': this.controlForm,
      'alarm_min': this.fb.control(null),
      'alarm_max': this.fb.control(null)
    });

    this.parentForm.addControl('ec', this.ecForm);
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy(){
    this.parentForm.removeControl('ec');
  }
}
