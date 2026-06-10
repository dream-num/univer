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

import type { IDocumentSkeletonGlyph } from '../../../basics/i-document-skeleton-cached';
import { getColorStyle } from '@univerjs/core';

export interface IBackgroundGlyphRun {
    glyph: IDocumentSkeletonGlyph;
    left: number;
    width: number;
}

export function collectBackgroundGlyphRuns(glyphGroup: IDocumentSkeletonGlyph[]): IBackgroundGlyphRun[] {
    const runs: IBackgroundGlyphRun[] = [];

    let activeGlyph: IDocumentSkeletonGlyph | null = null;
    let activeColor = '';
    let activeLeft = 0;
    let activeRight = 0;

    const flush = () => {
        if (!activeGlyph) {
            return;
        }

        runs.push({
            glyph: {
                ...activeGlyph,
                width: activeRight - activeLeft,
            },
            left: activeLeft,
            width: activeRight - activeLeft,
        });

        activeGlyph = null;
        activeColor = '';
        activeLeft = 0;
        activeRight = 0;
    };

    for (const glyph of glyphGroup) {
        if (!glyph.content || glyph.content === '\r') {
            flush();
            continue;
        }

        const backgroundColor = glyph.ts?.bg ? getColorStyle(glyph.ts.bg) : '';
        if (!backgroundColor) {
            flush();
            continue;
        }

        const glyphLeft = glyph.left;
        const glyphRight = glyph.left + glyph.width;

        if (activeGlyph && activeColor === backgroundColor) {
            activeRight = Math.max(activeRight, glyphRight);
            continue;
        }

        flush();
        activeGlyph = glyph;
        activeColor = backgroundColor;
        activeLeft = glyphLeft;
        activeRight = glyphRight;
    }

    flush();

    return runs;
}
