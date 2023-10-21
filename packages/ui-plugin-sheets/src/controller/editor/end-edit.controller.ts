import { getDocObject } from '@univerjs/base-docs';
import { IRenderManagerService } from '@univerjs/base-render';
import { SetRangeValuesCommand } from '@univerjs/base-sheets';
import { KeyCode } from '@univerjs/base-ui';
import {
    Disposable,
    DocumentModel,
    FOCUSING_EDITOR,
    FOCUSING_EDITOR_FORMULA,
    ICellData,
    ICommandInfo,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    OnLifecycle,
} from '@univerjs/core';
import { Subscription } from 'rxjs';

import { SetCellEditOperation } from '../../commands/operations/cell-edit.operation';
import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';
import { IEditorBridgeService, IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';

@OnLifecycle(LifecycleStages.Steady, EndEditController)
export class EndEditController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    private _editorVisiblePrevious = false;

    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @IContextService private readonly _contextService: IContextService,
        @ICellEditorManagerService private readonly _cellEditorManagerService: ICellEditorManagerService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {
        this._onInputSubscription?.unsubscribe();
    }

    private _initialize() {
        this._initialExitInput();
    }

    private _initialExitInput() {
        this._editorBridgeService.visible$.subscribe((param) => {
            const { visible, keycode } = param;

            if (visible === this._editorVisiblePrevious) {
                return;
            }

            this._editorVisiblePrevious = visible;

            if (visible === true) {
                return;
            }

            this._exitInput(param);

            if (keycode === KeyCode.ESC) {
                return;
            }

            const state = this._editorBridgeService.getState();

            if (state == null) {
                return;
            }

            const { unitId, sheetId, row, column, documentLayoutObject } = state;

            if (documentLayoutObject == null) {
                return;
            }

            const workbook = this._currentUniverService.getUniverSheetInstance(unitId);

            const worksheet = workbook?.getSheetBySheetId(sheetId);

            if (worksheet == null) {
                return;
            }

            const cellData: ICellData = worksheet.getCell(row, column) || {};

            const documentModel = documentLayoutObject.documentModel as DocumentModel;

            const snapshot = documentModel.getSnapshot();

            const body = snapshot.body;

            if (body == null) {
                return;
            }

            if (body.textRuns && body.textRuns.length > 1) {
                cellData.p = snapshot;
            } else {
                const data = body.dataStream;
                const lastString = data.substring(data.length - 2, data.length);
                const newDataStream = lastString === '\r\n' ? data.substring(0, data.length - 2) : data;

                if (newDataStream === cellData.v) {
                    return;
                }

                cellData.v = newDataStream;
            }

            this._commandService.executeCommand(SetRangeValuesCommand.id, {
                worksheetId: sheetId,
                workbookId: unitId,
                range: {
                    startRow: row,
                    startColumn: column,
                    endRow: row,
                    endColumn: column,
                },
                value: cellData,
            });
        });
    }

    private _exitInput(param: IEditorBridgeServiceVisibleParam) {
        this._contextService.setContextValue(FOCUSING_EDITOR_FORMULA, false);
        this._contextService.setContextValue(FOCUSING_EDITOR, false);
        this._cellEditorManagerService.setState({
            show: param.visible,
        });
    }

    private _commandExecutedListener() {
        const updateCommandList = [SetCellEditOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IEditorBridgeServiceVisibleParam;
                    const { visible, keycode, eventType } = params;

                    if (visible === true) {
                        return;
                    }

                    if (keycode === KeyCode.ESC) {
                        return;
                    }

                    const state = this._editorBridgeService.getState();

                    if (state == null) {
                        return;
                    }

                    const { unitId } = state;

                    this._renderManagerService.getRenderById(unitId)?.mainComponent?.makeDirty();
                }
            })
        );
    }

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
