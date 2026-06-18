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

import { Vector2 } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { ImageCropperObject } from '../crop/image-cropper-object';

describe('ImageCropperObject behavior', () => {
    it('treats the crop frame as draggable while leaving the image center untouched', () => {
        const cropper = new ImageCropperObject('cropper', {
            applyTransform: {
                left: 0,
                top: 0,
                width: 100,
                height: 80,
                angle: 0,
            },
            dragPadding: 10,
        });

        expect(cropper.isHit(Vector2.FromArray([5, 5]))).toBe(true);
        expect(cropper.isHit(Vector2.FromArray([50, 40]))).toBe(false);
        expect(cropper.isHit(Vector2.FromArray([120, 40]))).toBe(false);
    });

    it('positions the crop frame from the source rectangle and refreshes when the crop changes', () => {
        const cropper = new ImageCropperObject('cropper', {
            applyTransform: {
                left: 10,
                top: 20,
                width: 120,
                height: 80,
                angle: 15,
            },
            srcRect: {
                left: 5,
                top: 10,
                right: 15,
                bottom: 20,
            },
        });

        expect(cropper.getState()).toMatchObject({
            left: 15,
            top: 30,
            width: 100,
            height: 50,
            angle: 15,
        });

        cropper.refreshSrcRect({
            left: 0,
            top: 5,
            right: 30,
            bottom: 10,
        }, {
            left: 10,
            top: 20,
            width: 120,
            height: 80,
            angle: 45,
        });

        expect(cropper.getState()).toMatchObject({
            left: 10,
            top: 25,
            width: 90,
            height: 65,
            angle: 45,
        });
    });
});
