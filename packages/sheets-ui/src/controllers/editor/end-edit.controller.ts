/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, ICommandInfo, IDocumentBody, Nullable } from '@univerjs/core';
import { CellValueType,
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    Direction,
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_BUT_HIDDEN,
    FOCUSING_EDITOR_INPUT_FORMULA,
    FOCUSING_FORMULA_EDITOR,
    ICommandService,
    IContextService,
    isFormulaString,
    IUndoRedoService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
    Tools,
} from '@univerjs/core';
import { MoveCursorOperation, MoveSelectionOperation } from '@univerjs/docs';
import { LexerTreeBuilder, matchToken } from '@univerjs/engine-formula';
import type { IDocumentLayoutObject } from '@univerjs/engine-render';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import {
    SelectionManagerService,
    SetRangeValuesCommand,
    SetSelectionsOperation,
    SetWorksheetActivateCommand,
} from '@univerjs/sheets';
import { IEditorService, KeyCode } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';

import { getEditorObject } from '../../basics/editor/get-editor-object';
import { MoveSelectionCommand, MoveSelectionEnterAndTabCommand } from '../../commands/commands/set-selection.command';
import { SetCellEditVisibleArrowOperation, SetCellEditVisibleWithF2Operation } from '../../commands/operations/cell-edit.operation';
import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';
import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { MOVE_SELECTION_KEYCODE_LIST } from '../shortcuts/editor.shortcut';
import { extractStringFromForceString, isForceString } from '../utils/cell-tools';

function isRichText(body: IDocumentBody) {
    const { textRuns = [], paragraphs = [] } = body;

    return (
        textRuns.some((textRun) => textRun.ts && !Tools.isEmptyObject(textRun.ts)) ||
        paragraphs.some((paragraph) => paragraph.bullet) ||
        paragraphs.length >= 2
    );
}

enum CursorChange {
    InitialState,
    StartEditor,
    CursorChange,
}

@OnLifecycle(LifecycleStages.Rendered, EndEditController)
export class EndEditController extends Disposable {
    private _editorVisiblePrevious = false;

    /**
     * It is used to distinguish whether the user has actively moved the cursor in the editor, mainly through mouse clicks.
     */
    private _cursorChange: CursorChange = CursorChange.InitialState;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @IContextService private readonly _contextService: IContextService,
        @ICellEditorManagerService private readonly _cellEditorManagerService: ICellEditorManagerService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IUndoRedoService private _undoRedoService: IUndoRedoService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IEditorService private _editorService: IEditorService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    private _initialize() {
        this._initialExitInput();

        this._cursorStateListener();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initialExitInput() {
        this.disposeWithMe(
            // eslint-disable-next-line max-lines-per-function
            this._editorBridgeService.visible$.subscribe(async (param) => {
                const { visible, keycode, eventType } = param;

                if (visible === this._editorVisiblePrevious) {
                    return;
                }

                this._editorVisiblePrevious = visible;

                if (visible === true) {
                    // Change `CursorChange` to changed status, when formula bar clicked.
                    this._cursorChange =
                        eventType === DeviceInputEventType.PointerDown
                            ? CursorChange.CursorChange
                            : CursorChange.StartEditor;
                    return;
                }

                this._cursorChange = CursorChange.InitialState;

                const selections = this._selectionManagerService.getSelections();
                const currentSelection = this._selectionManagerService.getCurrent();

                if (currentSelection == null) {
                    return;
                }

                const { unitId: workbookId, sheetId: worksheetId, pluginName } = currentSelection;

                this._exitInput(param);

                if (keycode === KeyCode.ESC) {
                    // Reselect the current selections, when exist cell editor by press ESC.
                    if (selections) {
                        this._commandService.syncExecuteCommand(SetSelectionsOperation.id, {
                            unitId: workbookId,
                            subUnitId: worksheetId,
                            pluginName,
                            selections,
                        });
                    }

                    return;
                }

                const editCellState = this._editorBridgeService.getEditCellState();

                if (editCellState == null) {
                    return;
                }

                const { unitId, sheetId, row, column, documentLayoutObject } = editCellState;

                // If neither the formula bar editor nor the cell editor has been edited,
                // it is considered that the content has not changed and returns directly.
                const editorIsDirty = this._editorBridgeService.getEditorDirty();
                if (editorIsDirty === false) {
                    this._moveCursor(keycode);

                    return;
                }

                const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);

                const worksheet = workbook?.getSheetBySheetId(sheetId);

                if (worksheet == null) {
                    return;
                }

                const cellData: Nullable<ICellData> = getCellDataByInput(
                    worksheet.getCellRaw(row, column) || {},
                    documentLayoutObject,
                    this._lexerTreeBuilder
                );

                if (cellData == null) {
                    this._moveCursor(keycode);

                    return;
                }

                const context = {
                    subUnitId: sheetId,
                    unitId,
                    workbook: workbook!,
                    worksheet,
                    row,
                    col: column,
                };

                /**
                 * When closing the editor, switch to the current tab of the editor.
                 */
                if (workbookId === unitId && sheetId !== worksheetId && this._editorBridgeService.isForceKeepVisible()) {
                    // SetWorksheetActivateCommand handler uses Promise
                    await this._commandService.executeCommand(SetWorksheetActivateCommand.id, {
                        subUnitId: sheetId,
                        unitId,
                    });
                }
                /**
                 * When switching tabs while the editor is open,
                 * the operation to refresh the selection will be blocked and needs to be triggered manually.
                 */
                this._selectionManagerService.refreshSelection();

                const cell = this._editorBridgeService.interceptor.fetchThroughInterceptors(
                    this._editorBridgeService.interceptor.getInterceptPoints().AFTER_CELL_EDIT
                )(cellData, context);

                const finalCell = await this._editorBridgeService.interceptor.fetchThroughInterceptors(
                    this._editorBridgeService.interceptor.getInterceptPoints().AFTER_CELL_EDIT_ASYNC
                )(Promise.resolve(cell), context);

                this._commandService.executeCommand(SetRangeValuesCommand.id, {
                    subUnitId: sheetId,
                    unitId,
                    range: {
                        startRow: row,
                        startColumn: column,
                        endRow: row,
                        endColumn: column,
                    },
                    value: finalCell,
                });

                // moveCursor need to put behind of SetRangeValuesCommand, fix https://github.com/dream-num/univer/issues/1155
                this._moveCursor(keycode);
            })
        );
    }

    private _exitInput(param: IEditorBridgeServiceVisibleParam) {
        this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);
        this._contextService.setContextValue(EDITOR_ACTIVATED, false);
        this._contextService.setContextValue(FOCUSING_EDITOR_BUT_HIDDEN, false);
        this._contextService.setContextValue(FOCUSING_FORMULA_EDITOR, false);

        this._cellEditorManagerService.setState({
            show: param.visible,
        });
        const editorUnitId = this._editorBridgeService.getCurrentEditorId();
        if (editorUnitId == null || !this._editorService.isSheetEditor(editorUnitId)) {
            return;
        }
        this._undoRedoService.clearUndoRedo(editorUnitId);
        this._undoRedoService.clearUndoRedo(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
    }

    private _moveCursor(keycode?: KeyCode) {
        if (keycode == null || !MOVE_SELECTION_KEYCODE_LIST.includes(keycode)) {
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

    private _cursorStateListener() {
        /**
         * The user's operations follow the sequence of opening the editor and then moving the cursor.
         * The logic here predicts the user's first cursor movement behavior based on this rule
         */

        const editorObject = this._getEditorObject();
        if (editorObject == null) {
            return;
        }

        const { document: documentComponent } = editorObject;

        this.disposeWithMe(
            toDisposable(
                documentComponent.pointerDown$.subscribeEvent(() => {
                    if (this._cursorChange === CursorChange.StartEditor) {
                        this._cursorChange = CursorChange.CursorChange;
                    }
                })
            )
        );
    }

    private _commandExecutedListener() {
        const updateCommandList = [SetCellEditVisibleArrowOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IEditorBridgeServiceVisibleParam & { isShift: boolean };
                    const { keycode, isShift } = params;

                    /**
                     * After the user enters the editor and actively moves the editor selection area with the mouse,
                     * the up, down, left, and right keys can no longer switch editing cells,
                     * but move the cursor within the editor instead.
                     */
                    if (keycode != null &&
                        (this._cursorChange === CursorChange.CursorChange || this._contextService.getContextValue(FOCUSING_FORMULA_EDITOR))
                    ) {
                        this._moveInEditor(keycode, isShift);
                        return;
                    }

                    this._editorBridgeService.changeVisible(params);
                }

                if (command.id === SetCellEditVisibleWithF2Operation.id) {
                    this._cursorChange = CursorChange.CursorChange;
                }
            })
        );
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

    private _getEditorObject() {
        return getEditorObject(this._editorBridgeService.getCurrentEditorId(), this._renderManagerService);
    }
}

export function getCellDataByInput(
    cellData: ICellData,
    documentLayoutObject: IDocumentLayoutObject,
    lexerTreeBuilder: LexerTreeBuilder
) {
    cellData = Tools.deepClone(cellData);

    const { documentModel } = documentLayoutObject;
    if (documentModel == null) {
        return null;
    }

    const snapshot = documentModel.getSnapshot();

    const { body } = snapshot;
    if (body == null) {
        return null;
    }

    cellData.t = undefined;

    const data = body.dataStream;
    const lastString = data.substring(data.length - 2, data.length);
    let newDataStream = lastString === DEFAULT_EMPTY_DOCUMENT_VALUE ? data.substring(0, data.length - 2) : data;

    if (isFormulaString(newDataStream)) {
        if (cellData.f === newDataStream) {
            return null;
        }
        const bracketCount = lexerTreeBuilder.checkIfAddBracket(newDataStream);
        for (let i = 0; i < bracketCount; i++) {
            newDataStream += matchToken.CLOSE_BRACKET;
        }

        cellData.f = newDataStream;
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
        if ((newDataStream === cellData.v || (newDataStream === '' && cellData.v == null)) && cellData.p == null) {
            return null;
        }
        cellData.v = newDataStream;
        cellData.f = null;
        cellData.si = null;
        cellData.p = null;
    }

    return cellData;
}
