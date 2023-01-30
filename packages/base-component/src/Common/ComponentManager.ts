export class ComponentManager {
    private _componentList: Map<string, any>;

    register(name: string, component: any) {
        this._componentList.set(name, component);
    }

    get(name: string) {
        this._componentList.get(name);
    }

    delete(name: string) {
        this._componentList.delete(name);
    }
}
