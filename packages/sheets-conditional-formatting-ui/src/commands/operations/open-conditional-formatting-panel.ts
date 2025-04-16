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
import type { IClearRangeCfParams, IColorScale, IConditionFormattingRule, IDataBar, IFormulaHighlightCell, IIconSet, IRankHighlightCell } from '@univerjs/sheets-conditional-formatting';
import { CommandType, ICommandService } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { CFRuleType, CFSubRuleType, ClearRangeCfCommand, ClearWorksheetCfCommand, createDefaultRule } from '@univerjs/sheets-conditional-formatting';
import { ConditionalFormattingPanelController } from '../../controllers/cf.panel.controller';

interface IOpenConditionalFormattingOperatorParams {
    value: number;
}

export enum CF_MENU_OPERATION {
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

export const OpenConditionalFormattingOperator: ICommand = {
    id: 'sheet.operation.open.conditional.formatting.panel',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor, params: IOpenConditionalFormattingOperatorParams) => {
        const conditionalFormattingMenuController = accessor.get(ConditionalFormattingPanelController);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const commandService = accessor.get(ICommandService);

        const ranges = selectionManagerService.getCurrentSelections()?.map((s) => s.range) || [];

        const type = params.value;
        switch (type) {
            case CF_MENU_OPERATION.highlightCell:{
                conditionalFormattingMenuController.openPanel({ ...createDefaultRule(), ranges });
                break;
            }
            case CF_MENU_OPERATION.rank:{
                const rule = {
                    ...createDefaultRule,
                    ranges,
                    rule: {
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.rank,
                    },
                } as IConditionFormattingRule<IRankHighlightCell>;
                conditionalFormattingMenuController.openPanel(rule);
                break;
            }
            case CF_MENU_OPERATION.formula:{
                const rule = {
                    ...createDefaultRule,
                    ranges,
                    rule: {
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.formula,
                        value: '=',
                    },
                } as IConditionFormattingRule<IFormulaHighlightCell>;
                conditionalFormattingMenuController.openPanel(rule);
                break;
            }
            case CF_MENU_OPERATION.colorScale:{
                const rule = {
                    ...createDefaultRule,
                    ranges,
                    rule: {
                        type: CFRuleType.colorScale,
                        config: [],
                    },
                } as unknown as IConditionFormattingRule<IColorScale>;
                conditionalFormattingMenuController.openPanel(rule);
                break;
            }
            case CF_MENU_OPERATION.dataBar:{
                const rule = {
                    ...createDefaultRule,
                    ranges,
                    rule: {
                        type: CFRuleType.dataBar,
                        isShowValue: true,
                    },
                } as unknown as IConditionFormattingRule<IDataBar>;
                conditionalFormattingMenuController.openPanel(rule);
                break;
            }
            case CF_MENU_OPERATION.icon:{
                const rule = {
                    ...createDefaultRule,
                    ranges,
                    rule: {
                        type: CFRuleType.iconSet,
                        config: [],
                        isShowValue: true,
                    },
                } as unknown as IConditionFormattingRule<IIconSet>;
                conditionalFormattingMenuController.openPanel(rule);
                break;
            }
            case CF_MENU_OPERATION.viewRule:{
                conditionalFormattingMenuController.openPanel();
                break;
            }
            case CF_MENU_OPERATION.createRule:{
                conditionalFormattingMenuController.openPanel({ ...createDefaultRule(), ranges });
                break;
            }
            case CF_MENU_OPERATION.clearRangeRules:{
                commandService.executeCommand(ClearRangeCfCommand.id, { ranges } as IClearRangeCfParams);

                break;
            }
            case CF_MENU_OPERATION.clearWorkSheetRules:{
                commandService.executeCommand(ClearWorksheetCfCommand.id);
                break;
            }
        }

        return true;
    },
};
