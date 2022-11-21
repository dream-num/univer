// import { Registry } from '../Basics';
class Registry {
    private _data: any[] = [];

    add(dataInstance: any) {
        this._data.push(dataInstance);
    }

    delete(dataInstance: any) {
        const index = this._data.indexOf(dataInstance);
        this._data.splice(index, 1);
    }

    getData() {
        return this._data;
    }

    static create() {
        return new Registry();
    }
}

export const REGISTRY_ACTION_FACTORY = Registry.create();
