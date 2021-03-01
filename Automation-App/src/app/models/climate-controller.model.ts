import { AirTempSensor } from "./air-temp-sensor.model";
import { Deserializable } from "./deserializable";
import { Device } from "./device.model";
import { HumiditySensor } from "./humidity-sensor.model";

export class ClimateController extends Device implements Deserializable {

    settings: {
        air_temp: AirTempSensor,
        humidity: HumiditySensor
    }

    deserialize(input: any): this {
        Object.assign(this, input);
        
        if(input.settings.air_temp !== undefined) {
            console.log("here");
            this.settings.air_temp = new AirTempSensor().deserialize(input.settings.air_temp);
        }

        if(input.settings.humidity !== undefined) {
            this.settings.humidity = new HumiditySensor().deserialize(input.settings.humidity);
        }
        
        return this;
    }
}
