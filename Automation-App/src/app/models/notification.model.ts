import { Device } from "./device.model";
import { Deserializable } from "./deserializable";

export class Notification implements Deserializable{
    title: String;
    body: String;
    station: String;
    plant: String;
    image: String;
    timestamp: Date;
    isRead: Boolean;
    isDeleted: Boolean;
    deletedOn: Date;
    _id: string;
    notificationType: string;

    deserialize(input: any): this {
        return Object.assign(this, input);
    }

    
   


}

     