import { SheetPlugin } from '../SheetPlugin';
import { SideGroup } from '../View/UI/SideGroup/SideGroup';

export interface SideProps {
    name: string;
    zIndex: number;
    show?: boolean;
    onClick: (name: string) => void;
}

export type SideGroupProps = SideProps[];

export class SideGroupController {
    private _SideGroup: SideGroupProps;

    private _SideGroupComponent: SideGroup;

    private _plugin: SheetPlugin;

    constructor(plugin: SheetPlugin) {
        this._plugin = plugin;

        this._SideGroup = [];

        this.init();
    }

    init() {
        this._plugin.getObserver('onSideGroupDidMountObservable')?.add((component) => {
            //初始化视图
            this._SideGroupComponent = component;
        });
    }

    addSide(name: string, component: any) {
        const index = this._SideGroup.findIndex((item) => item.name === name);
        if (index < 0) {
            this._plugin.registerComponent(name, component);
            this._SideGroup.push({
                name,
                zIndex: this._SideGroup.length + 1,
                show: false,
                onClick: this.activeSide,
            });
        }
    }

    removeSide(name: string) {
        const index = this._SideGroup.findIndex((item) => item.name === name);
        if (index > -1) {
            for (let i = index + 1; i < this._SideGroup.length; i++) {
                this._SideGroup[i].zIndex -= 1;
            }
            this._SideGroup.splice(index, 1);
            this._SideGroupComponent.setSideGroup(this._SideGroup);
        }
    }

    activeSide(name: string) {
        const index = this._SideGroup.findIndex((item) => item.name === name);
        if (index > -1) {
            for (let i = index + 1; i < this._SideGroup.length; i++) {
                this._SideGroup[i].zIndex -= 1;
            }
            this._SideGroup[index].zIndex = this._SideGroup.length;
            this._SideGroup[index].show = true;
            this._SideGroup.sort((a, b) => a.zIndex - b.zIndex);

            this._SideGroupComponent.setSideGroup(this._SideGroup);
        }
    }

    hideSide(name: string) {
        const index = this._SideGroup.findIndex((item) => item.name === name);
        if (index > -1) {
            this._SideGroup[index].show = false;
            this._SideGroupComponent.setSideGroup(this._SideGroup);
        }
    }
}
