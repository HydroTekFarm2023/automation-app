import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AddPowerOutletPage } from 'src/app/add-power-outlet/add-power-outlet.page';
import { PowerOutlet } from 'src/app/models/power-outlet.model';

@Component({
  selector: 'reservoir',
  templateUrl: './reservoir.component.html',
  styleUrls: ['./reservoir.component.scss'],
})
export class ReservoirComponent implements OnInit {
  isOpen: boolean = false;
  @Input() parentForm: FormGroup;
  @Input() powerOutlets: PowerOutlet[];
  @Input() topicID: string;
  
  @Output() newPowerOutletEvent = new EventEmitter<PowerOutlet>();
  
  reservoirForm: FormGroup;
  
  constructor(private fb: FormBuilder, private modalController: ModalController) { }

  ngOnInit() {
    this.reservoirForm = this.fb.group({
      'reservoir_size': this.fb.control(null, [Validators.required, Validators.min(0), Validators.max(10000)]),
      'is_control': this.fb.control(false),
      'water_replacement_interval': this.fb.control(null, [Validators.min(0.5), Validators.max(1000)]) //TODO conditional
    });
    this.parentForm.addControl('reservoir', this.reservoirForm);
    this.manualCheckValidity();
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
    this.manualCheckValidity();
  }

  ngOnDestroy(){
    this.parentForm.removeControl('reservoir');
  }

  isPowerOutletSetup(name: string): boolean {
    for(var i = 0; i < this.powerOutlets.length; i++) {
      if(this.powerOutlets[i].name == name) {
        return true;
      }
    }
    return false;
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

  manualCheckValidity(){
    for(let key in this.reservoirForm.controls){
      this.reservoirForm.controls[key].updateValueAndValidity();
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
