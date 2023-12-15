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

import { DocumentType, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable } from '@univerjs/core';
import { DocCanvasView } from '@univerjs/docs';
import { SheetCanvasView } from '@univerjs/sheets-ui';
import { Inject, Injector } from '@wendellhu/redi';
import { interval, takeUntil, throttle } from 'rxjs';

@OnLifecycle(LifecycleStages.Rendered, PerformanceMonitorController)
export class PerformanceMonitorController extends RxDisposable {
    private _documentType: DocumentType = DocumentType.UNKNOWN;

    private _hasWatched = false;

    constructor(
        @Inject(DocCanvasView) private _docCanvasView: DocCanvasView,
        @Inject(Injector) private _injector: Injector,
        @IUniverInstanceService private _instanceService: IUniverInstanceService
    ) {
        super();

        this._listenDocumentTypeChange();
    }

    private _listenDocumentTypeChange() {
        this._instanceService.focused$.pipe(takeUntil(this.dispose$)).subscribe((unitId) => {
            if (unitId != null) {
                const univerType = this._instanceService.getDocumentType(unitId);

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

        const container = document.createElement('div');
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

        document.head.appendChild(document.createElement('style')).innerText = style;

        if (this._documentType === DocumentType.DOC) {
            this._docCanvasView.fps$
                .pipe(takeUntil(this.dispose$))
                .pipe(throttle(() => interval(THROTTLE_TIME)))
                .subscribe((fps) => {
                    container.innerText = `FPS: ${fps}`;
                });
        } else if (this._documentType === DocumentType.SHEET) {
            this._injector
                .get(SheetCanvasView)
                .fps$.pipe(takeUntil(this.dispose$))
                .pipe(throttle(() => interval(THROTTLE_TIME)))
                .subscribe((fps) => {
                    container.innerText = `FPS: ${fps}`;
                });
        }
    }
}
