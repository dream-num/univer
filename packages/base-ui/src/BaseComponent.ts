import { BasePlugin } from '@univerjs/core';
import { Context } from '@univerjs/core/src/Basics/Context';
import { ComponentClass, ForwardFn } from 'react';

import { Description } from './Interfaces/Description';

// TODO Button const enum; BaseComponentSheet => BaseComponentXXX

// UniverSheet base component
export interface BaseComponentSheet extends BasePlugin {
    getComponentRender(): BaseComponentRender;
    getComponentFactory(): BaseComponentFactory;
}
export interface BaseComponentProps {
    getComponent?: (ref: any) => void; //获取自身组件
    id?: string; // 组件id

    /** @deprecated */
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

// component type
export type PropsFrom<T> = T extends BaseComponent<infer Props> ? Props : void;
export type FunctionComponent<T = void> = (props: T) => JSX.Element;
export type ClassComponent<T = any, E = any> = ComponentClass<T, E>;
export type ForwardFnComponent<T> = ForwardFn<T>;
export type JSXComponent<T = void> = FunctionComponent<T> | ForwardFnComponent<T> | ClassComponent<T>;
