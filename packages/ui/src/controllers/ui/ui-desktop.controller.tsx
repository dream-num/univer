/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Disposable, LifecycleService, LifecycleStages, toDisposable } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector, Optional } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';
import { render as createRoot, unmount } from 'rc-util/lib/React/render';
import type { ComponentType } from 'react';
import React from 'react';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { ILayoutService } from '../../services/layout/layout.service';
import { App } from '../../views/App';
import type { IWorkbenchOptions } from './ui.controller';
import { IUIController } from './ui.controller';

export enum DesktopUIPart {
    HEADER = 'header',
    HEADER_MENU = 'header-menu',
    CONTENT = 'content',
    FOOTER = 'footer',
    LEFT_SIDEBAR = 'left-sidebar',
}

export interface IDesktopUIController extends IUIController {
    componentRegistered$: Observable<void>;

    registerComponent(part: DesktopUIPart, component: () => ComponentType): IDisposable;
    getComponents(part: DesktopUIPart): Set<() => ComponentType>;
}

const STEADY_TIMEOUT = 3000;

export class DesktopUIController extends Disposable implements IDesktopUIController {
    private _componentsByPart: Map<DesktopUIPart, Set<() => ComponentType>> = new Map();

    private readonly _componentRegistered$ = new Subject<void>();
    readonly componentRegistered$ = this._componentRegistered$.asObservable();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Optional(ILayoutService) private readonly _layoutService?: ILayoutService
    ) {
        super();
    }

    bootstrapWorkbench(options: IWorkbenchOptions): void {
        this.disposeWithMe(
            bootStrap(this._injector, options, (canvasElement, containerElement) => {
                this._initializeEngine(canvasElement);
                this._lifecycleService.stage = LifecycleStages.Rendered;

                if (this._layoutService) {
                    this.disposeWithMe(this._layoutService.registerRootContainerElement(containerElement));
                    this.disposeWithMe(this._layoutService.registerCanvasElement(canvasElement as HTMLCanvasElement));
                }

                setTimeout(() => (this._lifecycleService.stage = LifecycleStages.Steady), STEADY_TIMEOUT);
            })
        );
    }

    registerComponent(part: DesktopUIPart, component: () => React.ComponentType): IDisposable {
        const components = (
            this._componentsByPart.get(part)
            || this._componentsByPart.set(part, new Set()).get(part)!
        ).add(component);

        this._componentRegistered$.next();

        return toDisposable(() => {
            components.delete(component);
            if (components.size === 0) {
                this._componentsByPart.delete(part);
            }
        });
    }

    getComponents(part: DesktopUIPart): Set<() => ComponentType> {
        return new Set([...(this._componentsByPart.get(part) || new Set())]);
    }

    private _initializeEngine(element: HTMLElement) {
        const engine = this._renderManagerService.getFirst()?.engine;
        engine?.setContainer(element);
    }
}

function bootStrap(
    injector: Injector,
    options: IWorkbenchOptions,
    callback: (canvasEl: HTMLElement, containerElement: HTMLElement) => void
): IDisposable {
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

    const ConnectedApp = connectInjector(App, injector);
    const desktopUIController = injector.get(IUIController) as IDesktopUIController;
    const onRendered = (canvasElement: HTMLElement) => callback(canvasElement, mountContainer);

    function render() {
        const headerComponents = desktopUIController.getComponents(DesktopUIPart.HEADER);
        const contentComponents = desktopUIController.getComponents(DesktopUIPart.CONTENT);
        const footerComponents = desktopUIController.getComponents(DesktopUIPart.FOOTER);
        const headerMenuComponents = desktopUIController.getComponents(DesktopUIPart.HEADER_MENU);
        const leftSidebarComponents = desktopUIController.getComponents(DesktopUIPart.LEFT_SIDEBAR);

        createRoot(
            <ConnectedApp
                {...options}
                mountContainer={mountContainer}
                headerComponents={headerComponents}
                headerMenuComponents={headerMenuComponents}
                leftSidebarComponents={leftSidebarComponents}
                contentComponents={contentComponents}
                onRendered={onRendered}
                footerComponents={footerComponents}
            />,
            mountContainer
        );
    }

    const updateSubscription = desktopUIController.componentRegistered$.subscribe(render);
    render();

    return toDisposable(() => {
        unmount(mountContainer);
        updateSubscription.unsubscribe();
    });
}

function createContainer(id: string): HTMLElement {
    const element = document.createElement('div');
    element.id = id;
    // FIXME: the element is not append to the DOM tree. So it won't be rendered.
    return element;
}
