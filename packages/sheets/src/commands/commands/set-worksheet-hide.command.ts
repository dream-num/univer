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

import type { IAccessor, ICommand } from '@univerjs/core';
import type { ISetWorksheetHideMutationParams } from '../mutations/set-worksheet-hide.mutation';

import {
    BooleanNumber,
    CommandType,
    ErrorService,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
} from '@univerjs/core';
import { SetWorksheetHideMutation, SetWorksheetHideMutationFactory } from '../mutations/set-worksheet-hide.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface ISetWorksheetHiddenCommandParams {
    subUnitId?: string;
}

export const SetWorksheetHideCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-hidden',

    handler: (accessor: IAccessor, params?: ISetWorksheetHiddenCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const errorService = accessor.get(ErrorService);
        const localeService = accessor.get(LocaleService);

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

        const { workbook, worksheet, unitId, subUnitId } = target;
        const hidden = worksheet.getConfig().hidden;
        if (hidden === BooleanNumber.TRUE) return false;

        const redoMutationParams: ISetWorksheetHideMutationParams = {
            unitId,
            subUnitId,
            hidden: BooleanNumber.TRUE,
        };

        const undoMutationParams = SetWorksheetHideMutationFactory(accessor, redoMutationParams);

        const worksheets = workbook.getSheets();
        const visibleWorksheets = worksheets.filter((sheet) => sheet.getConfig().hidden === BooleanNumber.FALSE);
        if (visibleWorksheets.length === 1) {
            errorService.emit(localeService.t('sheets.info.hideSheet'));
            return false;
        }

        const result = commandService.syncExecuteCommand(SetWorksheetHideMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetWorksheetHideMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetWorksheetHideMutation.id, params: redoMutationParams }],
            });
            return true;
        }

        return false;
    },
};
