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

import { connectInjector, Disposable, IConfigService, Inject, Injector, isInternalEditorID, LifecycleService, LifecycleStages, OnLifecycle, Optional, toDisposable } from '@univerjs/core';
import type { RenderUnit } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { IDisposable } from '@univerjs/core';
import { render as createRoot, unmount } from 'rc-util/lib/React/render';
import React from 'react';

import { ILayoutService } from '../../services/layout/layout.service';
import { BuiltInUIPart, IUIPartsService } from '../../services/parts/parts.service';
import { CanvasPopup } from '../../views/components/popup/CanvasPopup';
import { FloatDom } from '../../views/components/dom/FloatDom';
import { DesktopWorkbench } from '../../views/workbench/Workbench';
import { type IUniverUIConfig, type IWorkbenchOptions, UI_CONFIG_KEY } from './ui.controller';

const STEADY_TIMEOUT = 3000;

@OnLifecycle(LifecycleStages.Ready, DesktopUIController)
export class DesktopUIController extends Disposable {
    constructor(
        private readonly _config: IUniverUIConfig,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService,
        @IConfigService private readonly _configService: IConfigService,
        @Optional(ILayoutService) private readonly _layoutService?: ILayoutService
    ) {
        super();

        this._configService.setConfig(UI_CONFIG_KEY, this._config);
        this._initBuiltinComponents();

        Promise.resolve().then(() => this._bootstrapWorkbench());
    }

    private _bootstrapWorkbench(): void {
        this.disposeWithMe(
            bootstrap(this._injector, this._config, (contentElement, containerElement) => {
                if (this._layoutService) {
                    this.disposeWithMe(this._layoutService.registerRootContainerElement(containerElement));
                    this.disposeWithMe(this._layoutService.registerContentElement(contentElement));
                }

                // TODO: this is subject to change in the future for Uni-mode
                this._renderManagerService.currentRender$.subscribe((renderId) => {
                    if (renderId) {
                        const render = this._renderManagerService.getRenderById(renderId)!;
                        if (!render.unitId) return;
                        if (isInternalEditorID(render.unitId)) return;

                        render.engine.setContainer(contentElement);
                    }
                });

                setTimeout(() => {
                    const allRenders = this._renderManagerService.getRenderAll();

                    for (const [key, render] of allRenders) {
                        if (isInternalEditorID(key) || !((render) as RenderUnit).isRenderUnit) continue;

                        render.engine.setContainer(contentElement);
                    }

                    this._lifecycleService.stage = LifecycleStages.Rendered;
                    setTimeout(() => this._lifecycleService.stage = LifecycleStages.Steady, STEADY_TIMEOUT);
                }, 300);
            })
        );
    }

    private _initBuiltinComponents() {
        this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.FLOATING, () => connectInjector(CanvasPopup, this._injector)));
        this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(FloatDom, this._injector)));
    }
}

function bootstrap(
    injector: Injector,
    options: IWorkbenchOptions,
    callback: (contentEl: HTMLElement, containerElement: HTMLElement) => void
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

    const ConnectedApp = connectInjector(DesktopWorkbench, injector);
    const onRendered = (contentElement: HTMLElement) => callback(contentElement, mountContainer);

    function render() {
        createRoot(
            <ConnectedApp
                {...options}
                mountContainer={mountContainer}
                onRendered={onRendered}
            />,
            mountContainer
        );
    }

    render();

    return toDisposable(() => {
        // https://github.com/facebook/react/issues/26031
        createRoot(<div></div>, mountContainer);
        setTimeout(() => createRoot(<div></div>, mountContainer), 200);
        setTimeout(() => unmount(mountContainer), 500);
    });
}

function createContainer(id: string): HTMLElement {
    const element = document.createElement('div');
    element.id = id;
    return element;
}
