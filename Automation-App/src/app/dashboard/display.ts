import { Title } from '@angular/platform-browser'

export class Display {
    public current_val;
    constructor(public title: string, public range: string, public target_val: string){
        this.current_val = "0";
    }
}
