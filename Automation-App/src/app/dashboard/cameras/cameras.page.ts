import { AddCameraPage } from './../../add-camera/add-camera.page';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Camera } from './../../models/camera.model';
import { VariableManagementService, FertigationSystemString } from './../../Services/variable-management.service';
import { Component, OnInit } from '@angular/core';
import { UserPage } from '../user/user.page';
import { HostListener } from '@angular/core';

@Component({
  selector: 'cameras',
  templateUrl: './cameras.page.html',
  styleUrls: ['./cameras.page.scss'],
})
export class CamerasPage implements OnInit {
  cameras: Camera[] = [];
  noCameras: boolean;
  currentDeviceType: string;
  currentDeviceIndex: number;
  darkMode: boolean;

  constructor(private varman: VariableManagementService,
              private route: ActivatedRoute,
              private modalCtrl : ModalController, private User: UserPage) {}

  ngOnInit() {
    setTimeout(() => { this.ngOnInit() }, 1000 * 10)
  
    this.darkMode = this.User.darkMode;
    console.log(this.darkMode);
    this.route.queryParams.subscribe(params => {
      this.currentDeviceType = params['deviceType'];
      this.currentDeviceIndex = params['deviceIndex'];
      if((this.currentDeviceType && this.currentDeviceIndex) != null) {
        if(this.currentDeviceType === FertigationSystemString){
          this.varman.fertigationSystemSettings.subscribe((fertArr)=>{
            this.cameras = fertArr[this.currentDeviceIndex].cameras;
          });
        }else{
          this.varman.climateControllerSettings.subscribe((climArr) => {
            this.cameras = climArr[this.currentDeviceIndex].cameras;
          });
        }
      }else{
        console.log(this.currentDeviceType, this.currentDeviceIndex, "cameras page ts null params");
      }
    });
    this.darkMode = JSON.parse(localStorage.getItem('darkMode'));

  }


  onCreateCamera(){
    this.presentNewCameraModal();
  }

  async presentNewCameraModal() {
    const modal = await this.modalCtrl.create({
      component: AddCameraPage,
      componentProps: {
        'name': "",
        'url': ""
      }
    });
    return await modal.present();
  }

  updateDarkMode(){
    this.darkMode = this.User.darkMode;
    console.log(this.darkMode);
  }
}
