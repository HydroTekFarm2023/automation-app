import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { AddPowerOutletPage } from 'src/app/add-power-outlet/add-power-outlet.page';
import { PowerOutlet } from 'src/app/models/power-outlet.model';

@Component({
  selector: 'grow-lights',
  templateUrl: './grow-lights.component.html',
  styleUrls: ['./grow-lights.component.scss'],
})
export class GrowLightsComponent implements OnInit {
  isOpen: boolean = false;

  @Input() parentForm: FormGroup;
  @Input() powerOutlets: PowerOutlet[];
  @Input() topicID: string;

  @Input() set powerOutletArray(array: [{ name: string, is_control: boolean }]) {
    if(this.powerOutletsArray) {
      this.powerOutletsArray.clear();
      for(var i = 0; i < array.length; i++) {
        this.newPowerOutlet();
      }
      this.growLightsForm.get("power_outlets").setValue(array);
    }
  }
  @Output() newPowerOutletEvent = new EventEmitter<PowerOutlet>();
  growLightsForm: FormGroup;

  get powerOutletsArray() : FormArray {
    if(this.growLightsForm) {
      return this.growLightsForm.get("power_outlets") as FormArray
    }
    return null;
  }

  readonly MaxGrowLightLength = 10;
  
  constructor(private fb: FormBuilder, private modalController: ModalController, private alertController: AlertController) { }

  ngOnInit() {
    this.growLightsForm = this.fb.group({
      'lights_on': this.fb.control(null, [Validators.required]),
      'lights_off': this.fb.control(null, [Validators.required]),
      'power_outlets': this.fb.array([])
    });
    this.parentForm.addControl('grow_lights', this.growLightsForm);
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy(){
    this.parentForm.removeControl('grow_lights');
  }

  isPowerOutletSetup(name: string): boolean {
    for(var i = 0; i < this.powerOutlets.length; i++) {
      if(this.powerOutlets[i].name == name) {
        return true;
      }
    }
    return false;
  }

  newPowerOutlet() {
    let currentLength = this.powerOutletsArray.length;
    if(currentLength < this.MaxGrowLightLength) {
      let fbGroup = this.fb.group({
        name: "grow_light_" + (currentLength + 1),
        is_control: this.fb.control(false)
      });
      this.powerOutletsArray.push(fbGroup);
    } else {
      this.maxGrowLightPowerOutletError();
    }
  }

  async maxGrowLightPowerOutletError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'You have reached the max amount of power outlets for grow lights',
      buttons: ['OK']
    });
    await alert.present();
  }

  onOutletToggleChange(name: string, index: number) {
    console.log(index);
    let isPowerOutletConfigured;
    this.powerOutlets.forEach(powerOutlet => {
      if(powerOutlet.name == name) {
        isPowerOutletConfigured = true;
      }
    });
    if(!isPowerOutletConfigured) {
      this.presentAddPowerOutletModal(name, index);
    }
  }

  async presentAddPowerOutletModal(powerOutletName: string, index: number) {
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
          this.growLightsForm.get('power_outlets')['controls'][index].patchValue( { is_control: true } );
          this.newPowerOutletEvent.emit(returnValue.data);
        }
      } else {
        console.log(index);
        this.growLightsForm.get('power_outlets')['controls'][index].patchValue( { is_control: false } );
      }
    });
    return await modal.present();
  }
}
