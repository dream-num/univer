import { BaseUlProps } from '@univer/base-component';
import { ACTION_NAMES, CommandManager, NameGen, Nullable, PLUGIN_NAMES } from '@univer/core';
import { SheetBarModel } from '../Model/Domain/SheetBarModel';
import { SheetBar } from '../View/UI/SheetBar';
import { SpreadsheetPlugin } from '../SpreadsheetPlugin';

interface SheetUlProps extends BaseUlProps {
    index: string;
    color?: Nullable<string>;
    sheetId: string;
}

class SheetBarUIController {
    private _barControl: SheetBarControl;

    private _sheetIndex: number;

    private _dataId: string;

    private _sheetBar: SheetBar;

    private _sheetList: SheetUlProps[];

    private _sheetUl: BaseUlProps[];

    private _menuList: SheetUlProps[];

    /**
     * SheetBarUIController init
     * @param barControl
     */
    constructor(barControl: SheetBarControl) {
        this._barControl = barControl;
        this._sheetUl = [
            {
                locale: 'sheetConfig.delete',
                onClick: () => barControl.deleteSheet(),
            },
            {
                locale: 'sheetConfig.copy',
                onClick: () => barControl.copySheet(),
            },
            {
                locale: 'sheetConfig.rename',
                onClick: () => barControl.reNameSheet(),
            },
            {
                locale: 'sheetConfig.changeColor',
                icon: 'RightIcon',
                children: [
                    {
                        selectType: 'jsx',
                        label: 'ColorPicker',
                        onClick: (color: string) => {
                            barControl.setSheetColor(color);
                        },
                    },
                ],
            },
            {
                locale: 'sheetConfig.hide',
                border: true,
                onClick: () => barControl.hideSheet(),
            },
            {
                locale: 'sheetConfig.unhide',
                onClick: () => barControl.unHideSheet(),
            },
            {
                locale: 'sheetConfig.moveLeft',
                border: true,
                onClick: () => barControl.moveSheet('left'),
            },
            {
                locale: 'sheetConfig.moveRight',
                onClick: () => barControl.moveSheet('right'),
            },
        ];
        this.initializeData();
        this.initializeObserver();
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
    initializeObserver() {
        const plugin = this._barControl.getPlugin();
        const context = plugin.getContext();
        const manager = context.getObserverManager();
        // manager.requiredObserver<SheetBar>('onSheetBarDidMountObservable', PLUGIN_NAMES.SPREADSHEET);
        manager.requiredObserver<SheetBar>('onSheetBarDidMountObservable', PLUGIN_NAMES.SPREADSHEET).add((component) => {
            this._sheetBar = component;
            this.resetSheetUl();
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
                        plugin.getCanvasView().updateToSheet(sheet);
                        // plugin.getMainComponent().makeDirty(true);
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
            this.resetSheetUl();
            this._sheetBar.setValue({
                sheetUl: this._sheetUl,
            });
        });
        // context.getContextObserver('onAfterInsertSheetObservable').add(() => {
        //     // update data
        //     this.initializeData();
        //     this._sheetBar.setValue({
        //         sheetList: this._sheetList,
        //         menuList: this._menuList,
        //     });
        // });
        // context.getContextObserver('onSheetTabColorChangeObservable').add(() => {
        //     // update data
        //     this.initializeData();
        //     this._sheetBar.setValue({
        //         sheetList: this._sheetList,
        //         menuList: this._menuList,
        //     });
        // });
        // context.getContextObserver('onAfterRemoveSheetObservable').add((event) => {
        //     const activeSheet = plugin.getContext().getWorkBook().getActiveSheet();
        //     if (activeSheet) {
        //         // update data;
        //         this.initializeData();
        //         // set ui bar sheetList;
        //         this._sheetBar.setValue({
        //             sheetList: this._sheetList,
        //             menuList: this._menuList,
        //         });
        //         // update canvas
        //         plugin.getCanvasView().updateToSheet(activeSheet);
        //         plugin.getMainComponent().makeDirty(true);
        //     }
        // });
        // context.getContextObserver('onAfterChangeSheetNameObservable').add(() => {
        //     // update data;
        //     this.initializeData();
        //     // set ui bar sheetList;
        //     this._sheetBar.setValue({
        //         sheetList: this._sheetList,
        //         menuList: this._menuList,
        //     });
        // });
        // context.getContextObserver('onAfterChangeActiveSheetObservable').add(() => {
        //     // update data;
        //     this.initializeData();
        //     // set ui bar sheetList;
        //     this._sheetBar.setValue({
        //         sheetList: this._sheetList,
        //         menuList: this._menuList,
        //     });
        // });
        // context.getContextObserver('onShowSheetObservable').add(() => {
        //     // update data;
        //     this.initializeData();
        //     // set ui bar sheetList;
        //     this._sheetBar.setValue({
        //         sheetList: this._sheetList,
        //         menuList: this._menuList,
        //     });
        // });
        // context.getContextObserver('onSheetOrderObservable').add(() => {
        //     // update data;
        //     this.initializeData();
        //     // set ui bar sheetList;
        //     this._sheetBar.setValue({
        //         sheetList: this._sheetList,
        //         menuList: this._menuList,
        //     });
        // });
        // context.getContextObserver('onHideSheetObservable').add(() => {
        //     // update data;
        //     this.initializeData();
        //     // set ui bar sheetList;
        //     this._sheetBar.setValue({
        //         sheetList: this._sheetList,
        //         menuList: this._menuList,
        //     });
        // });

        CommandManager.getActionObservers().add((actionEvent) => {
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
                    this.initializeData();
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

    initializeData() {
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
                plugin.getCanvasView().updateToSheet(plugin.getContext().getWorkBook().getActiveSheet()!);
                // plugin.getMainComponent().makeDirty(true);
            },
        }));
        this._sheetList = sheets
            .filter((sheet) => !sheet.isSheetHidden())
            .map((sheet, index) => ({
                sheetId: sheet.getSheetId(),
                label: sheet.getName(),
                icon: 'NextIcon',
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
                    // 清空选区
                    const controls = plugin.getSelectionManager().getCurrentControls();
                    for (let control of controls!) {
                        control.dispose();
                    }
                    plugin.getCanvasView().updateToSheet(plugin.getContext().getWorkBook().getActiveSheet()!);
                    // plugin.getMainComponent().makeDirty(true);
                },
            }));
        this._sheetIndex = sheets.findIndex((sheet) => sheet.getStatus() === 1);
        this._dataId = sheets[this._sheetIndex].getSheetId();
    }

    /**
     * reset sheet ui
     */
    resetSheetUl() {
        const locale = this._barControl.getPlugin().context.getLocale();
        this._sheetUl.forEach((item: BaseUlProps) => {
            item.label = locale.get(item.locale as string);
        });
    }

    /**
     * 选中sheet
     * @param args
     */
    selectSheet(...args: any[]) {
        // const index = args[1].index;
        // this._menuList.forEach((item) => {
        //     item.selected = false;
        // });
        // this._menuList[index].selected = true;
        // this._menuList[index].hidden = false;
        // this._sheetList.forEach((item) => {
        //     item.selected = false;
        //     if (item.index === this._menuList[index].index) {
        //         item.hideLi = false;
        //         item.selected = true;
        //     }
        // });
        // this._sheetBar.setValue({ sheetList: this._sheetList, menuList: this._menuList });
    }

    /**
     * 删除sheet
     */
    deleteSheet() {
        // const index = this._sheetList.findIndex((item) => item.index === this._dataId);
        //
        // let length = 0;
        // this._menuList.forEach((item) => {
        //     if (!item.hidden) {
        //         length++;
        //     }
        // });
        // if (length === 1) {
        //     alert('至少需要一个sheet');
        //     return;
        // }
        //
        // let selectIndex: number = 0;
        // let flag = false;
        // for (let i = index; i < this._menuList.length; i++) {
        //     if (!this._menuList[i].hidden) {
        //         selectIndex = i;
        //         flag = true;
        //         break;
        //     }
        // }
        // if (!flag) {
        //     for (let i = index - 1; i > -1; i--) {
        //         if (!this._menuList[i].hidden) {
        //             selectIndex = i;
        //             break;
        //         }
        //     }
        // }
        //
        // this._sheetList[selectIndex].selected = true;
        // this._sheetList.splice(index, 1);
        //
        // this._sheetBar.setValue(
        //     {
        //         sheetList: this._sheetList,
        //     },
        //     () => this.sortMenu(selectIndex)
        // );
    }

    /**
     * 排序menu list
     * @param index
     * @param hidden
     * @param hideIndex
     */
    sortMenu(index: number, hidden?: boolean, hideIndex?: number) {
        // const menu: SheetUlProps[] = [];
        // this._sheetList.forEach((item) => {
        //     this._menuList.forEach((ele) => {
        //         if (item.index === ele.index) {
        //             ele.selected = false;
        //             ele.label = item.label;
        //             menu.push(ele);
        //         }
        //     });
        // });
        // if (hidden && hideIndex) {
        //     menu[hideIndex].hidden = true;
        // }
        // menu[index].selected = true;
        // this._sheetBar.setValue({
        //     menuList: this._menuList,
        // });
    }

    /**
     * 复制sheet
     */
    copySheet() {
        // const index = this._sheetList.findIndex((item) => item.index === this._dataId);
        // this.addSheet(`${index + 1}`, {
        //     label: `${this._sheetList[index].label}副本`,
        //     index: `${this._sheetIndex}`,
        // });
    }

    /**
     * 增加sheet
     * @param position
     * @param config
     */
    addSheet(position?: string, config?: SheetUlProps): void {
        // this._menuList.forEach((item) => {
        //     item.selected = false;
        // });
        // if (position) {
        //     if (config) {
        //         this._sheetList.splice(+position, 0, { ...config, icon: 'NextIcon' });
        //         this._menuList.splice(+position, 0, { ...config, selected: true });
        //     } else {
        //         this._sheetList.splice(+position, 0, {
        //             label: `sheet${this._sheetIndex}`,
        //             icon: 'NextIcon',
        //             index: `${this._sheetIndex}`,
        //         });
        //         this._menuList.splice(+position, 0, {
        //             label: `sheet${this._sheetIndex}`,
        //             selected: true,
        //             index: `${this._sheetIndex}`,
        //         });
        //     }
        // } else {
        //     this._sheetList.push({
        //         label: `sheet${this._sheetIndex}`,
        //         icon: 'NextIcon',
        //         index: `${this._sheetIndex}`,
        //     });
        //     this._menuList.push({
        //         label: `sheet${this._sheetIndex}`,
        //         selected: true,
        //         index: `${this._sheetIndex}`,
        //     });
        // }
        //
        // this._sheetIndex++;
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
    hideSheet() {
        // const index = this._sheetList.findIndex((item) => item.index === this._dataId);
        // let length = 0;
        // this._menuList.forEach((item) => {
        //     if (!item.hidden) {
        //         length++;
        //     }
        // });
        // if (length === 1) {
        //     alert('至少需要一个sheet');
        //     return;
        // }
        // let selectIndex: number = 0;
        // let flag = false;
        // for (let i = index + 1; i < this._menuList.length; i++) {
        //     if (!this._menuList[i].hidden) {
        //         selectIndex = i;
        //         flag = true;
        //         break;
        //     }
        // }
        // if (!flag) {
        //     for (let i = index - 1; i > -1; i--) {
        //         if (!this._menuList[i].hidden) {
        //             selectIndex = i;
        //             break;
        //         }
        //     }
        // }
        // this._sheetList[index].hideLi = true;
        // this._sheetList[selectIndex].selected = true;
        // this._sheetBar.setValue(
        //     {
        //         sheetList: this._sheetList,
        //     },
        //     () => this.sortMenu(selectIndex, true, index)
        // );
    }

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
    moveSheet(direct: string) {
        // const index = this._sheetList.findIndex((item) => item.index === this._dataId);
        // if (direct === 'left') {
        //     if (!index) return;
        //     const item = this._sheetList.splice(index - 1, 1)[0];
        //     this._sheetList.splice(index, 0, item);
        // } else {
        //     if (index === this._sheetList.length - 1) return;
        //     const item = this._sheetList.splice(index, 1)[0];
        //     this._sheetList.splice(index + 1, 0, item);
        // }
        // this._sheetBar.setValue(
        //     {
        //         sheetList: this._sheetList,
        //     },
        //     () => this.sortMenu(index)
        // );
    }

    /**
     * 重命名sheet
     * @param e
     */
    changeSheetName(e: Event) {
        // const target = e.target as HTMLDivElement;
        // const index = this._sheetList.findIndex((item) => item.index === this._dataId);
        // this._sheetList[index].label = target.innerText;
        //
        // this._sheetBar.setValue(
        //     {
        //         sheetList: this._sheetList,
        //     },
        //     () => this.sortMenu(index)
        // );
    }

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

    private _plugin: SpreadsheetPlugin;

    constructor(plugin: SpreadsheetPlugin) {
        this._plugin = plugin;
        this._apiController = new SheetBarAPIControl(this);
        this._uiController = new SheetBarUIController(this);
    }

    /**
     * 获取插件
     */
    getPlugin(): SpreadsheetPlugin {
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
