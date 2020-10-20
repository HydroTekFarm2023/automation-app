import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'grow-lights',
  templateUrl: './grow-lights.component.html',
  styleUrls: ['./grow-lights.component.scss'],
})
export class GrowLightsComponent implements OnInit {
  isOpen: boolean = false;

  @Input() parentForm: FormGroup;
  growLightsForm: FormGroup;
  
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.growLightsForm = this.fb.group({
      'lights_on': this.fb.control(null),
      'lights_off': this.fb.control(null)
    });

    this.parentForm.addControl('grow_lights', this.growLightsForm);
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy(){
    this.parentForm.removeControl('grow_lights');
  }
}
