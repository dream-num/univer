import { BasePlugin, SheetContext, Nullable } from '@univer/core';
import { cloneElement, Component as PreactComponent, ComponentChildren, ComponentClass, createRef, JSX, RefObject, render, VNode, PreactContext, Ref } from 'preact';
import { ForwardFn, forwardRef, PureComponent as PreactPureComponent } from 'preact/compat';
import { BaseComponentRender, BaseComponentSheet } from '../BaseComponent';
import { AppContext, AppContextValues } from '../Common';

/**
 * Wrap the framework for easy switching of the underlying framework
 */
abstract class Component<P = {}, S = {}> extends PreactComponent<P, S> {
    static contextType: PreactContext<Partial<AppContextValues>> = AppContext;

    protected _context: SheetContext;

    constructor(props?: P, context?: any) {
        super(props, context);
        this._context = context.coreContext;
        this.initialize(props);
    }

    protected initialize(props?: P): void {}

    getContext(): SheetContext {
        return this._context;
    }

    getPluginByName<T extends BasePlugin>(name: string): Nullable<T> {
        return this._context.getPluginManager().getPluginByName<T>(name);
    }

    getComponentRender(): BaseComponentRender {
        return this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!.getComponentRender();
    }
}

abstract class PureComponent<P = {}, S = {}> extends PreactPureComponent<P, S> {
    static contextType: PreactContext<Partial<AppContextValues>> = AppContext;

    protected _context: SheetContext;

    constructor(props?: P, context?: any) {
        super(props, context);
        this._context = context.coreContext;
        this.initialize(props);
    }

    protected initialize(props?: P): void {}

    getContext(): SheetContext {
        return this._context;
    }

    getComponentRender(): BaseComponentRender {
        return this._context.getPluginManager().getPluginByName<BaseComponentSheet>('ComponentSheet')!.getComponentRender();
    }
}

export { render, Component, forwardRef, createRef, PureComponent, cloneElement };

export type { ComponentChildren, ComponentClass, ForwardFn, JSX, RefObject, VNode, PreactContext, Ref };
