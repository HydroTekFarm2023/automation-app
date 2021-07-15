import { Deserializable } from './deserializable';
export class Plant implements Deserializable {

    _id: string
    name: string;
    sensor_array: [{
        sensor_name: string,
        settings: {
            alarm_min: number,
            alarm_max: number,
            target_value: number,
            day_and_night: boolean,
            day_target_value: number,
            night_target_value: number,
        }
    }]

    deserialize(input: any): this {
        return Object.assign(this, input);
    }
}