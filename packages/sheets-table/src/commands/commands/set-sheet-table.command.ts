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

import type { ICommand, IMutationInfo } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { LocaleKey } from '../../locale/types';
import type { ITableSetConfig } from '../../types/type';
import {
    CommandType,
    ICommandService,
    ILogService,
    IPermissionService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    sequenceExecute,
} from '@univerjs/core';
import { IDefinedNamesService, LexerTreeBuilder } from '@univerjs/engine-formula';
import {
    checkRangesEditablePermission,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    SheetInterceptorService,
    WorkbookEditablePermission,
} from '@univerjs/sheets';
import { TableManager } from '../../models/table-manager';
import { IRangeOperationTypeEnum } from '../../types/type';
import { getExistingNamesSet } from '../../util';
import { validateSheetTableName } from '../../util/table-name';
import { SetSheetTableMutation } from '../mutations/set-sheet-table.mutation';
import { getCalculatedColumnFillMutation } from '../utils/calculated-column';

export interface ISetSheetTableCommandParams extends ITableSetConfig {
    unitId: string;
    tableId: string;
    oldTableName?: string;
}

export const SetSheetTableCommand: ICommand<ISetSheetTableCommandParams> = {
    id: 'sheet.command.set-table-config',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const { unitId, tableId, name, updateRange, rowColOperation, theme, filterButtons } = params;
        const tableManager = accessor.get(TableManager);
        const table = tableManager.getTableById(unitId, tableId);

        if (!table) {
            return false;
        }

        const cellRedos: IMutationInfo[] = [];
        const cellUndos: IMutationInfo[] = [];
        const oldTableConfig: ITableSetConfig = {};
        const newTableConfig: ITableSetConfig = {};
        if (params.calculatedColumn) {
            const { columnId, formula, formulaIsArray } = params.calculatedColumn;
            const column = table.getColumn(columnId);
            if (!column || typeof formula !== 'string' || (formulaIsArray !== undefined && typeof formulaIsArray !== 'boolean')) {
                return false;
            }
            // Combining a structural edit and a fill would make the formula anchor ambiguous.
            if (updateRange || rowColOperation) {
                return false;
            }
            const range = table.getTableFilterRange();
            const columnIndex = table.getTableInfo().columns.findIndex((item) => item.id === columnId);
            const sheetColumn = range.startColumn + columnIndex;
            const editRange = { ...range, startColumn: sheetColumn, endColumn: sheetColumn };
            if (!checkRangesEditablePermission(accessor, unitId, table.getSubunitId(), [editRange])) {
                return false;
            }
            const normalized = formula.trim();
            if (normalized === '=') {
                return false;
            }
            oldTableConfig.calculatedColumn = { columnId, formula: column.formula, formulaIsArray: column.formulaIsArray };
            newTableConfig.calculatedColumn = {
                columnId,
                formula: normalized && !normalized.startsWith('=') ? `=${normalized}` : normalized,
                formulaIsArray: normalized ? formulaIsArray ?? column.formulaIsArray : undefined,
            };
            const fill = getCalculatedColumnFillMutation(table, unitId, table.getSubunitId(), range.startRow, range.endRow, () => accessor.get(LexerTreeBuilder), newTableConfig.calculatedColumn);
            if (fill) {
                cellRedos.push(fill);
                cellUndos.push({
                    id: SetRangeValuesMutation.id,
                    params: SetRangeValuesUndoMutationFactory(accessor, fill.params as ISetRangeValuesMutationParams),
                });
            }
        }
        if (filterButtons) {
            if (accessor.get(IPermissionService).getPermissionPoint(new WorkbookEditablePermission(unitId).id)?.value === false) {
                return false;
            }
            const { showAutoFilter, columns } = filterButtons;
            if (showAutoFilter !== undefined && typeof showAutoFilter !== 'boolean') {
                return false;
            }
            const entries = Object.entries(columns ?? {});
            if (entries.some(([id, visible]) => !table.getColumn(id) || typeof visible !== 'boolean')) {
                return false;
            }
            oldTableConfig.filterButtons = {
                ...(showAutoFilter === undefined ? {} : { showAutoFilter: table.isShowAutoFilter() }),
                columns: Object.fromEntries(entries.map(([id]) => [id, table.getColumn(id)!.isShowFilterButton()])),
            };
            newTableConfig.filterButtons = {
                ...(showAutoFilter === undefined ? {} : { showAutoFilter }),
                columns: Object.fromEntries(entries),
            };
        }
        const localeService = accessor.get(LocaleService);
        const existingNamesSet = getExistingNamesSet(unitId, {
            univerInstanceService: accessor.get(IUniverInstanceService),
            tableManager,
            definedNamesService: accessor.get(IDefinedNamesService),
        });

        if (name) {
            const tableNameValidation = validateSheetTableName(name, existingNamesSet);
            if (!tableNameValidation.valid) {
                const logService = accessor.get(ILogService);
                logService.warn(localeService.t<LocaleKey>('sheets-table.tableNameError'));
                return false;
            }

            oldTableConfig.name = table.getDisplayName();
            newTableConfig.name = name;
        }

        if (rowColOperation) {
            oldTableConfig.rowColOperation = {
                operationType: rowColOperation.operationType === IRangeOperationTypeEnum.Insert ? IRangeOperationTypeEnum.Delete : IRangeOperationTypeEnum.Insert,
                rowColType: rowColOperation.rowColType,
                index: rowColOperation.index,
                count: rowColOperation.count,
            };
            newTableConfig.rowColOperation = rowColOperation;
        }

        if (updateRange) {
            oldTableConfig.updateRange = {
                newRange: table.getRange(),
            };
            newTableConfig.updateRange = updateRange;
        }

        if (theme) {
            oldTableConfig.theme = table.getTableStyleId();
            newTableConfig.theme = theme;
        }

        const redoParams = {
            unitId,
            subUnitId: table.getSubunitId(),
            tableId,
            config: newTableConfig,
        };
        const undoParams = {
            unitId,
            subUnitId: table.getSubunitId(),
            tableId,
            config: oldTableConfig,
        };

        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const interceptorCommands = sheetInterceptorService.onCommandExecute({
            id: SetSheetTableCommand.id,
            params: {
                ...params,
                oldTableName: oldTableConfig.name,
            },
        });
        const redos = [
            ...(interceptorCommands.preRedos ?? []),
            { id: SetSheetTableMutation.id, params: redoParams },
            ...cellRedos,
            ...interceptorCommands.redos,
        ];
        const undos = [
            ...(interceptorCommands.preUndos ?? []),
            { id: SetSheetTableMutation.id, params: undoParams },
            ...cellUndos,
            ...interceptorCommands.undos,
        ];

        const commandService = accessor.get(ICommandService);
        if (!sequenceExecute(redos, commandService).result) {
            return false;
        }

        const undoRedoService = accessor.get(IUndoRedoService);
        undoRedoService.pushUndoRedo({
            unitID: unitId,
            undoMutations: undos,
            redoMutations: redos,
        });

        return true;
    },
};
