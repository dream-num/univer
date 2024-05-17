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

import { Disposable, IUniverInstanceService, LifecycleService, LifecycleStages, toDisposable, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector, Optional } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';
import { render as createRoot, unmount } from 'rc-util/lib/React/render';
import React from 'react';
import { delay, filter, take } from 'rxjs';

import { ILayoutService } from '../../services/layout/layout.service';
import { App } from '../../views/App';
import { DesktopUIPart, IUIPartsService } from '../../services/parts/parts.service';
import type { IUIController, IWorkbenchOptions } from './ui.controller';

const STEADY_TIMEOUT = 3000;

export class DesktopUIController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService,
        @Optional(ILayoutService) private readonly _layoutService?: ILayoutService
    ) {
        super();
    }

    bootstrapWorkbench(options: IWorkbenchOptions): void {
        this.disposeWithMe(
            bootStrap(this._injector, options, (canvasElement, containerElement) => {
                if (this._layoutService) {
                    this.disposeWithMe(this._layoutService.registerRootContainerElement(containerElement));
                    this.disposeWithMe(this._layoutService.registerCanvasElement(canvasElement as HTMLCanvasElement));
                }

                // TODO: this is subject to change in the future
                this._renderManagerService.currentRender$.subscribe((renderId) => {
                    if (renderId) {
                        const render = this._renderManagerService.getRenderById(renderId)!;
                        if (!render.unitId) return;

                        const unitType = this._instanceService.getUnitType(render.unitId);
                        if (unitType !== UniverInstanceType.UNIVER_SHEET) return;

                        render.engine.setContainer(canvasElement);
                    }
                });

                this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === LifecycleStages.Ready), delay(300), take(1)).subscribe(() => {
                    const engine = this._renderManagerService.getFirst()?.engine;
                    engine?.setContainer(canvasElement);
                    this._lifecycleService.stage = LifecycleStages.Rendered;
                    setTimeout(() => this._lifecycleService.stage = LifecycleStages.Steady, STEADY_TIMEOUT);
                });
            })
        );
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
    const uiPartsService = injector.get(IUIPartsService);
    const onRendered = (canvasElement: HTMLElement) => callback(canvasElement, mountContainer);

    function render() {
        const headerComponents = uiPartsService.getComponents(DesktopUIPart.HEADER);
        const contentComponents = uiPartsService.getComponents(DesktopUIPart.CONTENT);
        const footerComponents = uiPartsService.getComponents(DesktopUIPart.FOOTER);
        const headerMenuComponents = uiPartsService.getComponents(DesktopUIPart.HEADER_MENU);
        const leftSidebarComponents = uiPartsService.getComponents(DesktopUIPart.LEFT_SIDEBAR);

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

    const updateSubscription = uiPartsService.componentRegistered$.subscribe(render);
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
