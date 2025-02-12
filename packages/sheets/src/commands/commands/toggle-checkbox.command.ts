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

import type { ICommand, IMutationInfo, Workbook } from '@univerjs/core';
import { BuildTextUtils, CellValueType, CommandType, DocumentDataModel, ICommandService, IUndoRedoService, IUniverInstanceService, TextX, Tools, UniverInstanceType } from '@univerjs/core';
import { type ISetRangeValuesMutationParams, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';

export interface IToggleCellCheckboxCommandParams {
    unitId: string;
    subUnitId: string;
    row: number;
    col: number;
    paragraphIndex: number;
}

export const ToggleCellCheckboxCommand: ICommand<IToggleCellCheckboxCommandParams> = {
    id: 'sheet.command.toggle-cell-checkbox',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, row, col, paragraphIndex } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        const sheet = workbook?.getSheetBySheetId(subUnitId);
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        if (!sheet) {
            return false;
        }
        const cell = sheet.getCell(row, col);
        if (!cell?.p) {
            return false;
        }
        const p = Tools.deepClone(cell.p);
        const documentDataModel = new DocumentDataModel(p);
        const textX = BuildTextUtils.paragraph.bullet.toggleChecklist({
            document: documentDataModel,
            paragraphIndex,
        });
        if (!textX) {
            return false;
        }
        TextX.apply(documentDataModel.getBody()!, textX.serialize());
        const redoParams: ISetRangeValuesMutationParams = {
            unitId,
            subUnitId,
            cellValue: {
                [row]: {
                    [col]: {
                        p,
                        t: CellValueType.STRING,
                    },
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

        undoRedoService.pushUndoRedo({
            redoMutations: redos,
            undoMutations: undos,
            unitID: unitId,
        });

        return commandService.syncExecuteCommand(redo.id, redo.params);
    },
};
