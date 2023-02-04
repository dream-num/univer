import { BaseMenuItem, BaseUlProps } from '@univerjs/base-ui';
import { Nullable, Plugin } from '@univerjs/core';
import { SheetBar } from "../View/SheetBar";

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

    protected _sheetList: SheetUlProps[];

    protected _sheetIndex: number;

    protected _dataId: string;

    protected _sheetUl: SheetUl[];

    protected _menuList: SheetUlProps[];

    protected _plugin: Plugin;

    protected _initializeObs() {
        const plugin = this._barControl.getPlugin();
        const context = plugin.getContext();
        const manager = context.getObserverManager();
        const workbook = context.getWorkBook();
        const unitId = workbook.getUnitId();
        // manager.requiredObserver<SheetBar>('onSheetBarDidMountObservable', PLUGIN_NAMES.SPREADSHEET);
        manager.requiredObserver<SheetBar>('onSheetBarDidMountObservable', PLUGIN_NAMES.SPREADSHEET).add((component) => {
            this._sheetBar = component;
            this._sheetUl = this.resetSheetUl(this._sheetUl);
            this._sheetBar.setValue({
                sheetList: this._sheetList,
                sheetUl: this._sheetUl,
                menuList: this._menuList,
                addSheet: () => {
                    this._barControl.addSheet();
                },
                selectSheet: (event: Event, data: { item: SheetUlProps }) => {
                    this._dataId = data.item.sheetId;
                    const sheet = plugin.getContext().getWorkBook().getSheetBySheetId(this._dataId);
                    if (sheet) {
                        sheet.activate();
                    }
                },
                contextMenu: (e: MouseEvent) => {
                    const target = e.currentTarget as HTMLDivElement;
                    this._dataId = target.dataset.id as string;
                    this._barControl.contextMenu(e);
                },
                changeSheetName: (e: Event) => {
                    this._barControl.changeSheetName(e);
                },
                dragEnd: (elements: HTMLDivElement[]) => {
                    this._barControl.dragEnd(elements);
                },
            });
        });
        context.getContextObserver('onAfterChangeUILocaleObservable').add(() => {
            this._sheetUl = this.resetSheetUl(this._sheetUl);
            this._sheetBar.setValue({
                sheetUl: this._sheetUl,
            });
        });

        CommandManager.getActionObservers().add((actionEvent: any) => {
            const action = actionEvent.action as SheetActionBase<any>;
            const workbook = action.getWorkBook();
            const actionUnitId = workbook.getUnitId();
            if (unitId !== actionUnitId) return;

            const { data } = actionEvent;
            switch (data.actionName) {
                case ACTION_NAMES.SET_SHEET_ORDER_ACTION:
                case ACTION_NAMES.INSERT_SHEET_ACTION:
                case ACTION_NAMES.SET_TAB_COLOR_ACTION:
                case ACTION_NAMES.REMOVE_SHEET_ACTION:
                case ACTION_NAMES.SET_WORKSHEET_NAME_ACTION:
                case ACTION_NAMES.SET_WORKSHEET_ACTIVATE_ACTION:
                case ACTION_NAMES.SET_WORKSHEET_STATUS_ACTION: {
                    // update data;
                    this._initializeData();
                    // set ui bar sheetList;
                    this._sheetBar.setValue({
                        sheetList: this._sheetList,
                        menuList: this._menuList,
                    });
                    break;
                }
            }
        });
    }

    protected _initializeData() {
        const workbook = this._plugin.getWorkbook();
        const sheets = workbook.getSheets();
        this._menuList = sheets.map((sheet, index) => ({
            label: sheet.getName(),
            index: String(index),
            sheetId: sheet.getSheetId(),
            hidden: sheet.isSheetHidden(),
            selected: sheet.getStatus() === 1,
            onClick: (e: MouseEvent) => {
                const target = e.currentTarget as HTMLDivElement;
                this._dataId = target.dataset.id as string;
                sheet.showSheet();
                sheet.activate();
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
        this._dataId = sheets[this._sheetIndex].getSheetId();
    }

    constructor(plugin: Plugin) {
        this._plugin = plugin;
        this._sheetUl = [
            {
                locale: 'sheetConfig.delete',
                onClick: () => {
                    barControl.deleteSheet();
                },
            },
            {
                locale: 'sheetConfig.copy',
                onClick: () => {
                    barControl.copySheet();
                },
            },
            {
                locale: 'sheetConfig.rename',
                onClick: () => {
                    barControl.reNameSheet();
                },
            },
            {
                locale: 'sheetConfig.changeColor',
                border: true,
                className: styles.selectColorPickerParent,
                children: [
                    {
                        customLabel: {
                            name: pluginName + ColorPicker.name,
                            props: {
                                onClick: (color: string) => {
                                    barControl.setSheetColor(color);
                                },
                                lang: {
                                    collapseLocale: 'colorPicker.collapse',
                                    customColorLocale: 'colorPicker.customColor',
                                    confirmColorLocale: 'colorPicker.confirmColor',
                                    cancelColorLocale: 'colorPicker.cancelColor',
                                    changeLocale: 'colorPicker.change',
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
                    barControl.hideSheet();
                },
            },
            {
                locale: 'sheetConfig.unhide',
                onClick: () => {
                    barControl.unHideSheet();
                },
                border: true,
            },
            {
                locale: 'sheetConfig.moveLeft',
                onClick: () => {
                    barControl.moveSheet('left');
                },
            },
            {
                locale: 'sheetConfig.moveRight',
                onClick: () => {
                    barControl.moveSheet('right');
                },
            },
        ];
        this._initializeObs();
        this._initializeData();
    }

    resetLabel(label: string[] | string) {
        const locale = this._plugin.getContext().getLocale();

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

    getSheetBar(): SheetBar {
        return this._sheetBar;
    }

    getDataId(): string {
        return this._dataId;
    }

    getSheetList(): SheetUlProps[] {
        return this._sheetList;
    }

    getMenuList(): SheetUlProps[] {
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

    selectSheet() {

    }

    deleteSheet() {

    }

    sortMenu(index: number, hidden?: boolean, hideIndex?: number) {

    }

    copySheet() {

    }

    addSheet(position?: string, config?: SheetUlProps): void {
        this._sheetBar.setValue({ sheetList: this._sheetList, menuList: this._menuList }, () => {
            this._sheetBar.overGrid();
        });
    }

    reNameSheet() {
        this._sheetBar.reNameSheet(this._dataId);
    }

    hideSheet() {

    }

    unHideSheet() {
        this._sheetBar.ref.current.showSelect();
    }

    moveSheet(direct: string) {

    }

    changeSheetName(e: Event) {

    }

    contextMenu(e: MouseEvent) {
        this._sheetBar.contextMenu(e);
    }

    dragEnd(element: HTMLDivElement[]) {
        let list: SheetUlProps[] = [];
        Array.from(element).forEach((node: any) => {
            const item = this._sheetList.find((ele) => ele.sheetId === node.dataset.id);
            if (item) {
                list.push(item);
            }
        });
        this._sheetList = list;
        this._sheetBar.setValue({
            sheetList: list,
        });
    }
}