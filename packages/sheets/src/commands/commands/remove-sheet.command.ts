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
import type {
    IInsertSheetMutationParams,
    IRemoveSheetMutationParams,
} from '../../basics/interfaces/mutation-interface';
import type { IUniverSheetsConfig } from '../../controllers/config.schema';

import {
    CommandType,
    ICommandService,
    IConfigService,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
} from '@univerjs/core';
import { defaultLargeSheetOperationConfig, SHEETS_PLUGIN_CONFIG_KEY } from '../../controllers/config.schema';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { InsertSheetMutation } from '../mutations/insert-sheet.mutation';
import { RemoveSheetMutation, RemoveSheetUndoMutationFactory } from '../mutations/remove-sheet.mutation';
import { countCells } from './util';
import { getSheetCommandTarget } from './utils/target-util';

export interface IRemoveSheetCommandParams {
    unitId?: string;
    subUnitId: string;
}

/**
 * The command to insert new worksheet
 */
export const RemoveSheetCommand: ICommand = {
    id: 'sheet.command.remove-sheet',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IRemoveSheetCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const configService = accessor.get(IConfigService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId, workbook, worksheet } = target;

        if (workbook.getSheets().length <= 1) return false;

        // Check if this is a large sheet that shouldn't support undo/redo
        const pluginConfig = configService.getConfig<IUniverSheetsConfig>(SHEETS_PLUGIN_CONFIG_KEY);
        const largeSheetConfig = {
            ...defaultLargeSheetOperationConfig,
            ...pluginConfig?.largeSheetOperation,
        };
        const cellCount = countCells(worksheet.getCellMatrix());
        const isLargeSheet = cellCount >= largeSheetConfig.largeSheetCellCountThreshold;

        // prepare do mutations
        const RemoveSheetMutationParams: IRemoveSheetMutationParams = {
            subUnitId,
            unitId,
            subUnitName: worksheet.getName(),
        };
        // For large sheets, we don't need to prepare undo mutation since undo/redo won't be supported
        const InsertSheetMutationParams: IInsertSheetMutationParams | null = isLargeSheet
            ? null
            : RemoveSheetUndoMutationFactory(accessor, RemoveSheetMutationParams);
        const intercepted = sheetInterceptorService.onCommandExecute({
            id: RemoveSheetCommand.id,
            params: { unitId, subUnitId },
        });
        const redos = [...(intercepted.preRedos ?? []), { id: RemoveSheetMutation.id, params: RemoveSheetMutationParams }, ...intercepted.redos];
        const undos = isLargeSheet
            ? []
            : [...(intercepted.preUndos ?? []), { id: InsertSheetMutation.id, params: InsertSheetMutationParams! }, ...intercepted.undos];
        const result = sequenceExecute(redos, commandService);

        if (result.result) {
            if (isLargeSheet) {
                // For large sheets, clear undo/redo to disable undo/redo functionality
                undoRedoService.clearUndoRedo(unitId);
            } else {
                undoRedoService.pushUndoRedo({
                    unitID: unitId,
                    undoMutations: undos,
                    redoMutations: redos,
                });
            }

            return true;
        }

        return false;
    },
};
