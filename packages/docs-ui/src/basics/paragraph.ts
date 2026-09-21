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

import type {
    ICustomDecoration,
    ICustomRange,
    ICustomTable,
    IDocumentBody,
    IParagraph,
    ITextRange,
    ITextRun,
    ITextStyle,
    Nullable,
} from '@univerjs/core';
import { DataStreamTreeTokenType, getParagraphContentStartOffset } from '@univerjs/core';

export function isTopLevelStructuralGap(dataStream: string, offset: number): boolean {
    const previousToken = dataStream[offset - 1];
    const nextToken = dataStream[offset];

    return previousToken === DataStreamTreeTokenType.BLOCK_END ||
        previousToken === DataStreamTreeTokenType.TABLE_END ||
        previousToken === DataStreamTreeTokenType.COLUMN_GROUP_END ||
        nextToken === DataStreamTreeTokenType.BLOCK_START ||
        nextToken === DataStreamTreeTokenType.TABLE_START ||
        nextToken === DataStreamTreeTokenType.COLUMN_GROUP_START;
}

export function hasParagraphInTable(paragraph: IParagraph, tables: ICustomTable[]) {
    return tables.some((table) => paragraph.startIndex > table.startIndex && paragraph.startIndex < table.endIndex);
}

export function getTextRunAtPosition(
    body: IDocumentBody,
    position: number,
    defaultStyle: ITextStyle,
    cacheStyle: Nullable<ITextStyle>,
    isCellEditor?: boolean
): ITextRun {
    const { textRuns = [], dataStream } = body;
    const isFormula = isCellEditor && dataStream.startsWith('=');
    const retTextRun: ITextRun = {
        st: 0,
        ed: 0,
        ts: !defaultStyle.cl ? {} : { cl: { ...defaultStyle.cl } },
    };

    if (isFormula) {
        return retTextRun;
    }

    const paragraph = !isCellEditor ? body.paragraphs?.find((item) => item.startIndex >= position) : undefined;
    const atParagraphStart = paragraph && getParagraphContentStartOffset(body, paragraph) === position;
    // At a paragraph start, inherit its first character/mark instead of the preceding paragraph.
    const samplePosition = atParagraphStart || position === 0 ? position + 1 : position;

    for (let i = textRuns.length - 1; i >= 0; i--) {
        const textRun = textRuns[i];
        const { st, ed } = textRun;

        if (samplePosition > st && samplePosition <= ed) {
            retTextRun.st = st;
            retTextRun.ed = ed;

            retTextRun.ts = {
                ...retTextRun.ts,
                ...textRun.ts,
            };
        }
    }

    if (atParagraphStart && paragraph.startIndex === position) {
        retTextRun.ts = {
            ...(!defaultStyle.cl ? {} : { cl: { ...defaultStyle.cl } }),
            ...paragraph.paragraphStyle?.textStyle,
            ...textRuns.find((run) => run.st <= position && run.ed > position)?.ts,
            ...paragraph.paragraphStyle?.paragraphMarkTextStyle,
        };
    }

    if (cacheStyle) {
        retTextRun.ts = {
            ...retTextRun.ts,
            ...cacheStyle,
        };
    }

    return retTextRun;
}

export function getTextRunAtInputPosition(
    body: IDocumentBody,
    position: number,
    defaultStyle: ITextStyle,
    cacheStyle: Nullable<ITextStyle>,
    isCellEditor?: boolean,
    inheritParagraphStartStyle = false
): ITextRun {
    if (!inheritParagraphStartStyle) {
        return getTextRunAtPosition(body, position, defaultStyle, cacheStyle, isCellEditor);
    }
    const inheritedTextRun = getTextRunAtPosition(body, position, defaultStyle, cacheStyle, isCellEditor);
    const previousToken = body.dataStream[position - 1];
    const startsParagraph = previousToken === DataStreamTreeTokenType.PARAGRAPH ||
        previousToken === DataStreamTreeTokenType.COLUMN_START;
    const nextTextRun = startsParagraph
        ? body.textRuns?.find((textRun) => textRun.st === position && textRun.ed > position)
        : undefined;
    const textStyle = nextTextRun
        ? {
            ...(!defaultStyle.cl ? {} : { cl: { ...defaultStyle.cl } }),
            ...nextTextRun.ts,
            ...cacheStyle,
        }
        : { ...inheritedTextRun.ts };

    return {
        ...(nextTextRun ?? inheritedTextRun),
        ts: textStyle,
    };
}

/** Replacing a selection uses its first character; a caret normally uses its left neighbor. */
export function getTextRunForSelection(
    body: IDocumentBody,
    range: Pick<ITextRange, 'startOffset' | 'endOffset'>,
    defaultStyle: ITextStyle,
    cacheStyle: Nullable<ITextStyle>,
    isCellEditor?: boolean,
    inheritParagraphStartStyle = false
): ITextRun {
    const position = !isCellEditor && range.startOffset !== range.endOffset ? range.startOffset + 1 : range.endOffset;
    return getTextRunAtInputPosition(body, position, defaultStyle, cacheStyle, isCellEditor, inheritParagraphStartStyle);
}

export function getCustomRangeAtPosition(customRanges: ICustomRange[], position: number, extendRange?: boolean) {
    if (extendRange) {
        const range = customRanges.find((customRange) => position >= customRange.startIndex && position <= customRange.endIndex + 1);
        return range?.wholeEntity ? null : range;
    }

    const range = customRanges.find((customRange) => position > customRange.startIndex && position <= customRange.endIndex);
    return range?.wholeEntity ? null : range;
}

export function getCustomDecorationAtPosition(customDecorations: ICustomDecoration[], position: number) {
    return customDecorations.filter((customDecoration) => position > customDecoration.startIndex && position <= customDecoration.endIndex);
}
