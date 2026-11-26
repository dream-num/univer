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

import { Injector } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ISheetDrawingTransformPlan } from '../sheet-drawing-transform-plan.service';
import { SheetDrawingTransformPlanService } from '../sheet-drawing-transform-plan.service';

describe('SheetDrawingTransformPlanService', () => {
    let injector: Injector;
    beforeEach(() => {
        injector = new Injector([[SheetDrawingTransformPlanService]]);
    });
    afterEach(() => injector.dispose());
    it('runs extensions by priority and aggregates feature mutations', () => {
        const service = injector.get(SheetDrawingTransformPlanService);
        const calls: string[] = [];

        service.register({
            priority: 0,
            transform: () => {
                calls.push('low');
                return {
                    redos: [{ id: 'low-redo', params: {} }],
                    undos: [{ id: 'low-undo', params: {} }],
                };
            },
        });
        service.register({
            priority: 100,
            transform: () => {
                calls.push('high');
                return {
                    preRedos: [{ id: 'high-pre-redo', params: {} }],
                    preUndos: [{ id: 'high-pre-undo', params: {} }],
                };
            },
        });

        const result = service.transform({ mode: 'command' } as ISheetDrawingTransformPlan);

        expect(calls).toEqual(['high', 'low']);
        expect(result.preRedos).toEqual([{ id: 'high-pre-redo', params: {} }]);
        expect(result.redos).toEqual([{ id: 'low-redo', params: {} }]);
        expect(result.preUndos).toEqual([{ id: 'high-pre-undo', params: {} }]);
        expect(result.undos).toEqual([{ id: 'low-undo', params: {} }]);
    });

    it('stops running an extension after disposal', () => {
        const service = injector.get(SheetDrawingTransformPlanService);
        const transform = vi.fn(() => ({}));
        const disposable = service.register({ transform });

        disposable.dispose();
        service.transform({ mode: 'command' } as ISheetDrawingTransformPlan);

        expect(transform).not.toHaveBeenCalled();
    });
});
