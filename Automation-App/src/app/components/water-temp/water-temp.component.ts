import { DayNightTargetValidator } from 'src/app/validators/daynighttarget.validator';
import { TwoValCompareValidator } from './../../validators/twovalcompare.validator';
import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AddPowerOutletPage } from 'src/app/add-power-outlet/add-power-outlet.page';
import { PowerOutlet } from 'src/app/models/power-outlet.model';

@Component({
  selector: 'water-temp',
  templateUrl: './water-temp.component.html',
  styleUrls: ['./water-temp.component.scss'],
})
export class WaterTempComponent implements OnInit, OnDestroy {
  isOpen: boolean = false;

  @Input() powerOutlets: PowerOutlet[];
  @Input() parentForm: FormGroup;
  @Output() newPowerOutletEvent = new EventEmitter<PowerOutlet>();
  
  waterTemperatureForm: FormGroup;
  controlForm: FormGroup;
  day_and_night_targetForm: FormGroup;
  
  constructor(private fb: FormBuilder, private modalController: ModalController,
    private twoValCompareValidator : TwoValCompareValidator,
    private dayNightTargetValidator: DayNightTargetValidator) { }

  ngOnInit() {
    this.controlForm = this.fb.group({
      'd_n_enabled': this.fb.control(true),
      'day_tgt': this.fb.control(null, [Validators.min(0), Validators.max(50)]),
      'night_tgt': this.fb.control(null, [Validators.min(0), Validators.max(50)]), //TODO conditional
      'tgt': this.fb.control(null, [Validators.min(0), Validators.max(50)]),
      'up_ctrl': this.fb.control(false),
      'down_ctrl': this.fb.control(false)
    }, {validators: [this.dayNightTargetValidator.dayNightTarget('tgt', 'day_tgt', 'night_tgt', 'd_n_enabled')]});

    this.waterTemperatureForm = this.fb.group({
      'monit_only': this.fb.control(false),
      'control': this.controlForm,
      'alarm_min': this.fb.control(null, [Validators.required, Validators.min(0), Validators.max(49)]),//TODO compare
      'alarm_max': this.fb.control(null, [Validators.required, Validators.min(0), Validators.max(49)])
    }, {validators: [this.twoValCompareValidator.twoValCompare('alarm_min','alarm_max')]});

    this.parentForm.addControl('water_temp', this.waterTemperatureForm);
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy() {
    this.parentForm.removeControl('water_temp');
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

  async presentAddPowerOutletModal(powerOutletName: string, formKey: string) {
    const modal = await this.modalController.create({
      component: AddPowerOutletPage,
      componentProps: {
        'powerOutletName': powerOutletName
      }
    });

    modal.onWillDismiss().then((returnValue) => {
      if(returnValue.data) {
        if(!this.isPowerOutletSetup(powerOutletName)) {
          this.newPowerOutletEvent.emit(returnValue.data);
        }
      } else {
        this.controlForm.patchValue( { [formKey]: false } );
      }
    });
    return await modal.present();
  }
}
