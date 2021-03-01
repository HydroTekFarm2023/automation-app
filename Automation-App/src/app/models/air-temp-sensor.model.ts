import { Deserializable } from "./deserializable";
import { Sensor } from "./sensor.model";

export class AirTempSensor extends Sensor implements Deserializable {

    control: {
        d_n_enabled: boolean;
        day_tgt: number;
        night_tgt: number;
        tgt: number;
        up_ctrl: boolean;
        down_ctrl: boolean;
    }

    deserialize(input: any): this {
        return Object.assign(this, input);
    }
}
