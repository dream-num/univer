import {
    BaseMenuItem,
    BaseSelectChildrenProps,
    ComponentManager,
    IMenuItemFactory,
    IMenuService,
    MenuPosition,
} from '@univerjs/base-ui';
import { Disposable } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { SheetRightMenuConfig } from '../Basics';
import { RightMenu, RightMenuInput, RightMenuItem } from '../View';
import {
    ClearSelectionMenuItemFactory,
    CopyMenuItemFactory,
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

export interface ICustomLabelProps {
    prefix?: string[] | string;
    suffix?: string[] | string;
    options?: BaseSelectChildrenProps[];
    label?: string;
    children?: ICustomLabelProps[];
    onKeyUp?: (e: Event) => void;
}

// TODO move to right menu
export interface ICustomLabelType {
    name: string;
    props?: ICustomLabelProps;
}

export interface RightMenuProps extends Omit<BaseMenuItem, 'label' | 'children'> {
    label?: string | ICustomLabelType | JSX.Element;
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
    /**
     * @deprecated right menu component should listen to changes in menu service
     */
    setMenuList() {
        this._rightMenu?.setMenuListNeo(this._menuService.getMenuItems(MenuPosition.CONTEXT_MENU));
    }

    private _initialize() {
        // TODO: add these menu items to base-ui
        const componentManager = this._componentManager;
        componentManager.register(RightMenuInput.name, RightMenuInput);
        componentManager.register(RightMenuItem.name, RightMenuItem);

        // // add context menu response to base-ui
        // this._sheetCanvasView
        //     .getSheetView()
        //     .getSpreadsheet()
        //     .onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
        //         if (evt.button === 2) {
        //             evt.preventDefault();
        //             this._rightMenu.handleContextMenu(evt);
        //         }
        //     });

        (
            [
                CopyMenuItemFactory,
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
