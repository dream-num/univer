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

import type { IDocumentBody } from '@univerjs/core';
import {
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_BUT_HIDDEN,
    FOCUSING_EDITOR_INPUT_FORMULA,
    FOCUSING_FX_BAR_EDITOR,
    LocaleType,
    UniverInstanceType,
} from '@univerjs/core';
import { MoveCursorOperation, MoveSelectionOperation, VIEWPORT_KEY } from '@univerjs/docs-ui';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import { KeyCode } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import {
    MoveSelectionCommand,
    MoveSelectionEnterAndTabCommand,
} from '../../../commands/commands/set-selection.command';
import { EditingRenderController, emptyBody } from '../editing.render-controller';

describe('emptyBody', () => {
    it('keeps an empty text-run collection initialized', () => {
        const body: IDocumentBody = { dataStream: 'value\r\n', textRuns: [] };

        emptyBody(body);

        expect(body.textRuns).toEqual([]);
    });

    it('keeps one inherited style when resetting the editor', () => {
        const body: IDocumentBody = {
            dataStream: 'value\r\n',
            textRuns: [{ st: 0, ed: 5, ts: { fs: 11 } }],
        };

        emptyBody(body);

        expect(body.textRuns).toEqual([{ st: 0, ed: 1, ts: { fs: 11 } }]);
    });

    it('removes an inherited style when style removal is requested', () => {
        const body: IDocumentBody = {
            dataStream: 'value\r\n',
            textRuns: [{ st: 0, ed: 5, ts: { fs: 11 } }],
        };

        emptyBody(body, true);

        expect(body.textRuns).toBeUndefined();
    });
});

function createController() {
    const worksheet = {
        getSheetId: vi.fn(() => 'sheet-1'),
        getCellRaw: vi.fn(() => ({ v: 'old' })),
        getComposedCellStyleWithoutSelf: vi.fn(() => ({})),
    };
    const styles = { get: vi.fn(() => undefined) };
    const workbook = {
        getUnitId: vi.fn(() => 'unit-1'),
        getActiveSheet: vi.fn(() => worksheet),
        getSheetBySheetId: vi.fn(() => worksheet),
        getStyles: vi.fn(() => styles),
    };
    let normalSnapshot = {
        body: { dataStream: 'new value\r\n', paragraphs: [{ startIndex: 9, paragraphId: 'normal-para' }] },
        documentStyle: {},
    };
    let formulaSnapshot = {
        body: { dataStream: 'new value\r\n', paragraphs: [{ startIndex: 9, paragraphId: 'formula-para' }] },
        documentStyle: {},
    };
    const docModel = {
        getUnitId: vi.fn(() => DOCS_NORMAL_EDITOR_UNIT_ID_KEY),
        getSnapshot: vi.fn(() => normalSnapshot),
        reset: vi.fn((snapshot) => {
            normalSnapshot = snapshot;
        }),
    };
    const formulaDocModel = {
        getUnitId: vi.fn(() => DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY),
        getSnapshot: vi.fn(() => formulaSnapshot),
        reset: vi.fn((snapshot) => {
            formulaSnapshot = snapshot;
        }),
    };
    const documentModel = {
        getSnapshot: vi.fn(() => ({
            body: { dataStream: 'new value\r\n' },
            documentStyle: {},
        })),
    };
    const controller = Object.create(EditingRenderController.prototype) as any;
    const formulaBarEditor = {
        setSelectionRanges: vi.fn(),
        blur: vi.fn(),
    };
    controller._editingUnit = 'unit-1';
    controller._lexerTreeBuilder = new LexerTreeBuilder();
    controller._localService = { getCurrentLocale: vi.fn(() => LocaleType.EN_US) };
    controller._functionService = { getDescriptions: vi.fn(() => ({})) };
    controller._undoRedoService = {
        rollback: vi.fn(),
        clearUndoRedo: vi.fn(),
    };
    controller._contextService = {
        setContextValue: vi.fn(),
        getContextValue: vi.fn(() => false),
    };
    controller._cellEditorManagerService = { setState: vi.fn() };
    controller._sheetCellEditorResizeService = {
        fitTextSize: vi.fn((callback?: () => void) => callback?.()),
    };
    controller._editorService = {
        isSheetEditor: vi.fn(() => true),
        getEditor: vi.fn((editorId: string) => editorId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY ? formulaBarEditor : null),
    };
    controller._editorBridgeService = {
        getEditCellState: vi.fn(() => ({
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            row: 2,
            column: 3,
            documentLayoutObject: { documentModel },
        })),
        getEditLocation: vi.fn(() => ({
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            row: 2,
            column: 3,
            documentLayoutObject: { documentModel },
        })),
        getCurrentEditorId: vi.fn(() => DOCS_NORMAL_EDITOR_UNIT_ID_KEY),
        isForceKeepVisible: vi.fn(() => false),
        disableForceKeepVisible: vi.fn(),
        refreshEditCellPosition: vi.fn(),
        changeEditorDirty: vi.fn(),
    };
    controller._sheetInterceptorService = {
        onWriteCell: vi.fn((_workbook, _worksheet, _row, _column, cellData) => cellData),
        onValidateCell: vi.fn(() => true),
    };
    controller._commandService = {
        syncExecuteCommand: vi.fn(() => true),
        executeCommand: vi.fn(),
    };
    controller._univerInstanceService = {
        getUnit: vi.fn((unitId: string) => {
            if (unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
                return docModel;
            }
            if (unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
                return formulaDocModel;
            }

            return workbook;
        }),
        getCurrentUnitOfType: vi.fn(() => workbook),
        setCurrentUnitForType: vi.fn(),
    };
    controller._textSelectionManagerService = {
        replaceDocRanges: vi.fn(),
        refreshSelection: vi.fn(),
    };
    const workbookSelections = {
        getCurrentLastSelection: vi.fn(() => ({ range: { startRow: 1, startColumn: 1, endRow: 4, endColumn: 4 } })),
        getSelectionsOfWorksheet: vi.fn(() => [{ range: { startRow: 2, startColumn: 3, endRow: 2, endColumn: 3 } }]),
    };
    controller._selectionManagerService = {
        getWorkbookSelections: vi.fn(() => workbookSelections),
    };
    controller._renderManagerService = {
        getRenderById: vi.fn(() => ({
            scene: {
                getViewport: vi.fn((key) => key === VIEWPORT_KEY.VIEW_MAIN
                    ? { scrollToViewportPos: vi.fn() }
                    : null),
                resetCursor: vi.fn(),
            },
            with: vi.fn(() => ({ resetInitialWidth: vi.fn() })),
        })),
    };
    controller._getEditorObject = vi.fn(() => ({
        document: {
            makeDirty: vi.fn(),
        },
        scene: {
            getViewport: vi.fn((key) => key === VIEWPORT_KEY.VIEW_MAIN
                ? { scrollToViewportPos: vi.fn() }
                : null),
            resetCursor: vi.fn(),
        },
    }));
    controller._getEditorSkeleton = vi.fn(() => ({ calculate: vi.fn(), resetInitialWidth: vi.fn() }));
    controller._getEditorViewModel = vi.fn(() => ({ reset: vi.fn() }));

    return {
        controller,
        docModel,
        formulaBarEditor,
        getFormulaSnapshot: () => formulaSnapshot,
        getNormalSnapshot: () => normalSnapshot,
        workbook,
        worksheet,
    };
}

describe('EditingRenderController business methods', () => {
    it('submits edited cell content and rolls back when validation rejects the value', async () => {
        const { controller } = createController();
        controller._sheetInterceptorService.onValidateCell.mockResolvedValue(false);

        const result = await controller._submitEdit({
            body: { dataStream: 'new value\r\n' },
            documentStyle: {},
        });

        expect(result).toBe(false);
        expect(controller._sheetInterceptorService.onWriteCell).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), 2, 3, {
            v: 'new value',
            f: null,
            si: null,
            p: null,
        });
        expect(controller._commandService.syncExecuteCommand).toHaveBeenCalledWith(SetRangeValuesCommand.id, expect.objectContaining({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { startRow: 2, startColumn: 3, endRow: 2, endColumn: 3 },
            value: { v: 'new value', f: null, si: null, p: null },
        }));
        expect(controller._undoRedoService.rollback).toHaveBeenCalledWith(expect.any(String), 'unit-1');
    });

    it('uses the whole current selection when committing an array edit', async () => {
        const { controller } = createController();

        await controller._submitEdit({
            body: { dataStream: 'fill\r\n' },
            documentStyle: {},
        }, true);

        expect(controller._commandService.syncExecuteCommand).toHaveBeenCalledWith(SetRangeValuesCommand.id, expect.objectContaining({
            range: { startRow: 1, startColumn: 1, endRow: 4, endColumn: 4 },
        }));
        expect(controller._undoRedoService.rollback).not.toHaveBeenCalled();
    });

    it('moves sheet selection after finishing edit and switches back to the edited workbook when needed', () => {
        const { controller } = createController();
        controller._univerInstanceService.getCurrentUnitOfType.mockReturnValue({ getUnitId: () => 'other-unit' });

        controller._moveSelection(KeyCode.ENTER, 'unit-1', 'sheet-1');
        controller._moveSelection(KeyCode.ARROW_LEFT, 'unit-1', 'sheet-1');
        controller._moveSelection(undefined, 'unit-1', 'sheet-1');

        expect(controller._univerInstanceService.setCurrentUnitForType).toHaveBeenCalledWith('unit-1');
        expect(controller._commandService.executeCommand).toHaveBeenCalledWith(MoveSelectionEnterAndTabCommand.id, {
            keycode: KeyCode.ENTER,
            direction: 2,
        });
        expect(controller._commandService.executeCommand).toHaveBeenCalledWith(MoveSelectionCommand.id, {
            direction: 3,
        });
        expect(controller._commandService.syncExecuteCommand).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            subUnitId: 'sheet-1',
        }));
    });

    it('moves the cursor inside the editor and resets editor state on exit', () => {
        const { controller, formulaBarEditor } = createController();

        controller._moveInEditor(KeyCode.ARROW_RIGHT, false);
        controller._moveInEditor(KeyCode.ARROW_UP, true);
        controller._exitInput({ visible: false });

        expect(controller._commandService.executeCommand).toHaveBeenCalledWith(MoveCursorOperation.id, { direction: 1 });
        expect(controller._commandService.executeCommand).toHaveBeenCalledWith(MoveSelectionOperation.id, { direction: 0 });
        expect(controller._contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_EDITOR_INPUT_FORMULA, false);
        expect(controller._contextService.setContextValue).toHaveBeenCalledWith(EDITOR_ACTIVATED, false);
        expect(controller._contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_EDITOR_BUT_HIDDEN, false);
        expect(controller._contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_FX_BAR_EDITOR, false);
        expect(controller._cellEditorManagerService.setState).toHaveBeenCalledWith({ show: false });
        expect(controller._undoRedoService.clearUndoRedo).toHaveBeenCalledWith(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        expect(controller._undoRedoService.clearUndoRedo).toHaveBeenCalledWith(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
        expect(formulaBarEditor.setSelectionRanges).toHaveBeenCalledWith([], false);
        expect(formulaBarEditor.blur).toHaveBeenCalled();
    });

    it('leaves initial keyboard input to the doc input pipeline when opening the cell editor', () => {
        const { controller, getFormulaSnapshot, getNormalSnapshot } = createController();

        controller._handleEditorVisible({
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            keycode: 187,
            initialValue: '=',
            unitId: 'unit-1',
        });

        expect(getNormalSnapshot().body.dataStream).toBe('\r\n');
        expect(getFormulaSnapshot().body.dataStream).toBe('\r\n');
        expect(controller._textSelectionManagerService.replaceDocRanges).toHaveBeenCalledWith(
            [{ startOffset: 0, endOffset: 0 }],
            {
                unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            }
        );
        expect(controller._editorBridgeService.changeEditorDirty).not.toHaveBeenCalled();
    });

    it('syncs the active sheet editor selection instead of the host document selection on focus', () => {
        const { controller, workbook } = createController();
        const focus$ = new Subject<boolean>();
        const hostSelectionSync = vi.fn();
        const cellEditorSelectionSync = vi.fn();
        const disposableCollection = { add: vi.fn() };

        controller._cellEditorManagerService.focus$ = focus$;
        controller._univerInstanceService.getCurrentUnitOfType.mockImplementation((type: UniverInstanceType) => {
            if (type === UniverInstanceType.UNIVER_DOC) {
                return { getUnitId: () => 'host-doc' };
            }

            return workbook;
        });
        controller._renderManagerService.getRenderById.mockImplementation((unitId: string) => ({
            with: vi.fn(() => {
                if (unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
                    return { sync: cellEditorSelectionSync };
                }
                if (unitId === 'host-doc') {
                    return { sync: hostSelectionSync };
                }

                return undefined;
            }),
        }));

        controller._initialCursorSync(disposableCollection);
        focus$.next(true);

        expect(cellEditorSelectionSync).toHaveBeenCalledTimes(1);
        expect(hostSelectionSync).not.toHaveBeenCalled();
    });
});
