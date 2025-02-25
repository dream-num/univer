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
import type { ISetWorksheetNameMutationParams } from '../mutations/set-worksheet-name.mutation';

import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
} from '@univerjs/core';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { SetWorksheetNameMutation, SetWorksheetNameMutationFactory } from '../mutations/set-worksheet-name.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface ISetWorksheetNameCommandParams {
    name: string;
    subUnitId?: string;
    unitId?: string;
}

/**
 * The command to set the sheet name.
 */
export const SetWorksheetNameCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-name',

    handler: (accessor: IAccessor, params: ISetWorksheetNameCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const redoMutationParams: ISetWorksheetNameMutationParams = {
            subUnitId,
            name: params.name,
            unitId,
        };
        const undoMutationParams: ISetWorksheetNameMutationParams = SetWorksheetNameMutationFactory(
            accessor,
            redoMutationParams
        );

        const interceptorCommands = sheetInterceptorService.onCommandExecute({
            id: SetWorksheetNameCommand.id,
            params,
        });

        const redos = [
            ...(interceptorCommands.preRedos ?? []),
            { id: SetWorksheetNameMutation.id, params: redoMutationParams },
            ...interceptorCommands.redos,
        ];
        const undos = [
            ...(interceptorCommands.preUndos ?? []),
            { id: SetWorksheetNameMutation.id, params: undoMutationParams },
            ...interceptorCommands.undos,
        ];

        const result = sequenceExecute(redos, commandService).result;
        if (result) {
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
