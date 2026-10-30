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

import type { ICommand, IMutationInfo } from '@univerjs/core';
import type { IDeleteConditionalRuleMutationParams } from '../mutations/delete-conditional-rule.mutation';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
} from '@univerjs/core';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';
import { DeleteConditionalRuleMutation, DeleteConditionalRuleMutationUndoFactory } from '../mutations/delete-conditional-rule.mutation';

export interface IClearWorksheetCfParams {
    unitId?: string;
    subUnitId?: string;
}
export const ClearWorksheetCfCommand: ICommand<IClearWorksheetCfParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.clear-worksheet-conditional-rule',
    handler(accessor, params) {
        const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const ruleList = conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
        if (!ruleList?.length) {
            return false;
        }
        const configList: IDeleteConditionalRuleMutationParams[] = ruleList.map((rule) => ({ cfId: rule.cfId, unitId, subUnitId }));
        const redos: IMutationInfo[] = configList.map((config) => ({ id: DeleteConditionalRuleMutation.id, params: config }));
        const undos: IMutationInfo[] = configList.map((config) => DeleteConditionalRuleMutationUndoFactory(accessor, config)[0]);

        const result = sequenceExecute(redos, commandService).result;
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: redos,
                undoMutations: undos,
            });
        }
        return result;
    },
};
