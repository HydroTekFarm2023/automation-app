import { Deserializable } from "./deserializable";
import { Sensor } from "./sensor.model";

export class PhSensor extends Sensor implements Deserializable {
    
    control: {
        d_n_enabled: boolean;
        day_tgt: number;
        night_tgt: number;
        tgt: number;
        dose_time: number;
        dose_interv: number;
        pumps: {
            pump_1: {
                enabled: boolean;
            }
            pump_2: {
                enabled: boolean;
            }
        }
    }
    

    deserialize(input: any): this {
        return Object.assign(this, input);
    }
}
