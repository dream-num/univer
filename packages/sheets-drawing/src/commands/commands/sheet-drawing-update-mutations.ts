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

import type { IMutationInfo } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import { DrawingApplyType, SetDrawingApplyMutation } from '../mutations/set-drawing-apply.mutation';
import { ClearSheetDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';

export function createSheetDrawingUpdateMutations(drawingOp: IDrawingJsonUndo1) {
    const { unitId, subUnitId, undo, redo, objects } = drawingOp;
    const createMutations = (op: IDrawingJsonUndo1['redo']): IMutationInfo[] => [
        {
            id: SetDrawingApplyMutation.id,
            params: { unitId, subUnitId, op, objects, type: DrawingApplyType.UPDATE },
        },
        { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] },
    ];
    return { redoMutations: createMutations(redo), undoMutations: createMutations(undo) };
}
