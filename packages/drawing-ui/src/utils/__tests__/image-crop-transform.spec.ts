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

import { describe, expect, it } from 'vitest';
import { getImageCropRect } from '../image-crop-transform';

describe('getImageCropRect', () => {
    it('keeps asymmetric crop insets in image coordinates', () => {
        const result = getImageCropRect({ left: 10, top: 20, width: 200, height: 100, angle: 0 }, { left: 30, top: 30, width: 150, height: 60 });
        expect(result.srcRectAngle).toEqual({ left: 20, top: 10, right: 30, bottom: 30 });
        expect(result.srcRect).toEqual(result.srcRectAngle);
    });
    it('accounts for different rotation centers without changing the crop size', () => {
        const { srcRectAngle } = getImageCropRect({ left: 0, top: 0, width: 200, height: 100, angle: 90 }, { left: 50, top: 10, width: 100, height: 60 });
        expect(srcRectAngle.left).toBeCloseTo(40);
        expect(srcRectAngle.top).toBeCloseTo(20);
        expect(srcRectAngle.right).toBeCloseTo(60);
        expect(srcRectAngle.bottom).toBeCloseTo(20);
    });
});
