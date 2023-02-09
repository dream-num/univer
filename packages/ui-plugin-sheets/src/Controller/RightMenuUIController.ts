import { IMouseEvent, IPointerEvent } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { BaseMenuItem, BaseSelectChildrenProps, resetDataLabel } from '@univerjs/base-ui';
import { PLUGIN_NAMES, Tools } from '@univerjs/core';
import { SheetUIPlugin } from '..';
import { DefaultRightMenuConfig, SheetRightMenuConfig } from '../Basics';
import { RightMenu } from '../View';

export interface CustomLabelOptions extends BaseSelectChildrenProps {
    locale?: string;
}

interface CustomLabelProps {
    prefix?: string;
    suffix?: string;
    prefixLocale?: string[] | string;
    suffixLocale?: string[] | string;
    options?: CustomLabelOptions[];
    label?: string;
    children?: CustomLabelProps[];
    onKeyUp?: (e: Event) => void;
}

export interface RightMenuProps extends BaseMenuItem {
    customLabel?: {
        name: string;
        props?: CustomLabelProps;
    };
    children?: RightMenuProps[];
    suffix?: string;
    border?: boolean;
    locale?: string
}

export class RightMenuUIController {
    private _plugin: SheetUIPlugin;

    private _sheetPlugin: SheetPlugin

    private _rightMenu: RightMenu;

    private _menuList: RightMenuProps[];

    private _config: SheetRightMenuConfig;

    constructor(plugin: SheetUIPlugin, config?: SheetRightMenuConfig) {
        this._plugin = plugin;

        this._sheetPlugin = plugin.getContext().getUniver().getCurrentUniverSheetInstance().context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this._config = Tools.deepMerge({}, DefaultRightMenuConfig, config);


        this._menuList = [
            {
                locale: 'rightClick.insertRow',
                onClick: () => { },
                show: this._config.InsertRow,
            },
        ];

        this._initialize();
    }

    private _initialize() {
        this._sheetPlugin.getMainComponent().onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            if (evt.button === 2) {
                this._rightMenu.handleContextMenu(evt);
            }
        });
    }

    // 获取RightMenu组件
    getComponent = (ref: RightMenu) => {
        this._rightMenu = ref;
        this.setMenuList();
    };

    // 刷新
    setMenuList() {
        const locale = this._plugin.getContext().getLocale();
        const menuList = resetDataLabel(this._menuList, locale);
        this._rightMenu?.setMenuList(menuList);
    }
}
