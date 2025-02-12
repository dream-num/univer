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

import type { IAccessor, ICommand, IExecutionOptions } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService } from '@univerjs/core';

import type { ISetWorksheetActiveOperationParams } from '../operations/set-worksheet-active.operation';
import { SetWorksheetActiveOperation } from '../operations/set-worksheet-active.operation';
import { getSheetCommandTarget } from './utils/target-util';

export interface ISetWorksheetActivateCommandParams {
    unitId?: string;
    subUnitId?: string;
}

/** We should delay this command to execute, after focus moves to the correct element. */
const SET_WORKSHEET_ACTIVE_DELAY = 4;

export const SetWorksheetActivateCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-activate',
    handler: (accessor: IAccessor, params?: ISetWorksheetActivateCommandParams, options?: IExecutionOptions) => {
        const commandService = accessor.get(ICommandService);

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        return new Promise((resolve) => {
            setTimeout(() => {
                const result = commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
                    unitId,
                    subUnitId,
                } as ISetWorksheetActiveOperationParams, options);

                resolve(result);
            }, SET_WORKSHEET_ACTIVE_DELAY);
        });
    },
};
