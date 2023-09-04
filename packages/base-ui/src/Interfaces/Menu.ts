import { ComponentChildren, JSX } from 'preact';
import { BaseComponent, JSXComponent } from '../BaseComponent';
import { ICustomComponentOption, IValueOption } from '../services/menu/menu';
import { DisplayTypes } from '../Components/Select/Select';

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
    /** @deprecated */
    onClick?: (...arg: any) => void;
    /** @deprecated */
    className?: string;
    /** @deprecated */
    style?: JSX.CSSProperties;
    /** @deprecated */
    parent?: any;
    /** @deprecated */
    dom?: HTMLElement;
    /** @deprecated */
    ref?: any;
    /** @deprecated */
    deep?: number;
    /** @deprecated this is legacy menu mechanism. Do not use it. Use `menuItems` instead. */
    menu?: BaseMenuItem[]; // TODO: should be renamed to `items`

    // NOTE: options above are legacy. They are going to be removed after we complete refactoring.

    display?: DisplayTypes;
    menuId?: string;
    options?: Array<IValueOption | ICustomComponentOption>;
    onOptionSelect?: (option: IValueOption) => void;
}

export type BaseMenuStyle = {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
};

export interface MenuComponent extends BaseComponent<BaseMenuProps> {
    render(): JSXComponent<BaseMenuProps>;
}
