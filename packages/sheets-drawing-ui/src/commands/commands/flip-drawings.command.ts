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

import type { IAccessor, ICommand, ITransformState } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import type { Image } from '@univerjs/engine-render';
import type { ISheetDrawingPosition } from '@univerjs/sheets-drawing';
import {
    CommandType,
    DrawingTypeEnum,
    ICommandService,
    IUndoRedoService,
    sequenceExecute,
} from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DrawingApplyType, ISheetDrawingService, SetDrawingApplyMutation } from '@univerjs/sheets-drawing';
import { ISheetSelectionRenderService } from '@univerjs/sheets-ui';
import { transformToAxisAlignPosition, transformToDrawingPosition } from '../../basics/transform-position';
import { ClearSheetDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';

interface IFlipDrawingCommandParam {
    unitId: string;
    subUnitId: string;
    drawingId: string;
}
export interface IFlipSheetDrawingCommandParams {
    unitId: string;
    drawings: IFlipDrawingCommandParam[];
    flipH?: boolean;
    flipV?: boolean;
}
/**
 * The command to flip sheet drawing elements
 */
export const FlipSheetDrawingCommand: ICommand = {
    id: 'sheet.command.toggle-flip-drawings',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function, complexity
    handler: (accessor: IAccessor, params?: IFlipSheetDrawingCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const sheetDrawingService = accessor.get(ISheetDrawingService);
        const renderManagerService = accessor.get(IRenderManagerService);

        if (!params) return false;

        const { drawings } = params;

        const flipH = params.flipH;
        const flipV = params.flipV;

        const unitIds: string[] = [];

        const updateParams: any[] = [];

        for (const param of drawings) {
            const { unitId, subUnitId, drawingId } = param;
            unitIds.push(unitId);

            const drawingData = sheetDrawingService.getDrawingData(unitId, subUnitId);
            const existing = drawingData?.[drawingId];
            if (!existing) {
                continue;
            }

            const transform = { ...existing.transform } as ITransformState;

            if (flipH) {
                transform.flipX = !transform.flipX;
            }
            if (flipV) {
                transform.flipY = !transform.flipY;
            }

            const render = renderManagerService.getRenderById(unitId);
            const selectionRenderService = render?.with(ISheetSelectionRenderService);
            if (!selectionRenderService) {
                continue;
            }

            const sheetTransform = transformToDrawingPosition(transform, selectionRenderService);
            const axisAlignSheetTransform = transformToAxisAlignPosition(transform, selectionRenderService) as ISheetDrawingPosition;

            const updateParamItem: any = {
                unitId,
                subUnitId,
                drawingType: existing.drawingType,
                drawingId,
                transform,
                sheetTransform,
                axisAlignSheetTransform,
            };

            const drawingType = existing.drawingType;
            if (drawingType === DrawingTypeEnum.DRAWING_IMAGE) {
                const scene = getSceneByDrawingSearch(accessor, unitId);
                if (scene) {
                    const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });
                    const imageShape = scene.getObject(drawingShapeKey) as Image;

                    if (imageShape) {
                        const srcRect = imageShape.srcRect;
                        if (srcRect) {
                            let newSrcRect;
                            const { left = 0, top = 0, right = 0, bottom = 0 } = srcRect;
                            if (flipH) {
                                const centerX = left + (right - left) / 2;
                                const newLeft = centerX - (right - left) / 2;
                                const newRight = centerX + (right - left) / 2;
                                newSrcRect = {
                                    left: newLeft,
                                    top,
                                    right: newRight,
                                    bottom,
                                };
                            }
                            if (flipV) {
                                const centerY = top + (bottom - top) / 2;
                                const newTop = centerY - (bottom - top) / 2;
                                const newBottom = centerY + (bottom - top) / 2;
                                newSrcRect = {
                                    left,
                                    top: newTop,
                                    right,
                                    bottom: newBottom,
                                };
                            }

                            if (newSrcRect) {
                                updateParamItem.srcRect = newSrcRect;
                            }
                        }
                    }
                }
            }
            updateParams.push(updateParamItem);
        }

        if (updateParams.length === 0) return false;

        const jsonOp = sheetDrawingService.getBatchUpdateOp(updateParams) as IDrawingJsonUndo1;
        const { unitId: opUnitId, subUnitId: opSubUnitId, undo, redo, objects } = jsonOp;

        const updateMutation = { id: SetDrawingApplyMutation.id, params: { unitId: opUnitId, subUnitId: opSubUnitId, op: redo, objects, type: DrawingApplyType.UPDATE } };
        const undoUpdateMutation = { id: SetDrawingApplyMutation.id, params: { unitId: opUnitId, subUnitId: opSubUnitId, op: undo, objects, type: DrawingApplyType.UPDATE } };

        const result = sequenceExecute([updateMutation], commandService);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: opUnitId,
                undoMutations: [undoUpdateMutation, { id: ClearSheetDrawingTransformerOperation.id, params: unitIds }],
                redoMutations: [updateMutation, { id: ClearSheetDrawingTransformerOperation.id, params: unitIds }],
            });

            return true;
        }

        return false;
    },
};

function getSceneByDrawingSearch(accessor: IAccessor, unitId: string) {
    const renderManagerService = accessor.get(IRenderManagerService);
    const render = renderManagerService.getRenderById(unitId);
    if (!render) {
        return null;
    }
    return render.scene;
}
