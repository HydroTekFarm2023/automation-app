import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { filter, take } from 'rxjs/operators';
import { ConnectionStatus, MqttInterfaceService } from 'src/app/Services/mqtt-interface.service';
import { wifiConnectStatusTopic } from 'src/app/Services/topicKeys';
import { VariableManagementService } from 'src/app/Services/variable-management.service';

@Component({
  selector: 'app-identify-device',
  templateUrl: './identify-device.page.html',
  styleUrls: ['./identify-device.page.scss'],
})
export class IdentifyDevicePage implements OnInit {

  private readonly deviceIP: string = "192.168.4.1";

  private readonly deviceIDLength = 5;
  private readonly charCombinations: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  isLoading: boolean = false;
  isConnected: boolean = false;
  deviceType: string;
  uniqueDeviceId: string;

  status: string;
  isWifiSettingsTransferred: boolean = false;
  wifiSettingsForm: FormGroup = new FormGroup({});
  
  constructor(private modalController: ModalController, private http: HttpClient, private alertController: AlertController, private router: Router, private fb: FormBuilder, private mqttInterfaceService: MqttInterfaceService, private varmanService: VariableManagementService) { 
    this.wifiSettingsForm = this.fb.group({
      'wifi_ssid': this.fb.control(null, [Validators.required]),
      'wifi_password': this.fb.control(null, [Validators.required])
    });
  }

  ngOnInit() {}

  dismiss(){
    this.modalController.dismiss();
  }

  pingDevice() {
    this.status = "";
    this.isLoading = true;
    this.http.get<{device_type: string}>("http://" + this.deviceIP + "/device_type").subscribe(resData => {
      this.isLoading = false;
      this.deviceType = resData.device_type;
      this.status = "";
      this.isConnected = true;
    }, error => {
      this.status = "Unable to Reach Device";
      this.isLoading = false;
      console.log(error);
    });
  }

  onWiFiSettingsSubmit() {
    this.isLoading = true;
    this.uniqueDeviceId = this.generateUniqueDeviceId(this.varmanService.getDeviceTopicIds());
    this.http.post<deviceSetup>("http://" + this.deviceIP + "/setup", JSON.stringify({
      ssid: this.wifiSettingsForm.value.wifi_ssid,
      password: this.wifiSettingsForm.value.wifi_password,
      device_id: this.uniqueDeviceId,
      time: "5:50", // Currently not being used as embedded device gets UTC time from NTP server
      broker_ip: this.mqttInterfaceService.client.host
    })).subscribe(() => {
      this.isLoading = false;
      console.log("Message Sent");
      this.isWifiSettingsTransferred = true;
    }, err => {
      console.log(err);
      this.status="Your Hydrotek Device was unable to connect to WiFi";
      this.isLoading = false;
    });
  };

  async presentWiFiConnectionError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Device Unable to connect to Router',
      buttons: ['OK']
    });
    await alert.present();
  }

  async presentDeviceNotRecognizedError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Device not recognized',
      buttons: ['OK']
    });
    await alert.present();
  }

  onWiFiChangeClick() {
    console.log("change wifi");
    this.isLoading = true;
    setTimeout(() => { 
      this.mqttInterfaceService.unsubscribeToTopic(wifiConnectStatusTopic + "/" + this.uniqueDeviceId);
      this.mqttInterfaceService.wifiConnectStatus.next(false);
      this.isLoading = false;
      this.status = "Unable to Connect to the Hydrotek Server";
      console.log("timeout");
      return;
    }, 90000); 
    console.log("hereee");
    this.mqttInterfaceService.mqttStatus.pipe(filter((status) => { console.log(status); return status == ConnectionStatus.CONNECTED }), take(1)).subscribe(() => {
      console.log("inside");
      this.mqttInterfaceService.subscribeToTopic(wifiConnectStatusTopic + "/" + this.uniqueDeviceId);
      this.mqttInterfaceService.wifiConnectStatus.pipe(take(1)).subscribe(resData => {
        this.isLoading = false;
        console.log("asdddddddddddd");
        if(resData == true) {
          switch(this.deviceType) {
            case "Hydrotek Fertigation System":
              console.log("Fertigation System Identified");
              this.modalController.dismiss({ type: "fertigation-system", topicId: this.uniqueDeviceId });
              break;
            case "Hydrotek Climate Controller":
              console.log("climate controller identified");
              this.modalController.dismiss({ type: "climate-controller", topicId: this.uniqueDeviceId });
              break;
            default:
              console.warn("Unknown Device Type: " + this.deviceType);
              this.status = "Unkown Device";
          }
        } else {
          this.status = "Device unable to connect to router";
          this.presentWiFiConnectionError();
        }
      });
    });  
  }

  private generateUniqueDeviceId(existingIds: string[]) {
    let uniqueDeviceId = '';
    let isUnique = true;
    do {
      uniqueDeviceId = this.randomString(this.deviceIDLength, this.charCombinations);
      existingIds.forEach(element => {
        if(element == uniqueDeviceId) {
          isUnique = false;
        }
      });
    } while(!isUnique);
    return uniqueDeviceId;
  }

  private randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }
}

interface deviceSetup {
  ssid: string,
  password: string,
  device_id: string,
  time: string,
  broker_ip: string
}

