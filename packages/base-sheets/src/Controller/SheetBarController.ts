import { BaseMenuItem, BaseUlProps } from '@univerjs/base-component';
import { ACTION_NAMES, CommandManager, NameGen, Nullable, PLUGIN_NAMES, SheetActionBase } from '@univerjs/core';
import { ColorPicker } from '@univerjs/style-univer';
import { SheetBarModel } from '../Model/SheetBarModel';
import { SheetBar } from '../View/UI/SheetBar';
import { SheetPlugin } from '../SheetPlugin';
import styles from '../View/UI/SheetBar/index.module.less';

interface CustomComponent {
    name: string;
    props?: Record<string, any>;
}

interface SheetUlProps extends BaseUlProps {
    index: string;
    color?: Nullable<string>;
    sheetId: string;
}

interface SheetUl extends BaseMenuItem {
    locale?: string;
    customLabel?: CustomComponent;
    children?: SheetUl[];
}

class SheetBarUIController {
    private _barControl: SheetBarControl;

    private _sheetIndex: number;

    private _dataId: string;

    private _sheetBar: SheetBar;

    private _sheetList: SheetUlProps[];

    private _sheetUl: SheetUl[];

    private _menuList: SheetUlProps[];

    /**
     * SheetBarUIController init
     * @param barControl
     */
    constructor(barControl: SheetBarControl) {
        this._barControl = barControl;
        const pluginName = barControl.getPlugin().getPluginName();

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
        this._initializeData();
        this._initializeObserver();
    }

    resetLabel(label: string[] | string) {
        const locale = this._barControl.getPlugin().getContext().getLocale();

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

    /**
     * 获取菜单列表
     */
    getMenuList(): SheetUlProps[] {
        return this._menuList;
    }

    getSheetList(): SheetUlProps[] {
        return this._sheetList;
    }

    getSheetBar(): SheetBar {
        return this._sheetBar;
    }

    /**
     * 获取焦点的TabItem
     */
    getDataId(): string {
        return this._dataId;
    }

    /**
     * 初始化sheet ui
     */
    private _initializeObserver() {
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

        CommandManager.getActionObservers().add((actionEvent) => {
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

    private _initializeData() {
        const plugin = this._barControl.getPlugin();
        const workbook = plugin.getWorkbook();
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

    /**
     * 选中sheet
     * @param args
     */
    selectSheet() {}

    /**
     * 删除sheet
     */
    deleteSheet() {}

    /**
     * 排序menu list
     * @param index
     * @param hidden
     * @param hideIndex
     */
    sortMenu(index: number, hidden?: boolean, hideIndex?: number) {}

    /**
     * 复制sheet
     */
    copySheet() {}

    /**
     * 增加sheet
     * @param position
     * @param config
     */
    addSheet(position?: string, config?: SheetUlProps): void {
        this._sheetBar.setValue({ sheetList: this._sheetList, menuList: this._menuList }, () => {
            this._sheetBar.overGrid();
        });
    }

    /**
     * 可以更改sheet名
     */
    reNameSheet() {
        this._sheetBar.reNameSheet(this._dataId);
    }

    /**
     * 隐藏sheet
     */
    hideSheet() {}

    /**
     * 取消隐藏sheet
     */
    unHideSheet() {
        this._sheetBar.ref.current.showSelect();
    }

    /**
     * 向左向右移动sheet
     * @param direct
     */
    moveSheet(direct: string) {}

    /**
     * 重命名sheet
     * @param e
     */
    changeSheetName(e: Event) {}

    /**
     * 右击显示菜单
     * @param e
     */
    contextMenu(e: MouseEvent) {
        this._sheetBar.contextMenu(e);
    }

    /**
     * 移动tab后修改数据
     * @param element
     */
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

class SheetBarAPIControl {
    private _barControl: SheetBarControl;

    constructor(barControl: SheetBarControl) {
        this._barControl = barControl;
    }

    /**
     * 删除sheet
     */
    deleteSheet(): void {
        const plugin = this._barControl.getPlugin();
        const workbook = plugin.getWorkbook();
        if (workbook) {
            workbook.removeSheetBySheetId(this._barControl.getUIController().getDataId());
        }
    }

    /**
     * 复制sheet
     */
    copySheet(): void {
        const workbook = this._barControl.getPlugin().getWorkbook();
        const activeSheet = workbook.getActiveSheet();
        const copySheet = activeSheet.copy(NameGen.getSheetName());
        if (workbook) {
            workbook.insertSheet(workbook.getActiveSheetIndex() + 1, copySheet.getConfig());
        }
    }

    /**
     * 修改sheet颜色
     * @param color
     */
    setSheetColor(color: string): void {
        const plugin = this._barControl.getPlugin();
        const workbook = plugin.getWorkbook();
        const worksheet = workbook.getSheetBySheetId(this._barControl.getUIController().getDataId());
        if (worksheet) {
            worksheet.setTabColor(color);
        }
    }

    /**
     * 设置sheet名称
     */
    changeSheetName(event: Event): void {
        const menuList = this._barControl.getUIController().getMenuList();
        const menu = menuList.find((menu) => menu.sheetId === this._barControl.getUIController().getDataId());
        const plugin = this._barControl.getPlugin();
        const context = plugin.getContext();
        const workbook = context.getWorkBook();
        if (menu) {
            const worksheet = workbook.getSheetBySheetId(menu.sheetId);
            const workName = (event.target as HTMLElement).innerText;
            if (worksheet && workName !== worksheet.getName()) {
                worksheet.setName(workName);
            }
        }
    }

    /**
     * 添加 sheet
     */
    addSheet(): void {
        const plugin = this._barControl.getPlugin();
        const context = plugin.getContext();
        const workbook = context.getWorkBook();
        workbook.insertSheet();

        const size = workbook.getSheetSize();
        const sheets = workbook.getSheets();
        const lastSheet = sheets[size - 1];
        if (lastSheet) {
            lastSheet.activate();
        }
    }

    /**
     * 移动sheet
     */
    moveSheet(dir: string): void {
        const plugin = this._barControl.getPlugin();
        const context = plugin.getContext();
        const workbook = context.getWorkBook();
        switch (dir) {
            case 'left': {
                const index = workbook.getActiveSheetIndex();
                const sheet = workbook.getActiveSheet();
                this._barControl
                    .getPlugin()
                    .getContext()
                    .getWorkBook()
                    .setSheetOrder(sheet.getSheetId(), Math.max(index - 1, 0));
                break;
            }
            case 'right': {
                const index = workbook.getActiveSheetIndex();
                const total = workbook.getSheetSize();
                const sheet = workbook.getActiveSheet();
                this._barControl
                    .getPlugin()
                    .getContext()
                    .getWorkBook()
                    .setSheetOrder(sheet.getSheetId(), Math.min(index + 1, total));
                break;
            }
        }
    }

    /**
     * 拖动sheet
     * @param element
     */
    dragEnd(element: HTMLDivElement[]) {
        let list: SheetUlProps[] = [];
        let sheetId = this._barControl.getUIController().getDataId();
        Array.from(element).forEach((node: any) => {
            const item = this._barControl
                .getUIController()
                .getSheetList()
                .find((ele) => ele.sheetId === node.dataset.id);
            if (item) {
                list.push(item);
            }
        });
        console.log(sheetId);
        list.forEach((ele, index) => {
            if (ele.sheetId === sheetId) {
                this._barControl.getPlugin().getContext().getWorkBook().setSheetOrder(ele.sheetId, index);
            }
        });
        console.log(element);
    }

    /**
     * 隐藏sheet
     */
    hideSheet(): void {
        const plugin = this._barControl.getPlugin();
        const workbook = plugin.getWorkbook();
        const worksheet = workbook.getSheetBySheetId(this._barControl.getUIController().getDataId());
        if (worksheet) {
            worksheet.hideSheet();
        }
    }
}

export class SheetBarControl {
    private _sheetBarModel: SheetBarModel;

    private _uiController: SheetBarUIController;

    private _apiController: SheetBarAPIControl;

    private _plugin: SheetPlugin;

    constructor(plugin: SheetPlugin) {
        this._plugin = plugin;
        this._apiController = new SheetBarAPIControl(this);
        this._uiController = new SheetBarUIController(this);
    }

    /**
     * 获取插件
     */
    getPlugin(): SheetPlugin {
        return this._plugin;
    }

    /**
     * 获取UI控制
     */
    getUIController(): SheetBarUIController {
        return this._uiController;
    }

    /**
     * 获取API控制
     */
    getAPIController(): SheetBarAPIControl {
        return this._apiController;
    }

    /**
     * 选中sheet
     * @param args
     */
    selectSheet(...args: any[]): void {
        // this._uiController.selectSheet(...args);
    }

    /**
     * 隐藏sheet
     */
    hideSheet(): void {
        this._apiController.hideSheet();
    }

    /**
     * 取消隐藏
     */
    unHideSheet(): void {
        this._uiController.unHideSheet();
    }

    /**
     * 增加sheet
     * @param position
     * @param config
     */
    addSheet(position?: string, config?: SheetUlProps): void {
        this._apiController.addSheet();
        this._uiController.addSheet(position, config);
        this._uiController.getSheetBar().slideTabBar.getScrollbar().scrollRight();
    }

    /**
     * 删除sheet
     */
    deleteSheet(): void {
        this._apiController.deleteSheet();
        this._uiController.deleteSheet();
    }

    /**
     * 向左向右移动sheet
     * @param direct
     */
    moveSheet(direct: string): void {
        this._apiController.moveSheet(direct);
    }

    /**
     * 复制sheet
     */
    copySheet(): void {
        this._apiController.copySheet();
    }

    /**
     * 可以更改sheet名
     */
    reNameSheet(): void {
        this._uiController.reNameSheet();
    }

    /**
     * 重命名sheet
     * @param e
     */
    changeSheetName(e: Event): void {
        this._apiController.changeSheetName(e);
        this._uiController.changeSheetName(e);
    }

    /**
     * Set Sheet Color
     * @param color
     */
    setSheetColor(color: string): void {
        this._apiController.setSheetColor(color);
    }

    /**
     * 上下文菜单
     * @param e
     */
    contextMenu(e: MouseEvent): void {
        this._uiController.contextMenu(e);
    }

    /**
     * 拖拽结束
     * @param element
     */
    dragEnd(element: HTMLDivElement[]): void {
        this._apiController.dragEnd(element);
        this._uiController.dragEnd(element);
    }
}
