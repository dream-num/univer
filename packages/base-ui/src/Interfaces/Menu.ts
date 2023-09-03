import { ComponentChildren, JSX } from 'preact';
import { BaseComponent, JSXComponent } from '../BaseComponent';
import { IDisplayMenuItem, IValueOption } from '../services/menu/menu.service';

export interface BaseMenuItem {
    className?: string;
    style?: JSX.CSSProperties;
    label?: ComponentChildren;
    value?: any;
    children?: BaseMenuItem[];
    show?: boolean;
    disabled?: boolean;
    onClick?: (...arg: any) => void;
    border?: boolean;
}

export interface BaseMenuProps {
    onClick?: (...arg: any) => void;
    className?: string;
    style?: JSX.CSSProperties;
    parent?: any;
    dom?: HTMLElement;
    ref?: any;
    deep?: number;
    /** @deprecated this is legacy menu mechanism. Do not use it. Use `menuItems` instead. */
    menu?: BaseMenuItem[]; // TODO: should be renamed to `items`

    // NOTE: options above are legacy. They are going to be removed after we complete refactoring.

    menuId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menuItems?: Array<IDisplayMenuItem<any>>;
    options?: IValueOption[];
}

export type BaseMenuState = {
    show: boolean;
    posStyle: BaseMenuStyle;
};

export type BaseMenuStyle = {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
};

export interface MenuComponent extends BaseComponent<BaseMenuProps> {
    render(): JSXComponent<BaseMenuProps>;
}
