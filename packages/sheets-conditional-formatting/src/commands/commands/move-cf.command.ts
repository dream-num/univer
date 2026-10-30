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

import type { ICommand } from '@univerjs/core';
import type { IAnchor } from '../../utils/anchor';
import type { IMoveConditionalRuleMutationParams } from '../mutations/move-conditional-rule.mutation';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';
import { transformSupportSymmetryAnchor } from '../../utils/anchor';
import { MoveConditionalRuleMutation, MoveConditionalRuleMutationUndoFactory } from '../mutations/move-conditional-rule.mutation';

export interface IMoveCfCommandParams {
    unitId?: string;
    subUnitId?: string;
    start: IAnchor;
    end: IAnchor;
};
export const MoveCfCommand: ICommand<IMoveCfCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.move-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const anchorList = transformSupportSymmetryAnchor(params.start, params.end, conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId) || [], (rule) => rule.cfId);
        if (!anchorList) {
            return false;
        }
        const [start, end] = anchorList;
        const config: IMoveConditionalRuleMutationParams = { unitId, subUnitId, start, end };
        const undos = MoveConditionalRuleMutationUndoFactory(config);
        const result = commandService.syncExecuteCommand(MoveConditionalRuleMutation.id, config);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                redoMutations: [{ id: MoveConditionalRuleMutation.id, params: config }],
                undoMutations: undos,
            });
        }

        return result;
    },
};
