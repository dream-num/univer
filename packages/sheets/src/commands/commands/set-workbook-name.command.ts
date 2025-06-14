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
import type { ISetWorkbookNameMutationParams } from '../mutations/set-workbook-name.mutation';
import { CommandType, ICommandService, IUniverInstanceService, sequenceExecute } from '@univerjs/core';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { SetWorkbookNameMutation } from '../mutations/set-workbook-name.mutation';
import { getSheetCommandTargetWorkbook } from './utils/target-util';

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
    handler: (accessor: IAccessor, params: ISetWorkbookNameCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const target = getSheetCommandTargetWorkbook(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

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

        return sequenceExecute(redos, commandService).result;
    },
};
