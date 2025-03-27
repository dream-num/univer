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

import type { IDocumentBody, IStyleBase } from '@univerjs/core';

interface ITextChunk {
    content: string;
    style?: IStyleBase;
}

export function prepareParagraphBody(body: IDocumentBody, paragraphIndex: number): IDocumentBody {
    const { dataStream, paragraphs = [], textRuns = [] } = body;

    let last = 0;
    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const { startIndex } = paragraph;

        if (startIndex === paragraphIndex) {
            break;
        }

        last = startIndex + 1;
    }

    const textRunChunks = [];

    for (const textRun of textRuns) {
        const { st, ed } = textRun;

        if (st >= last && st <= paragraphIndex) {
            textRunChunks.push({
                ...textRun,
                st: st - last,
                ed: Math.min(ed, paragraphIndex) - last,
            });
        } else if (ed >= last && ed <= paragraphIndex) {
            textRunChunks.push({
                ...textRun,
                st: Math.max(st, last) - last,
                ed: ed - last,
            });
        }
    }

    return {
        dataStream: dataStream.substring(last, paragraphIndex + 1),
        textRuns: textRunChunks,
    };
}

// Split the paragraph content into text chunks, and each chunk has the same style and font family.
export function prepareTextChunks(body: IDocumentBody) {
    const { dataStream, textRuns = [] } = body;
    let offset = 0;
    const chunks: ITextChunk[] = [];

    for (const textRun of textRuns) {
        const { st, ed, ts = {} } = textRun;
        if (st !== offset) {
            chunks.push({
                content: dataStream.substring(offset, st),
            });
        }

        chunks.push({
            content: dataStream.substring(st, ed),
            style: ts,
        });

        offset = ed;
    }

    if (offset !== dataStream.length) {
        chunks.push({
            content: dataStream.substring(offset),
        });
    }

    return chunks;
}
