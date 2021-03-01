import { Deserializable } from "./deserializable";
import { Device } from "./device.model";
import { EcSensor } from "./ec-sensor.model";
import { PhSensor } from "./ph-sensor.model";
import { WaterTempSensor } from "./water-temp-sensor.model";

export class FertigationSystem extends Device implements Deserializable {

    settings: {
        ph?: PhSensor,
        ec?: EcSensor,
        water_temp?: WaterTempSensor
    }

    deserialize(input: any): this {
        Object.assign(this, input);
        
        if(input.settings.ph !== undefined) {
            this.settings.ph = new PhSensor().deserialize(input.settings.ph);
        }

        if(input.settings.ec !== undefined) {
            this.settings.ec = new EcSensor().deserialize(input.settings.ec);
        }

        if(input.settings.water_temp !== undefined) {
            this.settings.water_temp = new WaterTempSensor().deserialize(input.settings.water_temp);
        }
        
        return this;
    }
}
