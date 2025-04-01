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

import type { IAccessor, ICommand, IMutationInfo } from '@univerjs/core';
import type { RangeThemeStyle } from '@univerjs/sheets';
import { CommandType, ICommandService, IUndoRedoService, sequenceExecute } from '@univerjs/core';
import { AddRangeThemeMutation, RemoveRangeThemeMutation } from '@univerjs/sheets';
import { TableManager } from '../../model/table-manager';
import { SetSheetTableMutation } from '../mutations/set-sheet-table.mutation';

export interface IAddTableThemeCommandParams {
    unitId: string;
    tableId: string;
    themeStyle: RangeThemeStyle;
}

export const AddTableThemeCommand: ICommand<IAddTableThemeCommandParams> = {
    id: 'sheet.command.add-table-theme',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params) => {
        if (!params) {
            return false;
        }

        const tableManager = accessor.get(TableManager);

        const { unitId, tableId, themeStyle } = params;
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const table = tableManager.getTableById(unitId, tableId);
        if (!table) return false;
        const subUnitId = table.getSubunitId();

        redos.push({
            id: AddRangeThemeMutation.id,
            params: {
                unitId,
                subUnitId,
                styleJSON: themeStyle.toJson(),
            },
        });

        redos.push({
            id: SetSheetTableMutation.id,
            params: {
                unitId,
                subUnitId,
                tableId,
                config: {
                    theme: themeStyle.getName(),
                },
            },
        });

        undos.push({
            id: SetSheetTableMutation.id,
            params: {
                unitId,
                subUnitId,
                tableId,
                config: {
                    themeStyle: table.getTableStyleId(),
                },
            },
        });

        undos.push({
            id: RemoveRangeThemeMutation.id,
            params: {
                unitId,
                subUnitId,
                styleName: themeStyle.getName(),
            },
        });

        const commandService = accessor.get(ICommandService);
        const res = sequenceExecute(redos, commandService);
        if (res) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
        }

        return true;
    },
};
