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

import type { IDrawingParam } from '@univerjs/core';

interface IDrawingTransformRotationChangeHandlerOptions {
    rotateEnabled: boolean;
    drawingParam: Pick<IDrawingParam, 'unitId' | 'subUnitId' | 'drawingId' | 'drawingType'>;
    setRotation: (rotation: number) => void;
    emitUpdate: (updateParams: IDrawingParam[]) => void;
    notifyChange: () => void;
}

export function isDrawingTransformRotationDisabled(rotateEnabled: boolean): boolean {
    return !rotateEnabled;
}

export function createDrawingTransformRotationChangeHandler(options: IDrawingTransformRotationChangeHandlerOptions) {
    return (val: number | null) => {
        if (isDrawingTransformRotationDisabled(options.rotateEnabled)) {
            return;
        }

        if (val == null) {
            return;
        }

        const { unitId, subUnitId, drawingId, drawingType } = options.drawingParam;
        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { angle: val } };

        options.setRotation(val);
        options.emitUpdate([updateParam]);
        options.notifyChange();
    };
}
