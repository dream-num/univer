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
import type { IAddSheetDataValidationCommandParams } from '@univerjs/sheets-data-validation';
import { CommandType, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { AddSheetDataValidationCommand, createDefaultNewRule } from '@univerjs/sheets-data-validation';
import { OpenValidationPanelOperation } from '../operations/data-validation.operation';

export const AddSheetDataValidationAndOpenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'data-validation.command.addRuleAndOpen',
    handler(accessor) {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { workbook, worksheet } = target;
        const rule = createDefaultNewRule(accessor);
        const commandService = accessor.get(ICommandService);
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        const addParams: IAddSheetDataValidationCommandParams = {
            rule,
            unitId,
            subUnitId,
        };

        const res = commandService.syncExecuteCommand(AddSheetDataValidationCommand.id, addParams);

        if (res) {
            commandService.syncExecuteCommand(OpenValidationPanelOperation.id, {
                ruleId: rule.uid,
                isAdd: true,
            });

            return true;
        }
        return false;
    },
};
