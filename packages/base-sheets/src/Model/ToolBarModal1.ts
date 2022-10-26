import { BaseSelectChildrenProps, BaseSelectProps } from '../View/UI/Common/Select/Select';
import { BaseTextButtonProps } from '../View/UI/Common/TextButton/TextButton';
import { IShowToolBarConfig } from '../View/UI/ToolBar';

enum ToolbarType {
    SELECT,
    BUTTON,
}

// 继承基础下拉属性,添加国际化
export interface BaseToolBarSelectChildrenProps extends BaseSelectChildrenProps {
    locale?: string;
    suffixLocale?: string;
    children?: BaseToolBarSelectChildrenProps[];
}

interface BaseToolBarSelectProps extends BaseSelectProps {
    locale?: string;
    suffixLocale?: string;
    children?: BaseToolBarSelectChildrenProps[];
}

export interface IToolBarItemProps extends BaseToolBarSelectProps, BaseTextButtonProps {
    show?: boolean; //是否显示按钮
    toolbarType?: ToolbarType;
    locale?: string; //label国际化
    tooltipLocale?: string; //tooltip国际化
    tooltip?: string; //tooltip文字
    border?: boolean;
}

export class ToolBarModel1 {
    private _config: IShowToolBarConfig[];

    private _toolList: IToolBarItemProps[];

    get config(): IShowToolBarConfig[] {
        return this._config;
    }

    get toolList(): IToolBarItemProps[] {
        return this._toolList;
    }

    set config(value: IShowToolBarConfig[]) {
        this._config = value;
    }

    set toolList(value: IToolBarItemProps[]) {
        this._toolList = value;
    }
}
