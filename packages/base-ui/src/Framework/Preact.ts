import { Context } from '@univerjs/core/src/Basics/Context';
import { cloneElement, Component as PreactComponent, ComponentChildren, ComponentClass, createRef, JSX, RefObject, render, VNode, PreactContext, Ref, toChildArray } from 'preact';
import { ForwardFn, forwardRef, PureComponent as PreactPureComponent } from 'preact/compat';
import { useRef, useState, useEffect } from 'preact/hooks';
import { AppContext, AppContextValues } from '../Common';

/**
 * Wrap the framework for easy switching of the underlying framework
 */
abstract class Component<P = {}, S = {}> extends PreactComponent<P, S> {
    static contextType: PreactContext<Partial<AppContextValues>> = AppContext;

    constructor(props?: P) {
        super(props);
        this.initialize(props);
    }

    protected initialize(props?: P): void { }

    getContext(): Context {
        return this.context.context;
    }

    getLocale(name?: string) {
        if (!name) return;
        return this.getContext().getLocale().get(name);
    }
}

abstract class PureComponent<P = {}, S = {}> extends PreactPureComponent<P, S> {
    static contextType: PreactContext<Partial<AppContextValues>> = AppContext;

    protected _context: Context;

    constructor(props?: P) {
        super(props);
        this.initialize(props);
    }

    protected initialize(props?: P): void { }

    getContext(): Context {
        return this.context.context;
    }

    getLocale(name: string) {
        return this.getContext().getLocale().get(name);
    }
}

export { render, Component, forwardRef, createRef, PureComponent, cloneElement, useRef, useState, useEffect, toChildArray };

export type { ComponentChildren, ComponentClass, ForwardFn, JSX, RefObject, VNode, PreactContext, Ref };
