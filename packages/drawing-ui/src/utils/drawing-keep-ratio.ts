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
import type { BaseObject } from '@univerjs/engine-render';

// Historical drawings omit this field, matching the Transformer default that preserves the aspect ratio.
const DEFAULT_DRAWING_KEEP_RATIO = true;

export function getDrawingKeepRatio(drawing: IDrawingParam): boolean {
    return drawing.locks?.noChangeAspect ?? DEFAULT_DRAWING_KEEP_RATIO;
}

export function syncDrawingKeepRatio(drawingObject: BaseObject, drawing: IDrawingParam): void {
    drawingObject.transformerConfig = {
        ...drawingObject.transformerConfig,
        keepRatio: getDrawingKeepRatio(drawing),
    };
}
