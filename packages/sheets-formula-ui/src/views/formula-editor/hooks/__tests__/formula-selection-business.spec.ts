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

import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, toDisposable } from '@univerjs/core';
import { sequenceNodeType } from '@univerjs/engine-formula';
import { describe, expect, it, vi } from 'vitest';
import {
    FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE,
    FORMULA_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE,
    isEventTargetInSameFormulaEmbedInteractionBoundary,
    registerFormulaEditorRuntimePortal,
} from '../../formula-embed-integration.service';
import { focusFormulaEditor, hasActiveFormulaEmbedInteraction, shouldRefocusFormulaEditorOnMouseUp, shouldSkipFormulaEditorMouseUpFocus } from '../use-focus';
import { FormulaSelectingType, resolveFormulaSelectingIntent, resolveFormulaSelectionCursorIndex, resolveFormulaSelectionDataStream, resolveFormulaSelectionWorkbook, shouldSkipReferenceEditingByPointer } from '../use-formula-selection';
import { buildTextRuns, calcHighlightRanges, createFormulaHighlightBody, getFormulaHighlightDataStream } from '../use-highlight';
import { isFormulaEditorInteractionOwner, shouldMoveFormulaSelectionFromCurrentSelection } from '../use-left-and-right-arrow';
import { createSelectionChangeDuplicateEndGuard, createSelectionChangeHandler, getInitialFormulaReferenceSelectionCount, getLastFormulaSelection, getSelectionsForFormulaRefUpdate, getSequenceNodeCharAtOffset, getSharedSelectionChangeDuplicateEndGuard, insertFormulaReferenceText, isFormulaReferenceAddingContext, isFormulaReferenceAddingTextContext, isSameFormulaSelection, prepareSelectionChangeContext, replaceFormulaControlSelection, shouldSkipFormulaReferenceUpdate } from '../use-sheet-selection-change';

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
    it('does not rewrite editor selections while doc pointer selection is in progress', () => {
        const editorService = {
            focus: vi.fn(),
        };
        const editor = {
            getEditorId: vi.fn(() => 'editor-1'),
            getSelectionRanges: vi.fn(() => [{ startOffset: 1, endOffset: 1, collapsed: true }]),
            setSelectionRanges: vi.fn(),
            getDocumentData: vi.fn(() => ({ body: { dataStream: 'abc\r\n' } })),
            docSelectionRenderService: {
                isOnPointerEvent: true,
            },
        };

        focusFormulaEditor(editorService as never, editor as never);

        expect(editorService.focus).toHaveBeenCalledWith('editor-1');
        expect(editor.setSelectionRanges).not.toHaveBeenCalled();
    });

    it('keeps formula editor mouse-up refocus available when the editor canvas handled the pointer interaction', () => {
        const canvas = document.createElement('canvas');
        canvas.dataset.uComp = 'render-canvas';
        const button = document.createElement('button');

        expect(shouldSkipFormulaEditorMouseUpFocus(canvas)).toBe(false);
        expect(shouldSkipFormulaEditorMouseUpFocus(button)).toBe(false);
    });

    it('does not refocus the formula editor on mouse-up when the editor is already focused', () => {
        const canvas = document.createElement('canvas');
        canvas.dataset.uComp = 'render-canvas';

        expect(shouldRefocusFormulaEditorOnMouseUp({
            target: canvas,
            isFocusing: true,
            isPointerSelecting: false,
        })).toBe(false);
    });

    it('does not refocus the formula editor while pointer text selection is active', () => {
        const canvas = document.createElement('canvas');
        canvas.dataset.uComp = 'render-canvas';

        expect(shouldRefocusFormulaEditorOnMouseUp({
            target: canvas,
            isFocusing: false,
            isPointerSelecting: true,
        })).toBe(false);
    });

    it('refocuses the formula editor on mouse-up only when focus was lost and no pointer selection is active', () => {
        const canvas = document.createElement('canvas');
        canvas.dataset.uComp = 'render-canvas';

        expect(shouldRefocusFormulaEditorOnMouseUp({
            target: canvas,
            isFocusing: false,
            isPointerSelecting: false,
        })).toBe(true);
    });

    it('treats sheet range selection inside the same embed owner as an active formula interaction', () => {
        const block = document.createElement('div');
        const editorHost = document.createElement('div');
        const sheetCanvas = document.createElement('canvas');
        block.setAttribute('data-embed-interaction-boundary-owner', 'embed-1');
        block.append(editorHost, sheetCanvas);
        document.body.appendChild(block);

        sheetCanvas.tabIndex = -1;
        sheetCanvas.focus();

        expect(isEventTargetInSameFormulaEmbedInteractionBoundary(editorHost, sheetCanvas)).toBe(true);
        expect(hasActiveFormulaEmbedInteraction(editorHost)).toBe(true);

        block.remove();
    });

    it('registers formula editor portal elements as embedded child editors', () => {
        const editorId = DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY;
        const portalRoot = document.createElement('div');
        const editorElement = document.createElement('div');
        portalRoot.id = `univer-doc-selection-container-${editorId}`;
        editorElement.id = `__editor_${editorId}`;
        portalRoot.appendChild(editorElement);
        document.body.appendChild(portalRoot);

        const registeredFocusElements = new Set<Element>();
        const registeredBoundaryElements = new Set<Element>();
        const focusCoordinator = {
            resolveRuntimeScopeByChildUnitId: () => undefined,
            acquireLease: () => toDisposable(() => {}),
            registerElement: ({ element, role }: { element: HTMLElement; role: string }) => {
                registeredFocusElements.add(element);
                element.setAttribute(FORMULA_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, role);
                return toDisposable(() => {
                    registeredFocusElements.delete(element);
                    element.removeAttribute(FORMULA_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
                });
            },
        };
        const interactionBoundaryService = {
            registerOwnedElement: (embedId: string, element: Element) => {
                registeredBoundaryElements.add(element);
                element.setAttribute(FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, embedId);
                return toDisposable(() => {
                    registeredBoundaryElements.delete(element);
                    element.removeAttribute(FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
                });
            },
        };
        const disposable = registerFormulaEditorRuntimePortal({
            embedId: 'embed-1',
            editorId,
            interactionBoundaryService,
            focusCoordinator,
        });

        expect(portalRoot.getAttribute(FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(editorElement.getAttribute(FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(portalRoot.getAttribute(FORMULA_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(editorElement.getAttribute(FORMULA_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(registeredBoundaryElements.has(editorElement)).toBe(true);
        expect(registeredFocusElements.has(editorElement)).toBe(true);

        disposable.dispose();

        expect(portalRoot.hasAttribute(FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        expect(editorElement.hasAttribute(FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        portalRoot.remove();
    });

    it('only skips reference editing when pointer-origin editing is still disabled and click editing is allowed', () => {
        expect(shouldSkipReferenceEditingByPointer(true)).toBe(true);
        expect(shouldSkipReferenceEditingByPointer(true, true)).toBe(false);
        expect(shouldSkipReferenceEditingByPointer(false)).toBe(false);
    });

    it('falls back to the formula editor workbook when the focused current workbook is unavailable', () => {
        const fallbackWorkbook = { unitId: 'embedded-sheet' };

        expect(resolveFormulaSelectionWorkbook(undefined, fallbackWorkbook)).toBe(fallbackWorkbook);
        expect(resolveFormulaSelectionWorkbook(null, fallbackWorkbook)).toBe(fallbackWorkbook);
        expect(resolveFormulaSelectionWorkbook({ unitId: 'current-sheet' }, fallbackWorkbook)).toEqual({ unitId: 'current-sheet' });
    });

    it('treats the hidden normal editor as the fx bar owner while the fx bar owns formula selection', () => {
        expect(isFormulaEditorInteractionOwner(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, {
            fxBarFocused: true,
        })).toBe(true);
    });

    it('does not let the hidden normal editor own the fx bar outside an fx formula selection session', () => {
        expect(isFormulaEditorInteractionOwner(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, {
            fxBarFocused: false,
        })).toBe(false);
    });

    it('reads formula selection text from the formula editor instead of the current host document', () => {
        const accessor = {
            get: vi.fn(() => ({
                getCurrentUniverDocInstance: vi.fn(() => ({
                    getBody: () => ({ dataStream: 'host document text\r\n' }),
                })),
            })),
        };
        const editor = {
            getDocumentData: vi.fn(() => ({
                body: {
                    dataStream: '=SUM(\r\n',
                },
            })),
        };

        expect(resolveFormulaSelectionDataStream(accessor as never, editor as never)).toEqual({
            dataStream: '=SUM(\r\n',
            offset: 0,
        });
    });

    it('reads formula selection text from the editor unit before falling back to the current host document', () => {
        const accessor = {
            get: vi.fn(() => ({
                getUnit: vi.fn((unitId: string) => unitId === 'formula-editor'
                    ? { getBody: () => ({ dataStream: '=A1\r\n' }) }
                    : undefined),
                getCurrentUniverDocInstance: vi.fn(() => ({
                    getBody: () => ({ dataStream: 'host document text\r\n' }),
                })),
            })),
        };

        expect(resolveFormulaSelectionDataStream(accessor as never, undefined, 'formula-editor')).toEqual({
            dataStream: '=A1\r\n',
            offset: 0,
        });
    });

    it('uses the end of a fresh formula when the editor selection offset is still stale', () => {
        expect(resolveFormulaSelectionCursorIndex({ collapsed: true, startOffset: 0 }, '=')).toBe(1);
        expect(resolveFormulaSelectionCursorIndex({ collapsed: true, startOffset: 0 }, '=SUM(')).toBe(5);
        expect(resolveFormulaSelectionCursorIndex({ collapsed: true, startOffset: 0 }, 'plain')).toBe(0);
        expect(resolveFormulaSelectionCursorIndex({ collapsed: true, startOffset: 2 }, '=A1')).toBe(2);
    });

    it('prefers adding a new formula reference when the cursor is after a delimiter', () => {
        expect(resolveFormulaSelectingIntent(true, true)).toBe(FormulaSelectingType.NEED_ADD);
        expect(resolveFormulaSelectingIntent(true, false)).toBe(FormulaSelectingType.NEED_ADD);
        expect(resolveFormulaSelectingIntent(false, true)).toBe(FormulaSelectingType.CAN_EDIT);
        expect(resolveFormulaSelectingIntent(false, false)).toBe(FormulaSelectingType.NOT_SELECT);
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

    it('starts the first keyboard-added formula reference from the edited cell selection', () => {
        expect(shouldMoveFormulaSelectionFromCurrentSelection(FormulaSelectingType.NEED_ADD, 0)).toBe(true);
    });

    it('routes formula editor interactions only to the focused formula editor', () => {
        expect(isFormulaEditorInteractionOwner('__INTERNAL_EDITOR__DOCS_NORMAL', '__INTERNAL_EDITOR__DOCS_NORMAL')).toBe(true);
        expect(isFormulaEditorInteractionOwner('__INTERNAL_EDITOR__DOCS_FORMULA_BAR', '__INTERNAL_EDITOR__DOCS_NORMAL')).toBe(false);
        expect(isFormulaEditorInteractionOwner(null, '__INTERNAL_EDITOR__DOCS_NORMAL')).toBe(false);
    });

    it('continues keyboard-added formula references from the last reference selection after a delimiter', () => {
        expect(shouldMoveFormulaSelectionFromCurrentSelection(FormulaSelectingType.NEED_ADD, 1)).toBe(false);
        expect(shouldMoveFormulaSelectionFromCurrentSelection(FormulaSelectingType.NEED_ADD, 2)).toBe(false);
    });

    it('keeps cross-sheet reference editing anchored to the current sheet selection', () => {
        expect(shouldMoveFormulaSelectionFromCurrentSelection(FormulaSelectingType.EDIT_OTHER_SHEET_REFERENCE, 1)).toBe(true);
        expect(shouldMoveFormulaSelectionFromCurrentSelection(FormulaSelectingType.CAN_EDIT, 1)).toBe(false);
    });

    it('recognizes delimiter-adjacent formula context as a new reference insertion point', () => {
        const nodes = [
            { token: 'M28', nodeType: sequenceNodeType.REFERENCE },
            ',',
        ];

        expect(getSequenceNodeCharAtOffset(nodes, 3)).toBe('8');
        expect(getSequenceNodeCharAtOffset(nodes, 4)).toBe(',');
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

describe('formula highlight helpers', () => {
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

    it('preserves incomplete formula editor text while applying token highlights', () => {
        expect(getFormulaHighlightDataStream('=', [
            'SUM(',
            { token: 'D37', nodeType: sequenceNodeType.REFERENCE, startIndex: 4, endIndex: 6 },
            ',',
            { token: 'F40', nodeType: sequenceNodeType.REFERENCE, startIndex: 8, endIndex: 10 },
        ], 'SUM(D37,F40,J36,J42')).toBe('=SUM(D37,F40,J36,J42\r\n');
    });

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

    it('returns empty highlight selections when the workbook or active sheet is unavailable', () => {
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
        })).toEqual([]);
        expect(refSelectionsService.setSelections).not.toHaveBeenCalled();
    });
});
