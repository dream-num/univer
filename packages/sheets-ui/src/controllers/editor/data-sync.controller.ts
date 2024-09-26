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

import { BooleanNumber, Disposable, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, HorizontalAlign, ICommandService, Inject, IUniverInstanceService, LifecycleStages, OnLifecycle, Tools, UniverInstanceType } from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/engine-render';
import { MoveRangeMutation, RangeProtectionRuleModel, SetRangeValuesMutation, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import type { DocumentDataModel, ICommandInfo, IDocumentBody, IParagraph, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { DocumentViewModel } from '@univerjs/engine-render';
import type { IMoveRangeMutationParams, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import type { IEditorBridgeServiceParam } from '../../services/editor-bridge.service';

@OnLifecycle(LifecycleStages.Rendered, EditorDataSyncController)
export class EditorDataSyncController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(RangeProtectionRuleModel) private readonly _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(WorksheetProtectionRuleModel) private readonly _worksheetProtectionRuleModel: WorksheetProtectionRuleModel
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._syncFormulaEditorContent();
        this._commandExecutedListener();
    }

    private _getEditorViewModel(unitId: string): Nullable<DocumentViewModel> {
        return this._renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService).getViewModel();
    }

    // Sync cell content to formula editor bar when sheet selection changed.
    private _syncFormulaEditorContent() {
        this.disposeWithMe(this._editorBridgeService.currentEditCellState$.subscribe((editCellState) => {
            if (
                editCellState == null
                || this._editorBridgeService.isForceKeepVisible()
                // If permissions are not initialized, data synchronization will not be performed.
                || !this._rangeProtectionRuleModel.getRangeRuleInitState()
                || !this._worksheetProtectionRuleModel.getSheetRuleInitState()
            ) {
                return;
            }

            this._editorSyncHandler(editCellState);
        }));
    }

    // Sync cell content to formula editor bar when sheet selection changed or visible changed.
    private _editorSyncHandler(param: IEditorBridgeServiceParam) {
        let body = Tools.deepClone(param.documentLayoutObject.documentModel?.getBody());

        if (
            !body || (
                param.isInArrayFormulaRange === true &&
                this._editorBridgeService.isVisible().eventType === DeviceInputEventType.Dblclick
            )
        ) {
            body = {
                dataStream: '\r\n',
                paragraphs: [
                    {
                        startIndex: 0,
                    },
                ],
                textRuns: [],
            };
        }

        this._syncContentAndRender(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, body);
    }

    // eslint-disable-next-line max-lines-per-function
    private _commandExecutedListener() {
        const INCLUDE_LIST = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== RichTextEditingMutation.id) {
                    return;
                }
                const params = command.params as IRichTextEditingMutationParams;
                const { unitId } = params;
                if (params.isSync) {
                    return;
                }
                if (INCLUDE_LIST.includes(unitId)) {
                    // sync cell content to formula editor bar when edit cell editor and vice verse.
                    const editorDocDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);

                    const syncId =
                        unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
                            ? DOCS_NORMAL_EDITOR_UNIT_ID_KEY
                            : DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY;

                    this._checkAndSetRenderStyleConfig(editorDocDataModel!);
                    this._syncActionsAndRender(syncId, params);
                }
            })
        );

        // this.disposeWithMe(
        //     this._commandService.onCommandExecuted((command: ICommandInfo) => {
        //         if (command.id !== SetEditorResizeOperation.id) {
        //             return;
        //         }

        //         const params = command.params as IRichTextEditingMutationParams;
        //         const { unitId } = params;

        //         if (INCLUDE_LIST.includes(unitId)) {
        //             // sync cell content to formula editor bar when edit cell editor and vice verse.
        //             const editorDocDataModel = this._univerInstanceService.getUniverDocInstance(unitId);
        //             const dataStream = editorDocDataModel?.getBody()?.dataStream;
        //             const paragraphs = editorDocDataModel?.getBody()?.paragraphs;
        //             const textRuns = editorDocDataModel?.getBody()?.textRuns;
        //             const customRanges = editorDocDataModel?.getBody()?.customRanges;

        //             const syncId =
        //                 unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
        //                     ? DOCS_NORMAL_EDITOR_UNIT_ID_KEY
        //                     : DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY;

        //             if (dataStream == null || paragraphs == null) {
        //                 return;
        //             }

        //             this._syncContentAndRender(syncId, dataStream, paragraphs, textRuns, customRanges);

        //             // handle weather need to show scroll bar.
        //             // this._autoScroll();
        //         }
        //     })
        // );

        // Update formula bar content when you call SetRangeValuesMutation and MoveRangeMutation.
        const needUpdateFormulaEditorContentCommandList = [SetRangeValuesMutation.id, MoveRangeMutation.id];
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (needUpdateFormulaEditorContentCommandList.includes(command.id)) {
                    const editCellState = this._editorBridgeService.getLatestEditCellState();

                    if (editCellState == null) {
                        return;
                    }

                    let needUpdate = false;

                    const { row, column } = editCellState;

                    if (command.id === SetRangeValuesMutation.id && command.params) {
                        const params = command.params as ISetRangeValuesMutationParams;
                        if (params.cellValue?.[row]?.[column]) {
                            needUpdate = true;
                        }
                    } else if (command.id === MoveRangeMutation.id && command.params) {
                        const params = command.params as IMoveRangeMutationParams;
                        if (params.to.value?.[row]?.[column]) {
                            needUpdate = true;
                        }
                    }

                    if (needUpdate) {
                        const body = editCellState.documentLayoutObject.documentModel?.getBody();

                        if (body == null) {
                            return;
                        }
                        this._syncContentAndRender(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, Tools.deepClone(body));
                    }
                }
            })
        );
    }

    // Sync actions between cell editor and formula editor, and make `dataStream` and `paragraph` is the same.
    private _syncActionsAndRender(
        unitId: string,
        parmas: IRichTextEditingMutationParams
    ) {
        const INCLUDE_LIST = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (currentRender == null) {
            return;
        }

        const skeleton = currentRender.with(DocSkeletonManagerService).getSkeleton();
        const docDataModel = this._univerInstanceService.getUniverDocInstance(unitId);
        const docViewModel = this._getEditorViewModel(unitId);

        if (docDataModel == null || docViewModel == null) {
            return;
        }
        // console.log('===before', Tools.deepClone(docDataModel.getBody()));
        // Update document data model.
        // docDataModel.apply(actions);
        this._commandService.syncExecuteCommand(RichTextEditingMutation.id, {
            ...parmas,
            isSync: true,
            unitId,
        });
        // console.log('===after', parmas, Tools.deepClone(docDataModel.getBody()));
        // this._checkAndSetRenderStyleConfig(docDataModel);

        docViewModel.reset(docDataModel);

        skeleton.calculate();

        if (INCLUDE_LIST.includes(unitId)) {
            currentRender.mainComponent?.makeDirty();
        }
    }

    private _syncContentAndRender(
        unitId: string,
        body: IDocumentBody
    ) {
        const INCLUDE_LIST = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];

        const skeleton = this._renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService).getSkeleton();
        const docDataModel = this._univerInstanceService.getUniverDocInstance(unitId);
        const docViewModel = this._getEditorViewModel(unitId);

        if (docDataModel == null || docViewModel == null || skeleton == null) {
            return;
        }

        docDataModel.getSnapshot().body = body;

        this._checkAndSetRenderStyleConfig(docDataModel);

        docViewModel.reset(docDataModel);

        const currentRender = this._renderManagerService.getRenderById(unitId);

        if (currentRender == null) {
            return;
        }

        skeleton.calculate();

        if (INCLUDE_LIST.includes(unitId)) {
            currentRender.mainComponent?.makeDirty();
        }
    }

    private _checkAndSetRenderStyleConfig(documentDataModel: DocumentDataModel) {
        const snapshot = documentDataModel.getSnapshot();
        const { body } = snapshot;

        if (snapshot.id !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
            return;
        }

        let renderConfig = snapshot.documentStyle.renderConfig;

        if (renderConfig == null) {
            renderConfig = {};
            snapshot.documentStyle.renderConfig = renderConfig;
        }

        if ((body?.dataStream ?? '').startsWith('=')) {
            renderConfig.isRenderStyle = BooleanNumber.TRUE;
        } else {
            renderConfig.isRenderStyle = BooleanNumber.FALSE;
        }
    }

// private normalize

    private _clearParagraph(paragraphs: IParagraph[]) {
        const newParagraphs = Tools.deepClone(paragraphs);
        for (const paragraph of newParagraphs) {
            if (paragraph.paragraphStyle) {
                paragraph.paragraphStyle.horizontalAlign = HorizontalAlign.UNSPECIFIED;
            }
        }

        return newParagraphs;
    }
}
