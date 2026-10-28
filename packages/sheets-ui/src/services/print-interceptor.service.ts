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

import type { DisposableCollection, IRange, IRectXYWH, Worksheet } from '@univerjs/core';
import type { Engine, Scene, Spreadsheet, SpreadsheetSkeleton } from '@univerjs/engine-render';
import { createInterceptorKey, Disposable, InterceptorManager } from '@univerjs/core';

const DEFAULT_PRINT_RESOURCE_WAIT_MS = 10_000;

/** Tracks asynchronous resources registered by all interceptors for one print page. */
export class SheetPrintingResourceCollector {
    private readonly _pending = new Set<Promise<unknown>>();
    private readonly _requiredPending = new Set<Promise<unknown>>();
    private _requiredFailure: unknown;
    private _hasRequiredFailure = false;
    private _failureMessage: string | undefined;
    private _closed = false;
    private _notifyClose!: () => void;
    readonly whenClosed = new Promise<void>((resolve) => { this._notifyClose = resolve; });

    get failureMessage(): string | undefined {
        return this._failureMessage;
    }

    get active(): boolean {
        return !this._closed;
    }

    close(): void {
        if (this._closed) {
            return;
        }
        this._closed = true;
        this._notifyClose();
    }

    add(resource: Promise<unknown>, options?: { required?: boolean; failureMessage?: string }): void {
        if (this._closed) {
            Promise.resolve(resource).catch(() => {});
            return;
        }
        const required = options?.required === true;
        const tracked = Promise.resolve(resource)
            .catch((error: unknown) => {
                if (required && !this._closed && !this._hasRequiredFailure) {
                    this._hasRequiredFailure = true;
                    this._requiredFailure = error;
                    this._failureMessage = options?.failureMessage;
                }
            })
            .finally(() => {
                this._pending.delete(tracked);
                this._requiredPending.delete(tracked);
            });
        this._pending.add(tracked);
        if (required) {
            this._requiredPending.add(tracked);
        }
    }

    async wait(timeout = DEFAULT_PRINT_RESOURCE_WAIT_MS): Promise<void> {
        const deadline = Date.now() + timeout;
        // A completed resource may synchronously register another resource, so keep
        // draining until the set is empty rather than snapshotting it only once.
        while (this._pending.size > 0) {
            const remaining = deadline - Date.now();
            if (remaining <= 0) {
                if (this._requiredPending.size > 0) {
                    this.close();
                    throw new Error('Required print resource timed out');
                }
                if (this._hasRequiredFailure) {
                    throw this._requiredFailure ?? new Error('Required print resource failed');
                }
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
        if (this._hasRequiredFailure) {
            throw this._requiredFailure ?? new Error('Required print resource failed');
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

interface IChartSheetPrintContext {
    unitId: string;
    subUnitId: string;
    scene: Scene;
    engine: Engine;
    root: HTMLElement;
    worksheet: Worksheet;
    resourceCollector: SheetPrintingResourceCollector;
    sourceRect: IRectXYWH;
    contentRect: IRectXYWH;
    offset: {
        offsetX: number;
        offsetY: number;
    };
}

const PRINTING_RANGE = createInterceptorKey<IRange, { unitId: string; subUnitId: string }>('PRINTING_RANGE');
const PRINTING_COMPONENT_COLLECT = createInterceptorKey<undefined, ISheetPrintComponentContext>('PRINTING_COMPONENT_COLLECT');
const PRINTING_DOM_COLLECT = createInterceptorKey<DisposableCollection, ISheetPrintContext>('PRINTING_DOM_COLLECT');
const PRINTING_CHART_PAGE_RECT = createInterceptorKey<IRectXYWH | undefined, { unitId: string; subUnitId: string }>('PRINTING_CHART_PAGE_RECT');
const PRINTING_CHART_COMPONENT_COLLECT = createInterceptorKey<undefined, IChartSheetPrintContext>('PRINTING_CHART_COMPONENT_COLLECT');
const PRINTING_CHART_DOM_COLLECT = createInterceptorKey<DisposableCollection, IChartSheetPrintContext>('PRINTING_CHART_DOM_COLLECT');

export class SheetPrintInterceptorService extends Disposable {
    private _printComponentMap: Map<string, string> = new Map();
    readonly interceptor = new InterceptorManager({
        PRINTING_RANGE,
        PRINTING_COMPONENT_COLLECT,
        PRINTING_DOM_COLLECT,
        PRINTING_CHART_PAGE_RECT,
        PRINTING_CHART_COMPONENT_COLLECT,
        PRINTING_CHART_DOM_COLLECT,
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

        this.disposeWithMe(this.interceptor.intercept(this.interceptor.getInterceptPoints().PRINTING_CHART_PAGE_RECT, {
            priority: -1,
            handler: (_value) => _value,
        }));
        this.disposeWithMe(this.interceptor.intercept(this.interceptor.getInterceptPoints().PRINTING_CHART_COMPONENT_COLLECT, {
            priority: -1,
            handler: (_value) => _value,
        }));
        this.disposeWithMe(this.interceptor.intercept(this.interceptor.getInterceptPoints().PRINTING_CHART_DOM_COLLECT, {
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
