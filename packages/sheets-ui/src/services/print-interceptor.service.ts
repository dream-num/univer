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

import type { DisposableCollection, IRange, Worksheet } from '@univerjs/core';
import type { Engine, Scene, Spreadsheet, SpreadsheetSkeleton } from '@univerjs/engine-render';
import { createInterceptorKey, Disposable, InterceptorManager } from '@univerjs/core';

/** Tracks asynchronous resources registered by all interceptors for one print page. */
export class SheetPrintingResourceCollector {
    private readonly _pending = new Set<Promise<unknown>>();

    add(resource: Promise<unknown>): void {
        const tracked = Promise.resolve(resource)
            .catch(() => undefined)
            .finally(() => this._pending.delete(tracked));
        this._pending.add(tracked);
    }

    async wait(timeout = 10_000): Promise<void> {
        const deadline = Date.now() + timeout;
        // A completed resource may synchronously register another resource, so keep
        // draining until the set is empty rather than snapshotting it only once.
        while (this._pending.size > 0) {
            const remaining = deadline - Date.now();
            if (remaining <= 0) {
                return;
            }

            let timeoutId: ReturnType<typeof setTimeout> | undefined;
            await Promise.race([
                Promise.allSettled(Array.from(this._pending)),
                new Promise<void>((resolve) => {
                    timeoutId = setTimeout(resolve, remaining);
                }),
            ]);
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
        }
    }
}

interface ISheetPrintContext {
    unitId: string;
    subUnitId: string;
    scene: Scene;
    engine: Engine;
    root: HTMLElement;
    worksheet: Worksheet;
    skeleton: SpreadsheetSkeleton;
    range: IRange;
    resourceCollector: SheetPrintingResourceCollector;
    offset: {
        offsetX: number;
        offsetY: number;
    };
}

interface ISheetPrintComponentContext extends ISheetPrintContext {
    spreadsheet: Spreadsheet;
}

const PRINTING_RANGE = createInterceptorKey<IRange, { unitId: string; subUnitId: string }>('PRINTING_RANGE');
const PRINTING_COMPONENT_COLLECT = createInterceptorKey<undefined, ISheetPrintComponentContext>('PRINTING_COMPONENT_COLLECT');
const PRINTING_DOM_COLLECT = createInterceptorKey<DisposableCollection, ISheetPrintContext>('PRINTING_DOM_COLLECT');

export class SheetPrintInterceptorService extends Disposable {
    private _printComponentMap: Map<string, string> = new Map();
    readonly interceptor = new InterceptorManager({
        PRINTING_RANGE,
        PRINTING_COMPONENT_COLLECT,
        PRINTING_DOM_COLLECT,
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

        this.disposeWithMe(this.interceptor.intercept(this.interceptor.getInterceptPoints().PRINTING_DOM_COLLECT, {
            priority: -1,
            handler: (_value) => _value,
        }));
    }

    registerPrintComponent(componentKey: string, printingComponentKey: string) {
        this._printComponentMap.set(componentKey, printingComponentKey);
    }

    getPrintComponent(componentKey: string) {
        return this._printComponentMap.get(componentKey);
    }
}
