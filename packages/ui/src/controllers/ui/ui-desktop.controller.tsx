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

import { Disposable, IUniverInstanceService, LifecycleService, LifecycleStages, toDisposable } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
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
    // SIDEBAR = 'sidebar',
}

/**
 * IDesktopUIController
 */
export interface IDesktopUIController extends IUIController {
    componentRegistered$: Observable<void>;

    // provides multi methods for business to register workbench custom components
    // TODO@wzhudev: in the future we may bind components to different business types
    registerComponent(part: DesktopUIPart, component: () => ComponentType): IDisposable;

    getHeaderMenuComponents(): Set<() => ComponentType>;

    // header bar
    registerHeaderComponent(component: () => ComponentType): IDisposable;
    getHeaderComponents(): Set<() => ComponentType>;

    // content
    registerContentComponent(component: () => ComponentType): IDisposable;
    getContentComponents(): Set<() => ComponentType>;

    // footer bar
    registerFooterComponent(component: () => ComponentType): IDisposable;
    getFooterComponents(): Set<() => ComponentType>;

    // registerSidebarComponent(component: () => ComponentType): IDisposable;
    // getSidebarComponents(): Set<() => ComponentType>;
}

const STEADY_TIMEOUT = 3000;

export class DesktopUIController extends Disposable implements IDesktopUIController {
    private _headerComponents: Set<() => ComponentType> = new Set();
    private _headerMenuComponents: Set<() => ComponentType> = new Set();
    private _contentComponents: Set<() => ComponentType> = new Set();
    private _footerComponents: Set<() => ComponentType> = new Set();
    // private _sidebarComponents: Set<() => ComponentType> = new Set();

    private _componentRegistered$ = new Subject<void>();
    componentRegistered$ = this._componentRegistered$.asObservable();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IFocusService private readonly _focusService: IFocusService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Optional(LayoutService) private readonly _layoutService?: LayoutService
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

    private _initializeEngine(element: HTMLElement) {
        const unitId = this._currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const engine = this._renderManagerService.getRenderById(unitId)!.engine;
        engine.setContainer(element);
    }

    registerComponent(part: DesktopUIPart, component: () => React.ComponentType): IDisposable {
        switch (part) {
            case DesktopUIPart.HEADER:
                return this.registerHeaderComponent(component);
            case DesktopUIPart.CONTENT:
                return this.registerContentComponent(component);
            case DesktopUIPart.FOOTER:
                return this.registerFooterComponent(component);
            // case DesktopUIPart.SIDEBAR:
            //     return this.registerSidebarComponent(component);
            case DesktopUIPart.HEADER_MENU:
                return this.registerHeaderMenuComponent(component);
            default:
                throw new Error(`[DesktopUIController] Unknown part type: ${part}.`);
        }
    }

    registerHeaderMenuComponent(component: () => ComponentType): IDisposable {
        this._headerMenuComponents.add(component);
        this._componentRegistered$.next();
        return toDisposable(() => this._headerMenuComponents.delete(component));
    }

    getHeaderMenuComponents(): Set<() => ComponentType> {
        return new Set([...this._headerMenuComponents]);
    }

    registerHeaderComponent(component: () => ComponentType): IDisposable {
        this._headerComponents.add(component);
        this._componentRegistered$.next();
        return toDisposable(() => this._headerComponents.delete(component));
    }

    getHeaderComponents(): Set<() => ComponentType> {
        return new Set([...this._headerComponents]);
    }

    registerContentComponent(component: () => ComponentType): IDisposable {
        this._contentComponents.add(component);
        this._componentRegistered$.next();
        return toDisposable(() => this._contentComponents.delete(component));
    }

    getContentComponents(): Set<() => ComponentType> {
        return new Set([...this._contentComponents]);
    }

    registerFooterComponent(component: () => ComponentType): IDisposable {
        this._footerComponents.add(component);
        this._componentRegistered$.next();
        return toDisposable(() => this._footerComponents.delete(component));
    }

    getFooterComponents(): Set<() => ComponentType> {
        return new Set([...this._footerComponents]);
    }

    // registerSidebarComponent(component: () => ComponentType): IDisposable {
    //     // this._sidebarComponents.add(component);
    //     this._componentRegistered$.next();
    //     return toDisposable(() => this._footerComponents.delete(component));
    // }

    // getSidebarComponents(): Set<() => React.ComponentType> {
    //     return new Set([...this._sidebarComponents]);
    // }
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
        const headerComponents = desktopUIController.getHeaderComponents();
        const contentComponents = desktopUIController.getContentComponents();
        const footerComponents = desktopUIController.getFooterComponents();
        // const sidebarComponents = desktopUIController.getSidebarComponents();
        const headerMenuComponents = desktopUIController.getHeaderMenuComponents();
        createRoot(
            <ConnectedApp
                {...options}
                mountContainer={mountContainer}
                headerComponents={headerComponents}
                headerMenuComponents={headerMenuComponents}
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
