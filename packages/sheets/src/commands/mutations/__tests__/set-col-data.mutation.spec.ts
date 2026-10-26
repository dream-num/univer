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
import { SetColDataMutation, SetColDataMutationFactory } from '../set-col-data.mutation';
import { createCommandTestBed } from './create-command-test-bed';

describe('col data dimension validation', () => {
    let testBed: ReturnType<typeof createCommandTestBed>;

    beforeEach(() => {
        testBed = createCommandTestBed();
        testBed.get(ICommandService).registerCommand(SetColDataMutation);
    });

    afterEach(() => testBed.univer.dispose());

    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('rejects a bad dimension %s before applying other properties', (value) => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const snapshot = testBed.sheet.save();
        expect(testBed.get(ICommandService).syncExecuteCommand(SetColDataMutation.id, {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            columnData: { 0: { w: 50.5 }, 1: { w: value } },
        })).toBe(false);
        expect(testBed.sheet.save()).toEqual(snapshot);
    });

    it('preserves undo patches that clear an optional dimension', () => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const commandService = testBed.get(ICommandService);
        const params = {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            columnData: { 0: { w: 50.5 } },
        };
        const snapshot = testBed.sheet.save();
        const undo = SetColDataMutationFactory(params, worksheet);
        expect(commandService.syncExecuteCommand(SetColDataMutation.id, params)).toBe(true);
        expect(commandService.syncExecuteCommand(SetColDataMutation.id, undo)).toBe(true);
        expect(testBed.sheet.save()).toEqual(snapshot);
    });
});
