import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'reservoir',
  templateUrl: './reservoir.component.html',
  styleUrls: ['./reservoir.component.scss'],
})
export class ReservoirComponent implements OnInit {
  isOpen: boolean = false;

  @Input() parentForm: FormGroup;
  reservoirForm: FormGroup;
  
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.reservoirForm = this.fb.group({
      'reservoir_size': this.fb.control(null),
      'solenoid_valve_1': this.fb.control(false)
    });

    this.parentForm.addControl('reservoir_control', this.reservoirForm);
  }

  toggleAccordion() {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy(){
    this.parentForm.removeControl('reservoir_control');
  }
}
