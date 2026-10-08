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

import type { Dependency, ICellData, IDocumentBody } from '@univerjs/core';
import {
    BooleanNumber,
    CellValueType,
    CommandService,
    ConfigService,
    DesktopLogService,
    Direction,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentDataModel,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_INPUT_FORMULA,
    FOCUSING_FX_BAR_EDITOR,
    FormulaType,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Styles,
    Tools,
    UndoCommandId,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, DocStateChangeManagerService, DocStateEmitService, InsertTextCommand, RichTextEditingMutation } from '@univerjs/docs';
import { DocSelectionRenderService, IEditorService, InnerPasteCommand, MoveCursorOperation, MoveSelectionOperation, SetDocInputStyleCommand, VIEWPORT_KEY } from '@univerjs/docs-ui';
import { FunctionService, IFunctionService, LexerTreeBuilder } from '@univerjs/engine-formula';
import { DeviceInputEventType, IRenderManagerService, NORMAL_TEXT_SELECTION_PLUGIN_STYLE } from '@univerjs/engine-render';
import { SetRangeValuesCommand, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { KeyCode } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MoveSelectionCommand, MoveSelectionEnterAndTabCommand } from '../../../commands/commands/set-selection.command';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { ICellEditorManagerService } from '../../../services/editor/cell-editor-manager.service';
import { SheetCellEditorResizeService } from '../../../services/editor/cell-editor-resize.service';
import { EditingRenderController, emptyBody, getCellDataByInput, getComparableCellData } from '../editing.render-controller';
import { createTestBed } from './create-test-bed';

const injectors: Injector[] = [];
afterEach(() => {
    injectors.splice(0).forEach((injector) => injector.dispose());
});

describe('imported formula metadata when editing', () => {
    it.each([BooleanNumber.FALSE, BooleanNumber.TRUE])('clears copied metadata on edits and keeps unchanged formulas (fd=%s)', (fd) => {
        const testBed = createTestBed(undefined, [[LexerTreeBuilder], [IFunctionService, { useClass: FunctionService }]]);
        try {
            const localeService = testBed.get(LocaleService);
            localeService.setLocale(LocaleType.EN_US);
            const previous: ICellData = { f: '=SUM(A1:A3)', ft: FormulaType.ARRAY, fd, v: 6 };
            const parseInput = (input: string, cell: ICellData) => getCellDataByInput(
                cell,
                { id: 'editor', body: { dataStream: `${input}\r\n` }, documentStyle: {} },
                testBed.get(LexerTreeBuilder),
                localeService,
                testBed.get(IFunctionService),
                testBed.sheet.getStyles()
            );
            for (const input of ['=2+2', 'plain text', '']) {
                expect(parseInput(input, { ...previous })).toMatchObject({ ft: null, fd: null });
            }
            const unchanged = { ...previous };
            expect(parseInput(previous.f!, unchanged)).toBeNull();
            expect(unchanged).toMatchObject({ f: previous.f, ft: previous.ft, fd });
        } finally {
            testBed.univer.dispose();
        }
    });
});

describe('cell editor commit comparison', () => {
    const unchanged: Array<{ name: string; previous: ICellData; incoming: ICellData }> = [
        { name: 'ordinary text after draft Undo', previous: { v: 'Committed', t: CellValueType.STRING }, incoming: { v: 'Committed' } },
        { name: 'number text', previous: { v: 42, t: CellValueType.NUMBER }, incoming: { v: '42' } },
        { name: 'zero', previous: { v: 0, t: CellValueType.NUMBER }, incoming: { v: '0' } },
        { name: 'true', previous: { v: 1, t: CellValueType.BOOLEAN }, incoming: { v: 'TRUE' } },
        { name: 'false', previous: { v: 0, t: CellValueType.BOOLEAN }, incoming: { v: 'FALSE' } },
        { name: 'forced text', previous: { v: '001', t: CellValueType.FORCE_STRING }, incoming: { v: '001', t: CellValueType.FORCE_STRING } },
        { name: 'inherited text format', previous: { v: '001', t: CellValueType.STRING, s: 'text' }, incoming: { v: '001', s: 'text' } },
        { name: 'resolved equivalent style', previous: { v: 'Styled', t: CellValueType.STRING, s: 'blue' }, incoming: { v: 'Styled', s: { cl: { rgb: '#0000ff' } } } },
    ];

    it.each(unchanged)('recognizes unchanged $name without mutating the input or styles', ({ previous, incoming }) => {
        const styles = new Styles({ text: { n: { pattern: '@' } }, blue: { cl: { rgb: '#0000ff' } } });
        const previousBefore = Tools.deepClone(previous);
        const incomingBefore = Tools.deepClone(incoming);
        expect(getComparableCellData(incoming, styles, previous)).toEqual(getComparableCellData(previous, styles, previous));
        expect(previous).toEqual(previousBefore);
        expect(incoming).toEqual(incomingBefore);
        expect(styles.get('text')).toEqual({ n: { pattern: '@' } });
        expect(styles.get('blue')).toEqual({ cl: { rgb: '#0000ff' } });
    });

    const changed: Array<{ name: string; previous: ICellData; incoming: ICellData }> = [
        { name: 'actual text edit', previous: { v: 'old', t: CellValueType.STRING }, incoming: { v: 'new' } },
        { name: 'numeric conversion from text', previous: { v: '001', t: CellValueType.STRING }, incoming: { v: '001' } },
        { name: 'removing forced text', previous: { v: '001', t: CellValueType.FORCE_STRING }, incoming: { v: '001' } },
        { name: 'boolean conversion', previous: { v: 'TRUE', t: CellValueType.STRING }, incoming: { v: 'TRUE' } },
        { name: 'format-only edit', previous: { v: 'same', t: CellValueType.STRING, s: { bl: 0 } }, incoming: { v: 'same', s: { bl: 1 } } },
        { name: 'formula replacement', previous: { v: 2, t: CellValueType.NUMBER, f: '=1+1' }, incoming: { v: null, f: '=1+2' } },
    ];

    it.each(changed)('preserves a meaningful $name', ({ previous, incoming }) => {
        const styles = new Styles();
        expect(getComparableCellData(incoming, styles, previous)).not.toEqual(getComparableCellData(previous, styles, previous));
    });
});

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

function createController(initialDataStream = 'new value\r\n', isPercentFormat = false, isInArrayFormulaRange = false) {
    const worksheet = {
        getSheetId: vi.fn(() => 'sheet-1'),
        getCellRaw: vi.fn(() => ({ v: 'old' })),
        getComposedCellStyleWithoutSelf: vi.fn(() => ({})),
    };
    const styles = new Styles();
    const workbook = {
        getUnitId: vi.fn(() => 'unit-1'),
        getActiveSheet: vi.fn(() => worksheet),
        getSheetBySheetId: vi.fn(() => worksheet),
        getStyles: vi.fn(() => styles),
    };
    const injector = new Injector();
    injectors.push(injector);
    const normalSnapshot = {
        id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        body: { dataStream: initialDataStream, paragraphs: [...initialDataStream.matchAll(/\r/g)].map((match) => ({ startIndex: match.index, paragraphId: `normal-${match.index}` })) },
        documentStyle: {},
    };
    const formulaSnapshot = {
        id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
        body: { dataStream: initialDataStream, paragraphs: [...initialDataStream.matchAll(/\r/g)].map((match) => ({ startIndex: match.index, paragraphId: `formula-${match.index}` })) },
        documentStyle: {},
    };
    const docModel = injector.createInstance(DocumentDataModel, normalSnapshot);
    const formulaDocModel = injector.createInstance(DocumentDataModel, formulaSnapshot);
    const documentModel = {
        getBody: vi.fn((): IDocumentBody => ({ dataStream: 'new value\r\n' })),
        getSnapshot: vi.fn(() => ({
            body: { dataStream: 'new value\r\n' },
            documentStyle: {},
        })),
    };
    const formulaBarEditor = {
        setSelectionRanges: vi.fn(),
        blur: vi.fn(),
    };
    const functionService = { getDescriptions: vi.fn(() => ({})) };
    const undoRedoService = {
        rollback: vi.fn(),
        clearUndoRedo: vi.fn(),
    };
    const docStateChangeManagerService = {
        clearHistory: vi.fn(),
    };
    const contextService = {
        setContextValue: vi.fn(),
        getContextValue: vi.fn(() => false),
    };
    const cellEditorManagerService = { setState: vi.fn(), focus$: new Subject<boolean>() };
    const sheetCellEditorResizeService = {
        fitTextSize: vi.fn((callback?: () => void) => callback?.()),
    };
    const editorService = {
        isSheetEditor: vi.fn(() => true),
        getEditor: vi.fn((editorId: string) => editorId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY ? formulaBarEditor : null),
    };
    const editorBridgeService = {
        currentEditCellState$: new Subject(),
        visible$: new Subject(),
        getEditCellState: vi.fn(() => ({
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            row: 2,
            column: 3,
            documentLayoutObject: { documentModel },
            isInArrayFormulaRange,
            isPercentFormat,
        })),
        getEditLocation: vi.fn(() => ({
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            row: 2,
            column: 3,
            documentLayoutObject: { documentModel },
            isInArrayFormulaRange,
            isPercentFormat,
        })),
        getCurrentEditorId: vi.fn(() => DOCS_NORMAL_EDITOR_UNIT_ID_KEY),
        isVisible: vi.fn(() => ({ visible: true, eventType: DeviceInputEventType.Keyboard, unitId: 'unit-1' })),
        getEditorDirty: vi.fn(() => true),
        isForceKeepVisible: vi.fn(() => false),
        disableForceKeepVisible: vi.fn(),
        refreshEditCellState: vi.fn(),
        refreshEditCellPosition: vi.fn(),
        changeEditorDirty: vi.fn(),
    };
    const sheetInterceptorService = {
        onWriteCell: vi.fn((_workbook, _worksheet, _row, _column, cellData) => cellData),
        onValidateCell: vi.fn(() => true),
    };
    const univerInstanceService = {
        getCurrentTypeOfUnit$: vi.fn((type) => new BehaviorSubject(type === UniverInstanceType.UNIVER_DOC ? docModel : workbook)),
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
    const workbookSelections = {
        getCurrentLastSelection: vi.fn(() => ({ range: { startRow: 1, startColumn: 1, endRow: 4, endColumn: 4 } })),
        getSelectionsOfWorksheet: vi.fn(() => [{ range: { startRow: 2, startColumn: 3, endRow: 2, endColumn: 3 } }]),
    };
    const selectionManagerService = {
        getWorkbookSelections: vi.fn(() => workbookSelections),
    };
    const skeleton = { calculate: vi.fn(), resetInitialWidth: vi.fn() };
    const viewModel = { reset: vi.fn() };
    const renderManagerService = {
        getRenderUnitById: vi.fn(() => ({
            components: new Map(),
            mainComponent: {
                makeDirty: vi.fn(),
                onPointerDown$: { subscribeEvent: vi.fn(() => ({ dispose: vi.fn() })) },
            },
            scene: {
                getViewport: vi.fn((key) => key === VIEWPORT_KEY.VIEW_MAIN
                    ? { scrollToViewportPos: vi.fn() }
                    : null),
                resetCursor: vi.fn(),
            },
            with: vi.fn(() => ({ getSkeleton: () => skeleton, getViewModel: () => viewModel, cancelPointerSelection: vi.fn() })),
        })),
    };
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([LocaleService]);
    injector.get(LocaleService).setLocale(LocaleType.EN_US);
    injector.add([LexerTreeBuilder]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocStateEmitService]);
    for (const dependency of [
        [IUndoRedoService, { useValue: undoRedoService }],
        [IContextService, { useValue: contextService }],
        [IRenderManagerService, { useValue: renderManagerService }],
        [IEditorBridgeService, { useValue: editorBridgeService }],
        [ICellEditorManagerService, { useValue: cellEditorManagerService }],
        [IFunctionService, { useValue: functionService }],
        [IEditorService, { useValue: editorService }],
        [IUniverInstanceService, { useValue: univerInstanceService }],
        [SheetInterceptorService, { useValue: sheetInterceptorService }],
        [SheetCellEditorResizeService, { useValue: sheetCellEditorResizeService }],
        [SheetsSelectionsService, { useValue: selectionManagerService }],
        [DocStateChangeManagerService, { useValue: docStateChangeManagerService }],
    ] as Dependency[]) {
        injector.add(dependency);
    }
    const commandService = injector.get(ICommandService);
    commandService.registerCommand(InsertTextCommand);
    commandService.registerCommand(InnerPasteCommand);
    commandService.registerCommand(RichTextEditingMutation);
    const syncExecuteCommand = commandService.syncExecuteCommand.bind(commandService);
    vi.spyOn(commandService, 'syncExecuteCommand').mockImplementation((id, params, options) =>
        commandService.hasCommand(id) ? syncExecuteCommand(id, params, options) : true as never
    );
    vi.spyOn(commandService, 'executeCommand').mockResolvedValue(true as never);
    const selectionManager = injector.get(DocSelectionManagerService);
    vi.spyOn(selectionManager, 'replaceDocRanges');
    vi.spyOn(selectionManager, 'refreshSelection');
    // The render boundary publishes the resolved selection back to the logical selection manager.
    selectionManager.refreshSelection$.subscribe((selection) => {
        if (selection) {
            selectionManager.replaceSelectionInfoWithoutRefresh({
                textRanges: selection.docRanges.map(({ startOffset, endOffset }) => ({
                    startOffset: startOffset!,
                    endOffset: endOffset!,
                    collapsed: startOffset === endOffset,
                    isActive: true,
                })),
                rectRanges: [],
                segmentId: '',
                segmentPage: -1,
                isEditing: selection.isEditing,
                style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            }, selection);
        }
    });
    injector.add([EditingRenderController]);
    const controller = injector.get(EditingRenderController) as any;
    controller._editingUnit = 'unit-1';

    return {
        controller,
        commandService,
        selectionManager,
        docModel,
        docStateEmitService: injector.get(DocStateEmitService),
        formulaBarEditor,
        documentModel,
        getFormulaSnapshot: () => formulaDocModel.getSnapshot(),
        getNormalSnapshot: () => docModel.getSnapshot(),
        workbook,
        worksheet,
    };
}

describe('EditingRenderController business methods', () => {
    it.each([
        { content: 'hello world', percent: false, offset: 5, scale: 1, expected: 'hello! world' },
        { content: 'hello world', percent: false, offset: 5, scale: 2, expected: 'hello! world' },
        { content: '25%', percent: true, offset: 1, scale: 1, expected: '2!5%' },
        { content: '=SUM(A1:A3)', percent: false, offset: 4, scale: 1, expected: '=SUM!(A1:A3)' },
        { content: 'hello\rworld', percent: false, offset: 7, scale: 1, expected: 'hello\rw!orld' },
    ])('inserts text at the double-click position in "$content" after layout (scale=$scale)', ({ content, percent, offset, scale, expected }) => {
        const { controller, commandService, docModel, selectionManager } = createController(`${content}\r\n`, percent);
        const visible = {
            visible: true,
            eventType: DeviceInputEventType.Dblclick,
            unitId: 'unit-1',
            pointerPosition: { x: 100 + 45 * scale, y: 200 + 30 * scale },
        };
        controller._editorBridgeService.isVisible.mockReturnValue(visible);
        controller._sheetCellEditorResizeService.fitTextSize.mockImplementation(() => undefined);
        const render = controller._renderManagerService.getRenderUnitById(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        const setCursorManually = vi.fn(() => selectionManager.replaceDocRanges([
            { startOffset: offset, endOffset: offset, collapsed: true },
        ], { unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY, subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY }));
        render.engine = { width: 300, height: 100, getCanvasElement: () => ({ getBoundingClientRect: () => ({ left: 100, top: 200, width: 300 * scale, height: 100 * scale }) }) };
        const originalWith = render.with;
        render.with = (token: unknown) => token === DocSelectionRenderService ? { setCursorManually } : originalWith(token);
        controller._renderManagerService.getRenderUnitById.mockReturnValue(render);

        controller._editorBridgeService.visible$.next(visible);
        controller._sheetCellEditorResizeService.fitTextSize.mock.calls.at(-1)[0]();
        commandService.syncExecuteCommand(InsertTextCommand.id, {
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            body: { dataStream: '!' },
            range: selectionManager.getActiveTextRange(),
        });

        expect(docModel.getBody()?.dataStream).toBe(`${expected}\r\n`);
        expect(setCursorManually).toHaveBeenCalledWith(45, 30, true, true, { strict: false });
    });

    it('bypasses parsing, interceptors, and commands when the editor is clean', async () => {
        const { controller, worksheet } = createController();
        controller._editorBridgeService.getEditorDirty.mockReturnValue(false);

        const result = await controller._submitEdit({
            body: { dataStream: 'canonical display value\r\n' },
            documentStyle: {},
        });

        expect(result).toBe(true);
        expect(worksheet.getCellRaw).not.toHaveBeenCalled();
        expect(controller._sheetInterceptorService.onWriteCell).not.toHaveBeenCalled();
        expect(controller._commandService.syncExecuteCommand).not.toHaveBeenCalled();
    });

    it('reuses an empty cell style for the next editor input', () => {
        const { controller, documentModel } = createController();
        documentModel.getBody.mockReturnValue({
            dataStream: '\r\n',
            textRuns: [{ st: 0, ed: 0, ts: { fs: 20, cl: { rgb: '#f05252' } } }],
        });

        controller._cacheEmptyCellTextStyle();

        expect(controller._commandService.syncExecuteCommand).toHaveBeenCalledWith(SetDocInputStyleCommand.id, {
            style: {
                fs: 20,
                cl: { rgb: '#f05252' },
            },
        });
    });

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

    it('captures rich-text cell data independently from the reusable editor snapshot', async () => {
        const { controller } = createController();
        const snapshot = {
            body: {
                dataStream: 'rich text\r\n',
                textRuns: [{ st: 5, ed: 9, ts: { bl: 1 } }],
            },
            documentStyle: {},
        };

        await controller._submitEdit(snapshot);
        const submitted = controller._commandService.syncExecuteCommand.mock.calls
            .find(([id]: [string]) => id === SetRangeValuesCommand.id)?.[1];
        snapshot.body.textRuns = [];

        expect(submitted?.value.p).not.toBe(snapshot);
        expect(submitted?.value.p?.body?.textRuns).toEqual([{ st: 5, ed: 9, ts: { bl: 1 } }]);
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

    it.each([
        ['Enter', KeyCode.ENTER, Direction.UP],
        ['Tab', KeyCode.TAB, Direction.LEFT],
    ])('moves the sheet selection in reverse after finishing edit with Shift+%s', async (_name, keycode, direction) => {
        const { controller } = createController();
        controller._editorBridgeService.getEditorDirty.mockReturnValue(false);

        await controller._handleEditorInvisible({
            visible: false,
            eventType: DeviceInputEventType.Keyboard,
            unitId: 'unit-1',
            keycode,
            isShift: true,
        });

        expect(controller._commandService.executeCommand).toHaveBeenCalledWith(MoveSelectionEnterAndTabCommand.id, {
            keycode,
            direction,
        });
    });

    it('refreshes editor content when Esc cancels editing', async () => {
        const { controller } = createController();

        await controller._handleEditorInvisible({
            visible: false,
            eventType: DeviceInputEventType.Keyboard,
            unitId: 'unit-1',
            keycode: KeyCode.ESC,
        });

        expect(controller._editorBridgeService.refreshEditCellState).toHaveBeenCalledTimes(1);
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

        expect(getNormalSnapshot().body?.dataStream).toBe('\r\n');
        expect(getFormulaSnapshot().body?.dataStream).toBe('\r\n');
        expect(controller._textSelectionManagerService.replaceDocRanges).toHaveBeenCalledWith(
            [{ startOffset: 0, endOffset: 0 }],
            {
                unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            }
        );
        expect(controller._editorBridgeService.changeEditorDirty).not.toHaveBeenCalled();
    });

    it.each(['3', '35', '0.35', '35%'])('preserves the percent suffix when input starts with a digit: %s', (initialValue) => {
        const { controller, getFormulaSnapshot, getNormalSnapshot } = createController('25%\r\n', true);

        controller._handleEditorVisible({
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            keycode: KeyCode.Digit3,
            initialValue,
            unitId: 'unit-1',
        });

        expect(getNormalSnapshot().body?.dataStream).toBe('25%\r\n');
        expect(getFormulaSnapshot().body?.dataStream).toBe('25%\r\n');
        expect(controller._textSelectionManagerService.replaceDocRanges).toHaveBeenCalledWith(
            [{ startOffset: 0, endOffset: 2, collapsed: false }],
            {
                unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            }
        );
    });

    it.each(['$30', '=1', 'text', '+', '-', '.', ','])('replaces percent content when input does not start with a digit: %s', (initialValue) => {
        const { controller, getNormalSnapshot } = createController('25%\r\n', true);

        controller._handleEditorVisible({
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            keycode: KeyCode.Digit3,
            initialValue,
            unitId: 'unit-1',
        });

        expect(getNormalSnapshot().body?.dataStream).toBe('\r\n');
    });

    it.each([KeyCode.BACKSPACE, KeyCode.DELETE])('keeps full-clear behavior for keycode %s', (keycode) => {
        const { controller, getNormalSnapshot } = createController('25%\r\n', true);

        controller._handleEditorVisible({
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            keycode,
            unitId: 'unit-1',
        });

        expect(getNormalSnapshot().body?.dataStream).toBe('\r\n');
    });

    it.each([
        { eventType: DeviceInputEventType.PointerDown },
        { eventType: DeviceInputEventType.Dblclick },
        { eventType: DeviceInputEventType.Keyboard, keycode: KeyCode.F2 },
    ])('opens an empty editor for inherited spill formulas (event=$eventType, key=$keycode)', (event) => {
        const { controller, getNormalSnapshot, getFormulaSnapshot } = createController('=A1:B10\r\n', false, true);

        controller._handleEditorVisible({ visible: true, unitId: 'unit-1', ...event });

        expect(getNormalSnapshot().body?.dataStream).toBe('\r\n');
        expect(getFormulaSnapshot().body?.dataStream).toBe('\r\n');
        expect(controller._editorBridgeService.changeEditorDirty).toHaveBeenCalledTimes(
            event.eventType === DeviceInputEventType.Dblclick ? 1 : 0
        );
    });

    it('cancels the inherited formula pointer anchor before clearing the formula bar', () => {
        const { controller, selectionManager, getFormulaSnapshot } = createController('=A1:B10\r\n', false, true);
        const cancelPointerSelection = vi.fn(() => {
            expect(getFormulaSnapshot().body?.dataStream).toBe('=A1:B10\r\n');
        });
        const render = controller._renderManagerService.getRenderUnitById(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
        const formulaSkeleton = render.with(DocSkeletonManagerService).getSkeleton();
        formulaSkeleton.calculate.mockImplementation(() => {
            expect(getFormulaSnapshot().body?.dataStream).toBe('\r\n');
        });
        const originalWith = render.with;
        render.with = vi.fn((service) => service === DocSelectionRenderService
            ? { cancelPointerSelection }
            : originalWith(service));
        const originalGetRender = controller._renderManagerService.getRenderUnitById;
        const cellRender = originalGetRender(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        const cancelCellPointerSelection = vi.fn();
        const originalCellWith = cellRender.with;
        cellRender.with = vi.fn((service) => service === DocSelectionRenderService
            ? { cancelPointerSelection: cancelCellPointerSelection }
            : originalCellWith(service));
        controller._renderManagerService.getRenderUnitById.mockImplementation((id: string) =>
            id === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY ? render : cellRender
        );
        controller._contextService.getContextValue.mockImplementation((key: string) => key === FOCUSING_FX_BAR_EDITOR);

        controller._handleEditorVisible({
            visible: true,
            unitId: 'unit-1',
            eventType: DeviceInputEventType.PointerDown,
        });

        expect(cancelPointerSelection).toHaveBeenCalledOnce();
        expect(formulaSkeleton.calculate).toHaveBeenCalledOnce();
        expect(cancelCellPointerSelection).not.toHaveBeenCalled();
        expect(selectionManager.getDocRanges({
            unitId: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            subUnitId: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
        })).toEqual([expect.objectContaining({ startOffset: 0, endOffset: 0, collapsed: true, isActive: true })]);
        expect(getFormulaSnapshot().body?.dataStream).toBe('\r\n');
        expect(controller._editorBridgeService.changeEditorDirty).not.toHaveBeenCalled();
    });

    it('keeps full-clear behavior for array formula cells', () => {
        const { controller, getNormalSnapshot } = createController('25%\r\n', true, true);

        controller._handleEditorVisible({
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            keycode: KeyCode.Digit3,
            initialValue: '3',
            unitId: 'unit-1',
        });

        expect(getNormalSnapshot().body?.dataStream).toBe('\r\n');
    });

    it.each([
        { content: '25%', percent: true, input: '3', expected: '253%' },
        { content: '25%', percent: true, input: '7%', expected: '257%' },
        { content: '-12.5%', percent: true, input: '3', expected: '-12.53%' },
        { content: 'hello world', percent: false, input: '3', expected: 'hello world3' },
        { content: '=SUM(A1:A3)', percent: false, input: '+1', expected: '=SUM(A1:A3)+1' },
        { content: '=1/4', percent: true, input: '+1', expected: '=1/4+1' },
        { content: '=25%', percent: true, input: '+1', expected: '=25%+1' },
        { content: 'hello\rworld', percent: false, input: '3', expected: 'hello\rworld3' },
        { content: '25%', percent: false, input: '3', expected: '25%3' },
        { content: '', percent: false, input: '3', expected: '3' },
    ])('keeps an insertion caret for "$content" when editing starts without a pointer position', ({ content, percent, input, expected }) => {
        const { controller, commandService, docModel, selectionManager } = createController(`${content}\r\n`, percent);

        controller._editorBridgeService.visible$.next({
            visible: true,
            eventType: DeviceInputEventType.Dblclick,
            unitId: 'unit-1',
        });
        commandService.syncExecuteCommand(InsertTextCommand.id, {
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            body: { dataStream: input },
            range: selectionManager.getActiveTextRange(),
        });

        expect(docModel.getBody()?.dataStream).toBe(`${expected}\r\n`);
    });

    it.each([
        { content: '25%', percent: true, input: '3', expected: '253%' },
        { content: 'hello', percent: false, input: '3', expected: 'hello3' },
        { content: '=25%', percent: true, input: '+1', expected: '=25%+1' },
    ])('keeps the insertion caret for F2 editing of "$content"', ({ content, percent, input, expected }) => {
        const { controller, commandService, docModel, selectionManager } = createController(`${content}\r\n`, percent);

        controller._editorBridgeService.visible$.next({
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            keycode: KeyCode.F2,
            unitId: 'unit-1',
        });
        commandService.syncExecuteCommand(InsertTextCommand.id, {
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            body: { dataStream: input },
            range: selectionManager.getActiveTextRange(),
        });

        expect(docModel.getBody()?.dataStream).toBe(`${expected}\r\n`);
    });

    it.each([
        { content: '25%', percent: true, input: '7%', expected: '257%' },
        { content: '25%', percent: true, input: '7', expected: '257%' },
        { content: '=25%', percent: true, input: '+30%', expected: '=25%+30%' },
        { content: '25%', percent: false, input: '7%', expected: '25%7%' },
    ])('pastes "$input" at the insertion caret in "$content" (percent=$percent)', ({ content, percent, input, expected }) => {
        const { controller, commandService, docModel } = createController(`${content}\r\n`, percent);
        controller._editorBridgeService.visible$.next({
            visible: true,
            eventType: DeviceInputEventType.Dblclick,
            unitId: 'unit-1',
        });

        commandService.syncExecuteCommand(InnerPasteCommand.id, {
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            segmentId: '',
            doc: { body: { dataStream: input } },
            textRanges: [{ startOffset: input.length, endOffset: input.length, collapsed: true }],
        });

        expect(docModel.getBody()?.dataStream).toBe(`${expected}\r\n`);
    });

    it.each([
        { eventType: DeviceInputEventType.Dblclick, percent: false, expected: 'hello3' },
        { eventType: DeviceInputEventType.Dblclick, percent: true, expected: '253%' },
        { eventType: DeviceInputEventType.Keyboard, percent: false, expected: 'hello3' },
        { eventType: DeviceInputEventType.Keyboard, percent: true, expected: '253%' },
    ])('preserves the host Docs selection when opening an embedded cell editor ($eventType, percent=$percent)', ({ eventType, percent, expected }) => {
        const { controller, commandService, docModel, selectionManager } = createController(percent ? '25%\r\n' : 'hello\r\n', percent);
        const host = { unitId: 'host-doc', subUnitId: 'host-doc' };
        const hostRange = { startOffset: 4, endOffset: 8, collapsed: false, isActive: true };
        selectionManager.__TEST_ONLY_setCurrentSelection(host);
        selectionManager.__TEST_ONLY_add([hostRange]);

        controller._editorBridgeService.visible$.next({
            visible: true,
            eventType,
            keycode: KeyCode.F2,
            unitId: 'unit-1',
        });

        commandService.syncExecuteCommand(InsertTextCommand.id, {
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            body: { dataStream: '3' },
            range: selectionManager.getTextRanges({
                unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            })?.find((range) => range.isActive),
        });
        expect(docModel.getBody()?.dataStream).toBe(`${expected}\r\n`);
        expect(selectionManager.getTextRanges(host)).toEqual([hostRange]);
    });

    it('restores the insertion caret after undoing a percentage paste inside the editor', () => {
        const { controller, commandService, docModel, docStateEmitService, selectionManager } = createController('25%\r\n', true);
        const emit = vi.spyOn(docStateEmitService, 'emitStateChangeInfo');
        controller._editorBridgeService.visible$.next({
            visible: true,
            eventType: DeviceInputEventType.Dblclick,
            unitId: 'unit-1',
        });
        commandService.syncExecuteCommand(InnerPasteCommand.id, {
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            segmentId: '',
            doc: { body: { dataStream: '7%' } },
            textRanges: [{ startOffset: 2, endOffset: 2, collapsed: true }],
        });
        const { undoState } = emit.mock.calls[0][0];
        commandService.syncExecuteCommand(RichTextEditingMutation.id, {
            ...undoState,
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            trigger: UndoCommandId,
        });
        commandService.syncExecuteCommand(InsertTextCommand.id, {
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            body: { dataStream: '3' },
            range: selectionManager.getActiveTextRange(),
        });

        expect(docModel.getBody()?.dataStream).toBe('253%\r\n');
    });

    it('keeps one percent suffix when typing a complete percentage after double click', () => {
        const { controller, commandService, docModel, selectionManager } = createController('25%\r\n', true);
        controller._editorBridgeService.visible$.next({
            visible: true,
            eventType: DeviceInputEventType.Dblclick,
            unitId: 'unit-1',
        });
        for (const input of ['3', '%']) {
            commandService.syncExecuteCommand(InsertTextCommand.id, {
                unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                body: { dataStream: input },
                range: selectionManager.getActiveTextRange(),
            });
        }
        expect(docModel.getBody()?.dataStream).toBe('253%\r\n');
    });

    it('inserts percent operators inside a formula without overtyping an existing operator', () => {
        const { controller, commandService, docModel, selectionManager } = createController('=25%\r\n', true);
        controller._editorBridgeService.visible$.next({
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            keycode: KeyCode.F2,
            unitId: 'unit-1',
        });
        selectionManager.replaceDocRanges([{ startOffset: 3, endOffset: 3, collapsed: true }], {
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        });
        commandService.syncExecuteCommand(InsertTextCommand.id, {
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            body: { dataStream: '%' },
            range: selectionManager.getActiveTextRange(),
        });

        expect(docModel.getBody()?.dataStream).toBe('=25%%\r\n');
    });

    it.each([
        { content: '25%', input: '3', expected: '3%' },
        { content: '25%', input: '35%', expected: '35%' },
        { content: '=25%', input: '3', expected: '3%' },
        { content: '=25%', input: '35%', expected: '35%' },
    ])('replaces "$content" on initial digit input "$input" despite the stale input range', ({ content, input, expected }) => {
        const { controller, commandService, docModel } = createController(`${content}\r\n`, true);
        const visible = {
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            initialValue: input,
            unitId: 'unit-1',
        };
        controller._editorBridgeService.getEditorDirty.mockReturnValue(false);
        controller._editorBridgeService.isVisible.mockReturnValue(visible);
        controller._editorBridgeService.visible$.next(visible);

        commandService.syncExecuteCommand(InsertTextCommand.id, {
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            body: { dataStream: input },
            range: { startOffset: 0, endOffset: 0, collapsed: true },
        });

        expect(docModel.getBody()?.dataStream).toBe(`${expected}\r\n`);
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
        controller._renderManagerService.getRenderUnitById.mockImplementation((unitId: string) => ({
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
