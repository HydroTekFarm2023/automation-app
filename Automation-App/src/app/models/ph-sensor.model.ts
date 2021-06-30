import { Deserializable } from "./deserializable";
import { SensorDisplay } from "./sensor-display";
import { Sensor } from "./sensor.model";

export class PhSensor extends Sensor implements Deserializable, SensorDisplay {
    
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
        return 'PH';
    }

    getSensorUnit(): string {
        return '';
    }
}
