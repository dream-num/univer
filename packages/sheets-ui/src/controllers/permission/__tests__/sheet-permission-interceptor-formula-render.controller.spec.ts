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

import { NullValueObject } from '@univerjs/engine-formula';
import { UnitAction } from '@univerjs/protocol';
import { WorksheetViewPermission } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { SheetPermissionInterceptorFormulaRenderController } from '../sheet-permission-interceptor-formula-render.controller';

function createFormulaValue(values: unknown[][], row = 3, col = 4) {
    return {
        getArrayValue: vi.fn(() => values),
        getCurrentRow: vi.fn(() => row),
        getCurrentColumn: vi.fn(() => col),
    };
}

function createController(options?: { sheetViewable?: boolean; protectedCell?: { row: number; col: number } }) {
    let handler: any;
    const univerInstanceService = {
        getCurrentUnitOfType: vi.fn(() => ({
            getUnitId: () => 'unit-1',
            getActiveSheet: () => ({
                getSheetId: () => 'sheet-1',
                getCellRaw: vi.fn(() => ({ v: 'raw' })),
            }),
        })),
    };
    const statusBarController = {
        interceptor: {
            getInterceptPoints: vi.fn(() => ({ STATUS_BAR_PERMISSION_CORRECT: 'status-bar-permission' })),
            intercept: vi.fn((_point, config) => {
                handler = config.handler;
                return { dispose: vi.fn() };
            }),
        },
    };
    const controller = new SheetPermissionInterceptorFormulaRenderController(
        {} as any,
        univerInstanceService as any,
        {
            getPermissionPoint: vi.fn((id: string) => ({
                value: id === new WorksheetViewPermission('unit-1', 'sheet-1').id ? options?.sheetViewable ?? true : true,
            })),
        } as any,
        statusBarController as any,
        {
            getCellInfo: vi.fn((_unitId: string, _sheetId: string, row: number, col: number) => (
                options?.protectedCell?.row === row && options?.protectedCell?.col === col
                    ? { [UnitAction.View]: false }
                    : { [UnitAction.View]: true }
            )),
        } as any
    );

    return { controller, handler, statusBarController };
}

describe('SheetPermissionInterceptorFormulaRenderController', () => {
    it('clears every formula result when worksheet view permission is denied', () => {
        const { controller, handler } = createController({ sheetViewable: false });
        const value = createFormulaValue([[1, 2], [3, 4]]);

        const result = handler([], [value]);

        expect(result).toEqual([value]);
        expect(value.getArrayValue()).toEqual([
            [NullValueObject.create(), NullValueObject.create()],
            [NullValueObject.create(), NullValueObject.create()],
        ]);

        controller.dispose();
    });

    it('clears only protected cell values when worksheet is viewable', () => {
        const { controller, handler } = createController({ protectedCell: { row: 3, col: 4 } });
        const value = createFormulaValue([[1, 2], [3, 4]]);

        handler([], [value]);

        expect(value.getArrayValue()[0][0]).toEqual(NullValueObject.create());
        expect(value.getArrayValue()[0][1]).toBe(2);
        expect(value.getArrayValue()[1][0]).toBe(3);
        expect(value.getArrayValue()[1][1]).toBe(4);

        controller.dispose();
    });
});
