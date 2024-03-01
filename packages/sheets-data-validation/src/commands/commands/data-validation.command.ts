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

import { CommandType, ICommandService } from '@univerjs/core';
import type { DataValidationType, ICommand, IDataValidationRuleBase } from '@univerjs/core';
import type { IUpdateDataValidationCommandParams } from '@univerjs/data-validation';
import { DataValidatorRegistryService, UpdateDataValidationCommand, UpdateRuleType } from '@univerjs/data-validation';
import { SheetDataValidationService } from '../../services/dv.service';

export interface IUpdateSheetDataValidationTypeCommandParams {
    unitId: string;
    subUnitId: string;
    ruleId: string;
    type: DataValidationType;
}

export const UpdateDataValidationTypeCommand: ICommand<IUpdateSheetDataValidationTypeCommandParams> = {
    id: 'sheets-data-validation.command.updateRuleType',
    type: CommandType.COMMAND,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, subUnitId, ruleId, type } = params;
        const dataValidationService = accessor.get(SheetDataValidationService);
        const validatorService = accessor.get(DataValidatorRegistryService);
        const commandService = accessor.get(ICommandService);
        const manager = dataValidationService.get(unitId, subUnitId);
        const validator = validatorService.getValidatorItem(type);
        const currentRule = manager.getRuleById(ruleId);

        if (!currentRule || !validator) {
            return false;
        }

        const oldValidator = validatorService.getValidatorItem(currentRule.type);
        if (!oldValidator) {
            return false;
        }

        const operator = validator.operators[0];

        // invalid formula, skip update
        if (validator.validatorFormula({
            type,
            operator,
            formula1: currentRule.formula1,
            formula2: currentRule.formula2,
        })) {
            return false;
        }

         // need't to change operator
        const updateParams: IUpdateDataValidationCommandParams = {
            unitId,
            subUnitId,
            ruleId,
            payload: {
                type: UpdateRuleType.SETTING,
                payload: {
                    type,
                    operator,
                },
            },
        };
        commandService.executeCommand(UpdateDataValidationCommand.id, updateParams);
        return true;
    },
};
