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
    private _containerElement: HTMLDivElement | null;

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
        const renderer = this._renderManagerService.getRenderById(unitId);
        if (renderer) {
            const { engine } = renderer;
            this._currentUnitSub = engine.endFrame$.subscribe(() => {
                if (!this._containerElement) {
                    this._containerElement = document.querySelector('[data-u-comp=debugger-fps]');
                } else {
                    this._containerElement.textContent = `FPS: ${Math.round(engine.getFps()).toString()}`;
                }
            });
        }
    }
}
