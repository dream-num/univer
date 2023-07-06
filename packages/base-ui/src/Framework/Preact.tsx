import { Context } from '@univerjs/core';
import {
    cloneElement,
    Component as PreactComponent,
    ComponentChildren,
    ComponentClass,
    createRef,
    JSX,
    RefObject,
    render,
    VNode,
    PreactContext,
    Ref,
    toChildArray,
    isValidElement,
} from 'preact';
import { ForwardFn, forwardRef, PureComponent as PreactPureComponent } from 'preact/compat';
import { useRef, useState, useEffect } from 'preact/hooks';
import { AppContext, AppContextValues, CustomComponent } from '../Common';

/**
 * Wrap the framework for easy switching of the underlying framework
 */
abstract class Component<P = {}, S = {}> extends PreactComponent<P, S> {
    static contextType: PreactContext<Partial<AppContextValues>> = AppContext;

    constructor(props?: P) {
        super(props);
        this.initialize(props);
    }

    getContext(): Context {
        return this.context.context;
    }

    getLocale(name?: string) {
        if (!name) return;
        return this.getContext().getLocale().get(name);
    }

    getLabel(label: string | CustomComponent | ComponentChildren) {
        if (typeof label === 'string') {
            return this.getLocale(label);
        }
        if (isValidElement(label)) {
            return label;
        }
        if (label) {
            const Label = this.context.componentManager.get((label as CustomComponent).name);
            if (Label) {
                const props = (label as CustomComponent).props ?? {};
                return <Label {...props}></Label>;
            }
        }
        return null;
    }

    protected initialize(props?: P): void {
        //
    }
}

abstract class PureComponent<P = {}, S = {}> extends PreactPureComponent<P, S> {
    static contextType: PreactContext<Partial<AppContextValues>> = AppContext;

    constructor(props?: P) {
        super(props);
        this.initialize(props);
    }

    getContext(): Context {
        return this.context.context;
    }

    getLocale(name: string) {
        return this.getContext().getLocale().get(name);
    }

    getLabel(label: string | CustomComponent | ComponentChildren) {
        if (typeof label === 'string') {
            return this.getLocale(label);
        }
        if (isValidElement(label)) {
            return label;
        }
        if (label) {
            const Label = this.context.componentManager.get((label as CustomComponent).name);
            if (Label) {
                const props = (label as CustomComponent).props ?? {};
                return <Label {...props}></Label>;
            }
        }
        return null;
    }

    protected initialize(props?: P): void {
        //
    }
}

export { render, Component, forwardRef, createRef, PureComponent, cloneElement, useRef, useState, useEffect, toChildArray };

export type { ComponentChildren, ComponentClass, ForwardFn, JSX, RefObject, VNode, PreactContext, Ref };
