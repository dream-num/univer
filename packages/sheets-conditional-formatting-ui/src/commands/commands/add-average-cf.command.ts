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

import type { ICommand, IRange } from '@univerjs/core';
import type { IAddConditionalRuleMutationParams, IAverageHighlightCell, IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import {
    CommandType,
    ICommandService,
    IUniverInstanceService,
} from '@univerjs/core';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { AddConditionalRuleMutation, CFRuleType, CFSubRuleType, ConditionalFormattingRuleModel } from '@univerjs/sheets-conditional-formatting';

interface IAddAverageCfParams {
    ranges: IRange[];
    stopIfTrue?: boolean;
    style: IAverageHighlightCell['style'];
    operator: IAverageHighlightCell['operator'];
}
export const AddAverageCfCommand: ICommand<IAddAverageCfParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-average-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { ranges, style, stopIfTrue, operator } = params;
        const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
        const rule: IConditionFormattingRule = {
            ranges,
            cfId,
            stopIfTrue: !!stopIfTrue,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.average,
                operator,
                style,
            },
        };
        const result = commandService.executeCommand(AddConditionalRuleMutation.id, { unitId, subUnitId, rule } as IAddConditionalRuleMutationParams);
        return result;
    },
};
