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

import type { IDocumentStyle, ISectionBreak, ISectionColumnProperties } from '@univerjs/core';
import { PAGE_SIZE, PaperType } from '@univerjs/core';

/** Creates explicit OOXML section columns from a count, gap, and optional widths. */
export function createSectionColumnProperties(
    documentStyle: IDocumentStyle | undefined,
    section: ISectionBreak | undefined,
    columnCount: number,
    gap: number,
    widths?: number[]
): ISectionColumnProperties[] {
    if (columnCount <= 1) {
        return [];
    }

    const safeGap = Math.max(0, gap);
    const pageWidth = section?.pageSize?.width ?? documentStyle?.pageSize?.width ?? PAGE_SIZE[PaperType.A4].width;
    const contentWidth = Math.max(
        0,
        pageWidth - (section?.marginLeft ?? documentStyle?.marginLeft ?? 72) - (section?.marginRight ?? documentStyle?.marginRight ?? 72)
    );
    const availableWidth = Math.max(0, contentWidth - safeGap * (columnCount - 1));
    const resolvedWidths = widths ?? Array.from({ length: columnCount }, () => availableWidth / columnCount);

    return resolvedWidths.map((width, index) => ({
        width: Math.max(0, width),
        paddingEnd: index === columnCount - 1 ? 0 : safeGap,
    }));
}
