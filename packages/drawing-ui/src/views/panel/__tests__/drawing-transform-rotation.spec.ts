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

import { DrawingTypeEnum } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { createDrawingTransformRotationChangeHandler, isDrawingTransformRotationDisabled } from '../drawing-transform-rotation';

const drawingParam = {
    unitId: 'unit-1',
    subUnitId: 'sheet-1',
    drawingId: 'drawing-1',
    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
};

describe('drawing transform rotation controls', () => {
    it('disables rotation and drops direct handler calls when rotation is not enabled', () => {
        const setRotation = vi.fn();
        const emitUpdate = vi.fn();
        const notifyChange = vi.fn();
        const handleRotationChange = createDrawingTransformRotationChangeHandler({
            rotateEnabled: false,
            drawingParam,
            setRotation,
            emitUpdate,
            notifyChange,
        });

        expect(isDrawingTransformRotationDisabled(false)).toBe(true);

        handleRotationChange(45);

        expect(setRotation).not.toHaveBeenCalled();
        expect(emitUpdate).not.toHaveBeenCalled();
        expect(notifyChange).not.toHaveBeenCalled();
    });

    it('emits angle updates when rotation is enabled', () => {
        const setRotation = vi.fn();
        const emitUpdate = vi.fn();
        const notifyChange = vi.fn();
        const handleRotationChange = createDrawingTransformRotationChangeHandler({
            rotateEnabled: true,
            drawingParam,
            setRotation,
            emitUpdate,
            notifyChange,
        });

        expect(isDrawingTransformRotationDisabled(true)).toBe(false);

        handleRotationChange(45);

        expect(setRotation).toHaveBeenCalledWith(45);
        expect(emitUpdate).toHaveBeenCalledWith([{
            ...drawingParam,
            transform: {
                angle: 45,
            },
        }]);
        expect(notifyChange).toHaveBeenCalledTimes(1);
    });

    it('ignores null rotation updates even when rotation is enabled', () => {
        const setRotation = vi.fn();
        const emitUpdate = vi.fn();
        const notifyChange = vi.fn();
        const handleRotationChange = createDrawingTransformRotationChangeHandler({
            rotateEnabled: true,
            drawingParam,
            setRotation,
            emitUpdate,
            notifyChange,
        });

        handleRotationChange(null);

        expect(setRotation).not.toHaveBeenCalled();
        expect(emitUpdate).not.toHaveBeenCalled();
        expect(notifyChange).not.toHaveBeenCalled();
    });
});
