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

import type { IDocumentBody, IDocumentData, IParagraphStyle } from '@univerjs/core';
import { BooleanNumber, DocumentFlavor } from '@univerjs/core';
import { DocumentLineBreaker, LineBreaker } from './line-breaker';

export function createDocumentLineBreaker(document: IDocumentData, paragraphStyle: IParagraphStyle, content: string, start: number, body: IDocumentBody | undefined = document.body): LineBreaker {
    const wordWrap = paragraphStyle.wordWrap ?? BooleanNumber.FALSE;
    if (wordWrap === BooleanNumber.FALSE ? !/\p{Script=Hangul}/u.test(content) : !/\p{Script=Latin}/u.test(content)) {
        return new LineBreaker(content);
    }
    const inferKorean = document.documentStyle?.documentFlavor === DocumentFlavor.MODERN
        || document.documentStyle?.documentFlavor === DocumentFlavor.TRADITIONAL
        || document.documentStyle?.documentFlavor === DocumentFlavor.DRAWINGML;
    if (wordWrap === BooleanNumber.FALSE && inferKorean) {
        return new DocumentLineBreaker(content, wordWrap);
    }
    const defaultLanguage = paragraphStyle.textStyle?.lang ?? document.documentStyle?.textStyle?.lang;
    const runs = body?.textRuns ?? [];
    let runIndex = 0;
    let end = runs.length;
    while (runIndex < end) {
        const middle = (runIndex + end) >>> 1;
        if (runs[middle].ed <= start) {
            runIndex = middle + 1;
        } else {
            end = middle;
        }
    }
    return new DocumentLineBreaker(content, wordWrap, (offset) => {
        const index = start + offset;
        while (runIndex < runs.length && runs[runIndex].ed <= index) {
            runIndex++;
        }
        const run = runs[runIndex];
        // Excel shapes require authored Korean language; Docs and Slides also recognize Hangul without that marker.
        return (run && run.st <= index ? run.ts?.lang : undefined) ?? defaultLanguage;
    }, inferKorean);
}
