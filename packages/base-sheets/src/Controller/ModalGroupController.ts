import { SheetPlugin } from '../SheetPlugin';
import { ModalGroup } from '../View/UI/ModalGroup/ModalGroup';

export type ModalGroupProps = string[];

export class ModalGroupController {
    private _ModalGroup: ModalGroupProps;

    private _ModalGroupComponent: ModalGroup;

    private _plugin: SheetPlugin;

    constructor(plugin: SheetPlugin) {
        this._plugin = plugin;

        this._ModalGroup = [];

        this.init();
    }

    init() {
        this._plugin.getObserver('onModalGroupDidMountObservable')?.add((component) => {
            //初始化视图
            this._ModalGroupComponent = component;
        });
    }

    addModal(name: string, component: any) {
        const index = this._ModalGroup.findIndex((item) => item === name);
        if (index < 0) {
            this._plugin.registerComponent(name, component);
            this._ModalGroup.push(name);

            this._ModalGroupComponent?.setModalGroup(this._ModalGroup);
        }
    }

    getModal(name: string) {
        const ModalGroup = this._ModalGroupComponent.getModalGroup();
        return ModalGroup.find((item) => item.constructor.name === name);
    }
}
