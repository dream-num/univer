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

import type { ICellData, ICommand, IDocumentData, IMutationInfo } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { ISheetHyperLink } from '../../types/interfaces/i-hyper-link';
import { BuildTextUtils, CellValueType, CommandType, CustomRangeType, generateRandomId, ICommandService, IUndoRedoService, IUniverInstanceService, sequenceExecute, TextX, Tools } from '@univerjs/core';
import { addCustomRangeBySelectionFactory } from '@univerjs/docs';
import { getSheetCommandTarget, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory, SheetInterceptorService } from '@univerjs/sheets';
import { HyperLinkModel } from '../../models/hyper-link.model';
import { AddHyperLinkMutation } from '../mutations/add-hyper-link.mutation';
import { RemoveHyperLinkMutation } from '../mutations/remove-hyper-link.mutation';

export interface IAddHyperLinkCommandParams {
    unitId: string;
    subUnitId: string;
    link: ISheetHyperLink;
}
/**
 * Command for add hyperlink
 */
export const AddHyperLinkCommand: ICommand<IAddHyperLinkCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.add-hyper-link',

    // eslint-disable-next-line max-lines-per-function
    async handler(accessor, params) {
        if (!params) return false;

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const hyperLinkModel = accessor.get(HyperLinkModel);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId, workbook, worksheet } = target;
        const { link } = params;
        const { payload, display, row, column, id } = link;

        const cellData = worksheet.getCell(row, column);
        const doc = worksheet.getBlankCellDocumentModel(cellData);
        const snapshot = doc.documentModel!.getSnapshot();
        const body = Tools.deepClone(snapshot.body);
        if (!body) return false;

        let textX: TextX | false;
        if (display) {
            textX = BuildTextUtils.selection.replace({
                selection: {
                    startOffset: 0,
                    endOffset: body.dataStream.length - 2,
                    collapsed: body.dataStream.length - 2 === 0,
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
                ranges: [{ startOffset: 0, endOffset: body.dataStream.length - 2, collapsed: false }],
                rangeId: id,
                rangeType: CustomRangeType.HYPERLINK,
                properties: {
                    url: payload,
                    refId: id,
                },
            });
        }

        if (!textX) return false;

        const newBody = TextX.apply(body, textX.serialize());
        const rangeValue: IDocumentData = {
            ...snapshot,
            body: newBody,
        };

        const newCellData: ICellData = {
            p: rangeValue,
            t: CellValueType.STRING,
        };

        const finalCellData = sheetInterceptorService.onWriteCell(workbook, worksheet, row, column, newCellData);
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

        const res = await sequenceExecute(redos, commandService);
        if (res) {
            const isValid = await sheetInterceptorService.onValidateCell(workbook, worksheet, row, column);
            if (isValid === false) {
                sequenceExecute(undos, commandService);
                return false;
            }
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
    link: ISheetHyperLink;
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
