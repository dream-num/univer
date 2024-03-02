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
import { CommandType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { ConditionalFormatMenuController } from '../../controllers/cf.menu.controller';
import { createDefaultRule, RuleType, SubRuleType } from '../../base/const';
import type { IColorScale, IConditionFormatRule, IDataBar, IFormulaHighlightCell, IRankHighlightCell } from '../../models/type';

interface IOpenConditionalFormatOperatorParams {
    value: number;
}

export enum OPERATION {
    createRule = 1,
    viewRule,
    highlightCell,
    rank,
    formula,
    colorScale,
    dataBar,
    icon,
    clearRangeRules,
    clearWorkSheetRules,
}
export const OpenConditionalFormatOperator: ICommand = {
    id: 'sheet.operation.open.conditional.format.panel',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor, params: IOpenConditionalFormatOperatorParams) => {
        const conditionalFormatMenuController = accessor.get(ConditionalFormatMenuController);
        const type = params.value;
        switch (type) {
            case OPERATION.highlightCell:{
                conditionalFormatMenuController.openPanel(createDefaultRule());
                break;
            }
            case OPERATION.rank:{
                const rule = {
                    ...createDefaultRule,
                    rule: {
                        type: RuleType.highlightCell,
                        subType: SubRuleType.rank,
                    },
                } as IConditionFormatRule<IRankHighlightCell>;
                conditionalFormatMenuController.openPanel(rule);
                break;
            }
            case OPERATION.formula:{
                const rule = {
                    ...createDefaultRule,
                    rule: {
                        type: RuleType.highlightCell,
                        subType: SubRuleType.formula,
                    },
                } as IConditionFormatRule<IFormulaHighlightCell>;
                conditionalFormatMenuController.openPanel(rule);
                break;
            }
            case OPERATION.colorScale:{
                const rule = {
                    ...createDefaultRule,
                    rule: {
                        type: RuleType.colorScale,
                        config: [],
                    },
                } as unknown as IConditionFormatRule<IColorScale>;
                conditionalFormatMenuController.openPanel(rule);
                break;
            }
            case OPERATION.dataBar:{
                const rule = {
                    ...createDefaultRule,
                    rule: {
                        type: RuleType.dataBar,
                    },
                } as unknown as IConditionFormatRule<IDataBar>;
                conditionalFormatMenuController.openPanel(rule);
                break;
            }
            case OPERATION.icon:{
                break;
            }
            case OPERATION.viewRule:{
                conditionalFormatMenuController.openPanel();
                break;
            }
            case OPERATION.createRule:{
                conditionalFormatMenuController.openPanel(createDefaultRule());
                break;
            }
            case OPERATION.clearRangeRules:{
                break;
            }
            case OPERATION.clearWorkSheetRules:{
                break;
            }
        }

        return true;
    },
};
