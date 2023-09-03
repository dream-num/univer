import { ComponentChildren, JSX } from 'preact';
import { BaseComponent, JSXComponent } from '../BaseComponent';
import { IDisplayMenuItem } from '../services/menu/menu.service';

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
    /** @deprecated this is legacy menu mechanism. Do not use it. Use `menuItems` instead. */
    parentId?: string;
    menu?: BaseMenuItem[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menuItems?: Array<IDisplayMenuItem<any>>;

    onClick?: (...arg: any) => void;
    className?: string;
    style?: JSX.CSSProperties;
    parent?: any;
    dom?: HTMLElement;
    ref?: any;
    deep?: number;
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
