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

import type { IAccessor, ICommand, IMutationInfo, Workbook } from '@univerjs/core';
import type {
    IInsertSheetMutationParams,
    IRemoveSheetMutationParams,
} from '../../basics/interfaces/mutation-interface';

import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    sequenceExecute,
    Tools,
} from '@univerjs/core';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
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
    handler: (accessor: IAccessor, params?: ICopySheetCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const localeService = accessor.get(LocaleService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) {
            return false;
        }

        const { workbook, worksheet, unitId, subUnitId } = target;
        const config = Tools.deepClone(worksheet.getConfig());
        config.name = getCopyUniqueSheetName(workbook, localeService, config.name);
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

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: CopySheetCommand.id,
            params: { unitId, subUnitId, targetSubUnitId: config.id },
        });

        const redos: IMutationInfo[] = [
            ...(intercepted.preRedos ?? []),
            { id: InsertSheetMutation.id, params: insertSheetMutationParams },
            ...intercepted.redos,
        ];

        const undos: IMutationInfo[] = [
            ...(intercepted.preUndos ?? []),
            { id: RemoveSheetMutation.id, params: removeSheetMutationParams },
            ...intercepted.undos,
        ];

        const insertResult = sequenceExecute(redos, commandService).result;

        if (insertResult) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
            return true;
        }
        return false;
    },
};

// If Sheet1(Copy) already exists and you copy Sheet1, you should get Sheet1(Copy2)
export function getCopyUniqueSheetName(workbook: Workbook, localeService: LocaleService, name: string): string {
    let output = name + localeService.t('sheets.tabs.sheetCopy', '');
    let count = 2;

    while (workbook.checkSheetName(output)) {
        output = name + localeService.t('sheets.tabs.sheetCopy', `${count}`);
        count++;
    }
    return output;
}
