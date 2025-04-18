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

/* eslint-disable max-lines-per-function */

import type { DocumentDataModel, ICellData, ICommandInfo, IDisposable, IDocumentBody, IDocumentData, IDocumentStyle, IMutationInfo, IStyleData, Nullable, Styles, Workbook } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ISetRangeValuesCommandParams, MutationsAffectRange } from '@univerjs/sheets';

import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import {
    CellValueType,
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    Direction,
    Disposable,
    DisposableCollection,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_BUT_HIDDEN,
    FOCUSING_EDITOR_INPUT_FORMULA,
    FOCUSING_EDITOR_STANDALONE,
    FOCUSING_FX_BAR_EDITOR,
    generateRandomId,
    ICommandService,
    IContextService,
    Inject,
    isFormulaString,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    toDisposable,
    Tools,
    UniverInstanceType,
    WrapStrategy,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    DocSkeletonManagerService,
    RichTextEditingMutation,
} from '@univerjs/docs';
import { VIEWPORT_KEY as DOC_VIEWPORT_KEY, DocSelectionRenderService, IEditorService, MoveCursorOperation, MoveSelectionOperation, ReplaceSnapshotCommand } from '@univerjs/docs-ui';
import { IFunctionService, LexerTreeBuilder, matchToken } from '@univerjs/engine-formula';
import { isTextFormat } from '@univerjs/engine-numfmt';

import {
    convertTextRotation,
    DeviceInputEventType,
    IRenderManagerService,
} from '@univerjs/engine-render';

import { adjustRangeOnMutation, COMMAND_LISTENER_SKELETON_CHANGE, InsertColMutation, InsertRowMutation, MoveColsMutation, MoveRowsMutation, REF_SELECTIONS_ENABLED, RemoveColMutation, RemoveRowMutation, SetRangeValuesCommand, SetSelectionsOperation, SetWorksheetActivateCommand, SetWorksheetActiveOperation, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import { distinctUntilChanged, filter } from 'rxjs';
import { getEditorObject } from '../../basics/editor/get-editor-object';
import { MoveSelectionCommand, MoveSelectionEnterAndTabCommand } from '../../commands/commands/set-selection.command';
import { SetCellEditVisibleArrowOperation, SetCellEditVisibleOperation, SetCellEditVisibleWithF2Operation } from '../../commands/operations/cell-edit.operation';
import { ScrollToRangeOperation } from '../../commands/operations/scroll-to-range.operation';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';
import { SheetCellEditorResizeService } from '../../services/editor/cell-editor-resize.service';
import { EditorBridgeRenderController } from '../render-controllers/editor-bridge.render-controller';
import { MOVE_SELECTION_KEYCODE_LIST } from '../shortcuts/editor.shortcut';
import { extractStringFromForceString, isForceString } from '../utils/cell-tools';
import { normalizeString } from '../utils/char-tools';
import { isRangeSelector } from './utils/is-range-selector';

const HIDDEN_EDITOR_POSITION = -1000;

enum CursorChange {
    InitialState,
    StartEditor,
    CursorChange,
}

export class EditingRenderController extends Disposable {
    /**
     * It is used to distinguish whether the user has actively moved the cursor in the editor, mainly through mouse clicks.
     */
    private _cursorChange: CursorChange = CursorChange.InitialState;

    /** If the corresponding unit is active and prepared for editing. */
    private _editingUnit = '';

    _cursorTimeout: NodeJS.Timeout;

    constructor(
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService,
        @IContextService private readonly _contextService: IContextService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @ICellEditorManagerService private readonly _cellEditorManagerService: ICellEditorManagerService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IFunctionService private readonly _functionService: IFunctionService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) protected readonly _localService: LocaleService,
        @IEditorService private readonly _editorService: IEditorService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetCellEditorResizeService) private readonly _sheetCellEditorResizeService: SheetCellEditorResizeService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService
    ) {
        super();

        // EditingRenderController is per unit. It should only handle keyboard events when the unit is
        // the current of its type.

        this.disposeWithMe(this._init());
        this._initEditorVisibilityListener();
    }

    override dispose(): void {
        super.dispose();
    }

    private get _workbookSelections() {
        return this._selectionManagerService.getWorkbookSelections(this._editingUnit);
    }

    private _init(): IDisposable {
        const d = new DisposableCollection();
        this._subscribeToCurrentCell(d);
        this._initialCursorSync(d);
        this._listenEditorFocus(d);
        this._commandExecutedListener(d);
        this._initSkeletonListener(d);

        // RenderManagerService._disposeItem will calls EditingRenderController.dispose before unitDisposed$.subscribe,so that the timer won't be cleared
        d.add(() => {
            clearTimeout(this._cursorTimeout);
        });

        // FIXME: this problem is the same with slide. Should be fixed when refactoring editor.
        this._cursorTimeout = setTimeout(() => {
            this._cursorStateListener(d);
        }, 1000);

        return d;
    }

    private _initEditorVisibilityListener(): void {
        this.disposeWithMe(this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe(async (unit) => {
            if (this._editingUnit && unit?.getUnitId() !== this._editingUnit && !this._editorBridgeService.isForceKeepVisible()) {
                this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, {
                    visible: false,
                    eventType: DeviceInputEventType.Keyboard,
                    keycode: KeyCode.ESC,
                    unitId: this._editingUnit,
                });
                const editorBridgeRenderController = this._renderManagerService.getRenderById(unit!.getUnitId())?.with(EditorBridgeRenderController);
                if (editorBridgeRenderController) {
                    editorBridgeRenderController.refreshEditorPosition();
                }
            }
        }));

        this.disposeWithMe(
            this._editorBridgeService.visible$
                .pipe(distinctUntilChanged((prev, curr) => prev.visible === curr.visible))
                .subscribe(async (params) => {
                    if (params.visible) {
                        this._editingUnit = params.unitId;
                        this._handleEditorVisible(params);
                    } else if (this._editingUnit) {
                        await this._handleEditorInvisible(params);
                        this._editingUnit = '';
                    }
                })
        );
    }

    private _listenEditorFocus(d: DisposableCollection) {
        const renderConfig = this._getEditorObject();
        if (!renderConfig) return;

        d.add(renderConfig.document.onPointerDown$.subscribeEvent(() => {
            // fix https://github.com/dream-num/univer/issues/628, need to recalculate the cell editor size after
            // it acquire focus.
            if (this._editingUnit && this._editorBridgeService.isVisible()) {
                const param = this._editorBridgeService.getEditCellState();
                const editorId = this._editorBridgeService.getCurrentEditorId();

                if (!param || !editorId) {
                    return;
                }

                this._sheetCellEditorResizeService?.fitTextSize();
            }
        }));
    }

    private _initialCursorSync(d: DisposableCollection) {
        d.add(this._cellEditorManagerService.focus$.pipe(filter((f) => !!f)).subscribe(() => {
            const currentDoc = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC);
            if (!currentDoc) return;

            const docSelectionRenderManager = this._renderManagerService.getRenderById(currentDoc?.getUnitId())?.with(DocSelectionRenderService);
            if (!docSelectionRenderManager) return;

            docSelectionRenderManager.sync();
        }));
    }

    private _initSkeletonListener(d: DisposableCollection) {
        const commandList = new Set(COMMAND_LISTENER_SKELETON_CHANGE);
        commandList.delete(SetWorksheetActiveOperation.id);

        d.add(this._commandService.onCommandExecuted((commandInfo) => {
            if (!commandList.has(commandInfo.id)) {
                return;
            }
            switch (commandInfo.id) {
                case MoveRowsMutation.id:
                case MoveColsMutation.id:
                case RemoveColMutation.id:
                case RemoveRowMutation.id:
                case InsertColMutation.id:
                case InsertRowMutation.id:
                {
                    const editLocation = this._editorBridgeService.getEditLocation();
                    if (!editLocation) break;
                    const currentRange = {
                        startRow: editLocation.row,
                        startColumn: editLocation.column,
                        endRow: editLocation.row,
                        endColumn: editLocation.column,
                    };
                    const newRange = adjustRangeOnMutation(currentRange, commandInfo as IMutationInfo<MutationsAffectRange>);
                    if (!newRange) break;
                    const newRow = newRange.startRow;
                    const newColumn = newRange.startColumn;
                    this._editorBridgeService.updateEditLocation(newRow, newColumn);
                    break;
                }
            }

            this._sheetCellEditorResizeService?.resizeCellEditor(() => {
                this._textSelectionManagerService.refreshSelection({
                    unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                    subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                });
            });
        }));
    }

    /**
     * Should update current editing cell info when selection is changed.
     * @param d DisposableCollection
     */
    private _subscribeToCurrentCell(d: DisposableCollection) {
        // TODO: After the sheet dispose, recreate the sheet, the first cell edit may be unsuccessful,
        // it should be the editor initialization late, and we need to pay attention to this problem in the future.
        d.add(this._editorBridgeService.currentEditCellState$.subscribe((editCellState) => {
            if (editCellState == null || this._editorBridgeService.isForceKeepVisible()) {
                return;
            }
            const state = this._editorBridgeService.getEditCellState();
            if (state == null) {
                return;
            }

            const { position, documentLayoutObject, scaleX, editorUnitId } = state;

            if (this._contextService.getContextValue(FOCUSING_EDITOR_STANDALONE)) {
                return;
            }

            const cellDocument = this._getDocumentDataModel();
            if (cellDocument == null) return;
            const { startX, endX } = position;
            const { textRotation, wrapStrategy, documentModel } = documentLayoutObject;
            const { vertexAngle: angle } = convertTextRotation(textRotation);

            if (wrapStrategy === WrapStrategy.WRAP && angle === 0) {
                cellDocument.updateDocumentDataPageSize((endX - startX) / scaleX);
            }

            this._commandService.syncExecuteCommand(ReplaceSnapshotCommand.id, {
                unitId: editorUnitId,
                snapshot: (documentModel!.getSnapshot()),
            });

            this._contextService.setContextValue(FOCUSING_EDITOR_BUT_HIDDEN, true);
            this._textSelectionManagerService.replaceDocRanges(
                [{
                    startOffset: 0,
                    endOffset: 0,
                }],
                {
                    unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                    subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                }
            );

            const cellSelectionRenderManager = this._renderManagerService.getRenderById(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)?.with(DocSelectionRenderService);
            const formulaSelectionRenderManager = this._renderManagerService.getRenderById(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY)?.with(DocSelectionRenderService);
            if (cellSelectionRenderManager?.canFocusing || formulaSelectionRenderManager?.canFocusing) {
                this._univerInstanceService.setCurrentUnitForType(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
                cellSelectionRenderManager?.activate(
                    HIDDEN_EDITOR_POSITION,
                    HIDDEN_EDITOR_POSITION,
                    true
                );
            }
        }));
    }

    /**
     * Listen to document edits to refresh the size of the sheet editor, not for normal editor.
     */
    private _commandExecutedListener(d: DisposableCollection) {
        d.add(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id === RichTextEditingMutation.id) {
                const params = command.params as IRichTextEditingMutationParams;
                const { unitId: commandUnitId } = params;

                // Only when the sheet it attached to is focused. Maybe we should change it to the render unit sys.
                if (isRangeSelector(commandUnitId)) {
                    return;
                }

                this._editorBridgeService.changeEditorDirty(true);

                if (!this._editorBridgeService.isVisible().visible) {
                    return;
                }

                if (commandUnitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY) {
                    this._sheetCellEditorResizeService?.fitTextSize();
                }
            }
        }));

        const closeEditorOperation = [SetCellEditVisibleArrowOperation.id];
        d.add(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (closeEditorOperation.includes(command.id)) {
                const params = command.params as IEditorBridgeServiceVisibleParam & { isShift: boolean };
                const { keycode, isShift } = params;

                /**
                 * After the user enters the editor and actively moves the editor selection area with the mouse,
                 * the up, down, left, and right keys can no longer switch editing cells,
                 * but move the cursor within the editor instead.
                 */
                if (keycode != null &&
                    (this._cursorChange === CursorChange.CursorChange || this._contextService.getContextValue(FOCUSING_FX_BAR_EDITOR))
                ) {
                    this._moveInEditor(keycode, isShift);
                    return;
                }

                // TODO@Jocs: After we merging editor related controllers, this seems verbose.
                // We can directly call SetRangeValues here.
                this._commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, params);
            }

            if (command.id === SetCellEditVisibleWithF2Operation.id) {
                this._cursorChange = CursorChange.CursorChange;
            }
        }));
    }

    // You can double-click on the cell or input content by keyboard to put the cell into the edit state.
    // eslint-disable-next-line complexity
    private _handleEditorVisible(param: IEditorBridgeServiceVisibleParam) {
        const { eventType, keycode } = param;
        // Change `CursorChange` to changed status, when formula bar clicked.
        this._cursorChange =
            (eventType === DeviceInputEventType.PointerDown || eventType === DeviceInputEventType.Dblclick)
                ? CursorChange.CursorChange
                : CursorChange.StartEditor;

        const editCellState = this._editorBridgeService.getEditLocation();
        if (editCellState == null) {
            return;
        }

        this._commandService.syncExecuteCommand(ScrollToRangeOperation.id, {
            range: {
                startRow: editCellState.row,
                startColumn: editCellState.column,
                endRow: editCellState.row,
                endColumn: editCellState.column,
            },
        });

        this._editorBridgeService.refreshEditCellPosition(false);
        const { unitId, isInArrayFormulaRange = false } = editCellState;
        const editorObject = this._getEditorObject();

        if (editorObject == null) {
            return;
        }

        const { document, scene } = editorObject;

        this._contextService.setContextValue(EDITOR_ACTIVATED, true);

        const documentDataModel = this._getDocumentDataModel();
        const skeleton = this._getEditorSkeleton(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        if (!skeleton || !documentDataModel) {
            return;
        }

        this._sheetCellEditorResizeService?.fitTextSize(() => {
            const viewMain = scene.getViewport(DOC_VIEWPORT_KEY.VIEW_MAIN);
            viewMain?.scrollToViewportPos({
                viewportScrollX: Number.POSITIVE_INFINITY,
                viewportScrollY: Number.POSITIVE_INFINITY,
            });
        });

        const clearAndEdit = () => {
            this._emptyDocumentDataModel(documentDataModel.getSnapshot().documentStyle, !!isInArrayFormulaRange);
            document.makeDirty();

            // @JOCS, Why calculate here?
            if (keycode === KeyCode.BACKSPACE || eventType === DeviceInputEventType.Dblclick) {
                skeleton.calculate();
                this._editorBridgeService.changeEditorDirty(true);
            }

            this._textSelectionManagerService.replaceDocRanges(
                [{
                    startOffset: 0,
                    endOffset: 0,
                }],
                {
                    unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                    subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                }
            );
        };
        if (this._isCellImageData(documentDataModel.getSnapshot())) {
            clearAndEdit();
        } else if (eventType === DeviceInputEventType.Keyboard && keycode === KeyCode.F2) {
            // f2, continue to edit
            document.makeDirty();
            this._textSelectionManagerService.replaceDocRanges([
                {
                    startOffset: 0,
                    endOffset: 0,
                },
            ]);
            const endOffset = (documentDataModel.getBody()?.dataStream.length ?? 2) - 2;
            this._textSelectionManagerService.replaceDocRanges(
                [{
                    startOffset: endOffset,
                    endOffset,
                }],
                {
                    unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                    subUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
                }
            );
        } else if (
            // clear and edit
            eventType === DeviceInputEventType.Keyboard ||
            (eventType === DeviceInputEventType.Dblclick && isInArrayFormulaRange)
        ) {
            clearAndEdit();
        } else if (eventType === DeviceInputEventType.Dblclick) {
            if (this._contextService.getContextValue(FOCUSING_EDITOR_INPUT_FORMULA)) {
                return;
            }

            const cursor = documentDataModel.getBody()!.dataStream.length - 2 || 0;
            this._textSelectionManagerService.replaceDocRanges([
                {
                    startOffset: cursor,
                    endOffset: cursor,
                },
            ]);
        }

        this._renderManagerService.getRenderById(unitId)?.scene.resetCursor();
    }

    private _refreshCurrentSelections(sheetId: string) {
        const selections = this._workbookSelections.getSelectionsOfWorksheet(sheetId);
        if (selections) {
            this._contextService.setContextValue(REF_SELECTIONS_ENABLED, false);
            this._commandService.syncExecuteCommand(SetSelectionsOperation.id, {
                unitId: this._editingUnit,
                subUnitId: sheetId,
                selections,
            });
        }
    }

    private async _handleEditorInvisible(param: IEditorBridgeServiceVisibleParam) {
        const editCellState = this._editorBridgeService.getEditCellState();
        const documentDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        const snapshot = Tools.deepClone(documentDataModel?.getSnapshot());
        const { keycode } = param;
        this._cursorChange = CursorChange.InitialState;
        const currentUnitId = editCellState?.unitId ?? '';
        this._exitInput(param);
        if (editCellState == null) {
            return;
        }

        const workbook = this._univerInstanceService.getUnit<Workbook>(currentUnitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return;
        }
        const worksheet = workbook.getActiveSheet();
        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();

        const { unitId, sheetId } = editCellState;
        /**
         * When closing the editor, switch to the current tab of the editor.
         */
        if (workbookId === unitId && sheetId !== worksheetId) {
            // SetWorksheetActivateCommand handler uses Promise
            await this._commandService.executeCommand(SetWorksheetActivateCommand.id, {
                subUnitId: sheetId,
                unitId,
            });
        }

        // If neither the formula bar editor nor the cell editor has been edited,
        // it is considered that the content has not changed and returns directly.
        const editorIsDirty = this._editorBridgeService.getEditorDirty();
        if (editorIsDirty === false) {
            if (this._editorBridgeService.isForceKeepVisible()) {
                this._editorBridgeService.disableForceKeepVisible();
            }
            this._moveSelection(keycode, currentUnitId, worksheetId);
            return;
        }

        // Reselect the current selections, when exist cell editor by press ESC.I
        if (keycode === KeyCode.ESC) {
            if (this._editorBridgeService.isForceKeepVisible()) {
                this._editorBridgeService.disableForceKeepVisible();
            }
            this._refreshCurrentSelections(sheetId);
            return;
        }

        const isEmpty = snapshot?.body?.dataStream.length === 2;
        const isCellImage = editCellState.documentLayoutObject.documentModel
            ? this._isCellImageData(editCellState.documentLayoutObject.documentModel.getSnapshot())
            : false;

        if (snapshot && !(isEmpty && isCellImage)) {
            const res = await this._submitEdit(snapshot, keycode === (MetaKeys.CTRL_COMMAND | KeyCode.ENTER) || keycode === (MetaKeys.MAC_CTRL | KeyCode.ENTER));
            if (res === false) return; // if the submit was rejected, don't move selection
        }

        // moveSelection need to put behind of SetRangeValuesCommand, fix https://github.com/dream-num/univer/issues/1155
        this._moveSelection(keycode, currentUnitId, worksheetId);
    }

    private _getEditorObject() {
        return getEditorObject(this._editorBridgeService.getCurrentEditorId(), this._renderManagerService);
    }

    private _isCellImageData(snapshot: IDocumentData) {
        const drawingCount = snapshot.drawingsOrder?.length ?? 0;
        return drawingCount > 0;
    }

    submitCellData(documentDataModel: DocumentDataModel) {
        return this._submitEdit(documentDataModel.getSnapshot());
    }

    private async _submitEdit(snapshot: IDocumentData, wholeSelection = false) {
        const editCellState = this._editorBridgeService.getEditCellState();
        if (editCellState == null) {
            return true;
        }
        const { unitId, sheetId, row, column } = editCellState;

        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return true;
        }
        let worksheet = workbook.getActiveSheet();

        // If the target cell does not exist, there is no need to execute setRangeValue
        const setRangeValueTargetSheet = workbook.getSheetBySheetId(sheetId);
        if (!setRangeValueTargetSheet) {
            return true;
        }

        worksheet = workbook.getActiveSheet();

        // If cross-sheet operation, switch current sheet first, then const cellData
        // This should moved to after cell editor
        const cellData: Nullable<ICellData> = getCellDataByInput(
            { ...(worksheet.getCellRaw(row, column) || {}) },
            snapshot,
            this._lexerTreeBuilder,
            this._localService,
            this._functionService,
            workbook.getStyles()
        );

        if (!cellData) {
            return true;
        }

        const finalCell = this._sheetInterceptorService.onWriteCell(workbook, worksheet, row, column, cellData) as ICellData;
        if (finalCell === worksheet.getCellRaw(row, column)) {
            return true;
        }

        const range = wholeSelection
            ? this._workbookSelections.getCurrentLastSelection()?.range
            : {
                startRow: row,
                startColumn: column,
                endRow: row,
                endColumn: column,
            };

        const redoUndoId = generateRandomId(6);
        const res = this._commandService.syncExecuteCommand<ISetRangeValuesCommandParams>(SetRangeValuesCommand.id, {
            subUnitId: sheetId,
            unitId,
            range,
            value: finalCell,
            redoUndoId,
        });

        if (res) {
            const isValid = await this._sheetInterceptorService.onValidateCell(workbook, worksheet, row, column);
            if (isValid === false) {
                this._undoRedoService.rollback(redoUndoId, unitId);
                return false;
            }
        }

        return true;
    }

    private _exitInput(param: IEditorBridgeServiceVisibleParam) {
        this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);
        this._contextService.setContextValue(EDITOR_ACTIVATED, false);
        this._contextService.setContextValue(FOCUSING_EDITOR_BUT_HIDDEN, false);
        this._contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, false);
        this._cellEditorManagerService.setState({
            show: param.visible,
        });
        const editorObject = this._getEditorObject();
        editorObject?.scene.getViewport(DOC_VIEWPORT_KEY.VIEW_MAIN)?.scrollToViewportPos({
            viewportScrollX: 0,
            viewportScrollY: 0,
        });
        const editorUnitId = this._editorBridgeService.getCurrentEditorId();
        if (editorUnitId == null || !this._editorService.isSheetEditor(editorUnitId)) {
            return;
        }
        this._undoRedoService.clearUndoRedo(editorUnitId);
        this._undoRedoService.clearUndoRedo(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
    }

    private _moveSelection(keycode: KeyCode | undefined, currentUnitId: string, worksheetId: string) {
        if (keycode == null || !MOVE_SELECTION_KEYCODE_LIST.includes(keycode)) {
            this._refreshCurrentSelections(worksheetId);
            return;
        }

        let direction = Direction.LEFT;

        switch (keycode) {
            case KeyCode.ENTER:
                direction = Direction.DOWN;
                break;
            case KeyCode.TAB:
                direction = Direction.RIGHT;
                break;
            case KeyCode.ARROW_DOWN:
                direction = Direction.DOWN;
                break;
            case KeyCode.ARROW_UP:
                direction = Direction.UP;
                break;
            case KeyCode.ARROW_LEFT:
                direction = Direction.LEFT;
                break;
            case KeyCode.ARROW_RIGHT:
                direction = Direction.RIGHT;
                break;
        }
        const currentUnit = this._univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET);
        if (currentUnitId && currentUnit?.getUnitId() !== currentUnitId) {
            this._univerInstanceService.setCurrentUnitForType(currentUnitId);
        }

        if (keycode === KeyCode.ENTER || keycode === KeyCode.TAB) {
            this._commandService.executeCommand(MoveSelectionEnterAndTabCommand.id, {
                keycode,
                direction,
            });
        } else {
            this._commandService.executeCommand(MoveSelectionCommand.id, {
                direction,
            });
        }
    }

    /**
     * The user's operations follow the sequence of opening the editor and then moving the cursor.
     * The logic here predicts the user's first cursor movement behavior based on this rule
     */
    private _cursorStateListener(d: DisposableCollection) {
        const editorObject = this._getEditorObject();
        if (!editorObject?.document) return;
        const { document: documentComponent } = editorObject;

        d.add(toDisposable(documentComponent.onPointerDown$.subscribeEvent(() => {
            if (this._cursorChange === CursorChange.StartEditor) {
                this._cursorChange = CursorChange.CursorChange;
            }
        })));
    }

    // TODO: @JOCS, is it necessary to move these commands MoveSelectionOperation\MoveCursorOperation to shortcut? and use multi-commands?
    private _moveInEditor(keycode: KeyCode, isShift: boolean) {
        let direction = Direction.LEFT;
        if (keycode === KeyCode.ARROW_DOWN) {
            direction = Direction.DOWN;
        } else if (keycode === KeyCode.ARROW_UP) {
            direction = Direction.UP;
        } else if (keycode === KeyCode.ARROW_RIGHT) {
            direction = Direction.RIGHT;
        }

        if (isShift) {
            this._commandService.executeCommand(MoveSelectionOperation.id, {
                direction,
            });
        } else {
            this._commandService.executeCommand(MoveCursorOperation.id, {
                direction,
            });
        }
    }

    private _getDocumentDataModel() {
        return this._univerInstanceService.getUnit<DocumentDataModel>(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, UniverInstanceType.UNIVER_DOC);
    }

    private _getEditorSkeleton(editorId: string) {
        return this._renderManagerService.getRenderById(editorId)?.with(DocSkeletonManagerService).getSkeleton();
    }

    private _getEditorViewModel(editorId: string) {
        return this._renderManagerService.getRenderById(editorId)?.with(DocSkeletonManagerService).getViewModel();
    }

    private _getEditingUnit() {
        return this._editingUnit ? this._univerInstanceService.getUnit<Workbook>(this._editingUnit, UniverInstanceType.UNIVER_SHEET) : null;
    }

    private _emptyDocumentDataModel(documentStyle: IDocumentStyle, removeStyle: boolean) {
        const empty = (documentDataModel: DocumentDataModel, resetDocumentStyle?: boolean) => {
            const snapshot = Tools.deepClone(documentDataModel.getSnapshot());
            const documentViewModel = this._getEditorViewModel(documentDataModel.getUnitId());
            if (documentViewModel == null) {
                return;
            }

            emptyBody(snapshot.body!, removeStyle);
            if (resetDocumentStyle) {
                snapshot.documentStyle = documentStyle;
            }
            snapshot.drawings = {};
            snapshot.drawingsOrder = [];
            documentDataModel.reset(snapshot);
            documentViewModel.reset(documentDataModel);
        };

        const documentDataModel = this._getDocumentDataModel();
        documentDataModel && empty(documentDataModel, true);

        const formulaDocument = this._univerInstanceService.getUnit<DocumentDataModel>(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, UniverInstanceType.UNIVER_DOC);
        formulaDocument && empty(formulaDocument);
    }
}

// eslint-disable-next-line complexity
export function getCellDataByInput(
    cellData: ICellData,
    snapshot: Nullable<IDocumentData>,
    lexerTreeBuilder: LexerTreeBuilder,
    localeService: LocaleService,
    functionService: IFunctionService,
    styles: Styles
) {
    if (snapshot?.body == null) {
        return null;
    }
    const { body } = snapshot;
    cellData.t = undefined;

    const data = body.dataStream;
    const lastString = data.substring(data.length - 2, data.length);
    let newDataStream = lastString === DEFAULT_EMPTY_DOCUMENT_VALUE ? data.substring(0, data.length - 2) : data;

    const currentLocale = localeService.getCurrentLocale();
    newDataStream = normalizeString(newDataStream, lexerTreeBuilder, currentLocale, functionService);

    if (snapshot.drawingsOrder?.length) {
        cellData.v = '';
        cellData.f = null;
        cellData.si = null;
        cellData.p = snapshot;
        cellData.t = CellValueType.STRING;
    }
    // Text format ('@' or '@@@') has the highest priority
    else if (cellData.s && isTextFormat(styles?.get(cellData.s)?.n?.pattern)) {
        // If the style is text format ('@'or  '@@@'), the data should be set as a string.
        cellData.v = newDataStream;
        cellData.f = null;
        cellData.si = null;
        cellData.p = null;
        cellData.t = CellValueType.STRING;

        // Text format supports rich text
        if (isRichText(body) && body.dataStream !== '\r\n') {
            cellData.p = snapshot;
        }

        // If the style length in textRun.ts is equal to the content length, it should be set as the cell style
        const style = getCellStyleBySnapshot(snapshot);
        if (style) {
            cellData.s = style;
        }
    } else if (isFormulaString(newDataStream)) {
        if (cellData.f === newDataStream) {
            return null;
        }

        const bracketCount = lexerTreeBuilder.checkIfAddBracket(newDataStream);
        for (let i = 0; i < bracketCount; i++) {
            newDataStream += matchToken.CLOSE_BRACKET;
        }

        cellData.f = newDataStream;
        cellData.si = null; // Disassociate from the original formula
        cellData.v = null;
        cellData.p = null;
    } else if (isForceString(newDataStream)) {
        const v = extractStringFromForceString(newDataStream);
        cellData.v = v;
        cellData.f = null;
        cellData.si = null;
        cellData.p = null;
        cellData.t = CellValueType.FORCE_STRING;
    } else if (isRichText(body)) {
        if (body.dataStream === '\r\n') {
            cellData.v = '';
            cellData.f = null;
            cellData.si = null;
            cellData.p = null;
        } else {
            cellData.p = snapshot;
            cellData.v = null;
            cellData.f = null;
            cellData.si = null;
        }
    } else {
        // If the data is empty, the data is set to null.
        if (newDataStream === '' && cellData.v == null && cellData.p == null) {
            return null;
        }
        cellData.v = newDataStream;
        cellData.f = null;
        cellData.si = null;
        cellData.p = null;
        // If the style length in textRun.ts is equal to the content length, it should be set as the cell style
        const style = getCellStyleBySnapshot(snapshot);
        if (style) {
            cellData.s = style;
        }
    }

    return cellData;
}

export function isRichText(body: IDocumentBody): boolean {
    const { textRuns = [], paragraphs = [], customRanges, customBlocks = [] } = body;

    const bodyNoLineBreak = body.dataStream.replace(/(\r\n)+$/, '');

    // Some styles are unique to rich text. When this style appears, we consider the value to be rich text.
    const richTextStyle = ['va'];

    return (
        // This is because after editing, an inexplicable second paragraph style will appear \r\n
        textRuns.filter((ts) => ts.st < bodyNoLineBreak.length).some((textRun) => {
            const hasRichTextStyle = Boolean(textRun.ts && Object.keys(textRun.ts).some((property) => {
                return richTextStyle.includes(property);
            }));
            return hasRichTextStyle || (Object.keys(textRun.ts ?? {}).length && (textRun.ed - textRun.st < bodyNoLineBreak.length));
        }) ||
        paragraphs.some((paragraph) => paragraph.bullet) ||
        paragraphs.length >= 2 ||
        Boolean(customRanges?.length) ||
        customBlocks.length > 0
    );
}

export function getCellStyleBySnapshot(snapshot: IDocumentData): Nullable<IStyleData> {
    const { body } = snapshot;
    if (!body) return null;
    const { textRuns = [] } = body;

    let style = {};
    const bodyNoLineBreak = body.dataStream.replace('\r\n', '');
    textRuns.forEach((textRun) => {
        const { st, ed, ts } = textRun;
        if (ed - st >= bodyNoLineBreak.length) {
            style = { ...style, ...ts };
        }
    });
    if (Object.keys(style).length) {
        return style;
    }
    return null;
}

function emptyBody(body: IDocumentBody, removeStyle = false) {
    body.dataStream = DEFAULT_EMPTY_DOCUMENT_VALUE;

    if (body.textRuns != null) {
        if (body.textRuns.length === 1 && !removeStyle) {
            body.textRuns[0].st = 0;
            body.textRuns[0].ed = 1;
        } else {
            body.textRuns = undefined;
        }
    }

    if (body.paragraphs != null) {
        body.paragraphs = [
            {
                startIndex: 0,
            },
        ];
    }

    if (body.sectionBreaks != null) {
        body.sectionBreaks = undefined;
    }

    if (body.tables != null) {
        body.tables = undefined;
    }

    if (body.customRanges != null) {
        body.customRanges = undefined;
    }

    if (body.customBlocks != null) {
        body.customBlocks = undefined;
    }
}
