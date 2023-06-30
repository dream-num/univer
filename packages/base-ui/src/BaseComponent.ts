import { BasePlugin } from '@univerjs/core';
import { Context } from '@univerjs/core/src/Basics/Context';
import { ComponentClass, ForwardFn } from './Framework';
import { Description } from './Interfaces';

// TODO Button const enum; BaseComponentSheet => BaseComponentXXX

// UniverSheet base component
export interface BaseComponentSheet extends BasePlugin {
    getComponentRender(): BaseComponentRender;
    getComponentFactory(): BaseComponentFactory;
}
export interface BaseComponentProps {
    getComponent?: (ref: any) => void; //获取自身组件
    id?: string; // 组件id
    context?: Context;
}

export interface BaseComponent<T = any> {
    render(): JSXComponent<T>;
}
export interface BaseComponentFactory {
    createComponent<T extends BaseComponent>(name: string): T;
}
export interface BaseComponentRender {
    renderForwardFn<T extends keyof Description>(name: string): ForwardFnComponent<PropsFrom<Description[T]>>;
    renderClass<T extends keyof Description>(name: string): ClassComponent<PropsFrom<Description[T]>>;
    renderFunction<T extends keyof Description>(name: T): FunctionComponent<PropsFrom<Description[T]>>;
}

// Components interface
const ButtonTypes: string[] = ['default', 'primary'];
export type ButtonType = typeof ButtonTypes[number];
const ButtonShapes: string[] = ['circle', 'round'];
export type ButtonShape = typeof ButtonShapes[number];
const SizeTypes: string[] = ['small', 'middle', 'large'];
export type SizeType = typeof SizeTypes[number];
const ButtonHTMLTypes: string[] = ['submit', 'rest', 'button'];
export type ButtonHTMLType = typeof ButtonHTMLTypes[number];

export interface BaseButtonProps extends BaseComponentProps {
    type?: ButtonType;
    shape?: ButtonShape;
    size?: SizeType;
    danger?: boolean;
    disabled?: boolean;
    block?: boolean;
    loading?: boolean;
    active?: boolean;
    htmlType?: ButtonHTMLType;
    onClick?: Function;
    children?: any;
    className?: string;
    style?: JSX.CSSProperties;
    unActive?: boolean;
}

// component class
export interface ButtonComponent extends BaseComponent<BaseButtonProps> {
    render(): JSXComponent<BaseButtonProps>;
}

// component type
export type PropsFrom<T> = T extends BaseComponent<infer Props> ? Props : void;
export type FunctionComponent<T = void> = (props: T) => JSX.Element;
export type ClassComponent<T = any, E = any> = ComponentClass<T, E>;
export type ForwardFnComponent<T> = ForwardFn<T>;
export type JSXComponent<T = void> = FunctionComponent<T> | ForwardFnComponent<T> | ClassComponent<T>;
