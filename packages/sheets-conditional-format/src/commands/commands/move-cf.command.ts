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
import type { IMoveConditionalRuleMutationParams } from '../mutations/move-conditional-rule.mutation';
import { MoveConditionalRuleMutation, MoveConditionalRuleMutationUndoFactory } from '../mutations/move-conditional-rule.mutation';

export interface IMoveCfCommand {
    unitId?: string;
    subUnitId?: string;
    cfId: string;
    targetCfId: string;
};
export const moveCfCommand: ICommand<IMoveCfCommand> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.move-conditional-rule',
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { cfId, targetCfId } = params;
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitId = params.unitId ?? workbook.getUnitId();
        const subUnitId = params.subUnitId ?? worksheet.getSheetId();
        const config: IMoveConditionalRuleMutationParams = { unitId, subUnitId, cfId, targetCfId };
        const undos = MoveConditionalRuleMutationUndoFactory(accessor, config);
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
