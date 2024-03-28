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
    IUniverInstanceService,
} from '@univerjs/core';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';
import type { IConditionFormattingRule, IDataBar } from '../../models/type';
import { CFRuleType } from '../../base/const';
import type { IAddConditionalRuleMutationParams } from '../mutations/add-conditional-rule.mutation';
import { AddConditionalRuleMutation } from '../mutations/add-conditional-rule.mutation';

interface IAddUniqueValuesConditionalRuleParams {
    ranges: IRange[];
    stopIfTrue?: boolean;
    min: IDataBar['config']['min'];
    max: IDataBar['config']['max'];
    nativeColor: IDataBar['config']['nativeColor'];
    positiveColor: IDataBar['config']['positiveColor'];
    isGradient: IDataBar['config']['isGradient'];

}
export const AddDataBarConditionalRuleCommand: ICommand<IAddUniqueValuesConditionalRuleParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-data-bar-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { ranges, min, max, nativeColor, positiveColor, isGradient, stopIfTrue } = params;
        const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
        const rule: IConditionFormattingRule = {
            ranges, cfId,
            stopIfTrue: !!stopIfTrue,
            rule: {
                type: CFRuleType.dataBar,
                config: {
                    min, max, nativeColor, positiveColor, isGradient,
                },
            },
        };
        return commandService.executeCommand(AddConditionalRuleMutation.id, { unitId, subUnitId, rule } as IAddConditionalRuleMutationParams);
    },
};
