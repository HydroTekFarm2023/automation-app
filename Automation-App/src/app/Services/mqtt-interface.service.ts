import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from 'rxjs';
import { VariableManagementService } from '../variable-management.service';
import { timeout, filter, take } from 'rxjs/operators';


declare const Paho: any;
declare const document: any;

@Injectable({providedIn: "root"})

export class MqttInterfaceService {

  private status: string[] = ['uninitialized', 'connecting', 'connected', 'disconnected'];
  public mqttStatus = new BehaviorSubject(status[0]);

  public deviceLiveData = new Subject<string>();

  public client: any;
  private topics: string[] = ['#'];

  private messageConfirmation = new Subject<string>();

  MQTT_CONFIG: {
    host: string;
    port: number;
    clientId: string;
    path?: string;
  } = {
    host: "192.168.86.55",
    port: 9001,
    clientId: "User122",
  };

  private scripts: any = {};
  private ScriptStore: Scripts[] = [
    {
      name: 'paho_mqtt', src: 'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.1.0/paho-mqtt.min.js'
    }
  ];

  constructor(private variableManagementService: VariableManagementService) {
    this.ScriptStore.forEach((script: any) => {
        this.scripts[script.name] = {
            loaded: false,
            src: script.src
        };
    });
    this.createClient(
      this.onConnectionLost,
      this.topics,
      this.MQTT_CONFIG
    );
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
    onConnectionLost,
    TOPIC: string[], 
    MQTT_CONFIG: {
      host: string,
      port: number,
      clientId: string,
      path?: string,
    }): any {
    return this._load('paho_mqtt').then(data => {
      this.mqttStatus.next(this.status[1]);
      this.client = new Paho.Client(MQTT_CONFIG.host, Number(MQTT_CONFIG.port), MQTT_CONFIG.path || "/mqtt", MQTT_CONFIG.clientId);
      this.client.onConnectionLost = onConnectionLost.bind(this);
      this.client.onMessageArrived = this.onMessageArrived.bind(this);
      this.client.onMessageDelivered = this.onMessageDelivered.bind(this);
      return this.client.connect(
        {
          onSuccess: this._onConnect.bind(this, TOPIC),
          onFailure: this._onConnectionFailure.bind(this)
      });
    }).catch(error => {
   
    })
  };

  public publishMessage(topic: string, payload: string, qos?: number, retained?: boolean): Promise<any> {
      console.log('msg, topic', topic, payload);
      var message = new Paho.Message(payload);
      message.topic = topic;
      qos ? message.qos = qos : 1;
      qos ? message.retained = retained : false;
      this.client.publish(message);
      var messageConfirmationSubscribtion;
      let messageConfirmationPromise = new Promise((resolve, reject) => {
        messageConfirmationSubscribtion = this.messageConfirmation.pipe(filter((message) => message == payload), take(1)).subscribe(() => {
          console.log("resolved");
          resolve();
        },
        (error) => {
          console.log("heee");
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
    console.log(ResponseObject);
    // Split TOPIC URL to extract IDs
    var topicParam = ResponseObject.topic.split("/", 3);
    // Check if incoming data is for selected device
    if(topicParam[0] == this.variableManagementService.selectedCluster.value && topicParam[1] == this.variableManagementService.selectedDevice.value) {
      switch(topicParam[2]) {
        case 'live_data': {
          // Update selected system live data
          this.deviceLiveData.next(ResponseObject.payloadString);
          break;
        }
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


