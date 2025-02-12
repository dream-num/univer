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
import type { IRangeProtectionRule } from '../../model/range-protection-rule.model';
import type { IWorksheetProtectionRule } from '../../services/permission/type';
import { CommandType, ICommandService, IUndoRedoService, sequenceExecute } from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import { RangeProtectionRuleModel } from '../../model/range-protection-rule.model';
import { AddRangeProtectionMutation } from '../mutations/add-range-protection.mutation';
import { AddWorksheetProtectionMutation } from '../mutations/add-worksheet-protection.mutation';
import { DeleteRangeProtectionMutation } from '../mutations/delete-range-protection.mutation';
import { DeleteWorksheetProtectionMutation } from '../mutations/delete-worksheet-protection.mutation';
import { SetRangeProtectionMutation } from '../mutations/set-range-protection.mutation';
import { SetWorksheetProtectionMutation } from '../mutations/set-worksheet-protection.mutation';

type IPermissionRule = (IRangeProtectionRule | IWorksheetProtectionRule) & { ranges: IRange[]; id: string };

interface ISetProtectionParams {
    rule: IPermissionRule;
    oldRule: IPermissionRule;
}

export const SetProtectionCommand: ICommand<ISetProtectionParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-protection',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
        const { rule, oldRule } = params;
        const { unitId, subUnitId } = rule;

        const redoMutations = [];
        const undoMutations = [];

        if (oldRule?.unitType === rule.unitType) {
            if (rule.unitType === UnitObject.Worksheet) {
                redoMutations.push({ id: SetWorksheetProtectionMutation.id, params: { unitId, subUnitId, rule } });
                undoMutations.push({ id: SetWorksheetProtectionMutation.id, params: { unitId, subUnitId, rule: oldRule } });
            } else {
                redoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, rule, ruleId: (rule as IRangeProtectionRule).id } });
                undoMutations.push({ id: SetRangeProtectionMutation.id, params: { unitId, subUnitId, ruleId: (oldRule as IRangeProtectionRule).id, rule: oldRule } });
            }
        } else {
            if (oldRule) {
                if (oldRule.unitType === UnitObject.Worksheet) {
                    redoMutations.push({ id: DeleteWorksheetProtectionMutation.id, params: { unitId, subUnitId } });
                    undoMutations.push({ id: AddWorksheetProtectionMutation.id, params: { unitId, rule: oldRule, subUnitId: oldRule.subUnitId } });
                } else if (oldRule.unitType === UnitObject.SelectRange) {
                    redoMutations.push({ id: DeleteRangeProtectionMutation.id, params: { unitId, subUnitId, ruleIds: [(oldRule as IRangeProtectionRule).id] } });
                    undoMutations.push({ id: AddRangeProtectionMutation.id, params: { unitId, subUnitId, rules: [oldRule] } });
                }
            }

            if (rule.unitType === UnitObject.Worksheet) {
                redoMutations.push({ id: AddWorksheetProtectionMutation.id, params: { unitId, rule, subUnitId: rule.subUnitId } });
                undoMutations.unshift({ id: DeleteWorksheetProtectionMutation.id, params: { unitId, subUnitId } });
            } else if (rule.unitType === UnitObject.SelectRange) {
                (rule as IRangeProtectionRule).id = rangeProtectionRuleModel.createRuleId(unitId, subUnitId);
                redoMutations.push({ id: AddRangeProtectionMutation.id, params: { unitId, subUnitId, rules: [rule] } });
                undoMutations.unshift({ id: DeleteRangeProtectionMutation.id, params: { unitId, subUnitId, ruleIds: [(rule as IRangeProtectionRule).id] } });
            }
        }

        const result = sequenceExecute(redoMutations, commandService);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations,
                redoMutations,
            });
        }

        return true;
    },
};
