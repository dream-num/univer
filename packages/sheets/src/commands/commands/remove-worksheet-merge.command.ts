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

import type { IAccessor, ICellData, ICommand, IMutationInfo, IRange, Nullable, Worksheet } from '@univerjs/core';
import type {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../basics/interfaces/mutation-interface';

import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, ObjectMatrix, Rectangle, sequenceExecute, Tools } from '@univerjs/core';
import { SetSelectionsOperation } from '../../commands/operations/selection.operation';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { AddWorksheetMergeMutation } from '../mutations/add-worksheet-merge.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../mutations/remove-worksheet-merge.mutation';
import { SetRangeValuesMutation } from '../mutations/set-range-values.mutation';
import { getSheetCommandTarget } from './utils/target-util';

interface IRemoveWorksheetMergeCommandParams {
    ranges?: IRange[];
}

export const RemoveWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-worksheet-merge',
    // eslint-disable-next-line max-lines-per-function
    handler: (accessor: IAccessor, params: IRemoveWorksheetMergeCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selections = params?.ranges || selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        if (!selections?.length) return false;

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { subUnitId, unitId, worksheet } = target;
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: selections,
        };

        const mergeData = worksheet.getConfig().mergeData;
        const intersectsMerges = mergeData.filter((merge) => {
            return selections.some((selection) => Rectangle.intersects(selection, merge));
        });
        if (!intersectsMerges.length) return false;

        const undoredoMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            accessor,
            removeMergeMutationParams
        );

        const nowSelections = selectionManagerService.getCurrentSelections();
        if (!nowSelections?.length) return false;

        const undoSelections = Tools.deepClone(nowSelections);
        const redoSelections = Tools.deepClone(nowSelections);
        const redoLastSelection = redoSelections[redoSelections.length - 1];
        const { startRow, startColumn } = redoLastSelection.range;
        redoLastSelection.primary = {
            startRow,
            startColumn,
            endRow: startRow,
            endColumn: startColumn,
            actualRow: startRow,
            actualColumn: startColumn,
            isMerged: false,
            isMergedMainCell: false,
        };

        const getSetRangeValuesParams = getSetRangeStyleParamsForRemoveMerge(worksheet, intersectsMerges);
        const redoSetRangeValueParams: ISetRangeValuesMutationParams = {
            unitId,
            subUnitId,
            cellValue: getSetRangeValuesParams.redoParams.getMatrix(),
        };
        const undoSetRangeValueParams: ISetRangeValuesMutationParams = {
            unitId,
            subUnitId,
            cellValue: getSetRangeValuesParams.undoParams.getMatrix(),
        };

        const redoMutations: IMutationInfo[] = [
            { id: RemoveWorksheetMergeMutation.id, params: undoredoMutationParams },
            { id: SetRangeValuesMutation.id, params: redoSetRangeValueParams },
            { id: SetSelectionsOperation.id, params: { selections: redoSelections } },
        ];

        const undoMutations: IMutationInfo[] = [
            { id: AddWorksheetMergeMutation.id, params: undoredoMutationParams },
            { id: SetRangeValuesMutation.id, params: undoSetRangeValueParams },
            { id: SetSelectionsOperation.id, params: { selections: undoSelections } },
        ];

        const result = sequenceExecute(redoMutations, commandService);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations,
                redoMutations,
            });
            return true;
        }
        return false;
    },
};

function getSetRangeStyleParamsForRemoveMerge(worksheet: Worksheet, ranges: IRange[]) {
    const styleRedoMatrix = new ObjectMatrix<Nullable<ICellData>>();
    const styleUndoMatrix = new ObjectMatrix<Nullable<ICellData>>();

    ranges.forEach((range) => {
        const { startRow, startColumn, endColumn, endRow } = range;
        const cellValue = worksheet.getCellMatrix().getValue(startRow, startColumn);
        if (cellValue?.s) {
            for (let i = startRow; i <= endRow; i++) {
                for (let j = startColumn; j <= endColumn; j++) {
                    if (i !== startRow || j !== startColumn) {
                        styleRedoMatrix.setValue(i, j, { s: cellValue.s });
                        styleUndoMatrix.setValue(i, j, null);
                    }
                }
            }
        }
    });

    return {
        redoParams: styleRedoMatrix,
        undoParams: styleUndoMatrix,
    };
}
