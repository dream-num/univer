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

import type { ReactFlowInstance } from '@xyflow/react';
import { Disposable } from '@univerjs/core';

import { BehaviorSubject } from 'rxjs';

export interface IFlowViewport {
    zoom: number;
    x: number;
    y: number;
}

export class FlowManagerService extends Disposable {
    private readonly _viewportChanged$ = new BehaviorSubject<IFlowViewport | null>(null);
    readonly viewportChanged$ = this._viewportChanged$.asObservable();

    private _flowInstance: ReactFlowInstance<any>;

    constructor() {
        super();
    }

    getViewport() {
        return this._flowInstance?.getViewport();
    }

    setViewport(viewport: { zoom: number; x: number; y: number }) {
        this._flowInstance?.setViewport(viewport, {
            duration: 100,
        });
    }

    setReactFlowInstance(instance: ReactFlowInstance<any>) {
        this._flowInstance = instance;
    }

    fitView() {
        if (this._flowInstance) {
            this._flowInstance.fitView();
        }
    }

    zoomIn() {
        if (this._flowInstance) {
            this._flowInstance.zoomIn();
        }
    }

    zoomOut() {
        if (this._flowInstance) {
            this._flowInstance.zoomOut();
        }
    }

    setViewportChanged(viewport: IFlowViewport) {
        this._viewportChanged$.next(viewport);
    }
}
