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

import type { ICommand } from '@univerjs/core';
import type { LocaleKey } from '../../locale/types';
import type { ITableSetConfig } from '../../types/type';
import {
    CommandType,
    ICommandService,
    ILogService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
} from '@univerjs/core';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import { SheetInterceptorService } from '@univerjs/sheets';
import { TableManager } from '../../models/table-manager';
import { IRangeOperationTypeEnum } from '../../types/type';
import { getExistingNamesSet } from '../../util';
import { validateSheetTableName } from '../../util/table-name';
import { SetSheetTableMutation } from '../mutations/set-sheet-table.mutation';

export interface ISetSheetTableCommandParams extends ITableSetConfig {
    unitId: string;
    tableId: string;
    oldTableName?: string;
}

export const SetSheetTableCommand: ICommand<ISetSheetTableCommandParams> = {
    id: 'sheet.command.set-table-config',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const { unitId, tableId, name, updateRange, rowColOperation, theme } = params;
        const tableManager = accessor.get(TableManager);
        const table = tableManager.getTableById(unitId, tableId);

        if (!table) return false;

        const oldTableConfig: ITableSetConfig = {};
        const newTableConfig: ITableSetConfig = {};
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
            ...interceptorCommands.redos,
        ];
        const undos = [
            ...(interceptorCommands.preUndos ?? []),
            { id: SetSheetTableMutation.id, params: undoParams },
            ...interceptorCommands.undos,
        ];

        const commandService = accessor.get(ICommandService);
        redos.forEach((mutation) => {
            commandService.executeCommand(mutation.id, mutation.params);
        });

        const undoRedoService = accessor.get(IUndoRedoService);
        undoRedoService.pushUndoRedo({
            unitID: unitId,
            undoMutations: undos,
            redoMutations: redos,
        });

        return true;
    },
};
