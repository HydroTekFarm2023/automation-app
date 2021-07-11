import { Deserializable } from "./deserializable";
import { Sensor } from "./sensor.model";

export class PhSensor extends Sensor implements Deserializable {
    //DO NOT ADD VARIABLES IN THE SENSOR MODELS
    //You can add functions though.
    control: {
        d_n_enabled: boolean;
        day_tgt: number;
        night_tgt: number;
        tgt: number;
        dose_time: number;
        dose_interv: number;
        up_ctrl: boolean,
        down_ctrl: boolean
    }
    

    deserialize(input: any): this {
        return Object.assign(this, input);
    }

    getDisplayName(): string {
        return 'PH'
    }
}
