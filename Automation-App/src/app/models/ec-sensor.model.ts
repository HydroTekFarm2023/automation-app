import { Deserializable } from "./deserializable";
import { Sensor } from "./sensor.model";

export class EcSensor extends Sensor implements Deserializable {

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
            value: number;
          }
          pump_2: {
            enabled: boolean;
            value: number;
          }
          pump_3: {
            enabled: boolean;
            value: number;
          }
          pump_4: {
            enabled: boolean;
            value: number;
          }
          pump_5: {
            enabled: boolean;
            value: number;
          }
        }
    }    

    deserialize(input: any): this {
        return Object.assign(this, input);
    }
}
