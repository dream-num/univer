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
import { InsertColMutation, InsertRowMutation } from '../insert-row-col.mutation';
import { createCommandTestBed } from './create-command-test-bed';

describe('insert dimensions validation', () => {
    let testBed: ReturnType<typeof createCommandTestBed>;

    beforeEach(() => {
        testBed = createCommandTestBed();
        testBed.get(ICommandService).registerCommand(InsertColMutation);
        testBed.get(ICommandService).registerCommand(InsertRowMutation);
    });

    afterEach(() => testBed.univer.dispose());

    it('rejects invalid insertion metadata before moving cells or changing counts', () => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const params = {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
        };
        const snapshot = testBed.sheet.save();
        const commandService = testBed.get(ICommandService);
        expect(commandService.syncExecuteCommand(InsertColMutation.id, { ...params, colInfo: { 0: { w: 50 }, 1: { w: -1 } } })).toBe(false);
        expect(commandService.syncExecuteCommand(InsertRowMutation.id, { ...params, rowInfo: { 0: { h: 50 }, 1: { ah: Number.NaN } } })).toBe(false);
        expect(testBed.sheet.save()).toEqual(snapshot);
    });
});
