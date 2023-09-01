import { Inject, Injector, SkipSelf } from '@wendellhu/redi';
import { ISelectionManager, SelectionManager } from '@univerjs/base-sheets';
import { BaseSelectChildrenProps, BaseSelectProps, ColorPicker, ComponentManager, IMenuService, MenuPosition } from '@univerjs/base-ui';
import { UIObserver, ICurrentUniverService, ObserverManager, Disposable } from '@univerjs/core';
import { ComponentChildren } from 'preact';
import { SheetToolbarConfig, SHEET_UI_PLUGIN_NAME } from '../Basics';
import { ColorSelect, LineBold, LineColor, Toolbar } from '../View';

import {
    BackgroundColorSelectorMenuItemFactory,
    BoldMenuItemFactory,
    CellBorderSelectorMenuItemFactory,
    TextColorSelectorMenuItemFactory,
    FontFamilySelectorMenuItemFactory,
    FontSizeSelectorMenuItemFactory,
    ItalicMenuItemFactory,
    RedoMenuItemFactory,
    StrikeThroughMenuItemFactory,
    TextRotateMenuItemFactory,
    UnderlineMenuItemFactory,
    UndoMenuItemFactory,
    WrapTextMenuItemFactory,
    HorizontalAlignMenuItemFactory,
    VerticalAlignMenuItemFactory,
} from './menu';

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
    suffix?: ComponentChildren;
}

export class ToolbarUIController extends Disposable {
    private _toolbar: Toolbar;

    /**
     * @deprecated
     */
    private _toolList: IToolbarItemProps[] = [];

    constructor(
        config: SheetToolbarConfig | undefined,
        @Inject(Injector) private readonly _injector: Injector,
        @ISelectionManager private readonly _selectionManager: SelectionManager,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IMenuService private readonly _menuService: IMenuService
    ) {
        super();

        // this._config = Tools.deepMerge({}, DefaultToolbarConfig, config);

        this._initialize();
    }

    // 获取Toolbar组件
    getComponent = (ref: Toolbar) => {
        this._toolbar = ref;

        this._initializeToolbar();
        this.setToolbar();
    };

    // 增加toolbar配置
    /**
     * @deprecated
     */
    addToolbarConfig(config: IToolbarItemProps) {
        const index = this._toolList.findIndex((item) => item.name === config.name);
        if (index > -1) return;
        this._toolList.push(config);
    }

    /**
     * @deprecated
     */
    deleteToolbarConfig(name: string) {
        const index = this._toolList.findIndex((item) => item.name === name);
        if (index > -1) {
            this._toolList.splice(index, 1);
        }
    }

    // 刷新 toolbar 数据从 controller 层移动到 view 层
    setToolbar() {
        this._toolbar?.setToolbar(this._toolList);
        this._toolbar?.setToolbarNeo(this._menuService.getMenuItems(MenuPosition.TOOLBAR));
    }

    setUIObserve<T>(msg: UIObserver<T>) {
        this._globalObserverManager.requiredObserver<UIObserver<T>>('onUIChangeObservable', 'core').notifyObservers(msg);
    }

    private _initialize() {
        // TODO@wzhudev: this should be builtin and requires no registration process.
        const componentManager = this._componentManager;
        componentManager.register(SHEET_UI_PLUGIN_NAME + ColorSelect.name, ColorSelect);
        componentManager.register(SHEET_UI_PLUGIN_NAME + ColorPicker.name, ColorPicker);
        componentManager.register(SHEET_UI_PLUGIN_NAME + LineColor.name, LineColor);
        componentManager.register(SHEET_UI_PLUGIN_NAME + LineBold.name, LineBold);
    }

    private _initializeToolbar(): void {
        // TODO@wzhudev: now we register menu items that only display in the toolbar here. In fact we should register all commands and menu items and shortcuts
        // in a single controller. I will do that layer.
        [
            UndoMenuItemFactory,
            RedoMenuItemFactory,
            FontFamilySelectorMenuItemFactory,
            FontSizeSelectorMenuItemFactory,
            BoldMenuItemFactory,
            ItalicMenuItemFactory,
            UnderlineMenuItemFactory,
            StrikeThroughMenuItemFactory,
            TextColorSelectorMenuItemFactory,
            BackgroundColorSelectorMenuItemFactory,
            CellBorderSelectorMenuItemFactory,
            HorizontalAlignMenuItemFactory,
            VerticalAlignMenuItemFactory,
            WrapTextMenuItemFactory,
            TextRotateMenuItemFactory,
        ].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }
}
