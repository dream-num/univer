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

import type { ICommand, Workbook } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, TextX, UniverInstanceType } from '@univerjs/core';
import { deleteCustomRangeFactory, deleteCustomRangeTextX } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';

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

    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const renderManagerService = accessor.get(IRenderManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const { unitId, subUnitId, row, column, id } = params;
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
        const cellData = worksheet.getCellRaw(row, column);
        if (!cellData) {
            return false;
        }
        const doc = skeleton.getCellDocumentModelWithFormula(cellData);
        if (!doc?.documentModel) {
            return false;
        }
        const snapshot = doc.documentModel!.getSnapshot();

        const range = snapshot.body?.customRanges?.find((range) => range.rangeId === id);
        if (!range) {
            return false;
        }

        const textX = deleteCustomRangeTextX(accessor, { documentDataModel: doc.documentModel, rangeId: id });

        if (!textX) {
            return false;
        }

        const newBody = TextX.apply(snapshot.body!, textX.serialize());

        const redo = {
            id: SetRangeValuesMutation.id,
            params: {
                unitId,
                subUnitId,
                cellValue: {
                    [row]: {
                        [column]: {
                            p: {
                                ...snapshot,
                                body: newBody,
                            },
                        },
                    },
                },
            },
        };
        const undoParams = SetRangeValuesUndoMutationFactory(accessor, redo.params);

        const undo = {
            id: SetRangeValuesMutation.id,
            params: undoParams,
        };

        const res = commandService.syncExecuteCommand(redo.id, redo.params);
        if (res) {
            undoRedoService.pushUndoRedo({
                redoMutations: [redo],
                undoMutations: [undo],
                unitID: unitId,
            });
            return true;
        }
        return false;
    },
};

export interface ICancelInlineHyperLinkCommandParams {
    /**
     * id of link
     */
    id: string;
    /**
     * document id
     */
    documentId: string;
}

export const CancelInlineHyperLinkCommand: ICommand<ICancelInlineHyperLinkCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.cancel-inline-hyper-link',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { id: linkId, documentId } = params;
        const commandService = accessor.get(ICommandService);

        const doMutation = deleteCustomRangeFactory(accessor, { unitId: documentId, rangeId: linkId });
        if (!doMutation) {
            return false;
        }

        return commandService.syncExecuteCommand(doMutation.id, doMutation.params);
    },
};
