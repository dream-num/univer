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
import type { IConditionFormattingRule } from '../../models/type';
import type { ISetConditionalRuleMutationParams } from '../mutations/set-conditional-rule.mutation';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { SetConditionalRuleMutation, setConditionalRuleMutationUndoFactory } from '../mutations/set-conditional-rule.mutation';

export interface ISetCfCommandParams {
    unitId?: string;
    subUnitId?: string;
    cfId?: string;
    rule: IConditionFormattingRule;
};
export const SetCfCommand: ICommand<ISetCfCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }

        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const config: ISetConditionalRuleMutationParams = { unitId, subUnitId, rule: params.rule, cfId: params.cfId };
        const undos = setConditionalRuleMutationUndoFactory(accessor, config);
        const result = commandService.syncExecuteCommand(SetConditionalRuleMutation.id, config);
        if (result) {
            undoRedoService.pushUndoRedo({ unitID: unitId, undoMutations: undos, redoMutations: [{ id: SetConditionalRuleMutation.id, params: config }] });
        }
        return result;
    },
};
