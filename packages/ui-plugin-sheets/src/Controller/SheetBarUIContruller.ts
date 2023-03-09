import { BaseMenuItem, BaseUlProps, ColorPicker } from '@univerjs/base-ui';
import {
    Nullable,
    Plugin,
    CommandManager,
    SheetActionBase,
    UIObserver,
    SetSheetOrderAction,
    InsertSheetAction,
    SetWorkSheetNameAction,
    SetTabColorAction,
    SetWorkSheetHideAction,
    SetWorkSheetActivateAction,
    SetWorkSheetStatusAction,
    RemoveSheetAction,
} from '@univerjs/core';
import { SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '..';
import { SheetBar } from '../View/SheetBar';
import styles from '../View/SheetBar/index.module.less';
import { SheetBarMenuItem } from '../View/SheetBar/SheetBarMenu';

interface CustomComponent {
    name: string;
    props?: Record<string, any>;
}

interface SheetUl extends BaseMenuItem {
    locale?: string;
    customLabel?: CustomComponent;
    children?: SheetUl[];
}

interface SheetUlProps extends BaseUlProps {
    index: string;
    color?: Nullable<string>;
    sheetId: string;
}

export class SheetBarUIController {
    protected _sheetBar: SheetBar;

    protected _plugin: Plugin;

    protected _sheetUl: SheetUl[];

    protected _dataId: string;

    protected _sheetIndex: number;

    protected _sheetList: SheetUlProps[];

    protected _menuList: SheetBarMenuItem[];

    constructor(plugin: Plugin) {
        let that = this;
        this._plugin = plugin;
        this._sheetUl = [
            {
                locale: 'sheetConfig.delete',
                onClick: () => {
                    that.setUIObserve('onUIChangeObservable', { name: 'deleteSheet', value: this._dataId });
                },
            },
            {
                locale: 'sheetConfig.copy',
                onClick: () => {
                    that.setUIObserve('onUIChangeObservable', { name: 'copySheet' });
                },
            },
            {
                locale: 'sheetConfig.rename',
                onClick: () => {
                    this._sheetBar.reNameSheet(this._dataId);
                },
            },
            {
                locale: 'sheetConfig.changeColor',
                border: true,
                className: styles.selectColorPickerParent,
                children: [
                    {
                        customLabel: {
                            name: this._plugin.getPluginName() + ColorPicker.name,
                            props: {
                                onClick: (color: string) => {
                                    this.setUIObserve('onUIChangeObservable', {
                                        name: 'changeSheetColor',
                                        value: {
                                            color,
                                            sheetId: this._dataId,
                                        },
                                    });
                                },
                            },
                        },
                        className: styles.selectColorPicker,
                    },
                ],
            },
            {
                locale: 'sheetConfig.hide',
                onClick: () => {
                    that.setUIObserve('onUIChangeObservable', { name: 'hideSheet', value: this._dataId });
                },
            },
            {
                locale: 'sheetConfig.unhide',
                onClick: () => {
                    this._sheetBar.ref.current.showMenu(true);
                    that.setUIObserve('onUIChangeObservable', { name: 'unHideSheet', value: this._dataId });
                },
            },
        ];
        this._plugin
            .getPluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
            ?.getComponentManager()
            .register(this._plugin.getPluginName() + ColorPicker.name, ColorPicker);
        CommandManager.getActionObservers().add((event) => {
            const action = event.action as SheetActionBase<any>;
            const data = event.data;
            const workbook = action.getWorkBook();
            const unitId = workbook.getUnitId();
            const currentWorkbook = this._plugin.getUniver().getCurrentUniverSheetInstance().getWorkBook();
            const currentUnitId = currentWorkbook.getUnitId();
            if (unitId === currentUnitId) {
                switch (data.actionName) {
                    case SetSheetOrderAction.NAME:
                    case SetWorkSheetActivateAction.NAME:
                    case InsertSheetAction.NAME:
                    case RemoveSheetAction.NAME:
                    case SetWorkSheetNameAction.NAME:
                    case SetTabColorAction.NAME:
                    case SetWorkSheetStatusAction.NAME:
                    case SetWorkSheetHideAction.NAME: {
                        // update data;
                        this._refreshSheetData();
                        // set ui bar sheetList;
                        this._refreshSheetBarUI();
                        break;
                    }
                }
            }
        });
        this._plugin
            .getPluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
            ?.getComponentManager()
            .register(this._plugin.getPluginName() + ColorPicker.name, ColorPicker);
    }

    getComponent = (ref: SheetBar) => {
        this._sheetBar = ref;
        this._refreshComponent();
    };

    resetLabel(label: string[] | string) {
        const locale = this._plugin.getGlobalContext().getLocale();

        let str = '';

        if (label instanceof Array) {
            label.forEach((item) => {
                if (item.includes('.')) {
                    str += locale.get(item);
                } else {
                    str += item;
                }
            });
        } else {
            if (label.includes('.')) {
                str = locale.get(label);
            } else {
                str += label;
            }
        }

        return str;
    }

    findLocale(obj: any) {
        for (let k in obj) {
            if (k === 'locale') {
                obj.label = this.resetLabel(obj[k]);
            } else if (k.endsWith('Locale')) {
                const index = k.indexOf('Locale');
                obj[k.slice(0, index)] = this.resetLabel(obj[k]);
            } else if (!obj[k].$$typeof) {
                if (Object.prototype.toString.call(obj[k]) === '[object Object]') {
                    this.findLocale(obj[k]);
                } else if (Object.prototype.toString.call(obj[k]) === '[object Array]') {
                    obj[k] = this.resetSheetUl(obj[k]);
                }
            }
        }

        return obj;
    }

    setUIObserve<T>(type: string, msg: UIObserver<T>) {
        this._plugin.getContext().getObserverManager().requiredObserver<UIObserver<T>>(type, 'core').notifyObservers(msg);
    }

    getSheetBar(): SheetBar {
        return this._sheetBar;
    }

    getDataId(): string {
        return this._dataId;
    }

    getSheetList(): SheetUlProps[] {
        return this._sheetList;
    }

    getMenuList(): SheetBarMenuItem[] {
        return this._menuList;
    }

    resetSheetUl(sheetUl: SheetUl[]) {
        for (let i = 0; i < sheetUl.length; i++) {
            let item = sheetUl[i];
            item = this.findLocale(item);

            if (item.children) {
                item.children = this.resetSheetUl(item.children);
            }
        }
        return sheetUl;
    }

    selectSheet() {}

    deleteSheet() {}

    sortMenu(index: number, hidden?: boolean, hideIndex?: number) {}

    copySheet() {}

    /**
     * Arrow functions must be used to bind `this`, otherwise `this` will be lost when the DOM component triggers the callback
     */
    addSheet = (position?: string, config?: SheetUlProps): void => {
        this.setUIObserve('onUIChangeObservable', {
            name: 'addSheet',
            value: {
                position,
                config,
            },
        });
    };

    hideSheet() {}

    unHideSheet() {
        this._sheetBar.ref.current.showSelect();
    }

    moveSheet(direct: string) {}

    changeSheetName = (event: Event) => {
        this.setUIObserve('onUIChangeObservable', {
            name: 'renameSheet',
            value: {
                sheetId: this._dataId,
                sheetName: (event.target as HTMLElement).innerText,
            },
        });
    };

    contextMenu(e: MouseEvent) {
        this._sheetBar.contextMenu(e);
    }

    dragEnd = (element: HTMLDivElement[]): void => {
        let list: SheetUlProps[] = [];
        let sheetId = this._dataId;
        Array.from(element).forEach((node: any) => {
            const item = this._sheetList.find((ele) => ele.sheetId === node.dataset.id);
            if (item) {
                list.push(item);
            }
        });
        list.forEach((ele, index) => {
            if (ele.sheetId === sheetId) {
                this._plugin.getUniver().getCurrentUniverSheetInstance().getWorkBook().setSheetOrder(ele.sheetId, index);
            }
        });
    };

    protected _refreshSheetBarUI(): void {
        this._sheetBar.setValue({
            sheetList: this._sheetList,
            sheetUl: this._sheetUl,
            menuList: this._menuList,
            selectSheet: (event: Event, data: { item: SheetUlProps }) => {
                this._dataId = data.item.sheetId;
                const sheet = this._plugin.getUniver().getCurrentUniverSheetInstance().getWorkBook().getSheetBySheetId(this._dataId);
                if (sheet) {
                    sheet.activate();
                }
            },
            contextMenu: (e: MouseEvent) => {
                const target = e.currentTarget as HTMLDivElement;
                this._dataId = target.dataset.id as string;
                //this._barControl.contextMenu(e);
            },
            changeSheetName: (event: Event) => {},
            dragEnd: (elements: HTMLDivElement[]) => {
                //this._barControl.dragEnd(elements);
            },
        });
    }

    protected _refreshSheetData(): void {
        const workbook = this._plugin.getUniver().getCurrentUniverSheetInstance().getWorkBook();
        const sheets = workbook.getSheets();
        this._menuList = sheets.map((sheet, index) => ({
            label: sheet.getName(),
            index: String(index),
            sheetId: sheet.getSheetId(),
            hide: sheet.isSheetHidden() === 1,
            selected: sheet.getStatus() === 1,
            onClick: (e?: MouseEvent) => {
                if (e) {
                    const target = e.currentTarget as HTMLDivElement;
                    this._dataId = target.dataset.id as string;
                    sheet.showSheet();
                    sheet.activate();
                }
            },
        }));
        this._sheetList = sheets
            .filter((sheet) => !sheet.isSheetHidden())
            .map((sheet, index) => ({
                sheetId: sheet.getSheetId(),
                label: sheet.getName(),
                index: String(index),
                selected: sheet.getStatus() === 1,
                color: sheet.getTabColor() as string,
                onDown: (e: MouseEvent) => {
                    const target = e.currentTarget as HTMLDivElement;
                    this._dataId = target.dataset.id as string;
                },
                onClick: (e: MouseEvent) => {
                    const target = e.currentTarget as HTMLDivElement;
                    this._dataId = target.dataset.id as string;

                    sheet.activate();
                },
            }));
        this._sheetIndex = sheets.findIndex((sheet) => sheet.getStatus() === 1);
        if (this._sheetIndex > -1) {
            this._dataId = sheets[this._sheetIndex].getSheetId();
        }
    }

    protected _refreshComponent(): void {
        this._sheetUl = this.resetSheetUl(this._sheetUl);
        this._refreshSheetData();
        this._refreshSheetBarUI();
    }
}
