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

import type { ICustomDecoration, ICustomRange, ICustomTable, IDocumentBody, IParagraph, ITextRun, ITextStyle, Nullable } from '@univerjs/core';

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
        ts: {},
    };

    if (isFormula) {
        return retTextRun;
    }

    for (let i = textRuns.length - 1; i >= 0; i--) {
        const textRun = textRuns[i];
        const { st, ed } = textRun;

        if (position > st && position <= ed) {
            retTextRun.st = st;
            retTextRun.ed = ed;

            retTextRun.ts = {
                ...retTextRun.ts,
                ...textRun.ts,
            };
        }
    }

    if (position === 0) {
        const textRun = textRuns?.[0];
        if (textRun && textRun.st === 0) {
            retTextRun.ts = {
                ...retTextRun.ts,
                ...textRun.ts,
            };
        }
    }

    if (cacheStyle) {
        retTextRun.ts = {
            ...retTextRun.ts,
            ...cacheStyle,
        };
    }

    return retTextRun;
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
