import { BaseMenuItem } from '@univer/base-component';
import { BaseSelectChildrenProps } from '../View/UI/Common/Select/Select';

interface IHideRightMenuConfig {
    hideInsertRow?: boolean;
    hideInsertColumn?: boolean;
    hideAddRowTop?: boolean;
    hideAddRowBottom?: boolean;
    hideAddColumnLeft?: boolean;
    hideAddColumnRight?: boolean;
    hideDeleteRow?: boolean;
    hideDeleteColumn?: boolean;
    hideHideRow?: boolean;
    hideShowRow?: boolean;
    hideRowHeight?: boolean;
    hideHideColumn?: boolean;
    hideShowColumn?: boolean;
    hideColumnWidth?: boolean;
    hideDeleteCell?: boolean;
    hideClearContent?: boolean;
    hideMatrix?: boolean;
}

export const RightMenuConfig: IHideRightMenuConfig = {
    hideInsertRow: false,
    hideInsertColumn: false,
    hideAddRowTop: true,
    hideAddRowBottom: true,
    hideAddColumnLeft: true,
    hideAddColumnRight: true,
    hideDeleteRow: false,
    hideDeleteColumn: false,
    hideHideRow: true,
    hideShowRow: true,
    hideRowHeight: true,
    hideHideColumn: true,
    hideShowColumn: true,
    hideColumnWidth: true,
    hideDeleteCell: false,
    hideClearContent: false,
    hideMatrix: true,
};

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

export interface IRightMenu {
    copy: boolean;
    copyAs: boolean;
    paste: boolean;
}

export class RightMenuModel implements IRightMenu {
    private _menuList: RightMenuProps[];

    private _copy: boolean;

    private _copyAs: boolean;

    private _paste: boolean;

    get copy(): boolean {
        return this._copy;
    }

    get copyAs(): boolean {
        return this._copyAs;
    }

    get paste(): boolean {
        return this._paste;
    }

    get menuList(): RightMenuProps[] {
        return this._menuList;
    }

    setValue(newRightMenu: IRightMenu) {
        const { copy, copyAs, paste } = newRightMenu;

        this._copy = copy;

        this._copyAs = copyAs;

        this._paste = paste;
    }

    setRightMenu(menuList: RightMenuProps[]) {
        this._menuList = menuList;
    }
}
