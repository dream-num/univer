export class InfoBarModel {
    private _name: string;

    get name(): string {
        return this._name;
    }

    setName(name: string) {
        this._name = name;
    }
}
