import { BooleanNumber } from '@univer/core';
import { BaseComponent, BaseComponentProps, JSXComponent } from '../BaseComponent';

export interface BaseUlProps extends BaseComponentProps {
    label?: string | JSX.Element | string[];
    /**
     * 是否显示 选中图标
     */
    selected?: boolean;
    /**
     * 是否显示 隐藏图标
     */
    hidden?: BooleanNumber;
    icon?: JSX.Element | string | null | undefined;
    border?: boolean;
    children?: BaseUlProps[];
    onClick?: (...arg: any[]) => void;
    onKeyUp?: (...any: any[]) => void;
    onDown?: (...any: any[]) => void;
    style?: JSX.CSSProperties;
    showSelect?: (e: MouseEvent) => void;
    getParent?: any;
    show?: boolean;
    className?: string;
    selectType?: string;
    name?: string;
    ref?: any;
    locale?: Array<string | object> | string;
    /**
     * 是否隐藏当前item
     */
    hideLi?: boolean;
}

export interface UlComponent extends BaseComponent<BaseUlProps> {
    render(): JSXComponent<BaseUlProps>;
}
