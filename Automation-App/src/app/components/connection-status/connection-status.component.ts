import { Component, Input, OnInit } from '@angular/core';
import { ConnectionStatus } from 'src/app/Services/mqtt-interface.service';

@Component({
  selector: 'connection-status',
  templateUrl: './connection-status.component.html',
  styleUrls: ['./connection-status.component.scss'],
})
export class ConnectionStatusComponent implements OnInit {
  _mqttStatus: ConnectionStatus;
  message: string = "";
  showBanner: boolean = false;

  @Input() set mqttStatus(value: ConnectionStatus) {
    this._mqttStatus = value;
    this.showBanner = true;
    var element = document.getElementById("mqtt-connection-banner");
    console.log(element);
    if(!element) return;

    if(value == ConnectionStatus.CONNECTED) {
      this.message = "Connected to Device";
      this.resetBanner(element);
      element.classList.add("mqtt-success");
      setTimeout(() => {
        this.showBanner = false;
      }, 5000);

    } else if (value == ConnectionStatus.UNABLE_TO_REACH_BROKER) {
      this.message = "Unable to reach Hydrotek server";
      this.resetBanner(element);
      element.classList.add("mqtt-fail");

    } else if(value == ConnectionStatus.DISCONNECTED) {
      this.message = "Disconnected from server";
      this.resetBanner(element);
      element.classList.add("mqtt-fail");

    } else if(value == ConnectionStatus.RECONNECTING) {
      this.message = "Disconnected: Attempting to reconnect to server";
      this.resetBanner(element);
      element.classList.add("mqtt-fail");

    } else if(value == ConnectionStatus.CONNECTING) {
      this.message = "Connecting to server";
      this.resetBanner(element);
      element.classList.add("mqtt-connecting");

    } else {
      this.showBanner = false;
    }
  }

  resetBanner(element: HTMLElement) {
    this.showBanner = true;
    element.className = '';
    element.classList.add("mqtt-status");
  }

  constructor() { }

  ngOnInit() {}

}
