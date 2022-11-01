export class Sensor {
    name: string;
    monit_only: boolean;
    alarm_min: number;
    alarm_max: number;
    test_toggle: boolean;
    test_state: number;

    getDisplayName(){ //This method is present in all sensors, this is just here to shut up the IDE about Sensor not having this method
        return this.name;
    }
}
