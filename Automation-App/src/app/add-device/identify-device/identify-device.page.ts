import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { take, timeout } from 'rxjs/operators';
import { MqttInterfaceService } from 'src/app/Services/mqtt-interface.service';

@Component({
  selector: 'app-identify-device',
  templateUrl: './identify-device.page.html',
  styleUrls: ['./identify-device.page.scss'],
})
export class IdentifyDevicePage implements OnInit {

  private deviceIP: string = "192.168.4.1";
  isLoading: boolean = false;
  isConnected: boolean = false;
  deviceType: string;

  status: string;
  isWifiSettingsTransferred: boolean = false;
  wifiSettingsForm: FormGroup = new FormGroup({});
  
  constructor(private modalController: ModalController, private http: HttpClient, private alertController: AlertController, private router: Router, private fb: FormBuilder, private mqttInterfaceService: MqttInterfaceService) { 
    this.wifiSettingsForm = this.fb.group({
      'wifi_ssid': this.fb.control(null),
      'wifi_password': this.fb.control(null)
    });
  }

  ngOnInit() {
  }

  dismiss(){
    this.modalController.dismiss();
  }

  pingDevice() {
    this.status = "";
    this.isLoading = true;
    this.http.get<{device_type: string}>("http://" + this.deviceIP + "/device_type").subscribe(resData => {
      this.isLoading = false;
      this.isConnected = true;
      this.deviceType = resData.device_type;
    }, error => {
      this.status = "Connection Error";
      this.isLoading = false;
      console.log(error);
      this.presentDeviceConnectionError();
    });
  }

  async presentDeviceConnectionError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Unable to connect to device',
      buttons: ['OK']
    });
    await alert.present();
  }

  // onWiFiSettingsSubmit() {
  //   this.http.post("http://" + this.deviceIP + "/setup", JSON.stringify({
  //     ssid: this.wifiSettingsForm.value.wifi_ssid,
  //     password: this.wifiSettingsForm.value.wifi_password,
  //     device_id: "D1000",
  //     time: "5:50",
  //     broker_ip: this.mqttInterfaceService.MQTT_CONFIG.host
  //   })).subscribe(() => {
  //     console.log("Message Sent");
  //     this.isWifiSettingsTransferred = true;
  //   }, err => {console.log(err)});
  // };

  async presentWiFiConnectionError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Device Unable to connect to Router',
      buttons: ['OK']
    });
    await alert.present();
  }

  onWiFiChangeClick() {
    // this.mqttInterfaceService.connectToBroker();
    this.mqttInterfaceService.subscribeToTopic("D100" + "/wificonnectstatus");
    this.mqttInterfaceService.wifiConnectStatus.pipe(take(1)).subscribe(resData => {
      console.log("here");
      if(resData == true) {
        console.log("true");
        switch(this.deviceType) {
          case "Hydrotek Fertigation System":
            this.router.navigate(['/add-system']);
            this.modalController.dismiss();
            break;
          case "Hydrotek Climate Controller":
            this.router.navigate(['/add-growroom']);
            this.modalController.dismiss();
            break;
          default:
            console.log("Unknown Name");
        }
      } else {
        this.presentWiFiConnectionError();
      }
    });
    setTimeout(() => { 
      this.mqttInterfaceService.unsubscribeToTopic("D100" + "/wificonnectstatus");
      this.mqttInterfaceService.wifiConnectStatus.next(false);
    }, 180000);
  }
}



interface deviceSetup {
  ssid: string,
  password: string,
  device_id: string,
  time: string,
  broker_ip: string
}

