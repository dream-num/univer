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

import type { DocumentDataModel, ICommand, IDocumentBody, IMutationInfo, Nullable } from '@univerjs/core';
import type { IAddHyperLinkMutationParams } from '../mutations/add-hyper-link.mutation';
import { BuildTextUtils, CellValueType, CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, sequenceExecute, TextX, Tools, UniverInstanceType } from '@univerjs/core';
import { deleteCustomRangeFactory } from '@univerjs/docs';
import { getSheetCommandTarget, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import { HyperLinkModel } from '../../models/hyper-link.model';
import { AddHyperLinkMutation } from '../mutations/add-hyper-link.mutation';
import { RemoveHyperLinkMutation } from '../mutations/remove-hyper-link.mutation';

export interface ICancelHyperLinkCommandParams {
    unitId: string;
    subUnitId: string;
    /**
     * id of link
     */
    id: string;
    row: number;
    column: number;
}

export const CancelHyperLinkCommand: ICommand<ICancelHyperLinkCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.cancel-hyper-link',

    // eslint-disable-next-line max-lines-per-function
    handler(accessor, params) {
        if (!params) return false;

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const instanceSrv = accessor.get(IUniverInstanceService);
        const hyperLinkModel = accessor.get(HyperLinkModel);

        const target = getSheetCommandTarget(instanceSrv, params);
        if (!target) return false;

        const { row, column, id } = params;
        const { unitId, subUnitId, worksheet } = target;

        const cellData = worksheet.getCell(row, column);
        if (!cellData) return false;

        const doc = worksheet.getCellDocumentModelWithFormula(cellData);
        if (!doc?.documentModel) return false;

        const snapshot = Tools.deepClone(doc.documentModel!.getSnapshot());
        const range = snapshot.body?.customRanges?.find((range) => `${range.rangeId}` === id);
        if (!range) return false;

        const textX = BuildTextUtils.customRange.delete({ documentDataModel: doc.documentModel, rangeId: range.rangeId });
        if (!textX) return false;

        const newBody = TextX.apply(snapshot.body!, textX.serialize());
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const setRangeParams = {
            unitId,
            subUnitId,
            cellValue: {
                [row]: {
                    [column]: {
                        p: {
                            ...snapshot,
                            body: newBody,
                        },
                        t: CellValueType.STRING,
                    },
                },
            },
        };

        redos.push({
            id: SetRangeValuesMutation.id,
            params: setRangeParams,
        });

        const undoParams = SetRangeValuesUndoMutationFactory(accessor, setRangeParams);

        undos.push({
            id: SetRangeValuesMutation.id,
            params: undoParams,
        });

        const link = hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, column);
        if (link) {
            redos.push({
                id: RemoveHyperLinkMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    id,
                },
            });
            undos.push({
                id: AddHyperLinkMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    link: {
                        ...link,
                    },
                } as IAddHyperLinkMutationParams,
            });
        }

        const res = sequenceExecute(redos, commandService).result;

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

export interface ICancelRichHyperLinkCommandParams extends ICancelHyperLinkCommandParams {
    /**
     * document id
     */
    documentId: string;
}

export const CancelRichHyperLinkCommand: ICommand<ICancelRichHyperLinkCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.cancel-rich-hyper-link',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { id: linkId, documentId } = params;
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const doc = univerInstanceService.getUnit<DocumentDataModel>(documentId, UniverInstanceType.UNIVER_DOC);
        const link = doc?.getBody()?.customRanges?.find((i) => i.rangeId === linkId);
        let insert: Nullable<IDocumentBody> = null;
        if (link && link.endIndex === doc!.getBody()!.dataStream.length - 3) {
            insert = {
                dataStream: ' ',
            };
        }
        const doMutation = deleteCustomRangeFactory(accessor, { unitId: documentId, rangeId: linkId, insert });
        if (!doMutation) {
            return false;
        }

        return commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    },
};
