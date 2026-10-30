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
import { SetRowDataMutation, SetRowDataMutationFactory } from '../set-row-data.mutation';
import { createCommandTestBed } from './create-command-test-bed';

describe('row data dimension validation', () => {
    let testBed: ReturnType<typeof createCommandTestBed>;

    beforeEach(() => {
        testBed = createCommandTestBed();
        testBed.get(ICommandService).registerCommand(SetRowDataMutation);
    });

    afterEach(() => testBed.univer.dispose());

    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('rejects a bad dimension %s before applying other properties', (value) => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const snapshot = testBed.sheet.save();
        expect(testBed.get(ICommandService).syncExecuteCommand(SetRowDataMutation.id, {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            rowData: { 0: { h: 50.5 }, 1: { h: value } },
        })).toBe(false);
        expect(testBed.sheet.save()).toEqual(snapshot);
    });

    it('preserves undo patches that clear an optional dimension', () => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const commandService = testBed.get(ICommandService);
        const params = {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            rowData: { 0: { h: 50.5 } },
        };
        const snapshot = testBed.sheet.save();
        const undo = SetRowDataMutationFactory(params, worksheet);
        expect(commandService.syncExecuteCommand(SetRowDataMutation.id, params)).toBe(true);
        expect(commandService.syncExecuteCommand(SetRowDataMutation.id, undo)).toBe(true);
        expect(testBed.sheet.save()).toEqual(snapshot);
    });
});
