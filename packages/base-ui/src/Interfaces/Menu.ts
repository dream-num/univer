import { ComponentChildren, JSX } from 'preact';
import { BaseComponent, JSXComponent } from '../BaseComponent';

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
    menu?: BaseMenuItem[];
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
