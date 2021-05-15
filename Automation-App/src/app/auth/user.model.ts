export class User{
    constructor(public id: string, public email: string, private _token: string, private tokenExpirateDate: Date) {}
    get token() {
        if(!this.tokenExpirateDate || this.tokenExpirateDate <= new Date())
        {
            return null;
        }
        return this._token;
    }
}