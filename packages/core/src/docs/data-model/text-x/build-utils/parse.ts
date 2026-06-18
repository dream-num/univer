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

import type { ICustomRange, IDocumentBody, IParagraph } from '../../../../types/interfaces';
import { Tools } from '../../../../shared';
import { generateRandomId } from '../../../../shared/random-id';
import { CustomRangeType } from '../../../../types/interfaces';
import { createParagraphId } from '../../../paragraph-id';
import { DataStreamTreeTokenType } from '../../types';

const tags = [
    // DataStreamTreeTokenType.PARAGRAPH, // paragraph
    // DataStreamTreeTokenType.SECTION_BREAK, // section break
    DataStreamTreeTokenType.TABLE_START, // table start
    DataStreamTreeTokenType.TABLE_ROW_START, // table start
    DataStreamTreeTokenType.TABLE_CELL_START, // table start
    DataStreamTreeTokenType.TABLE_CELL_END, // table start
    DataStreamTreeTokenType.TABLE_ROW_END, // table start
    DataStreamTreeTokenType.TABLE_END, // table end
    DataStreamTreeTokenType.BLOCK_START, // block start
    DataStreamTreeTokenType.BLOCK_END, // block end
    // DataStreamTreeTokenType.COLUMN_BREAK, // column break
    // DataStreamTreeTokenType.PAGE_BREAK, // page break
    // DataStreamTreeTokenType.DOCS_END, // document end
    // DataStreamTreeTokenType.TAB, // tab
    // DataStreamTreeTokenType.CUSTOM_BLOCK, // images, mentions, etc. that do not participate in document flow
];

export const getPlainText = (dataStream: string) => {
    const text = tags.reduce((res, curr) => res.replaceAll(curr, ''), dataStream);
    return text.endsWith('\r\n') ? text.slice(0, -2) : text;
};

export const isEmptyDocument = (dataStream?: string) => {
    if (!dataStream) {
        return true;
    }
    const text = getPlainText(dataStream).replaceAll('\r', '');
    return text === '';
};

export const fromPlainText = (text: string): IDocumentBody => {
    const dataStream = text.replace(/\n/g, '\r');
    const paragraphs: IParagraph[] = [];
    const existingParagraphIds = new Set<string>();
    const customRanges: ICustomRange[] = [];
    let cursor = 0;
    let newDataStream = '';

    const loopParagraph = (i: number, insertP = true) => {
        const paragraphText = dataStream.slice(cursor, i);
        if (Tools.isLegalUrl(paragraphText)) {
            const id = generateRandomId();
            const urlText = `${paragraphText}`;
            const range: ICustomRange = {
                startIndex: cursor,
                endIndex: cursor + urlText.length - 1,
                rangeId: id,
                rangeType: CustomRangeType.HYPERLINK,
                properties: {
                    url: text,
                },
            };
            customRanges.push(range);
            newDataStream += urlText;
            cursor = i + 1;
            if (insertP) {
                newDataStream += '\r';
                paragraphs.push({ startIndex: i, paragraphId: createParagraphId(existingParagraphIds) });
            }
        } else {
            newDataStream += dataStream.slice(cursor, i + 1);
            cursor = i + 1;
            if (insertP) {
                paragraphs.push({ startIndex: i, paragraphId: createParagraphId(existingParagraphIds) });
            }
        }
    };

    let end = 0;
    for (let i = 0; i < dataStream.length; i++) {
        if (dataStream[i] === '\r') {
            loopParagraph(i);
            end = i;
        }
    }

    if (end !== dataStream.length - 1 || dataStream.length === 1) {
        loopParagraph(dataStream.length, false);
    }
    return {
        dataStream: newDataStream,
        paragraphs,
        customRanges,
    };
};
