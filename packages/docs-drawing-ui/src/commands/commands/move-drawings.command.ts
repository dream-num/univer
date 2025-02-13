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
import { CommandType, Direction, ICommandService, IUniverInstanceService, PositionedObjectLayoutType } from '@univerjs/core';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import { IDocDrawingService } from '@univerjs/docs-drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { IDrawingDocTransform, IUpdateDrawingDocTransformParams } from './update-doc-drawing.command';
import { UpdateDrawingDocTransformCommand } from './update-doc-drawing.command';

export interface IMoveDrawingsCommandParams {
    direction: Direction;
}

export const MoveDocDrawingsCommand: ICommand = {

    id: 'doc.command.move-drawing',

    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params: IMoveDrawingsCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const docDrawingService = accessor.get(IDocDrawingService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const renderManagerService = accessor.get(IRenderManagerService);

        const { direction } = params;

        const drawings = docDrawingService.getFocusDrawings();

        if (drawings.length === 0) {
            return false;
        }

        const unitId = drawings[0].unitId;

        const renderObject = renderManagerService.getRenderById(unitId);
        const scene = renderObject?.scene;
        if (scene == null) {
            return false;
        }
        const transformer = scene.getTransformerByCreate();

        const documentDataModel = univerInstanceService.getUniverDocInstance(unitId);

        const newDrawings = drawings.map((drawing) => {
            const { drawingId } = drawing as IDocDrawing;
            const drawingData = documentDataModel?.getSnapshot().drawings?.[drawingId];

            // Inline drawing can not be moved by shortcut.
            if (drawingData == null || drawingData.layoutType === PositionedObjectLayoutType.INLINE) {
                return null;
            }

            const { positionH, positionV } = drawingData.docTransform;

            const newPositionH = { ...positionH };
            const newPositionV = { ...positionV };

            if (direction === Direction.UP) {
                newPositionV.posOffset = (newPositionV.posOffset ?? 0) - 2;
            } else if (direction === Direction.DOWN) {
                newPositionV.posOffset = (newPositionV.posOffset ?? 0) + 2;
            } else if (direction === Direction.LEFT) {
                newPositionH.posOffset = (newPositionH.posOffset ?? 0) - 2;
            } else if (direction === Direction.RIGHT) {
                newPositionH.posOffset = (newPositionH.posOffset ?? 0) + 2;
            }

            return {
                drawingId,
                key: direction === Direction.UP || direction === Direction.DOWN ? 'positionV' : 'positionH',
                value: direction === Direction.UP || direction === Direction.DOWN ? newPositionV : newPositionH,
            } as IDrawingDocTransform;
        }).filter((drawing) => drawing != null) as IDrawingDocTransform[];

        if (newDrawings.length === 0) {
            return false;
        }

        const result = commandService.syncExecuteCommand<IUpdateDrawingDocTransformParams>(UpdateDrawingDocTransformCommand.id, {
            unitId,
            subUnitId: unitId,
            drawings: newDrawings,
        });

        transformer.refreshControls();

        return Boolean(result);
    },
};
