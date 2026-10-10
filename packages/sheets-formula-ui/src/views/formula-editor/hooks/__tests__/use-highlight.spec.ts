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

// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { calcHighlightRanges, createFormulaHighlightBody, createHighlightTextRuns } from '../use-highlight';

function range(row: number, col: number, sheetId = 'sheet1', unitId = 'unit1') {
    return {
        startRow: row,
        endRow: row,
        startColumn: col,
        endColumn: col,
        sheetId,
        unitId,
    };
}

describe('use-highlight regression scenarios', () => {
    it('does not cover the first highlighted character when there is no leading marker', () => {
        const textRuns = [{ st: 0, ed: 12, ts: { cl: { rgb: '#ff0000' } } }];

        expect(createHighlightTextRuns(textRuns, 0)).toEqual(textRuns);
    });

    it('does not copy stale paragraph metadata into a formula text replacement', () => {
        const body = createFormulaHighlightBody('=F40', [
            { st: 0, ed: 1, ts: { fs: 11 } },
            { st: 1, ed: 4, ts: { fs: 11 } },
        ]);

        expect(body).toEqual({
            dataStream: '=F40',
            textRuns: [
                { st: 0, ed: 1, ts: { fs: 11 } },
                { st: 1, ed: 4, ts: { fs: 11 } },
            ],
        });
        expect(body.paragraphs).toBeUndefined();
        expect(body.sectionBreaks).toBeUndefined();
    });

    it('calculates visible formula reference selections and activates the reference under the editor cursor', () => {
        const currentSelections = [{
            range: range(0, 0),
            primary: { actualRow: 9, actualColumn: 9 },
        }];
        const refSelectionsService = {
            getCurrentSelections: vi.fn(() => currentSelections),
            setSelections: vi.fn(),
        };
        const refSelectionsRenderService = {
            setActiveSelectionIndex: vi.fn(),
            resetActiveSelectionIndex: vi.fn(),
        };
        const workbook = {
            getUnitId: vi.fn(() => 'unit1'),
            getActiveSheet: vi.fn(() => ({
                getSheetId: () => 'sheet1',
                getName: () => 'Sheet1',
                getRowCount: () => 100,
                getColumnCount: () => 50,
            })),
            getSheetBySheetName: vi.fn((name: string) => name === 'Sheet2'
                ? { getSheetId: () => 'sheet2' }
                : { getSheetId: () => 'sheet1' }),
        };
        const univerInstanceService = {
            getUnit: vi.fn(() => workbook),
        };
        const result = calcHighlightRanges({
            unitId: 'unit1',
            subUnitId: 'sheet1',
            currentWorkbook: workbook as never,
            refSelections: [
                { token: 'A1', themeColor: '#ff0000', refIndex: 0, startIndex: 0, endIndex: 1, index: 0 },
                { token: 'Sheet2!A1', themeColor: '#00ff00', refIndex: 1, startIndex: 3, endIndex: 11, index: 1 },
                { token: 'Book2#Sheet1!A1', themeColor: '#0000ff', refIndex: 2, startIndex: 12, endIndex: 26, index: 2 },
            ],
            editor: {
                getSelectionRanges: vi.fn(() => [{ startOffset: 3 }]),
            } as never,
            refSelectionsService: refSelectionsService as never,
            refSelectionsRenderService: refSelectionsRenderService as never,
            sheetSkeletonManagerService: {
                getSkeleton: vi.fn(() => ({})),
            } as never,
            themeService: { getColorFromTheme: vi.fn((key: string) => key === 'gray.0' ? '#fff' : key) } as never,
            univerInstanceService: univerInstanceService as never,
        });

        expect(result).toHaveLength(2);
        expect(result?.[0].range).toMatchObject({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0, unitId: 'unit1', sheetId: 'sheet1' });
        expect(result?.[0].primary).toBe(currentSelections[0].primary);
        expect(result?.[0].style).toMatchObject({ stroke: '#ff0000', widgetStroke: '#fff' });
        expect(refSelectionsRenderService.setActiveSelectionIndex).toHaveBeenCalledWith(0);
    });

    it('does not assign the active keyboard selection primary to an earlier formula reference', () => {
        const activeKeyboardSelection = {
            range: range(7, 2),
            primary: { actualRow: 7, actualColumn: 2 },
        };
        const workbook = {
            getUnitId: vi.fn(() => 'unit1'),
            getActiveSheet: vi.fn(() => ({
                getSheetId: () => 'sheet1',
                getName: () => 'Sheet1',
                getRowCount: () => 100,
                getColumnCount: () => 50,
            })),
            getSheetBySheetName: vi.fn(() => ({ getSheetId: () => 'sheet1' })),
        };

        const result = calcHighlightRanges({
            unitId: 'unit1',
            subUnitId: 'sheet1',
            currentWorkbook: workbook as never,
            refSelections: [
                { token: 'C10', themeColor: '#ff0000', refIndex: 0, startIndex: 0, endIndex: 2, index: 0 },
                { token: 'C8', themeColor: '#00ff00', refIndex: 1, startIndex: 4, endIndex: 5, index: 1 },
            ],
            editor: undefined,
            refSelectionsService: {
                getCurrentSelections: vi.fn(() => [activeKeyboardSelection]),
                setSelections: vi.fn(),
            } as never,
            refSelectionsRenderService: undefined,
            sheetSkeletonManagerService: {
                getSkeleton: vi.fn(() => ({})),
            } as never,
            themeService: { getColorFromTheme: vi.fn((key: string) => key === 'gray.0' ? '#fff' : key) } as never,
            univerInstanceService: { getUnit: vi.fn(() => workbook) } as never,
        });

        expect(result?.[0].range).toMatchObject(range(9, 2));
        expect(result?.[0].primary).toBeUndefined();
        expect(result?.[1].range).toMatchObject(range(7, 2));
        expect(result?.[1].primary).toBe(activeKeyboardSelection.primary);
    });

    it('ignores primary-only selections when calculating formula reference highlight primary cells', () => {
        const workbook = {
            getUnitId: vi.fn(() => 'unit1'),
            getActiveSheet: vi.fn(() => ({
                getSheetId: () => 'sheet1',
                getName: () => 'Sheet1',
                getRowCount: () => 100,
                getColumnCount: () => 50,
            })),
            getSheetBySheetName: vi.fn(() => ({ getSheetId: () => 'sheet1' })),
        };

        const result = calcHighlightRanges({
            unitId: 'unit1',
            subUnitId: 'sheet1',
            currentWorkbook: workbook as never,
            refSelections: [
                { token: 'A1', themeColor: '#ff0000', refIndex: 0, startIndex: 0, endIndex: 1, index: 0 },
            ],
            editor: undefined,
            refSelectionsService: {
                getCurrentSelections: vi.fn(() => [{ primary: { actualRow: 9, actualColumn: 9 } }]),
                setSelections: vi.fn(),
            } as never,
            refSelectionsRenderService: undefined,
            sheetSkeletonManagerService: {
                getSkeleton: vi.fn(() => ({})),
            } as never,
            themeService: { getColorFromTheme: vi.fn((key: string) => key === 'gray.0' ? '#fff' : key) } as never,
            univerInstanceService: { getUnit: vi.fn(() => workbook) } as never,
        });

        expect(result?.[0].primary).toBeUndefined();
    });

    it('returns empty highlight selections when the workbook or active sheet is unavailable', () => {
        const refSelectionsService = {
            getCurrentSelections: vi.fn(() => []),
            setSelections: vi.fn(),
        };

        expect(calcHighlightRanges({
            unitId: 'missing',
            subUnitId: 'sheet1',
            currentWorkbook: { getUnitId: () => 'unit1' } as never,
            refSelections: [{ token: 'A1', themeColor: '#ff0000', refIndex: 0, startIndex: 0, endIndex: 1, index: 0 }],
            editor: undefined,
            refSelectionsService: refSelectionsService as never,
            refSelectionsRenderService: undefined,
            sheetSkeletonManagerService: undefined,
            themeService: { getColorFromTheme: vi.fn(() => '#fff') } as never,
            univerInstanceService: { getUnit: vi.fn(() => null) } as never,
        })).toEqual([]);
        expect(refSelectionsService.setSelections).not.toHaveBeenCalled();
    });
});
