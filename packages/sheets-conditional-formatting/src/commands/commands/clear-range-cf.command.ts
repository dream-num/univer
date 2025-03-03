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

import type { ICommand, IMutationInfo, IRange } from '@univerjs/core';
import type { IConditionFormattingRule } from '../../models/type';
import type { IDeleteConditionalRuleMutationParams } from '../mutations/delete-conditional-rule.mutation';
import type { ISetConditionalRuleMutationParams } from '../mutations/set-conditional-rule.mutation';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    Range,
    sequenceExecute,
} from '@univerjs/core';
import { createTopMatrixFromMatrix, findAllRectangle, getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';
import { DeleteConditionalRuleMutation, DeleteConditionalRuleMutationUndoFactory } from '../mutations/delete-conditional-rule.mutation';
import { SetConditionalRuleMutation, setConditionalRuleMutationUndoFactory } from '../mutations/set-conditional-rule.mutation';

export interface IClearRangeCfParams {
    ranges?: IRange[];
    unitId?: string;
    subUnitId?: string;
}
export const ClearRangeCfCommand: ICommand<IClearRangeCfParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.clear-range-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const ranges = selectionManagerService.getCurrentSelections()?.map((selection) => selection.range) || [];
        const allRuleList = conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId);
        if (!allRuleList?.length || !ranges.length) {
            return false;
        }

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        allRuleList.forEach((oldRule) => {
            const matrix = new ObjectMatrix<1>();
            oldRule.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    matrix.setValue(row, col, 1);
                });
            });
            ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    matrix.realDeleteValue(row, col);
                });
            });
            const newRanges = findAllRectangle(createTopMatrixFromMatrix(matrix));
            if (newRanges.length) {
                const rule: IConditionFormattingRule = { ...oldRule, ranges: newRanges };
                const params = { unitId, subUnitId, rule } as ISetConditionalRuleMutationParams;
                const undo = setConditionalRuleMutationUndoFactory(accessor, params);
                redos.push({ id: SetConditionalRuleMutation.id, params });
                undos.push(...undo);
            } else {
                const params = { unitId, subUnitId, cfId: oldRule.cfId } as IDeleteConditionalRuleMutationParams;
                const undo = DeleteConditionalRuleMutationUndoFactory(accessor, params);
                redos.push({ id: DeleteConditionalRuleMutation.id, params });
                undos.push(...undo);
            }
        });

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
