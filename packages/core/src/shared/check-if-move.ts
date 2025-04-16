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

import type { ITransformState } from '../types/interfaces/i-drawing';
import type { Nullable } from './types';

export const MOVE_BUFFER_VALUE = 2;

export const ROTATE_BUFFER_VALUE = 1;

export function checkIfMove(transform: Nullable<ITransformState>, previousTransform: Nullable<ITransformState>): boolean {
    if (previousTransform == null || transform == null) {
        return true;
    }

    const { left: leftPrev = 0, top: topPrev = 0, height: heightPrev = 0, width: widthPrev = 0, angle: anglePrev = 0 } = previousTransform;
    const { left = 0, top = 0, height = 0, width = 0, angle = 0 } = transform;

    const allWidth = width;
    const allHeight = height;

    const allWidthPrev = widthPrev;
    const allHeightPrev = heightPrev;

    return Math.abs(left - leftPrev) > MOVE_BUFFER_VALUE || Math.abs(top - topPrev) > MOVE_BUFFER_VALUE || Math.abs(allWidth - allWidthPrev) > MOVE_BUFFER_VALUE || Math.abs(allHeight - allHeightPrev) > MOVE_BUFFER_VALUE || Math.abs(angle - anglePrev) > ROTATE_BUFFER_VALUE;
}
