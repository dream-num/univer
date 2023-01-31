export class ComponentManager {
    private _componentList: Map<string, any> = new Map();

    register(name: string, component: any) {
        this._componentList.set(name, component);
    }

    get(name: string) {
        return this._componentList.get(name);
    }

    delete(name: string) {
        this._componentList.delete(name);
    }
}
