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

import type { IDisposable, Injector, IUniverInstanceService, LifecycleService } from '@univerjs/core';
import type { IRenderManagerService } from '@univerjs/engine-render';
import type { ILayoutService } from '../../services/layout/layout.service';
import { Disposable, isInternalEditorID, LifecycleStages } from '@univerjs/core';

const STEADY_TIMEOUT = 3000;

/**
 * @ignore
 */
export abstract class SingleUnitUIController extends Disposable {
    protected _steadyTimeout: number;
    protected _renderTimeout: number;

    constructor(
        protected readonly _injector: Injector,
        protected readonly _instanceService: IUniverInstanceService,
        protected readonly _layoutService: ILayoutService,
        protected readonly _lifecycleService: LifecycleService,
        protected readonly _renderManagerService: IRenderManagerService
    ) {
        super();
    }

    override dispose(): void {
        super.dispose();

        clearTimeout(this._steadyTimeout);
        clearTimeout(this._renderTimeout);
    }

    protected _bootstrapWorkbench() {
        this.disposeWithMe(this.bootstrap(async (contentElement, containerElement) => {
            if (this._layoutService) {
                this.disposeWithMe(this._layoutService.registerRootContainerElement(containerElement));
                this.disposeWithMe(this._layoutService.registerContentElement(contentElement));
            }

            await this._lifecycleService.onStage(LifecycleStages.Ready);
            this._renderTimeout = window.setTimeout(() => {
                // First render
                const allRenders = this._renderManagerService.getRenderAll();
                for (const [key, render] of allRenders) {
                    if (this._changeRenderUnit(key, contentElement)) break;
                }

                // Render as focus shifts
                this.disposeWithMe(this._instanceService.focused$.subscribe((unit) => {
                    if (unit) this._changeRenderUnit(unit, contentElement);
                }));

                // When renderer created, check if matches the focused.
                this.disposeWithMe(this._renderManagerService.created$.subscribe((renderer) => {
                    if (renderer.unitId === this._instanceService.getFocusedUnit()?.getUnitId()) this._changeRenderUnit(renderer.unitId, contentElement);
                }));

                this.disposeWithMe(this._renderManagerService.disposed$.subscribe((renderer) => {
                    if (this._currentRenderId === renderer) this._currentRenderId = null;
                }));

                this._lifecycleService.stage = LifecycleStages.Rendered;
                this._steadyTimeout = window.setTimeout(() => {
                    this._lifecycleService.stage = LifecycleStages.Steady;
                }, STEADY_TIMEOUT);
            }, 300);
        }));
    }

    private _currentRenderId: string | null = null;
    private _changeRenderUnit(rendererId: string, contentElement: HTMLElement): boolean {
        if (this._currentRenderId === rendererId) return false;

        const renderer = this._renderManagerService.getRenderById(rendererId)!;
        if (!renderer || !renderer.unitId || isInternalEditorID(renderer.unitId)) return false;

        const currentRenderer = this._currentRenderId
            ? this._renderManagerService.getRenderById(this._currentRenderId)
            : null;
        currentRenderer?.deactivate();
        currentRenderer?.engine.unmount();
        renderer.engine.mount(contentElement);
        renderer.activate();
        this._currentRenderId = rendererId;
        return true;
    }

    abstract bootstrap(callback: (contentElement: HTMLElement, containerElement: HTMLElement) => void): IDisposable;
}
