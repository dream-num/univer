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

import { SetSelectionsOperation, SetWorksheetActiveOperation } from '@univerjs/sheets';
import { SheetHyperLinkType } from '@univerjs/sheets-hyper-link';
import { ScrollToRangeOperation } from '@univerjs/sheets-ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SheetsHyperLinkResolverService } from '../resolver.service';

describe('SheetsHyperLinkResolverService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should navigate to sheet ranges and execute selection and scroll commands', async () => {
        const executeCommand = vi.fn(async (id: string) => id === SetWorksheetActiveOperation.id);
        const worksheet = {
            getSheetId: () => 'sheet-2',
            getMergeData: () => [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 }],
            getMaxColumns: () => 10,
            getMaxRows: () => 10,
        };
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }),
            getSheetBySheetId: (sheetId: string) => (sheetId === 'sheet-2' ? worksheet : null),
            getHiddenWorksheets: () => [],
        };

        const resolver = new SheetsHyperLinkResolverService(
            {
                getCurrentUnitForType: () => workbook,
                getUnit: () => workbook,
            } as any,
            { executeCommand } as any,
            {
                getValueById: vi.fn(),
                getWorksheetByRef: vi.fn(),
                focusRange: vi.fn(),
            } as any,
            { show: vi.fn() } as any,
            { t: (key: string) => key } as any,
            { getConfig: vi.fn(() => undefined) } as any
        );

        await resolver.navigateToRange('unit-1', 'sheet-2', { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }, true);

        expect(executeCommand).toHaveBeenCalledWith(SetWorksheetActiveOperation.id, { unitId: 'unit-1', subUnitId: 'sheet-2' });
        expect(executeCommand).toHaveBeenCalledWith(SetSelectionsOperation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-2',
            selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }, primary: null }],
        });
        expect(executeCommand).toHaveBeenCalledWith(ScrollToRangeOperation.id, {
            range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
            forceTop: true,
        });
    });

    it('should show user-facing errors when target sheets or defined names are invalid', async () => {
        const show = vi.fn();
        const focusRange = vi.fn();
        const getWorksheetByRef = vi.fn()
            .mockReturnValueOnce(null)
            .mockReturnValueOnce({ isSheetHidden: () => true })
            .mockReturnValueOnce({ isSheetHidden: () => false });
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }),
            getSheetBySheetId: () => null,
            getHiddenWorksheets: () => ['sheet-hidden'],
        };
        const executeCommand = vi.fn(async () => false);

        const resolver = new SheetsHyperLinkResolverService(
            {
                getCurrentUnitForType: () => workbook,
                getUnit: () => workbook,
            } as any,
            { executeCommand } as any,
            {
                getValueById: (_unitId: string, rangeId: string) => (rangeId === 'named-range' ? { formulaOrRefString: 'Sheet1!A1' } : undefined),
                getWorksheetByRef,
                focusRange,
            } as any,
            { show } as any,
            { t: (key: string) => key } as any,
            { getConfig: vi.fn(() => undefined) } as any
        );

        resolver.navigate({ type: SheetHyperLinkType.SHEET, searchObj: { rangeid: 'named-range' } } as any);
        resolver.navigate({ type: SheetHyperLinkType.SHEET, searchObj: { rangeid: 'named-range' } } as any);
        resolver.navigate({ type: SheetHyperLinkType.SHEET, searchObj: { rangeid: 'named-range' } } as any);

        await resolver.navigateToSheetById('unit-1', 'sheet-missing');
        await resolver.navigateToSheetById('unit-1', 'sheet-hidden');

        expect(show).toHaveBeenCalledWith({ content: 'hyperLink.message.refError', type: 'error' });
        expect(show).toHaveBeenCalledWith({ content: 'hyperLink.message.hiddenSheet', type: 'error' });
        expect(show).toHaveBeenCalledWith({ content: 'hyperLink.message.noSheet', type: 'error' });
        expect(focusRange).toHaveBeenCalledWith('unit-1', 'named-range');
    });

    it('should open external links via configured handlers or fallback window.open', async () => {
        const navigateToOtherWebsite = vi.fn();
        const open = vi.fn();
        vi.stubGlobal('window', { open });

        const resolver = new SheetsHyperLinkResolverService(
            {
                getCurrentUnitForType: () => null,
                getUnit: () => null,
            } as any,
            { executeCommand: vi.fn() } as any,
            {
                getValueById: vi.fn(),
                getWorksheetByRef: vi.fn(),
                focusRange: vi.fn(),
            } as any,
            { show: vi.fn() } as any,
            { t: (key: string) => key } as any,
            {
                getConfig: vi.fn()
                    .mockReturnValueOnce({ urlHandler: { navigateToOtherWebsite } })
                    .mockReturnValueOnce(undefined),
            } as any
        );

        await resolver.navigateToOtherWebsite('https://univer.ai');
        await resolver.navigateToOtherWebsite('https://openai.com');

        expect(navigateToOtherWebsite).toHaveBeenCalledWith('https://univer.ai');
        expect(open).toHaveBeenCalledWith('https://openai.com', '_blank', 'noopener noreferrer');
    });

    it('should interpret workbook-style links through the public navigate entry', () => {
        const executeCommand = vi.fn(async () => true);
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }),
            getSheetBySheetId: () => ({
                getSheetId: () => 'sheet-2',
                getMergeData: () => [],
                getMaxColumns: () => 10,
                getMaxRows: () => 10,
            }),
            getHiddenWorksheets: () => [],
        };
        const resolver = new SheetsHyperLinkResolverService(
            {
                getCurrentUnitForType: () => workbook,
                getUnit: () => workbook,
            } as any,
            { executeCommand } as any,
            {
                getValueById: vi.fn(),
                getWorksheetByRef: vi.fn(),
                focusRange: vi.fn(),
            } as any,
            { show: vi.fn() } as any,
            { t: (key: string) => key } as any,
            { getConfig: vi.fn(() => undefined) } as any
        );

        resolver.navigate({ type: SheetHyperLinkType.SHEET, searchObj: { gid: 'sheet-2', range: 'B2:C3' } } as any);

        expect(executeCommand).toHaveBeenCalled();
    });
});
