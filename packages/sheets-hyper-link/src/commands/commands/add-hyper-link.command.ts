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
import { CommandType, ICommandService, IUndoRedoService, sequenceExecuteAsync } from '@univerjs/core';
import { SheetInterceptorService } from '@univerjs/sheets';
import type { ICellHyperLink } from '../../types/interfaces/i-hyper-link';
import { AddHyperLinkMutation } from '../mutations/add-hyper-link.mutation';
import { RemoveHyperLinkMutation } from '../mutations/remove-hyper-link.mutation';

export interface IAddHyperLinkCommandParams {
    unitId: string;
    subUnitId: string;
    link: ICellHyperLink;
}

export const AddHyperLinkCommand: ICommand<IAddHyperLinkCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.add-hyper-link',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { unitId, subUnitId, link } = params;
        const { redos, undos } = sheetInterceptorService.onCommandExecute({
            id: AddHyperLinkCommand.id,
            params,
        });
        const redo: IMutationInfo = {
            id: AddHyperLinkMutation.id,
            params,
        };
        const undo: IMutationInfo = {
            id: RemoveHyperLinkMutation.id,
            params: {
                unitId,
                subUnitId,
                id: link.id,
            },
        };
        const res = await sequenceExecuteAsync([redo, ...redos], commandService);
        if (res.result) {
            undoRedoService.pushUndoRedo({
                redoMutations: [redo, ...redos],
                undoMutations: [undo, ...undos],
                unitID: unitId,
            });
            return true;
        }

        return false;
    },
};
