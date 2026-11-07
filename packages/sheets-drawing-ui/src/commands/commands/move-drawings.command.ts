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
        const positionedDrawings = drawings.flatMap((drawing) => {
            const skeleton = sheetSkeletonService.getSkeleton(drawing.unitId, drawing.subUnitId);
            return drawing.transform && skeleton ? [{ drawing: drawing as ISheetDrawing, skeleton }] : [];
        });
        if (positionedDrawings.length === 0) return false;

        let moveX = direction === Direction.LEFT ? -1 : direction === Direction.RIGHT ? 1 : 0;
        let moveY = direction === Direction.UP ? -1 : direction === Direction.DOWN ? 1 : 0;
        let minX = -Infinity;
        let minY = -Infinity;
        let maxX = Infinity;
        let maxY = Infinity;
        for (const { drawing, skeleton } of positionedDrawings) {
            const { left = 0, top = 0, width = 0, height = 0 } = drawing.transform!;
            const { rowHeaderWidthAndMarginLeft, columnHeaderHeightAndMarginTop, columnTotalWidth, rowTotalHeight } = skeleton;
            minX = Math.max(minX, rowHeaderWidthAndMarginLeft - left);
            minY = Math.max(minY, columnHeaderHeightAndMarginTop - top);
            maxX = Math.min(maxX, rowHeaderWidthAndMarginLeft + columnTotalWidth - left - width);
            maxY = Math.min(maxY, columnHeaderHeightAndMarginTop + rowTotalHeight - top - height);
        }
        moveX = Math.max(minX, Math.min(moveX, maxX));
        moveY = Math.max(minY, Math.min(moveY, maxY));
        if (moveX === 0 && moveY === 0) return false;

        const newDrawings = positionedDrawings.map(({ drawing, skeleton }) => {
            const transform = drawing.transform!;
            const { left = 0, top = 0 } = transform;
            const newTransform = { ...transform, left: left + moveX, top: top + moveY };

            return {
                ...drawing,
                transform: newTransform,
                sheetTransform: transformToDrawingPosition(newTransform, skeleton),
                axisAlignSheetTransform: transformToAxisAlignPosition(newTransform, skeleton),
            } as ISheetDrawing;
        });

        const result = undoRedoGroupService.runTimed(
            unitId,
            `sheet-drawing:nudge:${drawings[0].subUnitId}:${drawings.map((drawing) => drawing.drawingId).sort().join(',')}`,
            () => commandService.syncExecuteCommand<ISetDrawingCommandParams>(SetSheetDrawingCommand.id, {
                unitId,
                drawings: newDrawings,
            })
        );

        if (result) {
            commandService.syncExecuteCommand(ClearSheetDrawingTransformerOperation.id, [unitId]);
            return true;
        }

        return false;
    },
};
