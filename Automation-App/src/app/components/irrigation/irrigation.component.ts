import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AddPowerOutletPage } from 'src/app/add-power-outlet/add-power-outlet.page';
import { PowerOutlet } from 'src/app/models/power-outlet.model';

@Component({
  selector: 'irrigation',
  templateUrl: './irrigation.component.html',
  styleUrls: ['./irrigation.component.scss'],
})
export class IrrigationComponent implements OnInit {
  isOpen: boolean = false;
  @Input() parentForm: FormGroup;
  @Input() powerOutlets: PowerOutlet[];
  @Input() topicID: string;

  @Output() newPowerOutletEvent = new EventEmitter<PowerOutlet>();
  
  irrigationForm: FormGroup;
  
  constructor(private fb: FormBuilder, private modalController: ModalController) { }

  ngOnInit() {
    this.irrigationForm = this.fb.group({
      'on_interval': this.fb.control(null, [Validators.required, Validators.min(1), Validators.max(1440)]),
      'off_interval': this.fb.control(null, [Validators.required, Validators.min(0), Validators.max(1440)])
    });

    this.parentForm.addControl('irrigation', this.irrigationForm);
    this.manualCheckValidity();
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
    this.manualCheckValidity();
  }

  ngOnDestroy(){
    this.parentForm.removeControl('irrigation');
  }

  onOutletToggleChange(name: string) {
    let isPowerOutletConfigured;
    this.powerOutlets.forEach(powerOutlet => {
      if(powerOutlet.name == name) {
        isPowerOutletConfigured = true;
      }
    });
    if(!isPowerOutletConfigured) {
      this.presentAddPowerOutletModal(name);
    }
  }

  isPowerOutletSetup(name: string): boolean {
    for(var i = 0; i < this.powerOutlets.length; i++) {
      if(this.powerOutlets[i].name == name) {
        return true;
      }
    }
    return false;
  }

  manualCheckValidity(){
    for(let key in this.irrigationForm.controls){
      this.irrigationForm.controls[key].updateValueAndValidity();
    }
  }

  async presentAddPowerOutletModal(powerOutletName: string) {
    const modal = await this.modalController.create({
      component: AddPowerOutletPage,
      componentProps: {
        'powerOutletName': powerOutletName,
        'topicID': this.topicID
      }
    });

    modal.onWillDismiss().then((returnValue) => {
      if(returnValue.data && !this.isPowerOutletSetup(powerOutletName)) {
        this.newPowerOutletEvent.emit(returnValue.data);
      }
    });
    return await modal.present();
  }
}
