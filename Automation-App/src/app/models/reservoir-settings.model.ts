import { Deserializable } from "./deserializable";

export class ReservoirSettings implements Deserializable {

    reservoir_size: number;
    is_control: boolean;
    replace_interv: number;
    replace_date: string;

    deserialize(input: any): this {
        return Object.assign(this, input);
    }

    getDisplayName(): string {
        return 'Reservoir'
    }
}
