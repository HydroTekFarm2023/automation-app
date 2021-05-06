import { Deserializable } from "./deserializable";

export class GrowlightsSettings implements Deserializable {

    lights_on: string;
    lights_off: string;
    power_outlets: [{
        name: string,
        is_control: boolean
    }];

    deserialize(input: any): this {
        return Object.assign(this, input);
    }

    getDisplayName(): string {
        return 'Grow Lights'
    }
}
