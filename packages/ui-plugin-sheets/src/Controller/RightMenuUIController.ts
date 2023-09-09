import { IMouseEvent, IPointerEvent } from '@univerjs/base-render';
import { CanvasView } from '@univerjs/base-sheets';
import { BaseMenuItem, ComponentManager, ICustomLabelType, IMenuItemFactory, IMenuService, MenuPosition } from '@univerjs/base-ui';
import { Disposable } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import { ComponentChildren } from 'react';

import { SheetRightMenuConfig } from '../Basics';
import { RightMenu, RightMenuInput, RightMenuItem } from '../View';
import {
    ClearSelectionMenuItemFactory,
    DeleteRangeMenuItemFactory,
    DeleteRangeMoveLeftMenuItemFactory,
    DeleteRangeMoveUpMenuItemFactory,
    InsertColMenuItemFactory,
    InsertRowMenuItemFactory,
    RemoveColMenuItemFactory,
    RemoveRowMenuItemFactory,
    SetColWidthMenuItemFactory,
    SetRowHeightMenuItemFactory,
} from './menu';

export interface RightMenuProps extends BaseMenuItem {
    label?: string | ICustomLabelType | ComponentChildren;
    children?: RightMenuProps[];
    suffix?: string;
    border?: boolean;
}

export class RightMenuUIController extends Disposable {
    private _rightMenu: RightMenu;

    // eslint-disable-next-line max-lines-per-function
    constructor(
        _config: SheetRightMenuConfig | undefined,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(CanvasView) private readonly _sheetCanvasView: CanvasView,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IMenuService private readonly _menuService: IMenuService
    ) {
        super();

        this._initialize();
    }

    // 获取RightMenu组件
    getComponent = (ref: RightMenu) => {
        this._rightMenu = ref;
        this.setMenuList();
    };

    // 刷新
    setMenuList() {
        this._rightMenu?.setMenuListNeo(this._menuService.getMenuItems(MenuPosition.CONTEXT_MENU));
    }

    private _initialize() {
        const componentManager = this._componentManager;
        componentManager.register(RightMenuInput.name, RightMenuInput);
        componentManager.register(RightMenuItem.name, RightMenuItem);

        this._sheetCanvasView
            .getSheetView()
            .getSpreadsheet()
            .onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
                if (evt.button === 2) {
                    evt.preventDefault();
                    this._rightMenu.handleContextMenu(evt);
                }
            });

        (
            [
                ClearSelectionMenuItemFactory,
                InsertRowMenuItemFactory,
                InsertColMenuItemFactory,
                RemoveRowMenuItemFactory,
                RemoveColMenuItemFactory,
                SetRowHeightMenuItemFactory,
                SetColWidthMenuItemFactory,
                DeleteRangeMenuItemFactory,
                DeleteRangeMoveLeftMenuItemFactory,
                DeleteRangeMoveUpMenuItemFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
