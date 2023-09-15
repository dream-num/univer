import { BaseComponentProps, ColorPicker, ComponentManager, IMenuItemFactory, IMenuService } from '@univerjs/base-ui';
import { BooleanNumber, Disposable, ICommandService, ICurrentUniverService, Nullable, ObserverManager, UIObserver } from '@univerjs/core';
import { Inject, Injector, SkipSelf } from '@wendellhu/redi';

import { SHEET_UI_PLUGIN_NAME } from '../Basics/Const';
import { RenameSheetCommand } from '../commands/rename.command';
import { ShowMenuListCommand } from '../commands/unhide.command';
import { SheetBar } from '../View/SheetBar';
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

        [ShowMenuListCommand, RenameSheetCommand].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    setUIObserve<T>(type: string, msg: UIObserver<T>) {
        this._observerManager.requiredObserver<UIObserver<T>>(type, 'core').notifyObservers(msg);
    }

    contextMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        this._sheetBar.contextMenu(e);
    }

    showMenuList(show: boolean) {
        this._sheetBar.showMenuList(show);
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
