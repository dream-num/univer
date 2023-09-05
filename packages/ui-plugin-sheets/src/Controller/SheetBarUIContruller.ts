import { BaseMenuItem, BaseUlProps, ColorPicker, ComponentManager, ICustomComponent, IMenuService, MenuPosition } from '@univerjs/base-ui';
import {
    Nullable,
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
    ICurrentUniverService,
    ObserverManager,
    Disposable,
    ICommandService,
} from '@univerjs/core';
import { InsertSheetMutation, RemoveSheetMutation, SetWorksheetActivateCommand, SetWorksheetOrderCommand } from '@univerjs/base-sheets';
import { Inject, Injector, SkipSelf } from '@wendellhu/redi';
import { SheetBar } from '../View/SheetBar';
import styles from '../View/SheetBar/index.module.less';
import { SheetBarMenuItem } from '../View/SheetBar/SheetBarMenu';
import { SHEET_UI_PLUGIN_NAME } from '../Basics/Const';
import { ChangeColorSheetMenuItemFactory, CopySheetMenuItemFactory, DeleteSheetMenuItemFactory, HideSheetMenuItemFactory, RenameSheetMenuItemFactory, UnHideSheetMenuItemFactory } from './menu';

interface SheetUl extends BaseMenuItem {
    label?: ICustomComponent | string;
    children?: SheetUl[];
}

export interface SheetUlProps extends BaseUlProps {
    index: string;
    color?: Nullable<string>;
    sheetId: string;
}

export class SheetBarUIController extends Disposable {
    protected _sheetBar: SheetBar;

    protected _sheetUl: SheetUl[];

    protected _dataId: string;

    protected _sheetIndex: number;

    protected _sheetList: SheetUlProps[];

    protected _menuList: SheetBarMenuItem[];

    // eslint-disable-next-line max-lines-per-function
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @SkipSelf() @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuService private readonly _menuService: IMenuService
    ) {
        super();
        const that = this;
        this._sheetUl = [
            {
                label: 'sheetConfig.delete',
                onClick: () => {
                    that.setUIObserve('onUIChangeObservable', { name: 'deleteSheet', value: this._dataId });
                },
            },
            {
                label: 'sheetConfig.copy',
                onClick: () => {
                    that.setUIObserve('onUIChangeObservable', { name: 'copySheet' });
                },
            },
            {
                label: 'sheetConfig.rename',
                onClick: () => {
                    this._sheetBar.reNameSheet(this._dataId);
                },
            },
            {
                label: 'sheetConfig.changeColor',
                border: true,
                className: styles.selectColorPickerParent,
                children: [
                    {
                        label: {
                            name: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
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
                label: 'sheetConfig.hide',
                onClick: () => {
                    that.setUIObserve('onUIChangeObservable', { name: 'hideSheet', value: this._dataId });
                },
            },
            {
                label: 'sheetConfig.unhide',
                onClick: () => {
                    this._sheetBar.ref.current.showMenu(true);
                    that.setUIObserve('onUIChangeObservable', { name: 'unHideSheet', value: this._dataId });
                },
            },
        ];

        this._initializeContextMenu();

        this._componentManager.register(SHEET_UI_PLUGIN_NAME + ColorPicker.name, ColorPicker);

        this.disposeWithMe(
            this._commandService.onCommandExecuted((params) => {
                const { id } = params;
                switch (id) {
                    case InsertSheetMutation.id:
                    case RemoveSheetMutation.id:
                        // update data;
                        this._refreshSheetData();
                        // set ui bar sheetList;
                        this._refreshSheetBarUI();

                        break;

                    default:
                        break;
                }
            })
        );

        CommandManager.getActionObservers().add((event) => {
            const action = event.action as SheetActionBase<any>;
            const data = event.data;

            // TODO Do not use try catch

            try {
                action.getWorkBook();
            } catch (error) {
                return;
            }

            const workbook = action.getWorkBook();
            const unitId = workbook.getUnitId();
            const currentWorkbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
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

        this._componentManager.register(SHEET_UI_PLUGIN_NAME + ColorPicker.name, ColorPicker);
    }

    getComponent = (ref: SheetBar) => {
        this._sheetBar = ref;
        this._refreshComponent();
    };

    setUIObserve<T>(type: string, msg: UIObserver<T>) {
        this._observerManager.requiredObserver<UIObserver<T>>(type, 'core').notifyObservers(msg);
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
        const list: SheetUlProps[] = [];
        const sheetId = this._dataId;
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        Array.from(element).forEach((node: any) => {
            const item = this._sheetList.find((ele) => ele.sheetId === node.dataset.id);
            if (item) {
                list.push(item);
            }
        });
        list.forEach((ele, index) => {
            if (ele.sheetId === sheetId) {
                this._commandService.executeCommand(SetWorksheetOrderCommand.id, {
                    workbookId: workbook.getUnitId(),
                    worksheetId: ele.sheetId,
                    order: index,
                });
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
                const currentWorkbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
                const sheet = currentWorkbook.getSheetBySheetId(this._dataId);
                if (sheet) {
                    // sheet.activate();
                    this._commandService.executeCommand(SetWorksheetActivateCommand.id, {
                        workbookId: currentWorkbook.getUnitId(),
                        worksheetId: sheet.getSheetId(),
                    });
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

        // this._sheetBar.setSheetUlNeo(this._menuService.getMenuItems(MenuPosition.SHEET_BAR));
    }

    protected _refreshSheetData(): void {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
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
                    // sheet.activate();
                    this._commandService.executeCommand(SetWorksheetActivateCommand.id, {
                        workbookId: workbook.getUnitId(),
                        worksheetId: sheet.getSheetId(),
                    });
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
                    // sheet.activate();
                    this._commandService.executeCommand(SetWorksheetActivateCommand.id, {
                        workbookId: workbook.getUnitId(),
                        worksheetId: sheet.getSheetId(),
                    });
                },
            }));
        this._sheetIndex = sheets.findIndex((sheet) => sheet.getStatus() === 1);
        if (this._sheetIndex > -1) {
            this._dataId = sheets[this._sheetIndex].getSheetId();
        }
    }

    protected _refreshComponent(): void {
        this._refreshSheetData();
        this._refreshSheetBarUI();
    }

    private _initializeContextMenu() {
        [
            DeleteSheetMenuItemFactory,
            CopySheetMenuItemFactory,
            RenameSheetMenuItemFactory,
            ChangeColorSheetMenuItemFactory,
            HideSheetMenuItemFactory,
            UnHideSheetMenuItemFactory,
        ].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
