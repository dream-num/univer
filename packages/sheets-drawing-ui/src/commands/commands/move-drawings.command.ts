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
import type { ISetDrawingCommandParams, ISheetDrawing } from '@univerjs/sheets-drawing';
import { CommandType, Direction, ICommandService } from '@univerjs/core';
import { SheetSkeletonService } from '@univerjs/sheets';
import { ClearSheetDrawingTransformerOperation, ISheetDrawingService, SetSheetDrawingCommand, transformToAxisAlignPosition, transformToDrawingPosition } from '@univerjs/sheets-drawing';

export interface IMoveDrawingsCommandParams {
    direction: Direction;
}

export const MoveDrawingsCommand: ICommand = {
    id: 'sheet.command.move-drawing',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params: IMoveDrawingsCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const drawingManagerService = accessor.get(ISheetDrawingService);
        const sheetSkeletonService = accessor.get(SheetSkeletonService);

        const { direction } = params;

        const drawings = drawingManagerService.getFocusDrawings();

        if (drawings.length === 0) {
            return false;
        }

        const unitId = drawings[0].unitId;

        const newDrawings = drawings.map((drawing) => {
            const { transform, unitId, subUnitId } = drawing as ISheetDrawing;
            const skeleton = sheetSkeletonService.getSkeleton(unitId, subUnitId);
            if (!transform || !skeleton) {
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
                sheetTransform: transformToDrawingPosition(newTransform, skeleton),
                axisAlignSheetTransform: transformToAxisAlignPosition(newTransform, skeleton),
            } as ISheetDrawing;
        }).filter((drawing) => drawing != null) as ISheetDrawing[];

        const result = commandService.syncExecuteCommand<ISetDrawingCommandParams>(SetSheetDrawingCommand.id, {
            unitId,
            drawings: newDrawings,
        });

        if (result) {
            commandService.syncExecuteCommand(ClearSheetDrawingTransformerOperation.id, [unitId]);
            return true;
        }

        return false;
    },
};
