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

import type { IAccessor, ICellData, ICommand, IMutationInfo, Injector, IRange, Nullable, Worksheet } from '@univerjs/core';
import type { IAddWorksheetMergeMutationParams, IRemoveWorksheetMergeMutationParams } from '../../basics/interfaces/mutation-interface';
import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
import type { ISheetCommandSharedParams } from '../utils/interface';
import {
    CellModeEnum,
    CommandType,
    Dimension,
    ICommandService,
    IConfirmService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    ObjectMatrix,
    Rectangle,
    sequenceExecute,
    Tools,
} from '@univerjs/core';
import { getAddMergeMutationRangeByType } from '../../controllers/merge-cell.controller';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { AddMergeUndoMutationFactory, AddWorksheetMergeMutation } from '../mutations/add-worksheet-merge.mutation';
import { RemoveMergeUndoMutationFactory, RemoveWorksheetMergeMutation } from '../mutations/remove-worksheet-merge.mutation';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';
import { AddMergeRedoSelectionsOperationFactory, AddMergeUndoSelectionsOperationFactory } from '../utils/handle-merge-operation';
import { RemoveWorksheetMergeCommand } from './remove-worksheet-merge.command';
import { getSheetCommandTarget } from './utils/target-util';

export interface IAddMergeCommandParams extends ISheetCommandSharedParams {
    value?: Dimension.ROWS | Dimension.COLUMNS;
    selections: IRange[];
    defaultMerge?: boolean;
}

export enum MergeType {
    MergeAll = 'mergeAll',
    MergeVertical = 'mergeVertical',
    MergeHorizontal = 'mergeHorizontal',
}

export interface IMergeCellsUtilOptions {
    /**
     * Whether to use the default merge behavior when there are existing cell contents in the merge ranges.
     * If true, only the value in the upper left cell is retained.
     * If false, a confirm dialog will be shown to the user.
     * @default true
     */
    defaultMerge?: boolean;
    /**
     * Whether to force merge even if there are existing merged cells that overlap with the new merge ranges.
     * If true, the overlapping merged cells will be removed before performing the new merge.
     * @default false
     */
    isForceMerge?: boolean;
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

export function getClearContentMutationParamsForRanges(
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

export function getClearContentMutationParamForRange(worksheet: Worksheet, range: IRange): ObjectMatrix<Nullable<ICellData>> {
    const { startRow, startColumn, endColumn, endRow } = range;
    const cellMatrix = worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn, CellModeEnum.Raw);
    const redoMatrix = new ObjectMatrix<Nullable<ICellData>>();
    let leftTopCellValue: Nullable<ICellData> = null;
    cellMatrix.forValue((row, col, cellData) => {
        if (cellData && row >= startRow && col >= startColumn) {
            if (!leftTopCellValue && worksheet.cellHasValue(cellData) && (cellData.v !== '' || (cellData.p?.body?.dataStream?.length ?? 0) > 2)) {
                leftTopCellValue = cellData;
            }
            redoMatrix.setValue(row, col, cellData.s ? { s: cellData.s } : null);
        }
    });
    redoMatrix.setValue(startRow, startColumn, leftTopCellValue);

    return redoMatrix;
}

export const AddWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params: IAddMergeCommandParams) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { worksheet } = target;
        const { unitId, subUnitId, selections } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const ranges = getAddMergeMutationRangeByType(selections, params.value);

        // First we should check if there are values in the going-to-be-merged cells.
        const willClearSomeCell = checkCellContentInRanges(worksheet, ranges);
        if (willClearSomeCell && !params.defaultMerge) {
            const confirmService = accessor.get(IConfirmService);
            const localeService = accessor.get(LocaleService);

            const result = await confirmService.confirm({
                id: 'merge.confirm.add-worksheet-merge',
                title: {
                    title: 'merge.confirm.warning',
                },
                children: {
                    title: 'merge.confirm.title',
                },
                cancelText: localeService.t('merge.confirm.cancel'),
                confirmText: localeService.t('merge.confirm.confirm'),
            });

            if (!result) return false;
        }

        const redoMutations: IMutationInfo[] = [];
        const undoMutations: IMutationInfo[] = [];

        // prepare redo mutations
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: Tools.deepClone(ranges),
        };
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges: Tools.deepClone(ranges),
        };

        // prepare undo mutations
        const undoRemoveMergeMutationParams = RemoveMergeUndoMutationFactory(accessor, removeMergeMutationParams);
        const undoMutationParams = AddMergeUndoMutationFactory(accessor, addMergeMutationParams);

        // params should be the merged cells to be deleted accurately, rather than the selection
        if (undoRemoveMergeMutationParams.ranges.length > 0) {
            redoMutations.push({ id: RemoveWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams });
        }

        redoMutations.push({ id: AddWorksheetMergeMutation.id, params: addMergeMutationParams });
        undoMutations.push({ id: RemoveWorksheetMergeMutation.id, params: undoMutationParams });
        if (undoRemoveMergeMutationParams.ranges.length > 0) {
            undoMutations.push({ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams });
        }

        // add set range values mutations to undo redo mutations
        if (willClearSomeCell) {
            const data = getClearContentMutationParamsForRanges(accessor, unitId, worksheet, ranges);
            redoMutations.unshift(...data.redos);
            undoMutations.push(...data.undos);
        }

        const addMergeRedoSelectionsMutation = AddMergeRedoSelectionsOperationFactory(accessor, params, ranges);
        addMergeRedoSelectionsMutation && redoMutations.push(addMergeRedoSelectionsMutation);

        const addMergeUndoSelectionsMutation = AddMergeUndoSelectionsOperationFactory(accessor, params);
        addMergeUndoSelectionsMutation && undoMutations.push(addMergeUndoSelectionsMutation);

        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const interceptor = sheetInterceptorService.onCommandExecute({
            id: AddWorksheetMergeCommand.id,
            params: { unitId, subUnitId, ranges },
        });

        redoMutations.push(...interceptor.redos);
        undoMutations.push(...interceptor.undos);

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
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        const mergeableSelections = getMergeableSelectionsByType(MergeType.MergeAll, selections);
        if (!mergeableSelections?.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet } = target;
        const unitId = worksheet.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            selections: mergeableSelections,
            unitId,
            subUnitId,
        } as IAddMergeCommandParams);
    },
};

export const AddWorksheetMergeVerticalCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-vertical',
    handler: async (accessor) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        const mergeableSelections = getMergeableSelectionsByType(MergeType.MergeVertical, selections);
        if (!mergeableSelections?.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet } = target;
        const unitId = worksheet.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            value: Dimension.COLUMNS,
            selections: mergeableSelections,
            unitId,
            subUnitId,
        } as IAddMergeCommandParams);
    },
};

export const AddWorksheetMergeHorizontalCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-horizontal',
    handler: async (accessor) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        const mergeableSelections = getMergeableSelectionsByType(MergeType.MergeHorizontal, selections);
        if (!mergeableSelections?.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { workbook, worksheet } = target;
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            value: Dimension.ROWS,
            selections: mergeableSelections,
            unitId,
            subUnitId,
        } as IAddMergeCommandParams);
    },
};

export function addMergeCellsUtil(injector: Injector, unitId: string, subUnitId: string, ranges: IRange[], options: IMergeCellsUtilOptions = {}) {
    const target = getSheetCommandTarget(injector.get(IUniverInstanceService), { unitId, subUnitId });
    if (!target) return;

    const commandService = injector.get(ICommandService);
    const { defaultMerge = true, isForceMerge = false } = options;
    const { worksheet } = target;
    const mergeData = worksheet.getMergeData();
    const overlap = mergeData.some((mergeRange) => {
        return ranges.some((range) => {
            return Rectangle.intersects(range, mergeRange);
        });
    });

    if (overlap) {
        if (!isForceMerge) {
            throw new Error('The ranges to be merged overlap with the existing merged cells');
        }

        commandService.syncExecuteCommand(RemoveWorksheetMergeCommand.id, {
            unitId,
            subUnitId,
            ranges,
        });
    }

    commandService.executeCommand(AddWorksheetMergeCommand.id, {
        unitId,
        subUnitId,
        selections: ranges,
        defaultMerge,
    });
}

export function getMergeableSelectionsByType(type: MergeType, selections: Nullable<IRange[]>): Nullable<IRange[]> {
    if (!selections) return null;
    if (type === MergeType.MergeAll) {
        return selections.filter((selection) => {
            if (selection.startRow === selection.endRow && selection.startColumn === selection.endColumn) {
                return false;
            }
            return true;
        });
    } else if (type === MergeType.MergeVertical) {
        return selections.filter((selection) => {
            if (selection.startRow === selection.endRow) {
                return false;
            }
            return true;
        });
    } else if (type === MergeType.MergeHorizontal) {
        return selections.filter((selection) => {
            if (selection.startColumn === selection.endColumn) {
                return false;
            }
            return true;
        });
    }

    return selections;
}
