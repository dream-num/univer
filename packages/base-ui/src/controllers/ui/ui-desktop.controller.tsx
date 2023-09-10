import { Disposable, toDisposable } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';
import { createRoot } from 'react-dom/client';

import { App } from '../../views/app';
import { IUIController, IWorkbenchOptions } from './ui.controller';

export class DesktopUIController extends Disposable implements IUIController {
    constructor(@Inject(Injector) private readonly _injector: Injector) {
        super();
    }

    bootstrapWorkbench(options: IWorkbenchOptions): void {
        this.disposeWithMe(toDisposable(bootStrap(this._injector, options)));
    }
}

function bootStrap(injector: Injector, options: IWorkbenchOptions) {
    let mountContainer: HTMLElement;

    const container = options.container;
    if (typeof container === 'string') {
        const containerElement = document.getElementById(container);
        if (!containerElement) {
            mountContainer = createContainer(container);
        } else {
            mountContainer = containerElement;
        }
    } else if (container instanceof HTMLElement) {
        mountContainer = container;
    } else {
        mountContainer = createContainer('univer');
    }

    const root = createRoot(mountContainer);
    const ConnectedApp = connectInjector(App, injector);
    root.render(<ConnectedApp {...options} />);

    return () => {
        root.unmount();
    };
}

function createContainer(id: string): HTMLElement {
    const element = document.createElement('div');
    element.id = id;
    // FIXME: the element is not append to the DOM tree. So it won't be rendered.
    return element;
}
