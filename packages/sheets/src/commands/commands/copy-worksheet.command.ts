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

import type { ICommand } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    Tools,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IInsertSheetMutationParams,
    IRemoveSheetMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { InsertSheetMutation, InsertSheetUndoMutationFactory } from '../mutations/insert-sheet.mutation';
import { RemoveSheetMutation } from '../mutations/remove-sheet.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface ICopySheetCommandParams {
    unitId?: string;
    subUnitId?: string;
}

export const CopySheetCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.copy-sheet',
    handler: async (accessor: IAccessor, params?: ICopySheetCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const localeService = accessor.get(LocaleService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) {
            return false;
        }

        const { workbook, worksheet, unitId } = target;
        const config = Tools.deepClone(worksheet.getConfig());
        config.name += localeService.t('sheets.tabs.sheetCopy');
        config.id = Tools.generateRandomId();
        const sheetIndex = workbook.getSheetIndex(worksheet);

        const insertSheetMutationParams: IInsertSheetMutationParams = {
            index: sheetIndex + 1,
            sheet: config,
            unitId,
        };

        const removeSheetMutationParams: IRemoveSheetMutationParams = InsertSheetUndoMutationFactory(
            accessor,
            insertSheetMutationParams
        );
        const insertResult = commandService.syncExecuteCommand(InsertSheetMutation.id, insertSheetMutationParams);

        if (insertResult) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: RemoveSheetMutation.id, params: removeSheetMutationParams }],
                redoMutations: [{ id: InsertSheetMutation.id, params: insertSheetMutationParams }],
            });
            return true;
        }
        return false;
    },
};
