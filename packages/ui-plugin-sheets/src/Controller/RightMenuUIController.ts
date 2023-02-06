import { BaseMenuItem, BaseSelectChildrenProps, resetDataLabel } from '@univerjs/base-ui';
import { Tools } from '@univerjs/core';
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
    locale?: string;
    label?: string;
    children?: CustomLabelProps[];
    onKeyUp?: (e: Event) => void;
}

export interface RightMenuProps extends BaseMenuItem {
    locale?: string[];
    customLabel?: {
        name: string;
        props?: CustomLabelProps;
    };
    children?: RightMenuProps[];
    suffix?: string;
    border?: boolean;
}

export class RightMenuUIController {
    private _plugin: SheetUIPlugin;

    private _rightMenu: RightMenu;

    private _menuList: RightMenuProps[];

    private _config: SheetRightMenuConfig;

    constructor(plugin: SheetUIPlugin, config?: SheetRightMenuConfig) {
        this._plugin = plugin;

        this._config = Tools.deepMerge({}, DefaultRightMenuConfig, config);

        this._menuList = [
            {
                locale: ['rightClick.insert', 'rightClick.row'],
                onClick: () => {},
                show: this._config.InsertRow,
            },
        ];

        this._initialize();
    }

    private _initialize() {
        setTimeout(() => {
            // this._plugin
            //     .getSheetContainerController()
            //     .getContentRef()
            //     .current?.addEventListener('click', (e) => {
            //         this._rightMenu.handleContextMenu(e as any);
            //     });
        }, 1000);
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
