import { BaseMenuItem } from '@univer/base-component';
import { BaseSelectChildrenProps } from '../View/UI/Common/Select/Select';

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
