import { Deserializable } from "./deserializable";

export class ReservoirSettings implements Deserializable {

    reservoir_size: number;
    is_control: boolean;
    water_replacement_interval: number;

    deserialize(input: any): this {
        return Object.assign(this, input);
    }

    getDisplayName(): string {
        return 'Reservoir'
    }
}
