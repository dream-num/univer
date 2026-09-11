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

import type { BaseObject } from '@univerjs/engine-render';
import { degToRad, Vector2 } from '@univerjs/engine-render';

/** Crop insets in image coordinates, accounting for rotation around different centers. */
export function getImageCropRect(image: Pick<BaseObject, 'left' | 'top' | 'width' | 'height' | 'angle'>, crop: Pick<BaseObject, 'left' | 'top' | 'width' | 'height'>) {
    const srcRect = {
        left: crop.left - image.left,
        top: crop.top - image.top,
        right: image.left + image.width - crop.left - crop.width,
        bottom: image.top + image.height - crop.top - crop.height,
    };
    const srcRectAngle = { ...srcRect };
    if (image.angle) {
        const origin = new Vector2(image.left, image.top);
        origin.rotateByPoint(degToRad(image.angle), new Vector2(image.left + image.width / 2, image.top + image.height / 2));
        origin.rotateByPoint(degToRad(-image.angle), new Vector2(crop.left + crop.width / 2, crop.top + crop.height / 2));
        srcRectAngle.left = crop.left - origin.x;
        srcRectAngle.top = crop.top - origin.y;
        srcRectAngle.right = image.width - srcRectAngle.left - crop.width;
        srcRectAngle.bottom = image.height - srcRectAngle.top - crop.height;
    }
    return { srcRect, srcRectAngle };
}
