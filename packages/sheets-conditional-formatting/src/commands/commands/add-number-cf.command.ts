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
import type { IConditionFormattingRule, INumberHighlightCell } from '../../models/type';
import { CFNumberOperator, CFRuleType, CFSubRuleType } from '../../base/const';
import type { IAddConditionalRuleMutationParams } from '../mutations/add-conditional-rule.mutation';
import { AddConditionalRuleMutation } from '../mutations/add-conditional-rule.mutation';

interface IAddNumberCfParams {
    ranges: IRange[];
    stopIfTrue?: boolean;
    style: INumberHighlightCell['style'];
    operator: INumberHighlightCell['operator'];
    value: number | [number, number];
}
export const AddNumberCfCommand: ICommand<IAddNumberCfParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-number-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { ranges, style, stopIfTrue, operator, value } = params;
        const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
        let rule: IConditionFormattingRule;
        if ([CFNumberOperator.between, CFNumberOperator.notBetween].includes(operator)) {
            const _value = value as [number, number];
            if (_value.length !== 2 || !Array.isArray(_value)) {
                return false;
            }
            rule = {
                ranges, cfId,
                stopIfTrue: !!stopIfTrue,
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.number,
                    operator: operator as CFNumberOperator.between | CFNumberOperator.notBetween,
                    style,
                    value: _value as [number, number],
                },
            };
        } else {
            const _value = value as number;
            if (typeof _value !== 'number') {
                return false;
            }
            rule = {
                ranges, cfId,
                stopIfTrue: !!stopIfTrue,
                rule: {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.number,
                    operator: operator as any,
                    style,
                    value: _value,
                },
            };
        }
        return commandService.executeCommand(AddConditionalRuleMutation.id, { unitId, subUnitId, rule } as IAddConditionalRuleMutationParams);
    },
};
