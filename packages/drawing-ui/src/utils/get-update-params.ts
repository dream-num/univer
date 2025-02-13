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

import type { IDrawingParam, Nullable } from '@univerjs/core';
import type { IDrawingManagerService, IImageData } from '@univerjs/drawing';
import type { BaseObject, Image } from '@univerjs/engine-render';
import { DrawingTypeEnum } from '@univerjs/core';

export function getUpdateParams(objects: Map<string, BaseObject>, drawingManagerService: IDrawingManagerService): Nullable<IDrawingParam>[] {
    const params: Nullable<IDrawingParam>[] = [];
    objects.forEach((object) => {
        const { oKey, left, top, height, width, angle } = object;

        const searchParam = drawingManagerService.getDrawingOKey(oKey);

        if (searchParam == null) {
            params.push(null);
            return true;
        }

        const { unitId, subUnitId, drawingId, drawingType } = searchParam;

        const param = {
            unitId,
            subUnitId,
            drawingId,
            drawingType,
            transform: {
                left,
                top,
                height,
                width,
                angle,
            },
        } as IDrawingParam;

        if (drawingType === DrawingTypeEnum.DRAWING_IMAGE) {
            (param as IImageData).srcRect = (object as Image).srcRect;
        }

        params.push(param);
    });

    return params;
}
