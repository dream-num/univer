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
import type { RangeThemeStyle } from '../../model/range-theme-util';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';

import { getSheetCommandTarget } from '../commands/utils/target-util';
import { RegisterWorksheetRangeThemeStyleMutation } from '../mutations/register-range-theme.mutation';
import { UnregisterWorksheetRangeThemeStyleMutation } from '../mutations/unregister-range-theme-style.mutation';

export interface IRegisterWorksheetRangeThemeStyleCommandParams {
    unitId: string;
    rangeThemeStyle: RangeThemeStyle;
}

export const RegisterWorksheetRangeThemeStyleCommand: ICommand<IRegisterWorksheetRangeThemeStyleCommandParams> = {
    id: 'sheet.command.register-worksheet-range-theme-style',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const { unitId, rangeThemeStyle } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const redoParam = {
            unitId,
            themeName: rangeThemeStyle.getName(),
            rangeThemeStyleJson: rangeThemeStyle.toJson(),
        };
        const undoParam = {
            unitId,
            themeName: rangeThemeStyle.getName(),
        };
        const result = commandService.syncExecuteCommand(RegisterWorksheetRangeThemeStyleMutation.id, redoParam);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: UnregisterWorksheetRangeThemeStyleMutation.id, params: undoParam }],
                redoMutations: [{ id: RegisterWorksheetRangeThemeStyleMutation.id, params: redoParam }],
            });
        }
        return true;
    },
};
