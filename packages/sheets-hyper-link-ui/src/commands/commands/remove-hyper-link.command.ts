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
import type { IAddHyperLinkMutationParams } from '@univerjs/sheets-hyper-link';
import { AddHyperLinkMutation, HyperLinkModel, RemoveHyperLinkMutation } from '@univerjs/sheets-hyper-link';

export interface ICancelHyperLinkCommandParams {
    unitId: string;
    subUnitId: string;
    /**
     * id of link
     */
    id: string;
    /**
     * row of cell
     */
    row: number;
    /**
     * column of cell
     */
    col: number;
}

export const CancelHyperLinkCommand: ICommand<ICancelHyperLinkCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheets.command.cancel-hyper-link',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const model = accessor.get(HyperLinkModel);
        const { unitId, subUnitId, id } = params;
        const link = model.getHyperLink(unitId, subUnitId, id);

        const redo: IMutationInfo = {
            id: RemoveHyperLinkMutation.id,
            params,
        };
        const undo: IMutationInfo = {
            id: AddHyperLinkMutation.id,
            params: {
                unitId,
                subUnitId,
                link,
            } as IAddHyperLinkMutationParams,
        };

        const res = await sequenceExecuteAsync([redo], commandService);
        if (res.result) {
            undoRedoService.pushUndoRedo({
                redoMutations: [redo],
                undoMutations: [undo],
                unitID: unitId,
            });
            return true;
        }

        return false;
    },
};
