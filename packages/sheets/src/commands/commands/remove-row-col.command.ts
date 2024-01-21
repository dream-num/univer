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

import type { ICommand, IRange } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { InsertColMutation, InsertRowMutation } from '../mutations/insert-row-col.mutation';
import {
    RemoveColMutation,
    RemoveColMutationFactory,
    RemoveRowMutation,
    RemoveRowsUndoMutationFactory,
} from '../mutations/remove-row-col.mutation';
import { followSelectionOperation } from './utils/selection-utils';

export interface IRemoveRowColCommandParams {
    range: IRange;
}
export const RemoveRowCommandId = 'sheet.command.remove-row';
/**
 * This command would remove the selected rows. These selected rows can be non-continuous.
 */
export const RemoveRowCommand: ICommand = {
    type: CommandType.COMMAND,

    id: RemoveRowCommandId,

    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        let range = params?.range;
        if (!range) {
            range = selectionManagerService.getLast()?.range;
        }
        if (!range) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        range = {
            ...range,
            startColumn: 0,
            endColumn: Math.max(worksheet.getMaxColumns() - 1, 0),
        };

        // row count
        const removeRowsParams: IRemoveRowsMutationParams = {
            unitId,
            subUnitId,
            range,
        };
        const undoRemoveRowsParams: IInsertRowMutationParams = RemoveRowsUndoMutationFactory(
            removeRowsParams,
            worksheet
        );

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: RemoveRowCommand.id,
            params: { range } as IRemoveRowColCommandParams,
        });

        const commandService = accessor.get(ICommandService);
        const result = sequenceExecute(
            [
                { id: RemoveRowMutation.id, params: removeRowsParams },
                ...intercepted.redos,
                followSelectionOperation(range, workbook, worksheet),
            ],
            commandService
        );

        if (result.result) {
            accessor.get(IUndoRedoService).pushUndoRedo({
                unitID: unitId,
                undoMutations: [...intercepted.undos, { id: InsertRowMutation.id, params: undoRemoveRowsParams }],
                redoMutations: [{ id: RemoveRowMutation.id, params: removeRowsParams }, ...intercepted.redos],
            });
            return true;
        }
        return false;
    },
};
export const RemoveColCommandId = 'sheet.command.remove-col';
/**
 * This command would remove the selected columns. These selected rows can be non-continuous.
 */
export const RemoveColCommand: ICommand = {
    type: CommandType.COMMAND,
    id: RemoveColCommandId,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        let range = params?.range;
        if (!range) {
            range = selectionManagerService.getLast()?.range;
        }
        if (!range) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        range = {
            ...range,
            startRow: 0,
            endRow: Math.max(worksheet.getMaxRows() - 1, 0),
        };

        // col count
        const removeColParams: IRemoveColMutationParams = {
            unitId,
            subUnitId,
            range,
        };
        const undoRemoveColParams: IInsertColMutationParams = RemoveColMutationFactory(accessor, removeColParams);

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: RemoveColCommand.id,
            params: { range } as IRemoveRowColCommandParams,
        });
        const commandService = accessor.get(ICommandService);
        const result = sequenceExecute(
            [
                { id: RemoveColMutation.id, params: removeColParams },
                ...intercepted.redos,
                followSelectionOperation(range, workbook, worksheet),
            ],
            commandService
        );

        if (result.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [...intercepted.undos, { id: InsertColMutation.id, params: undoRemoveColParams }],
                redoMutations: [{ id: RemoveColMutation.id, params: removeColParams }, ...intercepted.redos],
            });

            return true;
        }
        return false;
    },
};
