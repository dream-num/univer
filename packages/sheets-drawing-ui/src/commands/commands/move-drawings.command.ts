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
import {
    applySheetDrawingPlacement,
    ClearSheetDrawingTransformerOperation,
    ISheetDrawingService,
    SetSheetDrawingCommand,
    SheetDrawingAnchorType,
} from '@univerjs/sheets-drawing';
import { UndoRedoGroupService } from '@univerjs/ui';

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
        const undoRedoGroupService = accessor.get(UndoRedoGroupService);

        const { direction } = params;

        const drawings = drawingManagerService.getFocusDrawings();

        if (drawings.length === 0) {
            return false;
        }

        const unitId = drawings[0].unitId;

        const newDrawings = drawings.map((drawing) => {
            const sheetDrawing = drawing as ISheetDrawing;
            const { transform, unitId, subUnitId, anchorType = SheetDrawingAnchorType.Position } = sheetDrawing;
            if (!transform) {
                return null;
            }

            const { left = 0, top = 0, width = 0, height = 0 } = transform;
            const bounds = { left, top, width, height };

            if (direction === Direction.UP) {
                bounds.top = top - 1;
            } else if (direction === Direction.DOWN) {
                bounds.top = top + 1;
            } else if (direction === Direction.LEFT) {
                bounds.left = left - 1;
            } else if (direction === Direction.RIGHT) {
                bounds.left = left + 1;
            }

            switch (anchorType) {
                case SheetDrawingAnchorType.None:
                    return applySheetDrawingPlacement(sheetDrawing, { kind: anchorType, bounds });
                case SheetDrawingAnchorType.Position:
                case SheetDrawingAnchorType.Both: {
                    const skeleton = sheetSkeletonService.getSkeleton(unitId, subUnitId);
                    if (!skeleton) {
                        return null;
                    }

                    return applySheetDrawingPlacement(sheetDrawing, { kind: anchorType, bounds }, skeleton);
                }
                default:
                    return null;
            }
        }).filter((drawing) => drawing != null) as ISheetDrawing[];

        if (newDrawings.length === 0) {
            return false;
        }

        // Drawing history contains deltas, so grouped nudges must retain every update.
        const result = undoRedoGroupService.runTimed(
            unitId,
            `sheet-drawing:nudge:${drawings[0].subUnitId}:${drawings.map((drawing) => drawing.drawingId).sort().join(',')}`,
            () => commandService.syncExecuteCommand<ISetDrawingCommandParams>(SetSheetDrawingCommand.id, {
                unitId,
                drawings: newDrawings,
            }),
            'append'
        );

        if (result) {
            commandService.syncExecuteCommand(ClearSheetDrawingTransformerOperation.id, [unitId]);
            return true;
        }

        return false;
    },
};
