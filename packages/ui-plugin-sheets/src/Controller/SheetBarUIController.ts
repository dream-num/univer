import {
    InsertSheetMutation,
    RemoveSheetMutation,
    SetTabColorMutation,
    SetWorksheetActivateCommand,
    SetWorksheetActivateMutation,
    SetWorksheetHideMutation,
    SetWorksheetNameCommand,
    SetWorksheetNameMutation,
    SetWorksheetOrderCommand,
    SetWorksheetOrderMutation,
    SetWorksheetShowCommand,
} from '@univerjs/base-sheets';
import { BaseComponentProps, ColorPicker, ComponentManager, IMenuItemFactory, IMenuService } from '@univerjs/base-ui';
import { BooleanNumber, Disposable, ICommandService, ICurrentUniverService, IKeyValue, IWorksheetConfig, Nullable, ObserverManager, UIObserver } from '@univerjs/core';
import { Inject, Injector, SkipSelf } from '@wendellhu/redi';

import { SHEET_UI_PLUGIN_NAME } from '../Basics/Const';
import { RenameSheetCommand } from '../commands/rename.command';
import { ShowMenuListCommand } from '../commands/unhide.command';
import { SheetBar } from '../View/SheetBar';
import { ISheetBarMenuItem } from '../View/SheetBar/SheetBarMenu';
import {
    ChangeColorSheetMenuItemFactory,
    CopySheetMenuItemFactory,
    DeleteSheetMenuItemFactory,
    HideSheetMenuItemFactory,
    RenameSheetMenuItemFactory,
    UnHideSheetMenuItemFactory,
} from './menu';

export interface BaseUlProps extends BaseComponentProps {
    label?: string | JSX.Element | string[];
    /**
     * 是否显示 选中图标
     */
    selected?: boolean;
    /**
     * 是否显示 隐藏图标
     */
    hidden?: BooleanNumber;
    icon?: JSX.Element | string | null | undefined;
    border?: boolean;
    children?: BaseUlProps[];
    onClick?: (...arg: any[]) => void;
    onKeyUp?: (...any: any[]) => void;
    onMouseDown?: (...any: any[]) => void;
    style?: React.CSSProperties;
    showSelect?: (e: MouseEvent) => void;
    getParent?: any;
    show?: boolean;
    className?: string;
    selectType?: string;
    name?: string;
    ref?: any;
    locale?: Array<string | object> | string;
    /**
     * 是否隐藏当前item
     */
    hideLi?: boolean;
}
export interface SheetUlProps extends BaseUlProps {
    index: string;
    color?: Nullable<string>;
    sheetId: string;
}

export class SheetBarUIController extends Disposable {
    protected _sheetBar: SheetBar;

    protected _dataId: string;

    protected _sheetIndex: number;

    protected _sheetList: SheetUlProps[];

    protected _menuList: ISheetBarMenuItem[];

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

        this._initializeContextMenu();

        this._componentManager.register(SHEET_UI_PLUGIN_NAME + ColorPicker.name, ColorPicker);

        this.disposeWithMe(
            this._commandService.onCommandExecuted((params) => {
                const { id } = params;
                let worksheetId;
                if (params.params) {
                    const mutationParams: IKeyValue = params.params;
                    worksheetId = mutationParams.worksheetId;
                }
                switch (id) {
                    case SetTabColorMutation.id:
                        this._refreshComponent();

                        break;
                    case SetWorksheetHideMutation.id:
                        this._refreshComponent();

                        this.setMenuListHide(worksheetId);

                        break;
                    case RemoveSheetMutation.id:
                        this._refreshComponent();

                        this.setMenuListDelete(worksheetId);

                        break;
                    case SetWorksheetNameMutation.id:
                        this._refreshComponent();

                        this.setMenuListLabel(worksheetId, (params?.params as IKeyValue).name);

                        break;
                    case InsertSheetMutation.id:
                        this._refreshComponent();

                        this.setMenuListInsert((params?.params as IKeyValue).index, (params?.params as IKeyValue).sheet, (params?.params as IKeyValue).workbookId);
                        // Usually after the insert sheet operation, the activation operation is triggered. If it is placed after activate mutation, it will affect double-click
                        this._sheetBar.setSlideTabActive((params?.params as IKeyValue).sheet.id);

                        break;
                    case SetWorksheetOrderMutation.id:
                        this._refreshComponent();

                        // 重新计算状态不就行了...  搞这么复杂...
                        this.setMenuListOrder();

                        break;
                    case SetWorksheetActivateMutation.id:
                        this.setMenuListSelect(worksheetId);

                        break;

                    default:
                        break;
                }
            })
        );

        this._componentManager.register(SHEET_UI_PLUGIN_NAME + ColorPicker.name, ColorPicker);

        [ShowMenuListCommand, RenameSheetCommand].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    getComponent = (ref: SheetBar) => {
        this._sheetBar = ref;

        // render sheet bar content when the component is rendered
        this._refreshComponent();
    };

    setUIObserve<T>(type: string, msg: UIObserver<T>) {
        this._observerManager.requiredObserver<UIObserver<T>>(type, 'core').notifyObservers(msg);
    }

    getSheetList(): SheetUlProps[] {
        return this._sheetList;
    }

    getMenuList(): ISheetBarMenuItem[] {
        return this._menuList;
    }

    selectSheet = (sheetIndex: number) => {
        const worksheetId = this._sheetList.find((sheet) => sheet.index === String(sheetIndex))?.sheetId;
        if (!worksheetId) return;
        this._commandService.executeCommand(SetWorksheetActivateCommand.id, { worksheetId });
    };

    changeSheetName = (worksheetId: string, name: string) => {
        this._commandService.executeCommand(SetWorksheetNameCommand.id, { name, worksheetId });
    };

    contextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
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

    showMenuList(show: boolean) {
        this._sheetBar.showMenuList(show);
    }

    setMenuListSelect(worksheetId: string) {
        (this._sheetBar?.ref?.current as IKeyValue).selectItem(worksheetId);
    }

    setMenuListHide(worksheetId: string) {
        (this._sheetBar?.ref?.current as IKeyValue).hideItem(worksheetId);
    }

    setMenuListDelete(worksheetId: string) {
        (this._sheetBar?.ref?.current as IKeyValue).deleteItem(worksheetId);
    }

    setMenuListLabel(worksheetId: string, label: string) {
        (this._sheetBar?.ref?.current as IKeyValue).setItemLabel(worksheetId, label);
    }

    setMenuListInsert(index: number, sheet: IWorksheetConfig, workbookId: string) {
        const item = {
            label: sheet.name,
            index: String(index),
            sheetId: sheet.id,
            hide: sheet.hidden === 1,
            selected: sheet.status === 1,
            onClick: (e?: MouseEvent) => {
                if (e) {
                    const target = e.currentTarget as HTMLDivElement;
                    this._dataId = target.dataset.id as string;
                    const worksheetId = sheet.id;
                    this._commandService.executeCommand(SetWorksheetShowCommand.id, {
                        workbookId,
                        worksheetId,
                    });
                    // update tab item
                    this._sheetBar.setSlideTabActive(worksheetId);
                }
            },
        };
        (this._sheetBar?.ref?.current as IKeyValue).insertItem(index, item);
    }

    setMenuListOrder() {
        (this._sheetBar?.ref?.current as IKeyValue).setItemOrder(this._menuList);
    }

    protected _refreshSheetBarUI(): void {
        this._sheetBar.setValue({
            sheetList: this._sheetList,
            menuList: this._menuList,
        });
    }

    protected _refreshComponent(): void {
        this._refreshSheetBarUI();
    }

    private _initializeContextMenu() {
        (
            [
                DeleteSheetMenuItemFactory,
                CopySheetMenuItemFactory,
                RenameSheetMenuItemFactory,
                ChangeColorSheetMenuItemFactory,
                HideSheetMenuItemFactory,
                UnHideSheetMenuItemFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
