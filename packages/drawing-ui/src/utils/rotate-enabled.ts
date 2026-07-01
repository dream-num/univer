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

import type { DrawingType, IDrawingParam } from '@univerjs/core';
import type { IDrawingRotateEnabledResolverOptions } from '@univerjs/drawing';
import { DrawingTypeEnum } from '@univerjs/core';
import { resolveDrawingRotateEnabled } from '@univerjs/drawing';

export function isKnownDrawingUINonRotatableType(drawingType: DrawingType): boolean {
    return drawingType === DrawingTypeEnum.DRAWING_CHART;
}

export function resolveDrawingUIRotateEnabled(
    drawing: IDrawingParam,
    options: IDrawingRotateEnabledResolverOptions = {}
): boolean {
    return resolveDrawingRotateEnabled(drawing, {
        ...options,
        isKnownNonRotatableType: options.isKnownNonRotatableType ?? isKnownDrawingUINonRotatableType,
    });
}
