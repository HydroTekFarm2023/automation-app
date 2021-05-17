import { Camera } from './camera.model';
import { AirTempSensor } from "./air-temp-sensor.model";
import { Deserializable } from "./deserializable";
import { Device } from "./device.model";
import { HumiditySensor } from "./humidity-sensor.model";
import { PowerOutlet } from "./power-outlet.model";


export class ClimateController extends Device implements Deserializable {

    settings: {
        air_temp: AirTempSensor,
        humidity: HumiditySensor
    }

    power_outlets: PowerOutlet[] = [];
    cameras: Camera[] = [];

    deserialize(input: any): this {
        Object.assign(this, input);
        
        if(input.settings.air_temp !== undefined) {
            console.log("here");
            this.settings.air_temp = new AirTempSensor().deserialize(input.settings.air_temp);
        }

        if(input.settings.humidity !== undefined) {
            this.settings.humidity = new HumiditySensor().deserialize(input.settings.humidity);
        }

        if(input.power_outlets !== undefined) {
            for(let powerOutlet of this.power_outlets) {
                this.power_outlets.push(new PowerOutlet().deserialize(powerOutlet));
            }
        }

        if(input.cameras !== undefined) {
            this.cameras = [];
            //console.log(input.cameras);
            for(let camera of input.cameras) {
                //console.log(camera);
                this.cameras.push(new Camera().deserialize(camera));
            }
        }
        
        return this;
    }
}
