import { AtLeastOneEnableValidator } from './../../validators/atleastoneenable.validator';
import { DayNightTargetValidator } from 'src/app/validators/daynighttarget.validator';
import { TwoValCompareValidator } from './../../validators/twovalcompare.validator';
import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AddPowerOutletPage } from 'src/app/add-power-outlet/add-power-outlet.page';
import { PowerOutlet } from 'src/app/models/power-outlet.model';

@Component({
  selector: 'co2',
  templateUrl: './co2.component.html',
  styleUrls: ['./co2.component.scss'],
})
export class Co2Component implements OnInit, OnDestroy {
  isOpen: boolean = false;

  @Input() powerOutlets: PowerOutlet[];
  @Input() parentForm: FormGroup;
  @Input() topicID: string;
  
  @Output() newPowerOutletEvent = new EventEmitter<PowerOutlet>();
  
  co2Form: FormGroup;
  controlForm: FormGroup;
  
  constructor(private fb: FormBuilder, private modalController: ModalController,
    private twoValCompareValidator : TwoValCompareValidator,
    private atLeastOneEnableValidator: AtLeastOneEnableValidator) { }

  ngOnInit() {
    this.controlForm = this.fb.group({
      'tgt': this.fb.control(null, [Validators.min(0), Validators.max(10000)]),
      'up_ctrl': this.fb.control(false)
    });

    this.co2Form = this.fb.group({
      'monit_only': this.fb.control(false),
      'control': this.controlForm,
      'alarm_min': this.fb.control(null, [Validators.required, Validators.min(0), Validators.max(9999)]),
      'alarm_max': this.fb.control(null, [Validators.required, Validators.min(1), Validators.max(10000)])
    }, {validators: [this.twoValCompareValidator.twoValCompare('alarm_min','alarm_max')]});

    this.parentForm.addControl('co2', this.co2Form);
    this.manualCheckValidity();
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
    this.manualCheckValidity();
  }

  ngOnDestroy() {
    this.parentForm.removeControl('co2');
  }

  isPowerOutletSetup(name: string): boolean {
    for(var i = 0; i < this.powerOutlets.length; i++) {
      if(this.powerOutlets[i].name == name) {
        return true;
      }
    }
    return false;
  }

  onOutletToggleChange(name: string, formKey: string) {
      let isPowerOutletConfigured;
      this.powerOutlets.forEach(powerOutlet => {
        if(powerOutlet.name == name) {
          isPowerOutletConfigured = true;
        }
      });
      if(!isPowerOutletConfigured) {
        this.presentAddPowerOutletModal(name, formKey);
      }
  }

  manualCheckValidity(){
    for (let key in this.controlForm.controls) {
      this.controlForm.controls[key].updateValueAndValidity();
    }
    for (let key in this.co2Form.controls) {
      this.co2Form.controls[key].updateValueAndValidity();
    }
  }

  async presentAddPowerOutletModal(powerOutletName: string, formKey: string) {
    const modal = await this.modalController.create({
      component: AddPowerOutletPage,
      componentProps: {
        'powerOutletName': powerOutletName,
        'topicID': this.topicID
      }
    });

    modal.onWillDismiss().then((returnValue) => {
      if(returnValue.data) {
        if(!this.isPowerOutletSetup(powerOutletName)) {
          this.controlForm.patchValue( { [formKey]: true } );
          this.newPowerOutletEvent.emit(returnValue.data);
        }
      } else {
        this.controlForm.patchValue( { [formKey]: false } );
      }
    });
    return await modal.present();
  }
}
