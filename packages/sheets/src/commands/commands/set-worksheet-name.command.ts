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
    sequenceExecute,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import type { ISetWorksheetNameMutationParams } from '../mutations/set-worksheet-name.mutation';
import { SetWorksheetNameMutation, SetWorksheetNameMutationFactory } from '../mutations/set-worksheet-name.mutation';

export interface ISetWorksheetNameCommandParams {
    name: string;
    worksheetId?: string;
    workbookId?: string;
}

/**
 * The command to set the sheet name.
 */
export const SetWorksheetNameCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-name',

    handler: async (accessor: IAccessor, params: ISetWorksheetNameCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const workbookId = params.workbookId || univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId =
            params.worksheetId || univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();

        const redoMutationParams: ISetWorksheetNameMutationParams = {
            worksheetId,
            name: params.name,
            workbookId,
        };
        const undoMutationParams: ISetWorksheetNameMutationParams = SetWorksheetNameMutationFactory(
            accessor,
            redoMutationParams
        );

        const interceptorCommands = sheetInterceptorService.onCommandExecute({
            id: SetWorksheetNameCommand.id,
            params,
        });

        const redos = [{ id: SetWorksheetNameMutation.id, params: redoMutationParams }, ...interceptorCommands.redos];
        const undos = [...interceptorCommands.undos, { id: SetWorksheetNameMutation.id, params: undoMutationParams }];

        const result = await sequenceExecute(redos, commandService).result;
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: undos,
                redoMutations: redos,
            });
            return true;
        }
        return false;

        // const result = commandService.syncExecuteCommand(SetWorksheetNameMutation.id, redoMutationParams);

        // if (result) {
        //     undoRedoService.pushUndoRedo({
        //         unitID: workbookId,
        //         undoMutations: [{ id: SetWorksheetNameMutation.id, params: undoMutationParams }],
        //         redoMutations: [{ id: SetWorksheetNameMutation.id, params: redoMutationParams }],
        //     });

        //     return true;
        // }

        // return false;
    },
};
