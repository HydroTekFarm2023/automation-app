import { Deserializable } from "./deserializable";

export class PowerOutlet implements Deserializable {

    id: string;
    name: string;
    logo: string;
    currentValue: boolean = false;

    constructor(id?: string, name?: string, logo?: string, currentValue?: boolean) {
        if(id) this.id = id;
        if(name) this.name = name;
        if(logo) this.logo = logo;
        if(currentValue) this.currentValue = currentValue;
    }

    deserialize(input: any): this {
        return Object.assign(this, input);
    }
}
