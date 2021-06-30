import { Deserializable } from "./deserializable";
import { SensorDisplay } from "./sensor-display";
import { Sensor } from "./sensor.model";

export class HumiditySensor extends Sensor implements Deserializable, SensorDisplay {
  
    control: {
        tgt: number;
        up_ctrl: boolean;
        down_ctrl: boolean;
    }

    deserialize(input: any): this {
        return Object.assign(this, input);
    }

    getDisplayName(): string {
        return 'Humidity'
    }

    getSensorUnit(): string {
        return '%RH';
    }
}
