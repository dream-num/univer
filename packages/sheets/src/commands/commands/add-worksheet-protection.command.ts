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

import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService } from '@univerjs/core';
import type { IWorksheetProtectionRule } from '../../services/permission/type';
import { AddWorksheetProtectionMutation } from '../mutations/add-worksheet-protection.mutation';

export interface IAddWorksheetProtectionParams {
    unitId: string;
    rule: IWorksheetProtectionRule;
}

export const AddWorksheetProtectionCommand: ICommand<IAddWorksheetProtectionParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-protection',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const { rule, unitId } = params;
        const result = await commandService.executeCommand(AddWorksheetProtectionMutation.id, {
            unitId,
            rule,
            subUnitId: rule.subUnitId,
        });

        return result;
    },
};
