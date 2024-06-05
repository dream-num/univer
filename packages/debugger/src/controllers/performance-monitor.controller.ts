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

import { IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { DocCanvasView } from '@univerjs/docs-ui';
import { Inject, Injector } from '@wendellhu/redi';
import { interval, takeUntil, throttle } from 'rxjs';

@OnLifecycle(LifecycleStages.Rendered, PerformanceMonitorController)
export class PerformanceMonitorController extends RxDisposable {
    private _documentType: UniverInstanceType = UniverInstanceType.UNIVER_UNKNOWN;
    private _hasWatched = false;
    private _container!: HTMLDivElement;
    private _styleElement!: HTMLStyleElement;

    constructor(
        @Inject(DocCanvasView) private _docCanvasView: DocCanvasView,
        @Inject(Injector) private _injector: Injector,
        @IUniverInstanceService private _instanceService: IUniverInstanceService
    ) {
        super();

        this._listenDocumentTypeChange();
    }

    override dispose(): void {
        super.dispose();

        document.body.removeChild(this._container);
        document.head.removeChild(this._styleElement);
    }

    private _listenDocumentTypeChange() {
        this._instanceService.focused$.pipe(takeUntil(this.dispose$)).subscribe((unitId) => {
            if (unitId != null) {
                const univerType = this._instanceService.getUnitType(unitId);

                this._documentType = univerType;

                this._listenFPS();
            }
        });
    }

    private _listenFPS() {
        if (this._hasWatched) {
            return;
        }

        this._hasWatched = true;

        const container = (this._container = document.createElement('div'));
        container.classList.add('fps-monitor');
        const THROTTLE_TIME = 500;
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
        document.head.appendChild(this._styleElement).innerText = style;

        if (this._documentType === UniverInstanceType.UNIVER_DOC) {
            this._docCanvasView.fps$
                .pipe(takeUntil(this.dispose$))
                .pipe(throttle(() => interval(THROTTLE_TIME)))
                .subscribe((fps) => {
                    container.innerText = `FPS: ${fps}`;
                });
        }
    }
}
