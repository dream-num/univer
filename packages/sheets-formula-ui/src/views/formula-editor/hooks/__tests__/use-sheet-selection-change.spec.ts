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

import type { IRange } from '@univerjs/core';
import {
    getFormulaSequenceCharacterAtOffset,
    isFormulaReferenceAddingContext,
    isFormulaReferenceAddingTextContext,
    sequenceNodeType,
} from '@univerjs/engine-formula';
import { describe, expect, it, vi } from 'vitest';
import { FormulaSelectingType } from '../use-formula-selection';
import {
    createSelectionChangeDuplicateEndGuard,
    createSelectionChangeHandler,
    getInitialFormulaReferenceSelectionCount,
    getLastFormulaSelection,
    getSelectionsForFormulaRefUpdate,
    getSharedSelectionChangeDuplicateEndGuard,
    insertFormulaReferenceText,
    isSameFormulaSelection,
    prepareSelectionChangeContext,
    replaceFormulaControlSelection,
    shouldSkipFormulaReferenceUpdate,
} from '../use-sheet-selection-change';

describe('formula reference selection gesture boundaries', () => {
    it.each([false, true])('accepts the same reference in a new editor after the previous gesture ends: %s', (completed) => {
        const duplicateEndGuard = createSelectionChangeDuplicateEndGuard<IRange>();
        const selectedRange = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 };
        const firstChange = vi.fn();
        const first = createSelectionChangeHandler({
            initialSelectionsCount: 0,
            duplicateEndGuard,
            onSelectionsChange: firstChange,
        });
        first([selectedRange], false, { start: true });
        first(completed ? [selectedRange] : [], true);
        expect(firstChange).toHaveBeenCalledTimes(1);

        const nextChange = vi.fn();
        const commit = vi.fn();
        const next = createSelectionChangeHandler({
            initialSelectionsCount: 0,
            duplicateEndGuard,
            onSelectionsChange: nextChange,
            onDuplicateEnd: commit,
        });
        next([selectedRange], false, { start: true });
        next([selectedRange], false);
        next([selectedRange], true);

        expect(nextChange).toHaveBeenCalledExactlyOnceWith([selectedRange], false, false);
        expect(commit).toHaveBeenCalledExactlyOnceWith([selectedRange]);
    });
});

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

describe('use-sheet-selection-change regression scenarios', () => {
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

    it('previews ctrl-add selection updates before move end and ignores initial selection events', () => {
        const onSelectionsChange = vi.fn();
        const handler = createSelectionChangeHandler({
            initialSelectionsCount: 1,
            onSelectionsChange,
        });

        handler([range(0, 0)], true, { initial: true });
        handler([range(0, 0), range(1, 1)], false);
        expect(onSelectionsChange).toHaveBeenCalledWith([range(0, 0), range(1, 1)], false, true);

        handler([range(0, 0), range(1, 1)], true);
        expect(onSelectionsChange).toHaveBeenCalledTimes(1);

        handler([range(3, 3)], false);
        expect(onSelectionsChange).toHaveBeenLastCalledWith([range(3, 3)], false, false);
    });

    it('ignores replayed initial formula references when no initial reference selection exists', () => {
        const onSelectionsChange = vi.fn();
        const handler = createSelectionChangeHandler({
            initialSelectionsCount: 0,
            onSelectionsChange,
        });

        handler([range(7, 5)], true, { initial: true });

        expect(onSelectionsChange).not.toHaveBeenCalled();
    });

    it('uses the formula text end as the insertion context when the embedded editor selection is temporarily empty', () => {
        const lexerTreeBuilder = {
            sequenceNodesBuilder: vi.fn(() => []),
        };
        const editor = {
            getSelectionRanges: vi.fn(() => []),
            getDocumentData: vi.fn(() => ({ body: { dataStream: '=\r\n' } })),
        };

        expect(prepareSelectionChangeContext({
            editor: editor as never,
            lexerTreeBuilder: lexerTreeBuilder as never,
        })).toMatchObject({
            offset: 0,
            nodeIndex: -1,
            updatingRefIndex: -1,
            sequenceNodes: [],
        });
    });

    it('does not create a fallback formula context for non-formula editor text', () => {
        const lexerTreeBuilder = {
            sequenceNodesBuilder: vi.fn(() => []),
        };
        const editor = {
            getSelectionRanges: vi.fn(() => []),
            getDocumentData: vi.fn(() => ({ body: { dataStream: 'plain\r\n' } })),
        };

        expect(prepareSelectionChangeContext({
            editor: editor as never,
            lexerTreeBuilder: lexerTreeBuilder as never,
        })).toBeUndefined();
    });

    it('recognizes delimiter-adjacent formula context as a new reference insertion point', () => {
        const nodes = [
            { token: 'M28', nodeType: sequenceNodeType.REFERENCE },
            ',',
        ];

        expect(getFormulaSequenceCharacterAtOffset(nodes, 3)).toBe('8');
        expect(getFormulaSequenceCharacterAtOffset(nodes, 4)).toBe(',');
        expect(isFormulaReferenceAddingContext(nodes, 3)).toBe(false);
        expect(isFormulaReferenceAddingContext(nodes, 4)).toBe(true);
        expect(isFormulaReferenceAddingTextContext('M28,', 4)).toBe(true);
        expect(insertFormulaReferenceText('M28,', 'M27', 4)).toBe('M28,M27');
    });

    it('skips stale non-add formula selection updates when no rendered reference exists', () => {
        expect(shouldSkipFormulaReferenceUpdate(false, 0)).toBe(true);
        expect(shouldSkipFormulaReferenceUpdate(false, 1)).toBe(false);
        expect(shouldSkipFormulaReferenceUpdate(true, 0)).toBe(false);
    });

    it('applies a click-created formula reference from selection start before pointer-up controls are reset', () => {
        const onSelectionsChange = vi.fn();
        const handler = createSelectionChangeHandler({
            initialSelectionsCount: 0,
            onSelectionsChange,
        });

        handler([range(7, 5)], false);
        handler([], true);

        expect(onSelectionsChange).toHaveBeenCalledWith([range(7, 5)], false, false);
        expect(onSelectionsChange).toHaveBeenCalledTimes(1);
    });

    it('does not reapply the same click-created formula reference on selection end', () => {
        const onSelectionsChange = vi.fn();
        const handler = createSelectionChangeHandler({
            initialSelectionsCount: 0,
            onSelectionsChange,
        });

        handler([range(7, 5)], false);
        handler([range(7, 5)], true);

        expect(onSelectionsChange).toHaveBeenCalledWith([range(7, 5)], false, false);
        expect(onSelectionsChange).toHaveBeenCalledTimes(1);
    });

    it('commits duplicate selection end without reapplying formula text changes', () => {
        const onSelectionsChange = vi.fn();
        const onDuplicateEnd = vi.fn();
        const handler = createSelectionChangeHandler({
            initialSelectionsCount: 0,
            onSelectionsChange,
            onDuplicateEnd,
        });

        handler([range(7, 5)], false);
        handler([range(7, 5)], true);

        expect(onSelectionsChange).toHaveBeenCalledWith([range(7, 5)], false, false);
        expect(onSelectionsChange).toHaveBeenCalledTimes(1);
        expect(onDuplicateEnd).toHaveBeenCalledWith([range(7, 5)]);
        expect(onDuplicateEnd).toHaveBeenCalledTimes(1);
    });

    it('does not reapply the same click-created formula reference while selection is still moving', () => {
        const onSelectionsChange = vi.fn();
        const handler = createSelectionChangeHandler({
            initialSelectionsCount: 0,
            onSelectionsChange,
        });

        handler([range(7, 5)], false);
        handler([range(7, 5)], false);

        expect(onSelectionsChange).toHaveBeenCalledWith([range(7, 5)], false, false);
        expect(onSelectionsChange).toHaveBeenCalledTimes(1);
    });

    it('previews a ctrl-added formula reference before selection end', () => {
        const onSelectionsChange = vi.fn();
        const handler = createSelectionChangeHandler({
            initialSelectionsCount: 1,
            onSelectionsChange,
        });
        const existingRange = range(7, 5);
        const addedRange = range(8, 6);

        handler([existingRange, addedRange], false);

        expect(onSelectionsChange).toHaveBeenCalledWith([existingRange, addedRange], false, true);
        expect(onSelectionsChange).toHaveBeenCalledTimes(1);
    });

    it('updates a pending ctrl-added reference as the active reference while dragging', () => {
        const onSelectionsChange = vi.fn();
        const handler = createSelectionChangeHandler({
            initialSelectionsCount: 1,
            onSelectionsChange,
        });
        const existingRange = range(7, 5);
        const firstAddedRange = range(8, 6);
        const movedAddedRange = { ...range(8, 6), endRow: 10, endColumn: 8 };

        handler([existingRange, firstAddedRange], false);
        handler([existingRange, movedAddedRange], false);

        expect(onSelectionsChange).toHaveBeenNthCalledWith(1, [existingRange, firstAddedRange], false, true);
        expect(onSelectionsChange).toHaveBeenNthCalledWith(2, [existingRange, movedAddedRange], false, false);
        expect(onSelectionsChange).toHaveBeenCalledTimes(2);
    });

    it('does not append duplicate ctrl-added previews for the same range', () => {
        const onSelectionsChange = vi.fn();
        const handler = createSelectionChangeHandler({
            initialSelectionsCount: 1,
            onSelectionsChange,
        });
        const existingRange = range(7, 5);
        const addedRange = range(8, 6);

        handler([existingRange, addedRange], false);
        handler([existingRange, addedRange], false);

        expect(onSelectionsChange).toHaveBeenCalledWith([existingRange, addedRange], false, true);
        expect(onSelectionsChange).toHaveBeenCalledTimes(1);
    });

    it('keeps ordinary same-count dragging in replace mode', () => {
        const onSelectionsChange = vi.fn();
        const handler = createSelectionChangeHandler({
            initialSelectionsCount: 2,
            onSelectionsChange,
        });
        const existingRange = range(7, 5);
        const movedRange = { ...range(8, 6), endRow: 10, endColumn: 8 };

        handler([existingRange, movedRange], false);

        expect(onSelectionsChange).toHaveBeenCalledWith([existingRange, movedRange], false, false);
        expect(onSelectionsChange).toHaveBeenCalledTimes(1);
    });

    it('dedupes the same formula reference when selection end is reported by another source', () => {
        const duplicateEndGuard = createSelectionChangeDuplicateEndGuard();
        const onSelectionsChange = vi.fn();
        const handler = createSelectionChangeHandler({
            initialSelectionsCount: 0,
            duplicateEndGuard,
            onSelectionsChange,
        });
        const selectedRange = range(7, 5);
        const renderedRange = { ...selectedRange, startX: 10, endX: 20, startY: 30, endY: 40 };

        handler([renderedRange], false);
        if (!duplicateEndGuard.shouldSkip([selectedRange], true)) {
            onSelectionsChange([selectedRange], true);
        }

        expect(onSelectionsChange).toHaveBeenCalledWith([renderedRange], false, false);
        expect(onSelectionsChange).toHaveBeenCalledTimes(1);
    });

    it('matches formula selections by range identity instead of render coordinates', () => {
        expect(isSameFormulaSelection(
            { ...range(7, 5), startX: 10, endX: 20 },
            range(7, 5, 'other-sheet', 'other-unit')
        )).toBe(true);
        expect(isSameFormulaSelection(
            { ...range(7, 5), startX: 10, endX: 20 },
            range(7, 6)
        )).toBe(false);
    });

    it('shares duplicate formula selection guards across paired formula editors', () => {
        const guardFromCellEditor = getSharedSelectionChangeDuplicateEndGuard('unit1:sheet1:test');
        const guardFromFormulaBar = getSharedSelectionChangeDuplicateEndGuard('unit1:sheet1:test');

        expect(guardFromCellEditor.shouldSkip([range(7, 5)], false)).toBe(false);
        expect(guardFromFormulaBar.shouldSkip([range(7, 5)], false)).toBe(true);

        guardFromCellEditor.reset();
    });

    it('counts only rendered formula reference controls and parsed formula references as initial references', () => {
        expect(getInitialFormulaReferenceSelectionCount(0, 0)).toBe(0);
        expect(getInitialFormulaReferenceSelectionCount(0, 2)).toBe(2);
        expect(getInitialFormulaReferenceSelectionCount(1, 0)).toBe(1);
        expect(getInitialFormulaReferenceSelectionCount(1, 0, FormulaSelectingType.NEED_ADD)).toBe(1);
        expect(getInitialFormulaReferenceSelectionCount(1, 1, FormulaSelectingType.NEED_ADD)).toBe(1);
    });

    it('keeps formula control ranges scoped to the current selection unit and sheet', () => {
        const selections = [range(0, 0, 'sheet1', 'unit1')];

        expect(replaceFormulaControlSelection(selections, 0, range(2, 2, 'other-sheet', 'other-unit'))).toEqual([
            range(2, 2, 'sheet1', 'unit1'),
        ]);
    });

    it('ignores stale formula control events when the matching selection data is unavailable', () => {
        expect(replaceFormulaControlSelection([], 0, range(2, 2))).toBeUndefined();
    });

    it('returns no formula selection for empty selection events', () => {
        expect(getLastFormulaSelection([])).toBeUndefined();
        expect(getLastFormulaSelection([range(1, 1), range(2, 2)])).toEqual(range(2, 2));
    });
});
