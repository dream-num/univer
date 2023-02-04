import { ModalGroup } from '../UI/ModalGroup/ModalGroup';

export class ComponentManager {
    private _componentList: Map<string, any> = new Map();

    private _modalManager: ModalManager;

    constructor() {
        this._modalManager = new ModalManager();
    }

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

export class ModalManager {
    private _modalGroup: ModalGroup;

    private _group = [];

    getComponent(ref: ModalGroup) {
        this._modalGroup = ref;
    }

    addModal(name: string, component: any) {
        const index = this._modalGroup.findIndex((item) => item === name);
        if (index < 0) {
            this._plugin.registerComponent(name, component);
            this._modalGroup.push(name);

            this._ModalGroupComponent?.setModalGroup(this._modalGroup);
        }
    }

    getModal(name: string) {
        const ModalGroup = this._ModalGroupComponent.getModalGroup();
        return ModalGroup.find((item) => item.constructor.name === name);
    }
}
