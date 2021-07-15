import { Component, OnDestroy, OnInit } from '@angular/core';

import { MenuController, ModalController, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { VariableManagementService } from './Services/variable-management.service';
import { IdentifyDevicePage } from './add-device/identify-device/identify-device.page';
import { Subscription } from 'rxjs';
import { AddFertigationSystemPage } from './add-fertigation-system/add-fertigation-system.page';
import { AddClimateControllerPage } from './add-climate-controller/add-climate-controller.page';
import { MqttInterfaceService } from './Services/mqtt-interface.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  private authSubscription: Subscription;
  private previousAuthState: boolean = false;
 
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public variableManagementService: VariableManagementService,
    private menuController: MenuController,
    private modalController: ModalController,
    private authService: AuthService,
    private router: Router,
    private mqttService: MqttInterfaceService
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.authSubscription = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if(!isAuth && this.previousAuthState !== isAuth) {
        this.menuController.close();
        this.router.navigateByUrl('/auth');
      }
      this.previousAuthState = isAuth;
    });
  }

  ngOnDestroy() {
    if(this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  newDevice() {
    this.menuController.close();
    this.presentIdentifyDeviceModal();
  }

  logout() {
    this.mqttService.resetMqttService();
    this.authService.logout();
  }

  async presentIdentifyDeviceModal() {
    const modal = await this.modalController.create({
      component: IdentifyDevicePage
    });

    modal.onWillDismiss().then((resData) => {
      if (resData.data) {
        switch(resData.data.type) {
          case "fertigation-system":
            console.log("Fertigation System add");
            this.presentAddFertigationSystemModal(resData.data.topicId);
            break;
          case "climate-controller":
            console.log("climatte Controller add");
            this.presentAddClimateControllerModal(resData.data.topicId);
            break;
        }
        
      }
    });
    return await modal.present();
  }

  async presentAddFertigationSystemModal(topicId: string) {
    const modal = await this.modalController.create({
      component: AddFertigationSystemPage,
      componentProps: {
        'topicId': topicId
      }
    });

    modal.onWillDismiss().then((resData) => {
      if (resData.data) {
        this.router.navigate(['/dashboard', 'monitoring'], { queryParams: { deviceType: "fertigation-system", deviceIndex: resData.data } })
      }
    });
  
    return await modal.present();
  }

  async presentAddClimateControllerModal(topicId: string) {
    const modal = await this.modalController.create({
      component: AddClimateControllerPage,
      componentProps: {
        'topicId': topicId
      }
    });

    modal.onWillDismiss().then((resData) => {
      if (resData.data) {
        this.router.navigate(['/dashboard', 'monitoring'], { queryParams: { deviceType: "climate-controller", deviceIndex: resData.data } })
      }
    });
    return await modal.present();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
