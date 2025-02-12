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
import { CommandType, ICommandService, IUniverInstanceService, sequenceExecute, UniverInstanceType } from '@univerjs/core';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import type { ISetWorkbookNameMutationParams } from '../mutations/set-workbook-name.mutation';
import { SetWorkbookNameMutation } from '../mutations/set-workbook-name.mutation';

export interface ISetWorkbookNameCommandParams {
    name: string;
    unitId: string;
}

/**
 * The command to set the workbook name. It does not support undo redo.
 */
export const SetWorkbookNameCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-workbook-name',
    handler: async (accessor: IAccessor, params: ISetWorkbookNameCommandParams) => {
        const instanceService = accessor.get(IUniverInstanceService);
        const workbook = instanceService.getUnit(params.unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return false;

        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const interceptedCommands = sheetInterceptorService.onCommandExecute({
            id: SetWorkbookNameCommand.id,
            params,
        });

        const redoMutationParams: ISetWorkbookNameMutationParams = {
            name: params.name,
            unitId: params.unitId,
        };

        const redos = [
            ...(interceptedCommands.preRedos ?? []),
            { id: SetWorkbookNameMutation.id, params: redoMutationParams },
            ...interceptedCommands.redos,
        ];

        const commandService = accessor.get(ICommandService);
        return sequenceExecute(redos, commandService).result;
    },
};
