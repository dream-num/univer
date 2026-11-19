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

import { DataValidationRenderMode, DataValidationType, ObjectMatrix } from '@univerjs/core';
import { AddDataValidationMutation } from '@univerjs/data-validation';
import { ListValidator } from '@univerjs/sheets-data-validation';
import { COPY_TYPE, PREDEFINED_HOOK_NAME_PASTE } from '@univerjs/sheets-ui';
import { afterEach, describe, expect, it } from 'vitest';
import { createDvUiTestBed } from '../../__tests__/create-dv-ui-test-bed';
import { DataValidationCopyPasteController } from '../dv-copy-paste.controller';

describe('DataValidationCopyPasteController', () => {
    let testBed: ReturnType<typeof createDvUiTestBed>;

    afterEach(() => testBed.univer.dispose());

    it.each([
        { name: 'cross-sheet copy', copyType: COPY_TYPE.COPY, targetSheet: 'sheet2', row: 0, column: 0, firstRow: 0 },
        { name: 'cross-sheet cut with an offset', copyType: COPY_TYPE.CUT, targetSheet: 'sheet2', row: 5, column: 3, firstRow: 1 },
        { name: 'same-sheet copy with an offset', copyType: COPY_TYPE.COPY, targetSheet: 'sheet1', row: 5, column: 3, firstRow: 1 },
    ])('preserves dropdown choices and bounds through $name, undo and redo', async ({ copyType, targetSheet, row, column, firstRow }) => {
        testBed = createDvUiTestBed();
        testBed.injector.add([DataValidationCopyPasteController]);
        testBed.injector.get(DataValidationCopyPasteController);
        const range = { startRow: firstRow, endRow: 2, startColumn: 1, endColumn: 1 };
        const rule = { uid: 'dropdown', type: DataValidationType.LIST, formula1: 'Red,Green,Blue', renderMode: DataValidationRenderMode.ARROW, ranges: [range] };
        await testBed.commandService.executeCommand(AddDataValidationMutation.id, { unitId: 'test', subUnitId: 'sheet1', rule });
        const hook = testBed.getClipboardHook();
        hook.onBeforeCopy?.('test', 'sheet1', { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 }, copyType);
        const result = hook.onPasteCells!(
            { unitId: 'test', subUnitId: 'sheet1', range: { rows: [0, 1, 2], cols: [0, 1] } },
            { unitId: 'test', subUnitId: targetSheet, range: { rows: [row, row + 1, row + 2], cols: [column, column + 1] } },
            new ObjectMatrix(),
            { copyType, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );
        const validator = testBed.injector.createInstance(ListValidator);
        for (const mutations of [result.redos, result.undos, result.redos]) {
            for (const mutation of mutations) {
                expect(await testBed.commandService.executeCommand(mutation.id, mutation.params)).toBe(true);
            }
            const pasted = testBed.dataValidationModel.getRuleByLocation('test', targetSheet, row + 2, column + 1);
            const source = testBed.dataValidationModel.getRuleByLocation('test', 'sheet1', 2, 1);
            if (mutations === result.undos) {
                expect(pasted).toBeUndefined();
                expect(source).toEqual(rule);
            } else {
                expect(pasted).toMatchObject({ type: DataValidationType.LIST, renderMode: DataValidationRenderMode.ARROW });
                expect(validator.getList(pasted!, 'test', targetSheet)).toEqual(['Red', 'Green', 'Blue']);
                expect(Boolean(source)).toBe(copyType === COPY_TYPE.COPY);
                for (let r = row; r <= row + 3; r++) {
                    for (let c = column; c <= column + 2; c++) {
                        expect(Boolean(testBed.dataValidationModel.getRuleByLocation('test', targetSheet, r, c))).toBe(
                            r >= row + firstRow && r <= row + 2 && c === column + 1
                        );
                    }
                }
            }
        }
    });

    it('tiles dropdowns over a noncontiguous destination without extending into adjacent cells', async () => {
        testBed = createDvUiTestBed();
        testBed.injector.add([DataValidationCopyPasteController]);
        testBed.injector.get(DataValidationCopyPasteController);
        await testBed.commandService.executeCommand(AddDataValidationMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rule: {
                uid: 'dropdown',
                type: DataValidationType.LIST,
                formula1: 'Red,Green,Blue',
                ranges: [{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 1 }],
            },
        });
        const hook = testBed.getClipboardHook();
        hook.onBeforeCopy?.('test', 'sheet1', { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 }, COPY_TYPE.COPY);
        const result = hook.onPasteCells!(
            { unitId: 'test', subUnitId: 'sheet1', range: { rows: [0, 1, 2], cols: [0, 1] } },
            { unitId: 'test', subUnitId: 'sheet2', range: { rows: [10, 12, 13, 15, 16, 18], cols: [4, 6, 7, 9] } },
            new ObjectMatrix(),
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );
        for (const mutation of result.redos) {
            expect(await testBed.commandService.executeCommand(mutation.id, mutation.params)).toBe(true);
        }
        for (let row = 9; row <= 19; row++) {
            for (let column = 3; column <= 10; column++) {
                expect(Boolean(testBed.dataValidationModel.getRuleByLocation('test', 'sheet2', row, column))).toBe(
                    [12, 13, 16, 18].includes(row) && [6, 9].includes(column)
                );
            }
        }
    });
});
