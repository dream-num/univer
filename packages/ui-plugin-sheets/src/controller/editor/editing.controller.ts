import { DocSkeletonManagerService, getDocObject, TextSelectionManagerService } from '@univerjs/base-docs';
import { IRenderManagerService, ITextSelectionRenderManager } from '@univerjs/base-render';
import { SetRangeValuesCommand } from '@univerjs/base-sheets';
import { KeyCode } from '@univerjs/base-ui';
import {
    Disposable,
    DocumentModel,
    ICellData,
    ICommandInfo,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subscription } from 'rxjs';

import { SetCellEditOperation } from '../../commands/operations/cell-edit.operation';
import { IEditorBridgeService, IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';

@OnLifecycle(LifecycleStages.Steady, EditingController)
export class EditingController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {
        this._onInputSubscription?.unsubscribe();
    }

    private _initialize() {
        this._initialNormalInput();
    }

    private _initialNormalInput() {}

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
                        cellData.v = body.dataStream;
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
                }
            })
        );
    }

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }
}
