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

import type { ICommand, IMutationInfo, IRange } from '@univerjs/core';
import type { ITableOptions } from '../../types/type';
import { CommandType, generateRandomId, ICommandService, IUndoRedoService, LocaleService, sequenceExecute } from '@univerjs/core';
import { TableManager } from '../../model/table-manager';
import { AddSheetTableMutation } from '../mutations/add-sheet-table.mutation';
import { DeleteSheetTableMutation } from '../mutations/delete-sheet-table.mutation';

export interface IAddSheetTableCommandParams {
    unitId: string;
    subUnitId: string;
    range: IRange;
    id?: string;
    name?: string;
    options?: ITableOptions;
}

export const AddSheetTableCommand: ICommand<IAddSheetTableCommandParams> = {
    id: 'sheet.command.add-table',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const localeService = accessor.get(LocaleService);
        const tableId = params.id ?? generateRandomId();
        let tableName = params.name;
        if (!tableName) {
            const tableManager = accessor.get(TableManager);
            const tableCount = tableManager.getTableList(params.unitId).length;
            tableName = `${localeService.t('sheets-table.tablePrefix')} ${tableCount + 1}`;
        }

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const tableManager = accessor.get(TableManager);
        const { unitId, subUnitId, range } = params;
        const header = tableManager.getColumnHeader(unitId, subUnitId, range, localeService.t('sheets-table.columnPrefix'));

        redos.push({ id: AddSheetTableMutation.id, params: { ...params, tableId, name: tableName, header } });
        undos.push({ id: DeleteSheetTableMutation.id, params: { tableId, unitId: params.unitId } });

        const res = sequenceExecute(redos, commandService);

        if (res) {
            undoRedoService.pushUndoRedo({
                unitID: params.unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
        }

        return true;
    },
};
