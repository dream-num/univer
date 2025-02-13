/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IDisposable, UnitModel } from '@univerjs/core';
import type { RenderUnit } from '@univerjs/engine-render';
import type { IUniverUIConfig } from '../config.schema';
import type { IWorkbenchOptions } from './ui.controller';
import { Disposable, Inject, Injector, isInternalEditorID, IUniverInstanceService, LifecycleService, LifecycleStages, Optional, toDisposable } from '@univerjs/core';
import { render as createRoot, unmount } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import { filter, take } from 'rxjs';
import { ILayoutService } from '../../services/layout/layout.service';
import { IMenuManagerService } from '../../services/menu/menu-manager.service';
import { BuiltInUIPart, IUIPartsService } from '../../services/parts/parts.service';
import { connectInjector } from '../../utils/di';
import { FloatDom } from '../../views/components/dom/FloatDom';
import { CanvasPopup } from '../../views/components/popup/CanvasPopup';
import { Ribbon } from '../../views/components/ribbon/Ribbon';
import { DesktopWorkbench } from '../../views/workbench/Workbench';
import { menuSchema } from '../menus/menu.schema';

const STEADY_TIMEOUT = 3000;

export class DesktopUIController extends Disposable {
    private _steadyTimeout: NodeJS.Timeout;
    private _renderTimeout: NodeJS.Timeout;

    constructor(
        private readonly _config: IUniverUIConfig,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @Optional(ILayoutService) private readonly _layoutService?: ILayoutService
    ) {
        super();

        this._initBuiltinComponents();
        this._initMenus();
        this._bootstrapWorkbench();
    }

    private _initMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _currentRenderId: string | null = null;

    private _bootstrapWorkbench(): void {
        this.disposeWithMe(this._instanceSrv.unitDisposed$.subscribe((_unit: UnitModel) => {
            clearTimeout(this._steadyTimeout);
        }));

        this.disposeWithMe(
            bootstrap(this._injector, this._config, (contentElement, containerElement) => {
                if (this._layoutService) {
                    this.disposeWithMe(this._layoutService.registerRootContainerElement(containerElement));
                    this.disposeWithMe(this._layoutService.registerContentElement(contentElement));
                }

                // When current render changes, we need to update the render unit.
                this._renderManagerService.currentRender$.subscribe((renderId) => {
                    if (renderId) {
                        this._changeRenderUnit(renderId, contentElement);
                    }
                });

                // First render.
                this.disposeWithMe(this._lifecycleService.lifecycle$.pipe(filter((stage) => stage === LifecycleStages.Ready), take(1)).subscribe(() => {
                    this._renderTimeout = setTimeout(() => {
                        const allRenders = this._renderManagerService.getRenderAll();

                        for (const [key, render] of allRenders) {
                            if (isInternalEditorID(key) || !((render) as RenderUnit).isRenderUnit) continue;
                            this._changeRenderUnit(key, contentElement);
                            break; // We only render the first renderer when bootstrapping.
                        }

                        this._lifecycleService.stage = LifecycleStages.Rendered;
                        this._steadyTimeout = setTimeout(() => {
                            this._lifecycleService.stage = LifecycleStages.Steady;
                        }, STEADY_TIMEOUT);
                    }, 300);
                }));
            })
        );
    }

    private _changeRenderUnit(rendererId: string, contentElement: HTMLElement): void {
        if (this._currentRenderId === rendererId) return;

        const currentRenderer = this._currentRenderId ? this._renderManagerService.getRenderById(this._currentRenderId) : null;
        const renderer = this._renderManagerService.getRenderById(rendererId)!;
        if (!renderer.unitId || isInternalEditorID(renderer.unitId)) return;

        currentRenderer?.deactivate();
        currentRenderer?.engine.unmount();

        renderer.engine.mount(contentElement);
        renderer.activate();

        this._currentRenderId = rendererId;
    }

    private _initBuiltinComponents(): void {
        this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.FLOATING, () => connectInjector(CanvasPopup, this._injector)));
        // this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(ContentDOMPopup, this._injector)));
        this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(FloatDom, this._injector)));
        this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.TOOLBAR, () => connectInjector(Ribbon, this._injector)));
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
        createRoot(<div />, mountContainer);
        setTimeout(() => createRoot(<div />, mountContainer), 200);
        setTimeout(() => unmount(mountContainer), 500);
    });
}

function createContainer(id: string): HTMLElement {
    const element = document.createElement('div');
    element.id = id;
    return element;
}
