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

import { sequenceNodeType } from '@univerjs/engine-formula';
import { describe, expect, it, vi } from 'vitest';
import { shouldSkipReferenceEditingByPointer } from '../use-formula-selection';
import { buildTextRuns, calcHighlightRanges } from '../use-highlight';
import { createSelectionChangeHandler, getSelectionsForFormulaRefUpdate } from '../use-sheet-selection-change';

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

describe('formula selection update helpers', () => {
    it('only skips reference editing when pointer-origin editing is still disabled and click editing is allowed', () => {
        expect(shouldSkipReferenceEditingByPointer(true)).toBe(true);
        expect(shouldSkipReferenceEditingByPointer(true, true)).toBe(false);
        expect(shouldSkipReferenceEditingByPointer(false)).toBe(false);
    });

    it('reorders the active selection into the formula reference being edited and keeps ctrl-added ranges separate', () => {
        const selections = [range(0, 0), range(1, 1), range(2, 2)];

        expect(getSelectionsForFormulaRefUpdate(selections, 0)).toEqual({
            orderedSelections: [range(2, 2), range(0, 0), range(1, 1)],
        });
        expect(getSelectionsForFormulaRefUpdate(selections, 1, true)).toEqual({
            orderedSelections: [range(0, 0), range(1, 1)],
            insertedSelection: range(2, 2),
        });
        expect(getSelectionsForFormulaRefUpdate(selections, -1)).toEqual({
            orderedSelections: selections,
        });
    });

    it('defers ctrl-add selection updates until move end and ignores initial selection events', () => {
        const onSelectionsChange = vi.fn();
        const handler = createSelectionChangeHandler({
            initialSelectionsCount: 1,
            onSelectionsChange,
        });

        handler([range(0, 0)], true, { initial: true });
        handler([range(0, 0), range(1, 1)], false);
        expect(onSelectionsChange).not.toHaveBeenCalled();

        handler([range(0, 0), range(1, 1)], true);
        expect(onSelectionsChange).toHaveBeenCalledWith([range(0, 0), range(1, 1)], true, true);

        handler([range(3, 3)], false);
        expect(onSelectionsChange).toHaveBeenLastCalledWith([range(3, 3)], false, false);
    });
});

describe('formula highlight helpers', () => {
    it('builds colored text runs for references, numbers, strings, arrays, defined names, and plain text', () => {
        const result = buildTextRuns(
            { hasDefinedNameDescription: vi.fn((token: string) => token === 'SalesTotal') } as any,
            {
                formulaRefColors: ['#ff0000', '#00ff00'],
                numberColor: '#0000ff',
                stringColor: '#ff00ff',
                plainTextColor: '#111111',
            },
            [
                'SUM(',
                { token: 'A1', nodeType: sequenceNodeType.REFERENCE, startIndex: 4, endIndex: 5 },
                ',',
                { token: '42', nodeType: sequenceNodeType.NUMBER, startIndex: 7, endIndex: 8 },
                { token: '"ok"', nodeType: sequenceNodeType.STRING, startIndex: 9, endIndex: 12 },
                { token: '{1,2}', nodeType: sequenceNodeType.ARRAY, startIndex: 13, endIndex: 17 },
                { token: 'SalesTotal', nodeType: sequenceNodeType.DEFINED_NAME, startIndex: 18, endIndex: 27 },
                { token: '+', nodeType: sequenceNodeType.NORMAL, startIndex: 28, endIndex: 28 },
                { token: 'A1', nodeType: sequenceNodeType.REFERENCE, startIndex: 29, endIndex: 30 },
            ]
        );

        expect(result.refSelections).toEqual([
            expect.objectContaining({ token: 'A1', themeColor: '#ff0000', refIndex: 1, index: 0 }),
            expect.objectContaining({ token: 'A1', themeColor: '#ff0000', refIndex: 8, index: 1 }),
        ]);
        expect(result.textRuns.map((run) => run.ts?.cl?.rgb)).toEqual([
            '#111111',
            '#ff0000',
            '#111111',
            '#0000ff',
            '#ff00ff',
            '#ff00ff',
            '#111111',
            '#111111',
            '#ff0000',
        ]);
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
            currentWorkbook: workbook as any,
            refSelections: [
                { token: 'A1', themeColor: '#ff0000', refIndex: 0, startIndex: 0, endIndex: 1, index: 0 },
                { token: 'Sheet2!A1', themeColor: '#00ff00', refIndex: 1, startIndex: 3, endIndex: 11, index: 1 },
                { token: 'Book2#Sheet1!A1', themeColor: '#0000ff', refIndex: 2, startIndex: 12, endIndex: 26, index: 2 },
            ],
            editor: {
                getSelectionRanges: vi.fn(() => [{ startOffset: 3 }]),
            } as any,
            refSelectionsService: refSelectionsService as any,
            refSelectionsRenderService: refSelectionsRenderService as any,
            sheetSkeletonManagerService: {
                getSkeleton: vi.fn(() => ({})),
            } as any,
            themeService: { getColorFromTheme: vi.fn((key: string) => key === 'white' ? '#fff' : key) } as any,
            univerInstanceService: univerInstanceService as any,
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
            currentWorkbook: workbook as any,
            refSelections: [
                { token: 'C10', themeColor: '#ff0000', refIndex: 0, startIndex: 0, endIndex: 2, index: 0 },
                { token: 'C8', themeColor: '#00ff00', refIndex: 1, startIndex: 4, endIndex: 5, index: 1 },
            ],
            editor: undefined,
            refSelectionsService: {
                getCurrentSelections: vi.fn(() => [activeKeyboardSelection]),
                setSelections: vi.fn(),
            } as any,
            refSelectionsRenderService: undefined,
            sheetSkeletonManagerService: {
                getSkeleton: vi.fn(() => ({})),
            } as any,
            themeService: { getColorFromTheme: vi.fn((key: string) => key === 'white' ? '#fff' : key) } as any,
            univerInstanceService: { getUnit: vi.fn(() => workbook) } as any,
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
            currentWorkbook: workbook as any,
            refSelections: [
                { token: 'A1', themeColor: '#ff0000', refIndex: 0, startIndex: 0, endIndex: 1, index: 0 },
            ],
            editor: undefined,
            refSelectionsService: {
                getCurrentSelections: vi.fn(() => [{ primary: { actualRow: 9, actualColumn: 9 } }]),
                setSelections: vi.fn(),
            } as any,
            refSelectionsRenderService: undefined,
            sheetSkeletonManagerService: {
                getSkeleton: vi.fn(() => ({})),
            } as any,
            themeService: { getColorFromTheme: vi.fn((key: string) => key === 'white' ? '#fff' : key) } as any,
            univerInstanceService: { getUnit: vi.fn(() => workbook) } as any,
        });

        expect(result?.[0].primary).toBeUndefined();
    });

    it('clears highlight selections when the workbook or active sheet is unavailable', () => {
        const refSelectionsService = {
            getCurrentSelections: vi.fn(() => []),
            setSelections: vi.fn(),
        };

        expect(calcHighlightRanges({
            unitId: 'missing',
            subUnitId: 'sheet1',
            currentWorkbook: { getUnitId: () => 'unit1' } as any,
            refSelections: [{ token: 'A1', themeColor: '#ff0000', refIndex: 0, startIndex: 0, endIndex: 1, index: 0 }],
            editor: undefined,
            refSelectionsService: refSelectionsService as any,
            refSelectionsRenderService: undefined,
            sheetSkeletonManagerService: undefined,
            themeService: { getColorFromTheme: vi.fn(() => '#fff') } as any,
            univerInstanceService: { getUnit: vi.fn(() => null) } as any,
        })).toBeUndefined();
        expect(refSelectionsService.setSelections).toHaveBeenCalledWith([]);
    });
});
