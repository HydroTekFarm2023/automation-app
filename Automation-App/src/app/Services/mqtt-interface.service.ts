import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, take, timeout } from 'rxjs/operators';

declare const Paho: any;
declare const document: any;

const CLIENTID = "Hydrotek App";
const PORT = 9001;

@Injectable({providedIn: "root"})

export class MqttInterfaceService {
  public mqttStatus = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.UNINITIALIZED);

  public deviceLiveData = new Subject<string>();
  public wifiConnectStatus = new Subject<boolean>();

  public equipmentStatus = new BehaviorSubject<EquipmentStatus>(null);

  public client: any;

  private messageConfirmation = new Subject<string>();

  private reconnectDelay = 3000;

  public subscribedTopics: string[] = [];

  private scripts: any = {};
  private ScriptStore: Scripts[] = [
    {
      name: 'paho_mqtt', src: 'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.1.0/paho-mqtt.min.js'
    }
  ];

  resetMqttService() {
    this.disconnectClient();
    this.mqttStatus = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.UNINITIALIZED);
    this.equipmentStatus = new BehaviorSubject<EquipmentStatus>(null);
    this.client = null;
    this.reconnectDelay = 3000;
  }

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
    console.log(topic);
    console.log(this.client);
    this.mqttStatus.next(ConnectionStatus.CONNECTING);
    try {
      return this.client.connect(
        {
          onSuccess: this._onConnect.bind(this, topic),
          onFailure: this._onConnectionFailure.bind(this, topic),
          reconnect: true
      });
    } catch (error) {
      console.warn(error);
      return error; 
    }
  }
  
  public async publishMultipleMessages(messagesArray: {topic: string, payload: string, qos?: number, retained?: boolean}[]) {
    var i = 0;
    while(i < messagesArray.length) {
      await this.publishMessage(messagesArray[i].topic, messagesArray[i].payload, messagesArray[i].qos, messagesArray[i].retained).then(() => {
        i++;
      }).catch((error) => {
        throw { index: i, error: error };
      });
      console.log(i);
    }
    return i;
  }

  public publishMessage(topic: string, payload: string, qos?: number, retained?: boolean): Promise<any> {
      console.log('Attempting to publish: msg, topic', topic, payload);

      var message = new Paho.Message(payload);
      message.topic = topic;
      qos ? message.qos = qos : message.qos = 1;
      qos ? message.retained = retained : message.retained = false;

      let messageConfirmationPromise = new Promise<void>((resolve, reject) => {
        this.messageConfirmation.pipe(timeout(10 * 1000),filter((message) => message == payload), take(1)).subscribe(() => {
          console.log('Successfully published: msg, topic', topic, payload);
          resolve();
        },
        (error) => {
          console.log(error);
          reject(error);
        });
      });

      let publishPromise = new Promise(() => {
        this.client.publish(message);
      });

      return Promise.race([messageConfirmationPromise, publishPromise]);
  };

  public onMessageDelivered(ResponseObject) {
    console.log(ResponseObject);
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
        console.log("Unkown Level 0 Case for MQTT Topic: " + topicParam[0]);
        break;
      }
    }
  }

  onConnectionLost(ResponseObject) {
    console.log(ResponseObject);
    this.mqttStatus.next(ConnectionStatus.RECONNECTING);
  }
    
  public publishUpdate(topic: string, payload: string): void {
    var message = new Paho.Message(payload);
    message.topic = topic;
    message.qos = 2;
    message.retained = true;
    this.client.publish(message);
  }

  public subscribeToTopic(topic: string, qos?: number) {
    var clientRef = this.client;

    // Check if topic is already subscribed
    for(let subscribedTopic of this.subscribedTopics) {
      if(topic == subscribedTopic) {
        console.warn("Already Subscribed to topic: " + topic);
        return Promise.resolve();
      }
    }
  
    // Create promise for topic subscribe function
    let subscribePromise =  new Promise (function(resolve, reject) {
      let success = (resData) => {
        resolve(resData.invocationContext.topic);
      }
      let failure = (error) => {
        reject(error);
      }
      clientRef.subscribe(topic, { 
        invocationContext: {topic: topic},
        qos: qos? qos : 1, 
        onSuccess: (resData) => { success(resData) },
        onFailure: (error) => { failure(error) },
        timeout: 10 
      });
    });

    return subscribePromise.then((topic: string) => {
      this.subscribedTopics.push(topic);
      console.log(this.subscribedTopics);
    });
  }

  public unsubscribeFromTopic(topic: string) {
    var clientRef = this.client;
    // Check if topic is already not subscribed
    let index = this.subscribedTopics.findIndex((subscribedTopic) => subscribedTopic == topic);
    
    if(index == -1) {
      console.warn("Already not subscribed to topic: " + topic);
      return Promise.resolve();
    }
    // Create promise for topic unsubscribe function
    let unsubscribePromise = new Promise(function(resolve, reject) {
      let success = (resData) => {
        resolve(resData.invocationContext.topic);
      }
      let failure = (error) => {
        reject(error);
      }
      clientRef.unsubscribe(topic, { 
        invocationContext: {topic: topic},
        onSuccess: (resData) => { success(resData) },
        onFailure: (error) => { failure(error) },
        timeout: 10 
      });
    });

    return unsubscribePromise.then((topic: string) => {
      // Since this callback is async, find index again, incase subscribedTopics array was modified 
      let index = this.subscribedTopics.findIndex((subscribedTopic) => subscribedTopic == topic);
      if(index == -1) {
        console.warn("Already deleted topic: " + topic);
        return;
      }
      // If unsubscribe is successful then delete topic from subscribed topics
      this.subscribedTopics.splice(index, 1);
    });
  }

  private _onConnect(topic: string[]) {
    this.reconnectDelay = 3000;
    topic.forEach((tp) => {
      this.client.subscribe(tp);
    });
    console.log("connected");
    this.mqttStatus.next(ConnectionStatus.CONNECTED);
    return this.client;
  }

  _onConnectionFailure(topic: string[], error){
    console.warn(error);

    this.mqttStatus.next(ConnectionStatus.RECONNECTING);

    if(error.errorCode == 7) {
      this.mqttStatus.next(ConnectionStatus.UNABLE_TO_REACH_BROKER);
    } 
      
    setTimeout(() => {
      this.connectToBroker(topic);
    }, this.reconnectDelay);

    if(this.reconnectDelay < 120000) {
      this.reconnectDelay *= 2;
    }  
  }

  public async disconnectClient() {
    try {
      await this.client.disconnect();
      this.mqttStatus.next(ConnectionStatus.DISCONNECTED);
      return true;
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }
}

export enum ConnectionStatus {
  UNINITIALIZED,
  CONNECTING,
  RECONNECTING,
  CONNECTED,
  DISCONNECTED,
  UNABLE_TO_REACH_BROKER
}

interface Scripts {
   name: string;
   src: string;
}

interface EquipmentStatus {
  rf: any,
  control: any
}


