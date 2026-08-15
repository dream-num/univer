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

import { ArrangeTypeEnum } from '../types/interfaces/i-drawing';

/** Clamps a requested zero-based index to an available drawing order. */
export function normalizeDrawingOrderIndex(index: number, length: number): number {
    const lastIndex = Math.max(0, length - 1);
    return Math.max(0, Math.min(Math.floor(index), lastIndex)) || 0;
}

/** Resolves a relative drawing arrangement to its zero-based target index. */
export function getDrawingOrderIndex(currentIndex: number, length: number, arrangeType: ArrangeTypeEnum): number {
    const index = normalizeDrawingOrderIndex(currentIndex, length);
    if (arrangeType === ArrangeTypeEnum.front) return normalizeDrawingOrderIndex(length - 1, length);
    if (arrangeType === ArrangeTypeEnum.forward) return normalizeDrawingOrderIndex(index + 1, length);
    if (arrangeType === ArrangeTypeEnum.backward) return normalizeDrawingOrderIndex(index - 1, length);
    return 0;
}
