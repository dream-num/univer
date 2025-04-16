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

import type { Nullable } from '@univerjs/core';
import type { Subscription } from 'rxjs';
import { Inject, IUniverInstanceService, LifecycleService, LifecycleStages, RxDisposable } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { distinctUntilChanged, filter, take, takeUntil } from 'rxjs';

export class PerformanceMonitorController extends RxDisposable {
    private _initListener = false;
    private _containerElement!: HTMLDivElement;
    private _styleElement!: HTMLStyleElement;

    private _currentUnitSub: Nullable<Subscription>;

    constructor(
        @Inject(LifecycleService) lifecycleService: LifecycleService,
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        lifecycleService.subscribeWithPrevious()
            .pipe(
                filter((stage) => stage === LifecycleStages.Rendered),
                take(1)
            )
            .subscribe(() => this._listenDocumentTypeChange());
    }

    override dispose(): void {
        super.dispose();

        document.body.removeChild(this._containerElement);
        document.head.removeChild(this._styleElement);

        this._disposeCurrentObserver();
    }

    private _disposeCurrentObserver(): void {
        this._currentUnitSub?.unsubscribe();
        this._currentUnitSub = null;
    }

    private _listenDocumentTypeChange() {
        this._instanceService.focused$.pipe(takeUntil(this.dispose$), distinctUntilChanged()).subscribe((unitId) => {
            this._disposeCurrentObserver();
            if (unitId) {
                this._listenToRenderer(unitId);
            }
        });
    }

    private _listenToRenderer(unitId: string) {
        this._tryInit();

        const renderer = this._renderManagerService.getRenderById(unitId);
        if (renderer) {
            const { engine } = renderer;
            this._currentUnitSub = engine.endFrame$.subscribe(() => {
                this._containerElement.textContent = `FPS: ${Math.round(engine.getFps()).toString()}`;
            });
        }
    }

    private _tryInit(): void {
        if (this._initListener) {
            return;
        }

        this._initListener = true;

        const container = (this._containerElement = document.createElement('div'));
        this._containerElement = container;
        container.classList.add('fps-monitor');
        document.body.appendChild(container);

        const style = `
            .fps-monitor {
                position: absolute;
                top: 0;
                left: 10px;
                width: 100px;
                height: 32px;
                line-height: 32px;
                color: rgba(32, 32, 32, .8);
                font-size: 14px;
                font-family: sans-serif;
                z-index: 1000;
                pointer-events: none;
            }
        `;

        this._styleElement = document.createElement('style');
        document.head.appendChild(this._styleElement).textContent = style;
    }
}
