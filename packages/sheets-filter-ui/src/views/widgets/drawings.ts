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

import type { UniverRenderingContext2D } from '@univerjs/engine-render';
import { Rect } from '@univerjs/engine-render';
import { drawCanvasIcon } from '@univerjs/icons-svg';

export function drawFilterButton(ctx: UniverRenderingContext2D, size: number, fgColor: string, bgColor: string, hasCriteria: boolean): void {
    Rect.drawWith(ctx, { radius: 2, width: 16, height: 16, fill: bgColor });
    drawCanvasIcon(ctx, hasCriteria ? 'filter-applied-icon' : 'filter-options-icon', 0, 0, size, fgColor);
}
