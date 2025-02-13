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

import type { IAccessor, ICommand } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
} from '@univerjs/core';

import type { IDrawingGroupUpdateParam, IDrawingJsonUndo1 } from '@univerjs/drawing';
import { IDocDrawingService } from '@univerjs/docs-drawing';

/**
 * The command to insert new defined name
 */
export const UngroupDocDrawingCommand: ICommand = {
    id: 'doc.command.ungroup-doc-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IDrawingGroupUpdateParam[]) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const docDrawingService = accessor.get(IDocDrawingService);

        if (!params) return false;

        const unitIds: string[] = [];
        params.forEach(({ parent, children }) => {
            unitIds.push(parent.unitId);
            children.forEach((child) => {
                unitIds.push(child.unitId);
            });
        });

        // execute do mutations and add undo mutations to undo stack if completed
        const jsonOp = docDrawingService.getUngroupDrawingOp(params) as IDrawingJsonUndo1;

        const { unitId, subUnitId, undo, redo, objects } = jsonOp;

        // const result = commandService.syncExecuteCommand(SetDocDrawingApplyMutation.id, { op: redo, unitId, subUnitId, objects, type: DocDrawingApplyType.UNGROUP });

        // if (result) {
        //     undoRedoService.pushUndoRedo({
        //         unitID: unitId,
        //         undoMutations: [
        //             { id: SetDocDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects: ungroupToGroup(objects as IDrawingGroupUpdateParam[]), type: DocDrawingApplyType.GROUP } },
        //             { id: ClearDocDrawingTransformerOperation.id, params: unitIds },
        //         ],
        //         redoMutations: [
        //             { id: SetDocDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type: DocDrawingApplyType.UNGROUP } },
        //             { id: ClearDocDrawingTransformerOperation.id, params: unitIds },
        //         ],
        //     });

        //     return true;
        // }

        return false;
    },
};
