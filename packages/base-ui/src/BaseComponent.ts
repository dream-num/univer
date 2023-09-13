import { Context } from '@univerjs/core/src/Basics/Context';
import { ComponentClass, ForwardFn } from 'react';

// TODO Button const enum; BaseComponentSheet => BaseComponentXXX

export interface BaseComponentProps {
    getComponent?: (ref: any) => void; //获取自身组件
    id?: string; // 组件id

    /** @deprecated */
    context?: Context;
}

export interface BaseComponent<T = any> {
    render(): JSXComponent<T>;
}
// component type
export type FunctionComponent<T = void> = (props: T) => JSX.Element;
export type ClassComponent<T = any, E = any> = ComponentClass<T, E>;
export type ForwardFnComponent<T> = ForwardFn<T>;
export type JSXComponent<T = void> = FunctionComponent<T> | ForwardFnComponent<T> | ClassComponent<T>;
