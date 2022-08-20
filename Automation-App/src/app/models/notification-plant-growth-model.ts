import { Notification } from "./notification.model";


export class NotificationPlantGrowth extends Notification{
   
oldHeight: number;
newHeight: number;

deserialize(input: any): this {
    return Object.assign(this, input);
}
}

     