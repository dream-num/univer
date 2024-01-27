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
    IUniverInstanceService,
} from '@univerjs/core';
import { ConditionalFormatRuleModel } from '../../models/conditional-format-rule-model';
import type { IConditionFormatRule } from '../../models/type';
import { NumberOperator, RuleType, SubRuleType } from '../../base/const';

export const addCfRule: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-conditional-rule',
    handler(accessor) {
        const conditionalFormatRuleModel = accessor.get(ConditionalFormatRuleModel);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitID = workbook.getUnitId();
        const sheetId = worksheet.getSheetId();
        const cfId = conditionalFormatRuleModel.createCfId(unitID, sheetId);
        const rule: IConditionFormatRule = { ranges: [{ startRow: 0, endRow: 99, startColumn: 0, endColumn: 0 }], cfId, stopIfTrue: false,
                                             rule: {
                                                 type: RuleType.highlightCell,
                                                 subType: SubRuleType.number,
                                                 operator: NumberOperator.greaterThan,
                                                 value: 2,
                                                 style: {
                                                     b: true,
                                                 },
                                             } };
        conditionalFormatRuleModel.addRule(unitID, sheetId, rule);
        return true;
    },
};
