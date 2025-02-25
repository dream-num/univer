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
import { generateRandomId, Tools } from '../../../../shared';
import { CustomRangeType } from '../../../../types/interfaces';
import { DataStreamTreeTokenType } from '../../types';

const tags = [
    // DataStreamTreeTokenType.PARAGRAPH, // 段落
    // DataStreamTreeTokenType.SECTION_BREAK, // 章节
    DataStreamTreeTokenType.TABLE_START, // 表格开始
    DataStreamTreeTokenType.TABLE_ROW_START, // 表格开始
    DataStreamTreeTokenType.TABLE_CELL_START, // 表格开始
    DataStreamTreeTokenType.TABLE_CELL_END, // 表格开始
    DataStreamTreeTokenType.TABLE_ROW_END, // 表格开始
    DataStreamTreeTokenType.TABLE_END, // 表格结束
    // DataStreamTreeTokenType.COLUMN_BREAK, // 换列
    // DataStreamTreeTokenType.PAGE_BREAK, // 换页
    // DataStreamTreeTokenType.DOCS_END, // 文档结尾
    // DataStreamTreeTokenType.TAB, // 制表符
    // DataStreamTreeTokenType.CUSTOM_BLOCK, // 图片 mention 等不参与文档流的场景
];

export const getPlainText = (dataStream: string) => {
    const text = dataStream.endsWith('\r\n') ? dataStream.slice(0, -2) : dataStream;
    return tags.reduce((res, curr) => res.replaceAll(curr, ''), text);
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
                paragraphs.push({ startIndex: i });
            }
        } else {
            newDataStream += dataStream.slice(cursor, i + 1);
            cursor = i + 1;
            if (insertP) {
                paragraphs.push({ startIndex: i });
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
