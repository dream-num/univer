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

import type { ICellData, ICommand, IDocumentData, IMutationInfo, Workbook } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { BuildTextUtils, CellValueType, CommandType, CustomRangeType, generateRandomId, ICommandService, IUndoRedoService, IUniverInstanceService, sequenceExecuteAsync, TextX, Tools, UniverInstanceType } from '@univerjs/core';
import { addCustomRangeBySelectionFactory } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import { AddHyperLinkMutation, HyperLinkModel, type ICellHyperLink, RemoveHyperLinkMutation } from '@univerjs/sheets-hyper-link';
import { IEditorBridgeService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';

export interface IAddHyperLinkCommandParams {
    unitId: string;
    subUnitId: string;
    link: ICellHyperLink;
}
/**
 * Command for add hyperlink
 */
export const AddHyperLinkCommand: ICommand<IAddHyperLinkCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.add-hyper-link',

    // eslint-disable-next-line max-lines-per-function
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const hyperLinkModel = accessor.get(HyperLinkModel);
        const editorBridgeService = accessor.get(IEditorBridgeService);
        const { unitId, subUnitId, link } = params;
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
        const { payload, display, row, column, id } = link;
        const cellData = worksheet.getCell(row, column);
        const doc = skeleton.getBlankCellDocumentModel(cellData);
        const snapshot = doc.documentModel!.getSnapshot();
        const body = Tools.deepClone(snapshot.body);
        if (!body) {
            return false;
        }

        let textX: TextX | false;
        if (display) {
            textX = BuildTextUtils.selection.replace({
                selection: {
                    startOffset: 0,
                    endOffset: body.dataStream.length - 2,
                    collapsed: true,
                },
                body: {
                    dataStream: `${display}`,
                    customRanges: [{
                        startIndex: 0,
                        endIndex: display.length - 1,
                        rangeType: CustomRangeType.HYPERLINK,
                        rangeId: id,
                        properties: {
                            url: payload,
                            // refId: id,
                        },
                    }],
                },
                doc: doc.documentModel!,
            });
        } else {
            textX = BuildTextUtils.customRange.add({
                body,
                range: { startOffset: 0, endOffset: body.dataStream.length - 2, collapsed: false },
                rangeId: id,
                rangeType: CustomRangeType.HYPERLINK,
                properties: {
                    url: payload,
                    refId: id,
                },
            });
        }

        if (!textX) {
            return false;
        }

        const newBody = TextX.apply(body, textX.serialize());
        const rangeValue: IDocumentData = {
            ...snapshot,
            body: newBody,
        };

        const newCellData: ICellData = {
            p: rangeValue,
            t: CellValueType.STRING,
        };

        const finalCellData = await editorBridgeService.beforeSetRangeValue(workbook, worksheet, row, column, newCellData);

        const redoParams: ISetRangeValuesMutationParams = {
            unitId,
            subUnitId,
            cellValue: {
                [link.row]: {
                    [link.column]: finalCellData,
                },
            },
        };

        const redo: IMutationInfo = {
            id: SetRangeValuesMutation.id,
            params: redoParams,
        };
        const undoParams = SetRangeValuesUndoMutationFactory(accessor, redoParams);

        const undo: IMutationInfo = {
            id: SetRangeValuesMutation.id,
            params: undoParams,
        };
        const redos = [redo];
        const undos = [undo];
        const modelLink = hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, column);
        if (modelLink) {
            redos.push({
                id: RemoveHyperLinkMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    id: modelLink.id,
                },
            });
            undos.push({
                id: AddHyperLinkMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    link: modelLink,
                },
            });
        }

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

export interface IAddRichHyperLinkCommandParams {
    /**
     * url of link
     */
    documentId: string;
    link: ICellHyperLink;
}

export const AddRichHyperLinkCommand: ICommand<IAddRichHyperLinkCommandParams> = {
    id: 'sheets.command.add-rich-hyper-link',
    type: CommandType.COMMAND,
    handler: async (accessor, params) => {
        if (!params) {
            return false;
        }
        const { documentId, link } = params;
        const commandService = accessor.get(ICommandService);
        const newId = generateRandomId();
        const { payload } = link;

        const replaceSelection = addCustomRangeBySelectionFactory(accessor, {
            unitId: documentId,
            rangeId: newId,
            rangeType: CustomRangeType.HYPERLINK,
            properties: {
                url: payload,
                refId: newId,
            },
        });

        if (replaceSelection) {
            return commandService.syncExecuteCommand(replaceSelection.id, replaceSelection.params);
        }

        return false;
    },
};
