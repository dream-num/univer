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

import type { ICommand, IWorksheetData } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    mergeWorksheetSnapshotWithDefault,
    Tools,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IInsertSheetMutationParams,
    IRemoveSheetMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { InsertSheetMutation, InsertSheetUndoMutationFactory } from '../mutations/insert-sheet.mutation';
import { RemoveSheetMutation } from '../mutations/remove-sheet.mutation';

export interface IInsertSheetCommandParams {
    unitId?: string;
    index?: number;
    sheet?: IWorksheetData;
}

/**
 * The command to insert new worksheet
 */
export const InsertSheetCommand: ICommand = {
    id: 'sheet.command.insert-sheet',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IInsertSheetCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const localeService = accessor.get(LocaleService);

        const unitId = params?.unitId ?? univerInstanceService.getCurrentUniverSheetInstance().getUnitId();

        const workbook = univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) return false;

        let index = workbook.getSheets().length;
        let sheetConfig = mergeWorksheetSnapshotWithDefault({});
        if (params) {
            index = params.index ?? index;
            if (params.sheet) {
                sheetConfig = params.sheet;
            } else {
                sheetConfig.id = Tools.generateRandomId();
                sheetConfig.name = workbook.generateNewSheetName(`${localeService.t('sheets.sheet')}`);
            }
        } else {
            sheetConfig.id = Tools.generateRandomId();
            sheetConfig.name = workbook.generateNewSheetName(`${localeService.t('sheets.sheet')}`);
        }

        // prepare do mutations
        const insertSheetMutationParams: IInsertSheetMutationParams = {
            index,
            sheet: sheetConfig,
            unitId,
        };
        const removeSheetMutationParams: IRemoveSheetMutationParams = InsertSheetUndoMutationFactory(
            accessor,
            insertSheetMutationParams
        );
        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.syncExecuteCommand(InsertSheetMutation.id, insertSheetMutationParams);

        if (result) {
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
