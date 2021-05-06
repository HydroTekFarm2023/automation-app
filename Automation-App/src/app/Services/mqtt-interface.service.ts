import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

declare const Paho: any;
declare const document: any;

const CLIENTID = "Hydrotek App";
const PORT = 9001;

@Injectable({providedIn: "root"})

export class MqttInterfaceService {
  private status: string[] = ['uninitialized', 'connecting', 'connected', 'disconnected'];
  public mqttStatus = new BehaviorSubject(status[0]);

  public deviceLiveData = new Subject<string>();
  public wifiConnectStatus = new Subject<boolean>();

  public equipmentStatus = new BehaviorSubject<EquipmentStatus>(null);

  public client: any;

  private messageConfirmation = new Subject<string>();

  private scripts: any = {};
  private ScriptStore: Scripts[] = [
    {
      name: 'paho_mqtt', src: 'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.1.0/paho-mqtt.min.js'
    }
  ];

  constructor() {
    this.ScriptStore.forEach((script: any) => {
        this.scripts[script.name] = {
            loaded: false,
            src: script.src
        };
    });
  }

  private _load(...scripts: string[]) {
      var promises: any[] = [];
      scripts.forEach((script) => promises.push(this._loadScript(script)));
      return Promise.all(promises);
  }

  private _loadScript(name: string) {
      return new Promise((resolve, reject) => {
          //resolve if already loaded
          if (this.scripts[name].loaded) {
              resolve({name, loaded: true, status: 'Already Loaded'});
          }
          else {
              //load script
              let script = document.createElement('script');
              script.type = 'text/javascript';
              script.src = this.scripts[name].src;
              if (script.readyState) {  //IE
                  script.onreadystatechange = () => {
                      if (script.readyState === "loaded" || script.readyState === "complete") {
                          script.onreadystatechange = null;
                          this.scripts[name].loaded = true;
                          resolve({name, loaded: true, status: 'Loaded', script, src: script.src});
                      }
                  };
              } else {  //Others
                  script.onload = () => {
                      this.scripts[name].loaded = true;
                      resolve({name, loaded: true, status: 'Loaded', script, src: script.src});
                  };
              }
              script.onerror = (error: any) => resolve({name, loaded: false, status: 'Loaded'});
              document.getElementsByTagName('head')[0].appendChild(script);
          }
      });
  }

  public createClient(
    TOPIC: string[], 
    MQTT_CONFIG: {
      host: string,
      port?: number,
      clientId?: string,
      path?: string,
    }): any {
    return this._load('paho_mqtt').then(() => {
      this.mqttStatus.next(this.status[1]);
      this.client = new Paho.Client(MQTT_CONFIG.host, Number(MQTT_CONFIG.port) || PORT, MQTT_CONFIG.path || "/mqtt", MQTT_CONFIG.clientId || CLIENTID);
      this.client.onConnectionLost = this.onConnectionLost.bind(this);
      this.client.onMessageArrived = this.onMessageArrived.bind(this);
      this.client.onMessageDelivered = this.onMessageDelivered.bind(this);
      return this.connectToBroker(TOPIC);
    }).catch(error => {
      console.log(error);
    })
  };

  public connectToBroker(topic: string[]) {
    return this.client.connect(
      {
        onSuccess: this._onConnect.bind(this, topic),
        onFailure: this._onConnectionFailure.bind(this)
    });
  } 

  public publishMessage(topic: string, payload: string, qos?: number, retained?: boolean): Promise<any> {
      console.log('msg, topic', topic, payload);
      var message = new Paho.Message(payload);
      message.topic = topic;
      qos ? message.qos = qos : 1;
      qos ? message.retained = retained : false;
      this.client.publish(message);
      let messageConfirmationPromise = new Promise<void>((resolve, reject) => {
        this.messageConfirmation.pipe(filter((message) => message == payload), take(1)).subscribe(() => {
          console.log("resolved");
          resolve();
        },
        (error) => {
          reject(error);
        });
      });

      let timeOutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log("timeout");
          reject();
        }, 10000);
      })

      return Promise.race([messageConfirmationPromise, timeOutPromise]);
  };

  public onMessageDelivered(ResponseObject) {
    this.messageConfirmation.next(ResponseObject.payloadString);
  }

  onMessageArrived(ResponseObject) {
    console.log(ResponseObject.payloadString);
    // Split TOPIC URL to extract IDs
    console.log(ResponseObject);
    var topicParam = ResponseObject.topic.split("/", 2);
    // Check if incoming data is for selected device
    switch(topicParam[0]) {
      case 'live_data': {
        // Update selected system live data
        this.deviceLiveData.next(ResponseObject.payloadString);
        break;
      }
      case 'wifi_connect_status': {
        this.wifiConnectStatus.next(true);
        break;
      }
      case 'equipment_status': {
        var equipmentStatusObject = JSON.parse(ResponseObject.payloadString);
        this.equipmentStatus.next(equipmentStatusObject);
        break;
      }
      default: {
        console.log("Unkown Level 0 Case for MQTT Topic");
        break;
      }
    }
  }

  onConnectionLost(ResponseObject) {
    console.log(ResponseObject);
    this.mqttStatus.next('connection lost');
  }
    
  public publishUpdate(topic: string, payload: string): void {
    var message = new Paho.Message(payload);
    message.topic = topic;
    message.qos = 2;
    message.retained = true;
    this.client.publish(message);
  }

  public subscribeToTopic(topic: string) {
    this.client.subscribe(topic);
  }

  public subscribeToTopics(topics: string[]) {
    topics.forEach(topic => {
      this.client.subscribe(topic);
    });
  }

  public unsubscribeToTopic(topic: string) {
    this.client.unsubscribe(topic);
  }

  public unsubscribeToTopics(topics: string[]) {
    topics.forEach(topic => {
      this.client.unsubscribe(topic);
    });
  }

  private _onConnect(topic: string[]) {
    topic.forEach((tp) => {
      this.client.subscribe(tp);
    });
    console.log("connected");
    this.mqttStatus.next(this.status[2]);
    return this.client;
  }

  _onConnectionFailure(){
    console.log("Error");
  }

  public disconnectClient() {
    this.client.disconnect();
    this.mqttStatus.next(this.status[3]);
  }
}


interface Scripts {
   name: string;
   src: string;
}

interface EquipmentStatus {
  rf: any,
  control: any
}


