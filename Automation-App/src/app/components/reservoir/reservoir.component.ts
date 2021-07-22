import { ReservoirValidator } from './../../validators/reservoir.validator';
import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
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
  
  constructor(private fb: FormBuilder, 
    private modalController: ModalController, 
    private cd: ChangeDetectorRef,
    private resValidator: ReservoirValidator) { }

  ngOnInit() {
    this.reservoirForm = this.fb.group({
      'reservoir_size': this.fb.control(null, [Validators.required, Validators.min(1), Validators.max(3000)]),
      'is_control': this.fb.control(false),
      'replace_date': this.fb.control(null, [Validators.required]),
      'replace_interv': this.fb.control(null, [Validators.required, Validators.min(0), Validators.max(365)]) //TODO conditional
    }, {validators: [this.resValidator.ReservoirVal('is_control', this.powerOutlets)]});
    console.log(this.reservoirForm.get("replace_date").value);
    console.log(this.reservoirForm);
    this.cd.detectChanges();
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
