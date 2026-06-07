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

import type { IDocumentBody } from '@univerjs/core';

type IParagraphStyle = NonNullable<IDocumentBody['paragraphs']>[number]['paragraphStyle'];

export interface IBuildPlainTextInsertBodyOptions {
    paragraphStyle?: IParagraphStyle;
    removeLeadingParagraphBreak?: boolean;
}

function cloneParagraphStyle(paragraphStyle: IParagraphStyle): IParagraphStyle {
    return paragraphStyle == null ? paragraphStyle : JSON.parse(JSON.stringify(paragraphStyle));
}

function normalizePlainTextDataStream(dataStream: string): string {
    return dataStream.replace(/\r\n/g, '\r').replace(/\n/g, '\r');
}

export function getRemovedLeadingParagraphBreakLength(
    dataStream: string,
    removeLeadingParagraphBreak?: boolean
): number {
    const normalized = normalizePlainTextDataStream(dataStream);

    if (removeLeadingParagraphBreak && normalized.length > 1 && normalized.startsWith('\r')) {
        return 1;
    }

    return 0;
}

export function getNormalizedPlainTextCursorOffset(
    dataStream: string,
    cursorOffset: number,
    removeLeadingParagraphBreak?: boolean
): number {
    const normalizedPrefixLength = normalizePlainTextDataStream(dataStream.slice(0, cursorOffset)).length;

    return Math.max(
        0,
        normalizedPrefixLength - getRemovedLeadingParagraphBreakLength(dataStream, removeLeadingParagraphBreak)
    );
}

export function getParagraphStyleAtOffset(body: IDocumentBody, offset: number): IParagraphStyle {
    const paragraphs = body.paragraphs ?? [];
    const paragraph = paragraphs.find((item) => item.startIndex >= offset) ?? paragraphs[paragraphs.length - 1];

    return paragraph?.paragraphStyle;
}

export function buildPlainTextInsertBody(
    dataStream: string,
    options: IBuildPlainTextInsertBodyOptions = {}
): IDocumentBody {
    const normalizedDataStream = normalizePlainTextDataStream(dataStream).slice(
        getRemovedLeadingParagraphBreakLength(dataStream, options.removeLeadingParagraphBreak)
    );
    const body: IDocumentBody = {
        dataStream: normalizedDataStream,
        customDecorations: [],
        customRanges: [],
        textRuns: [],
    };

    const paragraphs = [];
    for (let index = 0; index < normalizedDataStream.length; index++) {
        if (normalizedDataStream[index] === '\r') {
            paragraphs.push({
                startIndex: index,
                ...(options.paragraphStyle == null ? {} : { paragraphStyle: cloneParagraphStyle(options.paragraphStyle) }),
            });
        }
    }

    if (paragraphs.length > 0) {
        body.paragraphs = paragraphs;
    }

    return body;
}
