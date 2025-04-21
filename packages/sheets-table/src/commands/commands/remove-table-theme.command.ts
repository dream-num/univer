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
import { CommandType, ICommandService, IUndoRedoService, sequenceExecute } from '@univerjs/core';
import { AddRangeThemeMutation, RemoveRangeThemeMutation, SheetRangeThemeModel } from '@univerjs/sheets';
import { SHEET_TABLE_CUSTOM_THEME_PREFIX } from '../../const';
import { TableManager } from '../../model/table-manager';
import { SetSheetTableMutation } from '../mutations/set-sheet-table.mutation';

export interface IRemoveTableThemeCommandParams {
    unitId: string;
    tableId: string;
    themeName: string;
}

export const RemoveTableThemeCommand: ICommand<IRemoveTableThemeCommandParams> = {
    id: 'sheet.command.remove-table-theme',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const { unitId, tableId, themeName } = params;

        const tableManager = accessor.get(TableManager);
        const rangeThemeModel = accessor.get(SheetRangeThemeModel);
        const table = tableManager.getTableById(unitId, tableId);
        if (!table) return false;
        const subUnitId = table.getSubunitId();

        const redos = [];
        const undos = [];

        const defaultRangeThemes = rangeThemeModel.getRegisteredRangeThemes().filter((item) => item?.startsWith('table-default'));
        const customRangeThemes = rangeThemeModel.getRegisteredRangeThemes().filter((item) => item?.startsWith(SHEET_TABLE_CUSTOM_THEME_PREFIX));

        let shouldBeSelectedTheme = customRangeThemes.find((item) => item !== themeName);
        if (!shouldBeSelectedTheme) {
            shouldBeSelectedTheme = defaultRangeThemes[0];
        }

        redos.push({ id: SetSheetTableMutation.id, params: { unitId, subUnitId, tableId, config: { theme: shouldBeSelectedTheme } } });
        redos.push({ id: RemoveRangeThemeMutation.id, params: { unitId, subUnitId, styleName: themeName } });

        const themeStyle = rangeThemeModel.getDefaultRangeThemeStyle(themeName);
        if (themeStyle) {
            undos.push({ id: AddRangeThemeMutation.id, params: { unitId, subUnitId, styleJSON: themeStyle.toJson() } });
            undos.push({ id: SetSheetTableMutation.id, params: { unitId, subUnitId, tableId, config: { theme: themeName } } });
        }

        const commandService = accessor.get(ICommandService);
        const res = sequenceExecute(redos, commandService);
        if (res) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: redos,
                undoMutations: undos,
            });
        }

        return true;
    },
};
