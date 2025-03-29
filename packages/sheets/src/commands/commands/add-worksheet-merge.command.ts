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

import type { IAccessor, ICellData, ICommand, IMutationInfo, Injector, IRange, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../basics/interfaces/mutation-interface';

import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
import {
    CellModeEnum,
    CommandType,
    Dimension,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    Rectangle,
    sequenceExecute,
    UniverInstanceType,
} from '@univerjs/core';
import { getAddMergeMutationRangeByType } from '../../controllers/merge-cell.controller';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { AddMergeUndoMutationFactory, AddWorksheetMergeMutation } from '../mutations/add-worksheet-merge.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../mutations/remove-worksheet-merge.mutation';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface IAddMergeCommandParams {
    value?: Dimension.ROWS | Dimension.COLUMNS;
    selections: IRange[];
    unitId: string;
    subUnitId: string;
}

function checkCellContentInRanges(worksheet: Worksheet, ranges: IRange[]): boolean {
    return ranges.some((range) => checkCellContentInRange(worksheet, range));
}

function checkCellContentInRange(worksheet: Worksheet, range: IRange): boolean {
    const { startRow, startColumn, endColumn, endRow } = range;
    const cellMatrix = worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);

    let someCellGoingToBeRemoved = false;
    cellMatrix.forValue((row, col, cellData) => {
        if (cellData && (row !== startRow || col !== startColumn) && worksheet.cellHasValue(cellData)) {
            someCellGoingToBeRemoved = true;
            return false;
        }
    });
    return someCellGoingToBeRemoved;
}

function getClearContentMutationParamsForRanges(
    accessor: IAccessor,
    unitId: string,
    worksheet: Worksheet,
    ranges: IRange[]
): { undos: IMutationInfo[]; redos: IMutationInfo[] } {
    const undos: IMutationInfo[] = [];
    const redos: IMutationInfo[] = [];

    const subUnitId = worksheet.getSheetId();

    // Use the following file as a reference.
    // packages/sheets/src/commands/commands/clear-selection-all.command.ts
    // packages/sheets/src/commands/mutations/set-range-values.mutation.ts
    ranges.forEach((range) => {
        const redoMatrix = getClearContentMutationParamForRange(worksheet, range);
        const redoMutationParams: ISetRangeValuesMutationParams = {
            unitId,
            subUnitId,
            cellValue: redoMatrix.getData(),
        };
        const undoMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            redoMutationParams
        );

        undos.push({ id: SetRangeValuesMutation.id, params: undoMutationParams });
        redos.push({ id: SetRangeValuesMutation.id, params: redoMutationParams });
    });

    return {
        undos,
        redos,
    };
}

function getClearContentMutationParamForRange(worksheet: Worksheet, range: IRange): ObjectMatrix<Nullable<ICellData>> {
    const { startRow, startColumn, endColumn, endRow } = range;
    const cellMatrix = worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn, CellModeEnum.Raw);
    const redoMatrix = new ObjectMatrix<Nullable<ICellData>>();
    cellMatrix.forValue((row, col, cellData) => {
        if (cellData && (row !== startRow || col !== startColumn)) {
            redoMatrix.setValue(row, col, null);
        }
    });

    return redoMatrix;
}

export const AddWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge',

    handler: (accessor: IAccessor, params: IAddMergeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const unitId = params.unitId;
        const subUnitId = params.subUnitId;
        const selections = params.selections;
        const ranges = getAddMergeMutationRangeByType(selections, params.value);
        const worksheet = univerInstanceService.getUniverSheetInstance(unitId)!.getSheetBySheetId(subUnitId)!;

        const redoMutations: IMutationInfo[] = [];
        const undoMutations: IMutationInfo[] = [];

        // First we should check if there are values in the going-to-be-merged cells.
        const willRemoveSomeCell = checkCellContentInRanges(worksheet, ranges);

        // prepare redo mutations
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges,
        };
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges,
        };
        redoMutations.push({ id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams });
        redoMutations.push({ id: AddWorksheetMergeMutation.id, params: addMergeMutationParams });

        // prepare undo mutations
        const undoRemoveMergeMutationParams = RemoveMergeUndoMutationFactory(accessor, removeMergeMutationParams);
        const undoMutationParams = AddMergeUndoMutationFactory(accessor, addMergeMutationParams);
        undoMutations.push({ id: RemoveWorksheetMergeMutation.id, params: undoMutationParams });
        undoMutations.push({ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams });

        // add set range values mutations to undo redo mutations
        if (willRemoveSomeCell) {
            const data = getClearContentMutationParamsForRanges(accessor, unitId, worksheet, ranges);
            redoMutations.unshift(...data.redos);
            undoMutations.push(...data.undos);
        }

        const result = sequenceExecute(redoMutations, commandService);
        if (result.result) {
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

export const AddWorksheetMergeAllCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-all',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        if (!selections?.length) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return false;

        const workSheet = workbook.getActiveSheet();
        if (!workSheet) return false;

        const unitId = workbook.getUnitId();
        const subUnitId = workSheet.getSheetId();

        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            selections,
            unitId,
            subUnitId,
        } as IAddMergeCommandParams);
    },
};

export const AddWorksheetMergeVerticalCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-vertical',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        if (!selections?.length) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return false;

        const workSheet = workbook.getActiveSheet();
        if (!workSheet) return false;

        const unitId = workbook.getUnitId();
        const subUnitId = workSheet.getSheetId();

        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            value: Dimension.COLUMNS,
            selections,
            unitId,
            subUnitId,
        } as IAddMergeCommandParams);
    },
};

export const AddWorksheetMergeHorizontalCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-horizontal',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        if (!selections?.length) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return false;

        const workSheet = workbook.getActiveSheet();
        if (!workSheet) return false;

        const unitId = workbook.getUnitId();
        const subUnitId = workSheet.getSheetId();
        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            value: Dimension.ROWS,
            selections,
            unitId,
            subUnitId,
        } as IAddMergeCommandParams);
    },
};

export function addMergeCellsUtil(injector: Injector, unitId: string, subUnitId: string, ranges: IRange[], defaultMerge: boolean) {
    const univerInstanceService = injector.get(IUniverInstanceService);
    const target = getSheetCommandTarget(univerInstanceService, { unitId, subUnitId });
    if (!target) return;
    const { worksheet } = target;
    const mergeData = worksheet.getMergeData();
    const overlap = mergeData.some((mergeRange) => {
        return ranges.some((range) => {
            return Rectangle.intersects(range, mergeRange);
        });
    });
    if (overlap) {
        throw new Error('The ranges to be merged overlap with the existing merged cells');
    }
    const commandService = injector.get(ICommandService);
    commandService.executeCommand(AddWorksheetMergeCommand.id, {
        unitId,
        subUnitId,
        selections: ranges,
        defaultMerge,
    });
}
