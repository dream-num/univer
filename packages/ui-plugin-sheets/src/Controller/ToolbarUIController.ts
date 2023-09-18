import { BaseSelectChildrenProps, BaseSelectProps, ColorPicker, ComponentManager, IMenuService, MenuPosition } from '@univerjs/base-ui';
import { IMenuItemFactory } from '@univerjs/base-ui/src/services/menu/menu';
import { Disposable } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import React from 'react';

import { SHEET_UI_PLUGIN_NAME, SheetToolbarConfig } from '../Basics';
import { ColorSelect, LineBold, LineColor, Toolbar } from '../View';
import {
    BackgroundColorSelectorMenuItemFactory,
    BoldMenuItemFactory,
    FontFamilySelectorMenuItemFactory,
    FontSizeSelectorMenuItemFactory,
    HorizontalAlignMenuItemFactory,
    ItalicMenuItemFactory,
    RedoMenuItemFactory,
    ResetBackgroundColorMenuItemFactory,
    ResetTextColorMenuItemFactory,
    SetBorderColorMenuItemFactory,
    SetBorderStyleMenuItemFactory,
    StrikeThroughMenuItemFactory,
    TextColorSelectorMenuItemFactory,
    TextRotateMenuItemFactory,
    UnderlineMenuItemFactory,
    UndoMenuItemFactory,
    VerticalAlignMenuItemFactory,
    WrapTextMenuItemFactory,
} from './menu';
import { CellBorderSelectorMenuItemFactory } from './menu/border.menu';
import {
    CellMergeAllMenuItemFactory,
    CellMergeCancelMenuItemFactory,
    CellMergeHorizontalMenuItemFactory,
    CellMergeMenuItemFactory,
    CellMergeVerticalMenuItemFactory,
} from './menu/merge.menu';

export interface BaseToolbarSelectProps extends BaseSelectProps {
    children?: BaseSelectChildrenProps[];
}

enum ToolbarType {
    SELECT,
    BUTTON,
}

export interface IToolbarItemProps extends BaseToolbarSelectProps {
    active?: boolean;
    unActive?: boolean; //button不需保持状态
    show?: boolean; //是否显示按钮
    toolbarType?: ToolbarType;
    tooltip?: string; //tooltip文字
    border?: boolean;
    suffix?: React.ReactNode;
}

export class ToolbarUIController extends Disposable {
    private _toolbar: Toolbar;

    constructor(
        _config: SheetToolbarConfig | undefined,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IMenuService private readonly _menuService: IMenuService
    ) {
        super();

        this._initialize();
        this._initializeToolbar();
    }

    // 获取Toolbar组件
    getComponent = (ref: Toolbar) => {
        this._toolbar = ref;

        this._initializeToolbar();
        this.setToolbar();
    };

    setToolbar() {
        this._toolbar?.setToolbarNeo(this._menuService.getMenuItems(MenuPosition.TOOLBAR));
    }

    private _initialize() {
        const componentManager = this._componentManager;
        componentManager.register(SHEET_UI_PLUGIN_NAME + ColorSelect.name, ColorSelect);
        componentManager.register(SHEET_UI_PLUGIN_NAME + ColorPicker.name, ColorPicker);
        componentManager.register(SHEET_UI_PLUGIN_NAME + LineColor.name, LineColor);
        componentManager.register(SHEET_UI_PLUGIN_NAME + LineBold.name, LineBold);
    }

    private _initializeToolbar(): void {
        // TODO: @wzhudev: now we register menu items that only display in the toolbar here. In fact we should register all commands and menu items and shortcuts
        // in a single controller. I will do that layer.
        (
            [
                UndoMenuItemFactory,
                RedoMenuItemFactory,
                BoldMenuItemFactory,
                ItalicMenuItemFactory,
                UnderlineMenuItemFactory,
                StrikeThroughMenuItemFactory,
                FontFamilySelectorMenuItemFactory,
                FontSizeSelectorMenuItemFactory,
                ResetTextColorMenuItemFactory,
                TextColorSelectorMenuItemFactory,
                BackgroundColorSelectorMenuItemFactory,
                ResetBackgroundColorMenuItemFactory,
                CellBorderSelectorMenuItemFactory,
                SetBorderColorMenuItemFactory,
                SetBorderStyleMenuItemFactory,
                CellMergeMenuItemFactory,
                CellMergeAllMenuItemFactory,
                CellMergeVerticalMenuItemFactory,
                CellMergeHorizontalMenuItemFactory,
                CellMergeCancelMenuItemFactory,
                HorizontalAlignMenuItemFactory,
                VerticalAlignMenuItemFactory,
                WrapTextMenuItemFactory,
                TextRotateMenuItemFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
