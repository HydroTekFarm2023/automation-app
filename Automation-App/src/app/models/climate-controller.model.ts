import { Camera } from './camera.model';
import { AirTempSensor } from "./air-temp-sensor.model";
import { Deserializable } from "./deserializable";
import { Device } from "./device.model";
import { HumiditySensor } from "./humidity-sensor.model";
import { PowerOutlet } from "./power-outlet.model";
import { Co2Sensor } from './co2-sensor.model';


export class ClimateController extends Device implements Deserializable {

    settings: {
        air_temp?: AirTempSensor,
        humidity?: HumiditySensor,
        co2?: Co2Sensor
    }

    power_outlets: PowerOutlet[] = [];
    cameras: Camera[] = [];

    deserialize(input: any): this {
        Object.assign(this, input);
        
        if(input.settings.air_temp !== undefined) {
            this.settings.air_temp = new AirTempSensor().deserialize(input.settings.air_temp);
        }

        if(input.settings.humidity !== undefined) {
            this.settings.humidity = new HumiditySensor().deserialize(input.settings.humidity);
        }

        if(input.settings.co2 !== undefined) {
            this.settings.co2 = new Co2Sensor().deserialize(input.settings.co2);
        }

        if(input.power_outlets !== undefined) {
            this.power_outlets = [];
            console.log(input.power_outlets);
            for(let powerOutlet of input.power_outlets) {
                console.log(powerOutlet);
                this.power_outlets.push(new PowerOutlet().deserialize(powerOutlet));
            }
        }

        if(input.cameras !== undefined) {
            this.cameras = [];
            for(let camera of input.cameras) {
                this.cameras.push(new Camera().deserialize(camera));
            }
        }
        
        return this;
    }
}
