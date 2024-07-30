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

import type { IAccessor, ICommand, IMutationInfo, Nullable, Workbook } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, LocaleService, Quantity, sequenceExecute, UniverInstanceType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import type { ISheetCommandSharedParams } from '@univerjs/sheets';
import { expandToContinuousRange, isSingleCellSelection, SheetsSelectionsService } from '@univerjs/sheets';
import type { FilterColumn, IAutoFilter, IFilterColumn, IReCalcSheetsFilterMutationParams, ISetSheetsFilterCriteriaMutationParams, ISetSheetsFilterRangeMutationParams } from '@univerjs/sheets-filter';
import { ReCalcSheetsFilterMutation, RemoveSheetsFilterMutation, SetSheetsFilterCriteriaMutation, SetSheetsFilterRangeMutation, SheetsFilterService } from '@univerjs/sheets-filter';
import { IMessageService } from '@univerjs/ui';

/**
 * This command is for toggling filter in the currently active Worksheet.
 */
export const SmartToggleSheetsFilterCommand: ICommand = {
    id: 'sheet.command.smart-toggle-filter',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const currentWorkbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const currentWorksheet = currentWorkbook?.getActiveSheet();
        if (!currentWorksheet || !currentWorkbook) return false;

        const unitId = currentWorkbook.getUnitId();
        const subUnitId = currentWorksheet.getSheetId();

        // If there is a filter model, we should remove it and prepare undo redo.
        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (filterModel) {
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
        }

        const selectionManager = accessor.get(SheetsSelectionsService);
        const lastSelection = selectionManager.getCurrentLastSelection();
        if (!lastSelection) return false;

        const startRange = lastSelection.range;
        const targetFilterRange = isSingleCellSelection(lastSelection)
            ? expandToContinuousRange(startRange, { left: true, right: true, up: true, down: true }, currentWorksheet)
            : startRange;

        if (targetFilterRange.endRow === targetFilterRange.startRow) {
            const messageService = accessor.get(IMessageService, Quantity.OPTIONAL);
            const localeService = accessor.get(LocaleService);
            messageService?.show({ type: MessageType.Warning, content: localeService.t('sheets-filter.command.not-valid-filter-range') });
            return false;
        }

        // Execute the command to set filter range and prepare undo redo.
        const redoMutation = { id: SetSheetsFilterRangeMutation.id, params: { unitId, subUnitId, range: targetFilterRange } };
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

export interface ISetSheetsFilterCriteriaCommandParams extends ISheetCommandSharedParams {
    col: number;
    criteria: Nullable<IFilterColumn>;
}
/**
 * This command is for setting filter criteria to a column in the targeting `FilterModel`.
 */
export const SetSheetsFilterCriteriaCommand: ICommand<ISetSheetsFilterCriteriaCommandParams> = {
    id: 'sheet.command.set-filter-criteria',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISetSheetsFilterCriteriaCommandParams) => {
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { unitId, subUnitId, col, criteria } = params;
        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (!filterModel) {
            return false;
        }

        const range = filterModel.getRange();
        if (!range || col < range.startColumn || col > range.endColumn) {
            return false;
        }

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
 * This command is for clearing all filter criteria in the currently active `FilterModel`.
 */
export const ClearSheetsFilterCriteriaCommand: ICommand = {
    id: 'sheet.command.clear-filter-criteria',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor) => {
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);

        const currentFilterModel = sheetsFilterService.activeFilterModel;
        if (!currentFilterModel) {
            return false;
        }

        // TODO@wzhudev: should also return when no filter criteria is set

        const { unitId, subUnitId } = currentFilterModel;
        const autoFilter = currentFilterModel.serialize();
        const undoMutations = destructFilterCriteria(unitId, subUnitId, autoFilter);
        const redoMutations = generateRemoveCriteriaMutations(unitId, subUnitId, autoFilter);

        const result = sequenceExecute(redoMutations, commandService);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations,
                redoMutations,
            });
        }

        return true;
    },
};

/**
 * This command force the currently active `FilterModel` to re-calculate all filter criteria.
 */
export const ReCalcSheetsFilterCommand: ICommand = {
    id: 'sheet.command.re-calc-filter',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor) => {
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const commandService = accessor.get(ICommandService);

        const currentFilterModel = sheetsFilterService.activeFilterModel;
        if (!currentFilterModel) {
            return false;
        }

        // No need to handle undo redo for this command.
        const { unitId, subUnitId } = currentFilterModel;
        return commandService.executeCommand(ReCalcSheetsFilterMutation.id, { unitId, subUnitId } as IReCalcSheetsFilterMutationParams);
    },
};

/**
 * Destruct a `FilterModel` to a list of mutations.
 * @param unitId the unit id of the Workbook
 * @param subUnitId the sub unit id of the Worksheet
 * @param autoFilter the to be destructed FilterModel
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

export function destructFilterCriteria(
    unitId: string,
    subUnitId: string,
    autoFilter: IAutoFilter
): IMutationInfo[] {
    const mutations: IMutationInfo[] = [];

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
 * @param unitId
 * @param subUnitId
 * @param colId
 * @param filterColumn
 * @returns the undo mutation
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
