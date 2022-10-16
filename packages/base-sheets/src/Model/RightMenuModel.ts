import { BaseUlProps } from '@univer/base-component';

export interface RightMenuProps extends BaseUlProps {
    flag?: string;
}

export interface IRightMenu {
    copy: boolean;
    copyAs: boolean;
    paste: boolean;
}

export interface IConfig {}

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
