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

import type { IAccessor, ICommand, IRange } from '@univerjs/core';
import type { IReorderRangeMutationParams } from '../mutations/reorder-range.mutation';
import type { ISheetCommandSharedParams } from '../utils/interface';
import { CommandType, ICommandService, IUndoRedoService, sequenceExecute } from '@univerjs/core';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { ReorderRangeMutation, ReorderRangeUndoMutationFactory } from '../mutations/reorder-range.mutation';

export interface IReorderRangeCommandParams extends ISheetCommandSharedParams {
    range: IRange;
    order: { [key: number]: number };
}

export const ReorderRangeCommandId = 'sheet.command.reorder-range' as const;

export const ReorderRangeCommand: ICommand<IReorderRangeCommandParams> = {
    id: ReorderRangeCommandId,
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params: IReorderRangeCommandParams) => {
        const { subUnitId, unitId, range, order } = params;
        const commandService = accessor.get(ICommandService);

        const reorderMutation = {
            id: ReorderRangeMutation.id,
            params: {
                unitId,
                subUnitId,
                order,
                range,
            } as IReorderRangeMutationParams,
        };

        const undoReorderMutation = {
            id: ReorderRangeMutation.id,
            params: ReorderRangeUndoMutationFactory(reorderMutation.params),
        };
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const interceptorCommands = sheetInterceptorService.onCommandExecute({ id: ReorderRangeCommand.id, params });

        const redos = [
            ...(interceptorCommands.preRedos ?? []),
            reorderMutation,
            ...interceptorCommands.redos,
        ];

        const undos = [
            ...(interceptorCommands.preUndos ?? []),
            undoReorderMutation,
            ...interceptorCommands.undos,
        ];
        const result = sequenceExecute(redos, commandService);

        const reorderAfterIntercepted = sheetInterceptorService.afterCommandExecute({ id: ReorderRangeCommand.id, params });

        if (result.result) {
            sequenceExecute(reorderAfterIntercepted.redos, commandService);

            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [...undos, ...reorderAfterIntercepted.undos],
                redoMutations: [...redos, ...reorderAfterIntercepted.redos],
            });
            return true;
        }
        return false;
    },

};
