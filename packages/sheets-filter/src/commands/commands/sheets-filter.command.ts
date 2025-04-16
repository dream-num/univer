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

import type { IAccessor, ICommand, IMutationInfo, IRange, Nullable, Workbook } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '@univerjs/sheets';
import type { FilterColumn } from '../../models/filter-model';
import type { IAutoFilter, IFilterColumn } from '../../models/types';
import type { ISetSheetsFilterCriteriaMutationParams, ISetSheetsFilterRangeMutationParams } from '../mutations/sheets-filter.mutation';
import { CommandType, ErrorService, ICommandService, IUndoRedoService, IUniverInstanceService, LocaleService, sequenceExecute, UniverInstanceType } from '@univerjs/core';
import { expandToContinuousRange, getSheetCommandTarget, isSingleCellSelection, SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsFilterService } from '../../services/sheet-filter.service';
import { ReCalcSheetsFilterMutation, RemoveSheetsFilterMutation, SetSheetsFilterCriteriaMutation, SetSheetsFilterRangeMutation } from '../mutations/sheets-filter.mutation';

/**
 * Parameters of command {@link SetSheetFilterRangeCommand}.
 * @property {IRange} range - the range to be set as filter range.
 */
export interface ISetSheetFilterRangeCommandParams extends ISheetCommandSharedParams {
    range: IRange;
}

/**
 * A {@link CommandType.COMMAND} to set filter range in a Worksheet. Its params {@link ISetSheetFilterRangeCommandParams}
 * is required. If the {@link FilterModel} does not exist, it will be created.
 */
export const SetSheetFilterRangeCommand: ICommand<ISetSheetFilterRangeCommandParams> = {
    id: 'sheet.command.set-filter-range',
    type: CommandType.COMMAND,
    handler: (accessor, params: ISetSheetFilterRangeCommandParams) => {
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const instanceSrv = accessor.get(IUniverInstanceService);

        const { unitId, subUnitId, range } = params;

        const commandTarget = getSheetCommandTarget(instanceSrv, params);
        if (!commandTarget) return false;

        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (filterModel) return false;

        if (range.endRow === range.startRow) {
            const errorService = accessor.get(ErrorService);
            const localeService = accessor.get(LocaleService);
            errorService.emit(localeService.t('sheets-filter.command.not-valid-filter-range'));
            return false;
        }

        // Execute the command to set filter range and prepare undo redo.
        const redoMutation = { id: SetSheetsFilterRangeMutation.id, params: { unitId, subUnitId, range } };
        const result = commandService.syncExecuteCommand(redoMutation.id, redoMutation.params);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: RemoveSheetsFilterMutation.id, params: { unitId, subUnitId } }],
                redoMutations: [redoMutation],
            });
        }

        return result;
    },
};

/**
 * A {@link CommandType.COMMAND} to remove filter in a Worksheet. Its params {@link ISheetCommandSharedParams} is
 * required. If the {@link FilterModel} does not exist, it will fail to execute.
 */
export const RemoveSheetFilterCommand: ICommand<ISheetCommandSharedParams> = {
    id: 'sheet.command.remove-sheet-filter',
    type: CommandType.COMMAND,
    handler: (accessor, params: ISheetCommandSharedParams) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const commandService = accessor.get(ICommandService);

        const undoRedoService = accessor.get(IUndoRedoService);

        const commandTarget = getSheetCommandTarget(univerInstanceService, params);
        if (!commandTarget) return false;

        // If there is a filter model, we should remove it and prepare undo redo.
        const { unitId, subUnitId } = commandTarget;
        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (!filterModel) return false;

        const autoFilter = filterModel?.serialize();
        const undoMutations = destructFilterModel(unitId, subUnitId, autoFilter);
        const result = commandService.syncExecuteCommand(RemoveSheetsFilterMutation.id, { unitId, subUnitId });
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations,
                redoMutations: [{ id: RemoveSheetsFilterMutation.id, params: { unitId, subUnitId } }],
            });
        }

        return result;
    },
};

/**
 * A {@link CommandType.COMMAND} to toggle filter in the current {@link Worksheet}.
 */
export const SmartToggleSheetsFilterCommand: ICommand = {
    id: 'sheet.command.smart-toggle-filter',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const commandService = accessor.get(ICommandService);

        const currentWorkbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const currentWorksheet = currentWorkbook?.getActiveSheet();
        if (!currentWorksheet || !currentWorkbook) return false;

        const unitId = currentWorkbook.getUnitId();
        const subUnitId = currentWorksheet.getSheetId();

        // If there is a filter model, we should remove it and prepare undo redo.
        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (filterModel) {
            return commandService.executeCommand(RemoveSheetFilterCommand.id, { unitId, subUnitId });
        }

        // Other wise we should set the filter range to the current selection.
        const selectionManager = accessor.get(SheetsSelectionsService);
        const lastSelection = selectionManager.getCurrentLastSelection();
        if (!lastSelection) return false;

        const startRange = lastSelection.range;
        const targetFilterRange = isSingleCellSelection(lastSelection)
            ? expandToContinuousRange(startRange, { left: true, right: true, up: true, down: true }, currentWorksheet)
            : startRange;

        return commandService.executeCommand(SetSheetFilterRangeCommand.id, {
            unitId,
            subUnitId,
            range: targetFilterRange,
        } as ISetSheetFilterRangeCommandParams);
    },
};

/**
 * Parameters of command {@link SetSheetsFilterCriteriaCommand}.
 * @property {number} col - the column index of the filter criteria
 * @property {Nullable<IFilterColumn>} criteria - the filter criteria to be set
 */
export interface ISetSheetsFilterCriteriaCommandParams extends ISheetCommandSharedParams {
    col: number;
    criteria: Nullable<IFilterColumn>;
}

/**
 * A {@link CommandType.COMMAND} to set filter criteria to a column in the targeting {@link FilterModel}. Its params
 * {@link ISetSheetsFilterCriteriaCommandParams} is required.
 */
export const SetSheetsFilterCriteriaCommand: ICommand<ISetSheetsFilterCriteriaCommandParams> = {
    id: 'sheet.command.set-filter-criteria',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params: ISetSheetsFilterCriteriaCommandParams) => {
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { unitId, subUnitId, col, criteria } = params;
        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (!filterModel) return false;

        const range = filterModel.getRange();
        if (!range || col < range.startColumn || col > range.endColumn) return false;

        const filterColumn = filterModel.getFilterColumn(col);
        const undoMutation = destructFilterColumn(unitId, subUnitId, col, filterColumn);
        const redoMutation: IMutationInfo<ISetSheetsFilterCriteriaMutationParams> = {
            id: SetSheetsFilterCriteriaMutation.id,
            params: {
                unitId,
                subUnitId,
                col,
                criteria,
            },
        };

        const result = commandService.syncExecuteCommand(redoMutation.id, redoMutation.params);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [undoMutation],
                redoMutations: [redoMutation],
            });
        }

        return result;
    },
};

/**
 * A {@link CommandType.COMMAND} to clear all filter criteria in the targeting {@link FilterModel}. Its params
 * {@link ISheetCommandSharedParams} is required.
 */
export const ClearSheetsFilterCriteriaCommand: ICommand<ISheetCommandSharedParams> = {
    id: 'sheet.command.clear-filter-criteria',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params) => {
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const instanceSrv = accessor.get(IUniverInstanceService);

        const commandTarget = getSheetCommandTarget(instanceSrv, params);
        if (!commandTarget) return false;

        const { unitId, subUnitId } = commandTarget;
        const filterModel = sheetsFilterService.getFilterModel(commandTarget.unitId, commandTarget.subUnitId);
        if (!filterModel) return false;

        const autoFilter = filterModel.serialize();
        const undoMutations = destructFilterCriteria(unitId, subUnitId, autoFilter);
        const redoMutations = generateRemoveCriteriaMutations(unitId, subUnitId, autoFilter);

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

/**
 * A {@link CommandType.COMMAND} forcing the currently active {@link FilterModel} to re-calculate all filter criteria.
 * Its params {@link ISheetCommandSharedParams} is required.
 */
export const ReCalcSheetsFilterCommand: ICommand<ISheetCommandSharedParams> = {
    id: 'sheet.command.re-calc-filter',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const commandService = accessor.get(ICommandService);
        const instanceSrv = accessor.get(IUniverInstanceService);

        const commandTarget = getSheetCommandTarget(instanceSrv, params);
        if (!commandTarget) return false;

        const { unitId, subUnitId } = commandTarget;
        const filterModel = sheetsFilterService.getFilterModel(commandTarget.unitId, commandTarget.subUnitId);
        if (!filterModel) return false;

        // No need to handle undo redo for this command.
        return commandService.executeCommand(ReCalcSheetsFilterMutation.id, { unitId, subUnitId } as ISheetCommandSharedParams);
    },
};

/**
 * Destruct a `FilterModel` to a list of mutations.
 * @param {string} unitId - the unit id of the Workbook
 * @param {string} subUnitId - the sub unit id of the Worksheet
 * @param {IAutoFilter} autoFilter - the to be destructed FilterModel
 * @returns a list of mutations those can be used to reconstruct the FilterModel
 */
function destructFilterModel(
    unitId: string,
    subUnitId: string,
    autoFilter: IAutoFilter
): IMutationInfo[] {
    const mutations: IMutationInfo[] = [];

    const setFilterMutation: IMutationInfo<ISetSheetsFilterRangeMutationParams> = {
        id: SetSheetsFilterRangeMutation.id,
        params: {
            unitId,
            subUnitId,
            range: autoFilter.ref,
        },
    };
    mutations.push(setFilterMutation);

    const criteriaMutations = destructFilterCriteria(unitId, subUnitId, autoFilter);
    criteriaMutations.forEach((m) => mutations.push(m));

    return mutations;
}

/**
 * Transform a {@link FilterModel} to a list of mutations to set the filter criteria.
 * @param unitId - the unit id of the {@link Workbook}
 * @param subUnitId - the sub unit id of the {@link Worksheet}
 * @param autoFilter - the to be destructed {@link FilterModel}
 * @returns {IMutationInfo<ISetSheetsFilterCriteriaMutationParams>} a list of mutations those can be used to
 * reconstruct the {@link FilterModel}
 */
export function destructFilterCriteria(
    unitId: string,
    subUnitId: string,
    autoFilter: IAutoFilter
): IMutationInfo<ISetSheetsFilterCriteriaMutationParams>[] {
    const mutations: IMutationInfo<ISetSheetsFilterCriteriaMutationParams>[] = [];

    autoFilter.filterColumns?.forEach((filterColumn) => {
        const setFilterCriteriaMutation: IMutationInfo<ISetSheetsFilterCriteriaMutationParams> = {
            id: SetSheetsFilterCriteriaMutation.id,
            params: {
                unitId,
                subUnitId,
                col: filterColumn.colId,
                criteria: filterColumn,
            },
        };
        mutations.push(setFilterCriteriaMutation);
    });

    return mutations;
}

/** Generate mutations to remove all criteria on a `FilterModel` */
function generateRemoveCriteriaMutations(
    unitId: string,
    subUnitId: string,
    autoFilter: IAutoFilter
): IMutationInfo[] {
    const mutations: IMutationInfo[] = [];

    autoFilter.filterColumns?.forEach((filterColumn) => {
        const removeFilterCriteriaMutation: IMutationInfo<ISetSheetsFilterCriteriaMutationParams> = {
            id: SetSheetsFilterCriteriaMutation.id,
            params: {
                unitId,
                subUnitId,
                col: filterColumn.colId,
                criteria: null,
            },
        };
        mutations.push(removeFilterCriteriaMutation);
    });

    return mutations;
}

/**
 * Prepare the undo mutation, it should rollback to the old criteria if there's already a `FilterColumn`,
 * or remove the filter criteria when there is no `FilterColumn`.
 * @param {string} unitId
 * @param {string} subUnitId
 * @param {number} colId
 * @param {Nullable<FilterColumn>} filterColumn
 * @returns {IMutationInfo<ISetSheetsFilterCriteriaMutationParams>} the undo mutation
 */
function destructFilterColumn(
    unitId: string,
    subUnitId: string,
    colId: number,
    filterColumn: Nullable<FilterColumn>
): IMutationInfo<ISetSheetsFilterCriteriaMutationParams> {
    if (!filterColumn) {
        return {
            id: SetSheetsFilterCriteriaMutation.id,
            params: {
                unitId,
                subUnitId,
                col: colId,
                criteria: null,
            },
        };
    }

    const serialize = filterColumn.serialize();
    return {
        id: SetSheetsFilterCriteriaMutation.id,
        params: {
            unitId,
            subUnitId,
            col: colId,
            criteria: serialize,
        },
    };
}
