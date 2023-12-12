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

import { LifecycleStages, OnLifecycle, RxDisposable } from '@univerjs/core';
import { DocCanvasView } from '@univerjs/docs/views/doc-canvas-view.js';
import { Inject } from '@wendellhu/redi';
import { interval, takeUntil, throttle } from 'rxjs';

@OnLifecycle(LifecycleStages.Rendered, PerformanceMonitorController)
export class PerformanceMonitorController extends RxDisposable {
    constructor(@Inject(DocCanvasView) private _docCanvasView: DocCanvasView) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._showFPS();
    }

    private _showFPS() {
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

        this._docCanvasView.fps$
            .pipe(takeUntil(this.dispose$))
            .pipe(throttle(() => interval(THROTTLE_TIME)))
            .subscribe((fps) => {
                container.innerText = `FPS: ${fps}`;
            });
    }
}
