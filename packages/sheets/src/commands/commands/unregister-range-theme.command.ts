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
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';

import { SheetRangeThemeModel } from '../../model/range-theme-model';
import { getSheetCommandTarget } from '../commands/utils/target-util';
import { RegisterWorksheetRangeThemeStyleMutation } from '../mutations/register-range-theme.mutation';
import { UnregisterWorksheetRangeThemeStyleMutation } from '../mutations/unregister-range-theme-style.mutation';

export interface IUnregisterWorksheetRangeThemeStyleCommandParams {
    unitId: string;
    themeName: string;
}

export const UnregisterWorksheetRangeThemeStyleCommand: ICommand<IUnregisterWorksheetRangeThemeStyleCommandParams> = {
    id: 'sheet.command.unregister-worksheet-range-theme-style',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const { unitId, themeName } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetRangeThemeModel = accessor.get(SheetRangeThemeModel);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const redoParam = {
            unitId,
            themeName,
        };
        const undoParam = {
            unitId,
            themeName,
            rangeThemeStyleJson: sheetRangeThemeModel.getRangeThemeStyle(unitId, themeName)?.toJson(),
        };
        const result = commandService.syncExecuteCommand(RegisterWorksheetRangeThemeStyleMutation.id, params);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: RegisterWorksheetRangeThemeStyleMutation.id, params: undoParam }],
                redoMutations: [{ id: UnregisterWorksheetRangeThemeStyleMutation.id, params: redoParam }],
            });
        }
        return true;
    },
};
