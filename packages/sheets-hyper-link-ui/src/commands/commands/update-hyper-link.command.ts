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

import type { DocumentDataModel, ICellData, ICommand, IMutationInfo, Workbook } from '@univerjs/core';
import type { ICellLinkContent } from '../../types/interfaces/i-hyper-link';
import { CellValueType, CommandType, CustomRangeType, DataStreamTreeTokenType, generateRandomId, getBodySlice, ICommandService, IUndoRedoService, IUniverInstanceService, sequenceExecuteAsync, TextX, Tools, UniverInstanceType } from '@univerjs/core';
import { replaceSelectionFactory } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import { IEditorBridgeService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';

export interface IUpdateHyperLinkCommandParams {
    unitId: string;
    subUnitId: string;
    id: string;
    payload: ICellLinkContent;
    row: number;
    column: number;
}

export const UpdateHyperLinkCommand: ICommand<IUpdateHyperLinkCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.update-hyper-link',
    // eslint-disable-next-line max-lines-per-function
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const editorBridgeService = accessor.get(IEditorBridgeService);

        const { unitId, subUnitId, payload: link, row, column, id } = params;
        const workbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        const currentRender = renderManagerService.getRenderById(unitId);
        if (!currentRender || !workbook) {
            return false;
        }
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        const skeletonManagerService = currentRender.with(SheetSkeletonManagerService);
        const skeleton = skeletonManagerService.getCurrent()?.skeleton;
        if (!worksheet || !skeleton) {
            return false;
        }
        const { payload, display = '' } = link;
        const cellData = worksheet.getCell(row, column);
        if (!cellData) {
            return false;
        }
        const doc = skeleton.getCellDocumentModelWithFormula(cellData);
        if (!doc?.documentModel) {
            return false;
        }
        const snapshot = doc.documentModel.getSnapshot();

        const range = snapshot.body?.customRanges?.find((range) => range.rangeId === id);
        if (!range) {
            return false;
        }

        const newId = generateRandomId();
        const oldBody = getBodySlice(doc.documentModel.getBody()!, range.startIndex, range.endIndex + 1);
        const textRun = oldBody.textRuns?.[0];
        if (textRun) {
            textRun.ed = display.length + 1;
        }

        const replaceSelection = replaceSelectionFactory(accessor, {
            unitId,
            body: {
                dataStream: `${DataStreamTreeTokenType.CUSTOM_RANGE_START}${display}${DataStreamTreeTokenType.CUSTOM_RANGE_END}`,
                customRanges: [{
                    rangeId: newId,
                    rangeType: CustomRangeType.HYPERLINK,
                    startIndex: 0,
                    endIndex: display.length + 1,
                    properties: {
                        url: payload,
                    },
                }],
                textRuns: textRun ? [textRun] : undefined,
            },
            selection: {
                startOffset: range.startIndex,
                endOffset: range.endIndex + 1,
                collapsed: false,
            },
            doc: doc.documentModel,
        });
        if (!replaceSelection) {
            return false;
        }
        const newBody = TextX.apply(Tools.deepClone(snapshot.body!), replaceSelection.textX.serialize());
        const newCellData: ICellData = {
            p: {
                ...snapshot,
                body: newBody,
            },
            t: CellValueType.STRING,
        };

        const finalCellData = await editorBridgeService.beforeSetRangeValue(workbook, worksheet, row, column, newCellData);

        const redo = {
            id: SetRangeValuesMutation.id,
            params: {
                unitId,
                subUnitId,
                cellValue: {
                    [row]: {
                        [column]: finalCellData,
                    },
                },
            },
        };
        const undoParams = SetRangeValuesUndoMutationFactory(accessor, redo.params);

        const undo = {
            id: SetRangeValuesMutation.id,
            params: undoParams,
        };
        const redos: IMutationInfo[] = [redo];
        const undos: IMutationInfo[] = [undo];

        const res = await sequenceExecuteAsync(redos, commandService);
        if (res) {
            undoRedoService.pushUndoRedo({
                redoMutations: redos,
                undoMutations: undos,
                unitID: unitId,
            });
            return true;
        }
        return false;
    },
};

export interface IUpdateRichHyperLinkCommandParams {
    documentId: string;
    id: string;
    payload: ICellLinkContent;
}

export const UpdateRichHyperLinkCommand: ICommand<IUpdateRichHyperLinkCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.update-rich-hyper-link',
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const { documentId: unitId, payload, id: rangeId } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const doc = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (!doc) {
            return false;
        }
        const range = doc.getBody()?.customRanges?.find((range) => range.rangeId === rangeId);
        if (!range) {
            return false;
        }

        const display = params.payload.display ?? '';
        const newId = generateRandomId();
        const oldBody = getBodySlice(doc.getBody()!, range.startIndex, range.endIndex + 1);
        const textRun = oldBody.textRuns?.[0];
        if (textRun) {
            textRun.ed = display.length + 1;
        }

        const replaceSelection = replaceSelectionFactory(accessor, {
            unitId,
            body: {
                dataStream: `${DataStreamTreeTokenType.CUSTOM_RANGE_START}${display}${DataStreamTreeTokenType.CUSTOM_RANGE_END}`,
                customRanges: [{
                    rangeId: newId,
                    rangeType: CustomRangeType.HYPERLINK,
                    startIndex: 0,
                    endIndex: display.length + 1,
                    properties: {
                        url: payload.payload,
                    },
                }],
                textRuns: textRun ? [textRun] : undefined,
            },
            selection: {
                startOffset: range.startIndex,
                endOffset: range.endIndex + 1,
                collapsed: false,
            },
            doc,
        });

        if (!replaceSelection) {
            return false;
        }

        return commandService.syncExecuteCommand(replaceSelection.id, replaceSelection.params);
    },
};
