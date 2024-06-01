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
import { CommandType, Direction, ICommandService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { IDocDrawing } from '@univerjs/docs-drawing';
import { IDocDrawingService } from '@univerjs/docs-drawing';
import { transformToDocDrawingPosition } from '@univerjs/docs-ui';
import { ClearDocDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';
import type { ISetDrawingCommandParams } from './interfaces';
import { SetDocDrawingCommand } from './set-doc-drawing.command';

export interface IMoveDrawingsCommandParams {
    direction: Direction ;
}

export const MoveDocDrawingsCommand: ICommand = {
    id: 'doc.command.move-drawing',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params: IMoveDrawingsCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const docDrawingService = accessor.get(IDocDrawingService);

        const { direction } = params;

        const drawings = docDrawingService.getFocusDrawings();

        if (drawings.length === 0) {
            return false;
        }

        const unitId = drawings[0].unitId;

        const newDrawings = drawings.map((drawing) => {
            const { transform } = drawing as IDocDrawing;
            if (transform == null) {
                return null;
            }
            const newTransform = { ...transform };

            const { left = 0, top = 0 } = transform;

            if (direction === Direction.UP) {
                newTransform.top = top - 1;
            } else if (direction === Direction.DOWN) {
                newTransform.top = top + 1;
            } else if (direction === Direction.LEFT) {
                newTransform.left = left - 1;
            } else if (direction === Direction.RIGHT) {
                newTransform.left = left + 1;
            }

            return {
                ...drawing,
                transform: newTransform,
                docTransform: transformToDocDrawingPosition(newTransform),
            } as IDocDrawing;
        }).filter((drawing) => drawing != null) as IDocDrawing[];

        const result = commandService.syncExecuteCommand<ISetDrawingCommandParams>(SetDocDrawingCommand.id, {
            unitId,
            drawings: newDrawings,
        });

        if (result) {
            commandService.syncExecuteCommand(ClearDocDrawingTransformerOperation.id, [unitId]);
            return true;
        }

        return false;
    },
};
