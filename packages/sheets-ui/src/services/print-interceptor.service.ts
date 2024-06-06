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

import type { IRange } from '@univerjs/core';
import { createInterceptorKey, Disposable, InterceptorManager } from '@univerjs/core';
import type { Scene } from '@univerjs/engine-render';

interface ISheetPos {
    unitId: string;
    subUnitId: string;
}

const PRINTING_RANGE = createInterceptorKey<IRange, ISheetPos>('PRINTING_RANGE');
const PRINTING_COMPONENT_COLLECT = createInterceptorKey<undefined, ISheetPos & { scene: Scene }>('PRINTING_COMPONENT_COLLECT');

export class SheetPrintInterceptorService extends Disposable {
    readonly interceptor = new InterceptorManager({
        PRINTING_RANGE,
        PRINTING_COMPONENT_COLLECT,
    });

    constructor() {
        super();
        this.disposeWithMe(this.interceptor.intercept(this.interceptor.getInterceptPoints().PRINTING_RANGE, {
            priority: -1,
            handler: (_value) => _value,
        }));

        this.disposeWithMe(this.interceptor.intercept(this.interceptor.getInterceptPoints().PRINTING_COMPONENT_COLLECT, {
            priority: -1,
            handler: (_value) => _value,
        }));
    }
}
