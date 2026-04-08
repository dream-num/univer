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

import { DataValidationType, IUniverInstanceService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { describe, expect, it } from 'vitest';
import { DisableLinkType, getShouldDisableCellLink, getShouldDisableCurrentCellLink, shouldDisableAddLink } from '../index';

function createAccessor(map: Array<[unknown, unknown]>) {
    const tokenMap = new Map(map);
    return {
        get: (token: unknown) => tokenMap.get(token),
        has: (token: unknown) => tokenMap.has(token),
    } as any;
}

describe('hyper-link utils', () => {
    it('should disable cell links for formulas, custom blocks and data validation rules', () => {
        const worksheet = {
            getCell: () => ({ f: '=SUM(A1:A2)' }),
            getUnitId: () => 'unit-1',
            getSheetId: () => 'sheet-1',
        };

        expect(getShouldDisableCellLink(createAccessor([]), worksheet as any, 0, 0)).toBe(DisableLinkType.DISABLED_BY_CELL);

        const worksheetWithBlocks = {
            ...worksheet,
            getCell: () => ({ p: { body: { customBlocks: [{}] } } }),
        };
        expect(getShouldDisableCellLink(createAccessor([]), worksheetWithBlocks as any, 0, 0)).toBe(DisableLinkType.DISABLED_BY_CELL);

        const accessor = createAccessor([
            [SheetDataValidationModel, { getRuleByLocation: () => ({ type: DataValidationType.CHECKBOX }) }],
        ]);
        const plainWorksheet = {
            ...worksheet,
            getCell: () => ({}),
        };

        expect(getShouldDisableCellLink(accessor, plainWorksheet as any, 1, 1)).toBe(true);
    });

    it('should allow editing-only links for drawing cells and inspect the current selection', () => {
        const worksheet = {
            getCell: () => ({ p: { drawingsOrder: ['drawing-1'] } }),
            getUnitId: () => 'unit-1',
            getSheetId: () => 'sheet-1',
        };

        expect(getShouldDisableCellLink(createAccessor([]), worksheet as any, 0, 0)).toBe(DisableLinkType.ALLOW_ON_EDITING);

        const currentAccessor = createAccessor([
            [IUniverInstanceService, { getCurrentUnitForType: () => ({ getActiveSheet: () => worksheet }) }],
            [SheetsSelectionsService, { getCurrentSelections: () => [{ range: { startRow: 0, startColumn: 0 } }] }],
        ]);

        expect(getShouldDisableCurrentCellLink(currentAccessor)).toBe(false);
    });

    it('should disable add-link when editor selection is missing and allow it with valid rich text context', () => {
        const noSelectionAccessor = createAccessor([
            [DocSelectionManagerService, { getTextRanges: () => [] }],
            [IUniverInstanceService, { getCurrentUnitForType: () => null }],
        ]);
        expect(shouldDisableAddLink(noSelectionAccessor)).toBe(true);

        const validAccessor = createAccessor([
            [DocSelectionManagerService, { getTextRanges: () => [{ collapsed: false, segmentId: 'body' }] }],
            [IUniverInstanceService, {
                getCurrentUnitForType: () => ({
                    getSelfOrHeaderFooterModel: () => ({ getBody: () => ({ dataStream: 'hello\r\n' }) }),
                }),
            }],
        ]);

        expect(shouldDisableAddLink(validAccessor)).toBe(false);
    });
});
