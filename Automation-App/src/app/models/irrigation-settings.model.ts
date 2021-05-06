import { Deserializable } from "./deserializable";

export class IrrigationSettings implements Deserializable {

    on_interval: number;
    off_interval: number; 

    deserialize(input: any): this {
        return Object.assign(this, input);
    }

    getDisplayName(): string {
        return 'Irrigation'
    }
}
