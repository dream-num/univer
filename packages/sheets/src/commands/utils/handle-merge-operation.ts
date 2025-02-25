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

import type { IAccessor, IRange } from '@univerjs/core';
import type { IAddMergeCommandParams } from '../commands/add-worksheet-merge.command';
import type { ISetSelectionsOperationParams } from '../operations/selection.operation';
import { Dimension } from '@univerjs/core';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SelectionMoveType } from '../../services/selections/type';
import { SetSelectionsOperation } from '../operations/selection.operation';

export const AddMergeRedoSelectionsOperationFactory = (accessor: IAccessor, params: IAddMergeCommandParams, ranges: IRange[]) => {
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const selectionsBeforeMutation = selectionManagerService.getCurrentSelections();
    const { value, selections, unitId, subUnitId } = params;
    if (selectionsBeforeMutation) {
        const lastSelectionBeforeMutation = selectionsBeforeMutation[selectionsBeforeMutation?.length - 1];
        const primaryBeforeMutation = lastSelectionBeforeMutation.primary;
        if (primaryBeforeMutation) {
            const { actualColumn, actualRow } = primaryBeforeMutation;
            let { startRow, startColumn, endRow, endColumn } = selections[selections.length - 1];
            if (value === Dimension.COLUMNS) {
                const rangeByColumn = ranges.find((item) => item.startColumn === actualColumn && item.endColumn === actualColumn && actualRow === item.startRow);
                if (rangeByColumn) {
                    endColumn = rangeByColumn.endColumn;
                    startRow = rangeByColumn.startRow;
                    endRow = rangeByColumn.endRow;
                }
            } else if (value === Dimension.ROWS) {
                const rangeByRow = ranges.find((item) => item.startRow === actualRow && item.endRow === actualRow && actualColumn === item.startColumn);
                if (rangeByRow) {
                    endRow = rangeByRow.endRow;
                    startColumn = rangeByRow.startColumn;
                    endColumn = rangeByRow.endColumn;
                }
            }
            const primary = {
                startRow,
                startColumn,
                endRow,
                endColumn,
                actualRow,
                actualColumn,
                isMerged: true,
                isMergedMainCell: startRow === actualRow && startColumn === actualColumn,
            };
            const selectionsByRedo = selectionsBeforeMutation.map((selection, index, selections) => {
                return {
                    range: selection.range,
                    style: null,
                    primary: index === selections.length - 1 ? primary : null,
                };
            });
            const setSelectionsParamByRedo: ISetSelectionsOperationParams = {
                unitId,
                subUnitId,
                type: SelectionMoveType.ONLY_SET,
                selections: selectionsByRedo,
            };
            return {
                id: SetSelectionsOperation.id,
                params: setSelectionsParamByRedo,
            };
        }
        return null;
    }
    return null;
};

export const AddMergeUndoSelectionsOperationFactory = (accessor: IAccessor, params: IAddMergeCommandParams) => {
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const selectionsBeforeMutation = selectionManagerService.getCurrentSelections();
    const { unitId, subUnitId } = params;
    if (selectionsBeforeMutation) {
        const lastSelectionBeforeMutation = selectionsBeforeMutation[selectionsBeforeMutation?.length - 1];
        const primaryBeforeMutation = lastSelectionBeforeMutation.primary;
        if (primaryBeforeMutation) {
            const setSelectionsParamByUndo: ISetSelectionsOperationParams = {
                unitId,
                subUnitId,
                type: SelectionMoveType.ONLY_SET,
                selections: [...selectionsBeforeMutation],
            };
            return {
                id: SetSelectionsOperation.id,
                params: setSelectionsParamByUndo,
            };
        }
    }
    return null;
};
