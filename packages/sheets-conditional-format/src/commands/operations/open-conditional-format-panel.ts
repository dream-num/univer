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
import { CommandType, ICommandService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { SelectionManagerService } from '@univerjs/sheets';
import { ConditionalFormatMenuController } from '../../controllers/cf.menu.controller';
import { CFRuleType, CFSubRuleType, createDefaultRule } from '../../base/const';
import type { IColorScale, IConditionFormatRule, IDataBar, IFormulaHighlightCell, IIconSet, IRankHighlightCell } from '../../models/type';
import type { IClearRangeCfParams } from '../commands/clear-range-cf.command';
import { clearRangeCfCommand } from '../commands/clear-range-cf.command';
import { clearWorksheetCfCommand } from '../commands/clear-worksheet-cf.command';

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
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);

        const ranges = selectionManagerService.getSelectionRanges() || [];

        const type = params.value;
        switch (type) {
            case OPERATION.highlightCell:{
                conditionalFormatMenuController.openPanel({ ...createDefaultRule(), ranges });
                break;
            }
            case OPERATION.rank:{
                const rule = {
                    ...createDefaultRule,
                    ranges,
                    rule: {
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.rank,
                    },
                } as IConditionFormatRule<IRankHighlightCell>;
                conditionalFormatMenuController.openPanel(rule);
                break;
            }
            case OPERATION.formula:{
                const rule = {
                    ...createDefaultRule,
                    ranges,
                    rule: {
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.formula,
                        value: '=',
                    },
                } as IConditionFormatRule<IFormulaHighlightCell>;
                conditionalFormatMenuController.openPanel(rule);
                break;
            }
            case OPERATION.colorScale:{
                const rule = {
                    ...createDefaultRule,
                    ranges,
                    rule: {
                        type: CFRuleType.colorScale,
                        config: [],
                    },
                } as unknown as IConditionFormatRule<IColorScale>;
                conditionalFormatMenuController.openPanel(rule);
                break;
            }
            case OPERATION.dataBar:{
                const rule = {
                    ...createDefaultRule,
                    ranges,
                    rule: {
                        type: CFRuleType.dataBar,
                    },
                } as unknown as IConditionFormatRule<IDataBar>;
                conditionalFormatMenuController.openPanel(rule);
                break;
            }
            case OPERATION.icon:{
                const rule = {
                    ...createDefaultRule,
                    ranges,
                    rule: {
                        type: CFRuleType.iconSet,
                        config: [],
                        isShowValue: true,
                    },
                } as unknown as IConditionFormatRule<IIconSet>;
                conditionalFormatMenuController.openPanel(rule);
                break;
            }
            case OPERATION.viewRule:{
                conditionalFormatMenuController.openPanel();
                break;
            }
            case OPERATION.createRule:{
                conditionalFormatMenuController.openPanel({ ...createDefaultRule(), ranges });
                break;
            }
            case OPERATION.clearRangeRules:{
                commandService.executeCommand(clearRangeCfCommand.id, { ranges } as IClearRangeCfParams);

                break;
            }
            case OPERATION.clearWorkSheetRules:{
                commandService.executeCommand(clearWorksheetCfCommand.id);
                break;
            }
        }

        return true;
    },
};
