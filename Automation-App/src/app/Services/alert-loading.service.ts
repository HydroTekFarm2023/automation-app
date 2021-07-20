import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertLoadingService {

  private isLoading = false;

  constructor(private loadingController: LoadingController, private alertController: AlertController) { }

  async presentLoadingScreen(message?: string) {
    message? message : message = 'Please Wait...';
    this.isLoading = true;

    return await this.loadingController.create({
      message: message
    }).then(controller => {
      controller.present().then(() => {
        if (!this.isLoading) {
          controller.dismiss();
          console.log(controller);
        }
      });
    });
  }

  async dismissLoadingScreen() {
    this.isLoading = false;
    while (await this.loadingController.getTop() !== undefined) {
      await this.loadingController.dismiss();
    }
  }

  async presentMongoPushError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Unable to connect to Hydrotek Cloud',
      buttons: ['OK']
    });
    await alert.present();
  }

  async presentPushSettingsToDeviceError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Unable to push settings to device',
      buttons: ['OK']
    });
    await alert.present();
  }
}
