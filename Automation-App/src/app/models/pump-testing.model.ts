export class Pump{
    id: string;
    name: string;
    logo: string;
    currentValue:boolean = false;
    currentState: number;

    constructor(id?: string, name?: string, logo?: string, currentValue?: boolean, currentState?: number) {
        if(id) this.id = id;
        if(name) this.name = name;
        if(logo) this.logo = logo;
        if(currentValue) this.currentValue = currentValue;
        if(currentState) this.currentState = currentState;
    }
}
