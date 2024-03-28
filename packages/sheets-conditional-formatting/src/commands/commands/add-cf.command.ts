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
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import type { IConditionFormattingRule } from '../../models/type';
import type { IAddConditionalRuleMutationParams } from '../mutations/add-conditional-rule.mutation';
import type { MakePropertyOptional } from '../../utils/type';
import { AddConditionalRuleMutation, AddConditionalRuleMutationUndoFactory } from '../mutations/add-conditional-rule.mutation';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';

export interface IAddCfCommandParams {
    unitId?: string;
    subUnitId?: string;
    rule: MakePropertyOptional<IConditionFormattingRule, 'cfId'>;
};

export const AddCfCommand: ICommand<IAddCfCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { rule } = params;
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitId = params.unitId ?? workbook.getUnitId();
        const subUnitId = params.subUnitId ?? worksheet.getSheetId();
        const cfId = conditionalFormattingRuleModel.createCfId(unitId, subUnitId);
        const config: IAddConditionalRuleMutationParams = { unitId, subUnitId, rule: { ...rule, cfId: rule.cfId || cfId } };
        const undo = AddConditionalRuleMutationUndoFactory(accessor, config);
        const result = commandService.syncExecuteCommand(AddConditionalRuleMutation.id, config);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: [{ id: AddConditionalRuleMutation.id, params: config }],
                undoMutations: [undo],
            });
        }

        return result;
    },
};
