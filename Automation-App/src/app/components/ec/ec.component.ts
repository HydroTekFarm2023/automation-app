import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { VariableManagementService } from 'src/app/variable-management.service';

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
  
  constructor(private variableManagementService: VariableManagementService, private fb: FormBuilder) { }

  ngOnInit() {
    this.controlForm = this.fb.group({
      'dosing_time': this.fb.control(null),
      'dosing_interval': this.fb.control(null),
      'day_and_night': this.fb.control(true),
      'day_target_value': this.fb.control(null),
      'night_target_value': this.fb.control(null),
      'target_value': this.fb.control(null),
      'pumps': this.fb.group({
        'pump 1': this.fb.group({
          'enabled': this.fb.control(false),
          'value': this.fb.control(null)
        }),
        'pump 2': this.fb.group({
          'enabled': this.fb.control(false),
          'value': this.fb.control(null)
        }),
        'pump 3': this.fb.group({
          'enabled': this.fb.control(false),
          'value': this.fb.control(null)
        }),
        'pump 4': this.fb.group({
          'enabled': this.fb.control(false),
          'value': this.fb.control(null)
        }),
        'pump 5': this.fb.group({
          'enabled': this.fb.control(false),
          'value': this.fb.control(null)
        })
      })
    });

    this.ecForm = this.fb.group({
      'monitoring_only': this.fb.control(false),
      'control': this.controlForm,
      'alarm_min': this.fb.control(null),
      'alarm_max': this.fb.control(null)
    });

    this.parentForm.addControl('ec', this.ecForm);

    this.ecForm.get('monitoring_only').valueChanges.subscribe(resData => {
      if(resData) {
        this.ecForm.removeControl('control');
      } else {
        this.ecForm.addControl('control', this.controlForm);
      }
    });
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy(){
    this.parentForm.removeControl('ec');
  }
}
