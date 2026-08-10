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

import type { ISheetAutoFillHook } from '@univerjs/sheets';
import { DataValidationType, Direction, Range } from '@univerjs/core';
import { AddDataValidationMutation } from '@univerjs/data-validation';
import { AUTO_FILL_APPLY_TYPE } from '@univerjs/sheets';
import { DATA_VALIDATION_PLUGIN_NAME } from '@univerjs/sheets-data-validation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDvUiTestBed } from '../../__tests__/create-dv-ui-test-bed';
import { DataValidationAutoFillController } from '../dv-auto-fill.controller';

describe('DataValidationAutoFillController', () => {
    let testBed: ReturnType<typeof createDvUiTestBed>;
    let hook: ISheetAutoFillHook;

    beforeEach(() => {
        testBed = createDvUiTestBed();
        testBed.injector.add([DataValidationAutoFillController]);
        testBed.injector.get(DataValidationAutoFillController);
        const registeredHook = testBed.autoFillService.getAllHooks().find((item) => item.id === DATA_VALIDATION_PLUGIN_NAME);
        if (!registeredHook) {
            throw new Error('Data validation autofill hook was not registered');
        }
        hook = registeredHook;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        testBed.univer.dispose();
    });

    it('disables series fill for checkbox rules without querying each source cell', async () => {
        await testBed.commandService.executeCommand(AddDataValidationMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: {
                uid: 'checkbox-rule',
                type: DataValidationType.CHECKBOX,
                ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
            },
        });
        vi.spyOn(testBed.dataValidationModel, 'getRuleByLocation').mockImplementation(() => {
            throw new Error('must not query validation by cell');
        });

        hook.onBeforeFillData?.({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            source: {
                rows: Array.from({ length: 100_000 }, (_, index) => index),
                cols: Array.from({ length: 1_000 }, (_, index) => index),
            },
            target: { rows: [100_000], cols: [0] },
        }, Direction.DOWN);

        expect(testBed.autoFillService.menu.find((item) => item.value === AUTO_FILL_APPLY_TYPE.SERIES)?.disable).toBe(true);
    });

    it('ignores checkbox rules that only cover filtered-out source rows', async () => {
        await testBed.commandService.executeCommand(AddDataValidationMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: {
                uid: 'filtered-checkbox-rule',
                type: DataValidationType.CHECKBOX,
                ranges: [{ startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 }],
            },
        });
        vi.spyOn(testBed.dataValidationModel, 'getRuleByLocation').mockImplementation(() => {
            throw new Error('must not query validation by cell');
        });

        hook.onBeforeFillData?.({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            source: { rows: [0, 2], cols: [0] },
            target: { rows: [3], cols: [0] },
        }, Direction.DOWN);

        expect(testBed.autoFillService.menu.find((item) => item.value === AUTO_FILL_APPLY_TYPE.SERIES)?.disable).toBe(false);
    });

    it('executes and undoes real validation mutations without enumerating autofill cells', async () => {
        await testBed.commandService.executeCommand(AddDataValidationMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: {
                uid: 'decimal-rule',
                type: DataValidationType.DECIMAL,
                formula1: '1',
                ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
            },
        });
        const foreach = vi.spyOn(Range, 'foreach').mockImplementation(() => {
            throw new Error('must not enumerate cells');
        });
        const location = {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            source: { rows: [0], cols: [0] },
            target: { rows: [1], cols: [0] },
        };

        const result = hook.onFillData?.(location, Direction.DOWN, AUTO_FILL_APPLY_TYPE.COPY);
        if (!result) {
            throw new Error('Data validation autofill did not return mutations');
        }
        foreach.mockRestore();
        for (const mutation of result.redos) {
            await testBed.commandService.executeCommand(mutation.id, mutation.params);
        }
        expect(testBed.dataValidationModel.getRuleByLocation(testBed.unitId, testBed.subUnitId, 0, 0)?.uid).toBe('decimal-rule');
        expect(testBed.dataValidationModel.getRuleByLocation(testBed.unitId, testBed.subUnitId, 1, 0)?.uid).toBe('decimal-rule');

        for (const mutation of result.undos) {
            await testBed.commandService.executeCommand(mutation.id, mutation.params);
        }
        expect(testBed.dataValidationModel.getRuleByLocation(testBed.unitId, testBed.subUnitId, 0, 0)?.uid).toBe('decimal-rule');
        expect(testBed.dataValidationModel.getRuleByLocation(testBed.unitId, testBed.subUnitId, 1, 0)).toBeUndefined();
    });
});
