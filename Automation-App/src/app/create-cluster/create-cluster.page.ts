import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { VariableManagementService } from '../Services/variable-management.service';

@Component({
  selector: 'app-create-cluster',
  templateUrl: './create-cluster.page.html',
  styleUrls: ['./create-cluster.page.scss'],
})
export class CreateClusterPage implements OnInit {

  clusterForm: FormGroup;

  constructor(private modalController: ModalController, public variableManagementService: VariableManagementService, private fb: FormBuilder) { 
    this.clusterForm = this.fb.group({
      'cluster_name': this.fb.control(null)
    });
  }

  ngOnInit() {
  }

  onSubmit(){
    console.log(this.clusterForm.value);
    //this.variableManagementService.createCluster(this.clusterForm.value).subscribe(() => {
    //   this.dismiss();
    // }, error => {
    //   console.log(error);
    // });
  }

  dismiss(){
    this.modalController.dismiss();
  }

}
