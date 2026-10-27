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

import { ICommandService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetWorksheetColWidthMutation } from '../set-worksheet-col-width.mutation';
import { createCommandTestBed } from './create-command-test-bed';

describe('col-width mutation validation', () => {
    let testBed: ReturnType<typeof createCommandTestBed>;

    beforeEach(() => {
        testBed = createCommandTestBed();
        testBed.get(ICommandService).registerCommand(SetWorksheetColWidthMutation);
    });

    afterEach(() => testBed.univer.dispose());

    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, '90', null, undefined, false, ''])(
        'rejects invalid size %s atomically for scalar and batch mutations',
        (value) => {
            const commandService = testBed.get(ICommandService);
            const worksheet = testBed.sheet.getActiveSheet()!;
            const params = {
                unitId: testBed.sheet.getUnitId(),
                subUnitId: worksheet.getSheetId(),
                ranges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
            };
            const snapshot = testBed.sheet.save();
            const sizesToCheck = value == null ? [value] : [value, { 0: 90.5, 1: value }];
            for (const sizes of sizesToCheck) {
                expect(commandService.syncExecuteCommand(SetWorksheetColWidthMutation.id, { ...params, colWidth: sizes })).toBe(false);
                expect(testBed.sheet.save()).toEqual(snapshot);
            }
        }
    );
});
