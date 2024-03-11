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

import type { ICommand, IMutationInfo } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
} from '@univerjs/core';
import { ConditionalFormatRuleModel } from '../../models/conditional-format-rule-model';

import type { IDeleteConditionalRuleMutationParams } from '../mutations/deleteConditionalRule.mutation';
import { deleteConditionalRuleMutation, deleteConditionalRuleMutationUndoFactory } from '../mutations/deleteConditionalRule.mutation';

export interface IClearWorksheetCfParams {
    unitId?: string;
    subUnitId?: string;
}
export const clearWorksheetCfCommand: ICommand<IClearWorksheetCfParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.clear-worksheet-conditional-rule',
    handler(accessor, params) {
        const conditionalFormatRuleModel = accessor.get(ConditionalFormatRuleModel);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const undoRedoService = accessor.get(IUndoRedoService);

        const worksheet = workbook.getActiveSheet();
        const unitId = params?.unitId ?? workbook.getUnitId();
        const subUnitId = params?.subUnitId ?? worksheet.getSheetId();
        const ruleList = conditionalFormatRuleModel.getSubunitRules(unitId, subUnitId);
        if (!ruleList?.length) {
            return false;
        }
        const configList: IDeleteConditionalRuleMutationParams[] = ruleList.map((rule) => ({ cfId: rule.cfId, unitId, subUnitId }));
        const redos: IMutationInfo[] = configList.map((config) => ({ id: deleteConditionalRuleMutation.id, params: config }));
        const undos: IMutationInfo[] = configList.map((config) => deleteConditionalRuleMutationUndoFactory(accessor, config)[0]);

        const result = sequenceExecute(redos, commandService).result;
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: redos,
                undoMutations: undos,
            });
        }
        return true;
    },
};
