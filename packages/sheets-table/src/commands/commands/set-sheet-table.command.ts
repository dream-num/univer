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
import type { ITableSetConfig } from '../../types/type';
import type { ISetSheetTableMutationParams } from '../mutations/set-sheet-table.mutation';
import { CommandType, ICommandService, IUndoRedoService } from '@univerjs/core';
import { TableManager } from '../../model/table-manager';
import { IRangeOperationTypeEnum } from '../../types/type';
import { SetSheetTableMutation } from '../mutations/set-sheet-table.mutation';

export interface ISetSheetTableCommandParams extends ITableSetConfig {
    unitId: string;
    tableId: string;
}

export const SetSheetTableCommand: ICommand<ISetSheetTableCommandParams> = {
    id: 'sheet.command.set-table-config',
    type: CommandType.COMMAND,
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

        if (name) {
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

        const commandService = accessor.get(ICommandService);
        commandService.executeCommand<ISetSheetTableMutationParams>(SetSheetTableMutation.id, redoParams);

        const undoRedoService = accessor.get(IUndoRedoService);
        undoRedoService.pushUndoRedo({
            unitID: unitId,
            undoMutations: [
                {
                    id: SetSheetTableMutation.id,
                    params: {
                        unitId,
                        subUnitId: table.getSubunitId(),
                        tableId,
                        config: oldTableConfig,
                    },
                },
            ],
            redoMutations: [
                {
                    id: SetSheetTableMutation.id,
                    params: redoParams,
                },
            ],
        });

        return true;
    },
};
