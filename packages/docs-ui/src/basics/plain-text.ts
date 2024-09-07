/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IDocumentBody, IDocumentData } from '@univerjs/core';
import { DataStreamTreeTokenType } from '@univerjs/core';

export const getPlainText = (text: string) => {
    return text.replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_START, '')
        .replaceAll(DataStreamTreeTokenType.CUSTOM_RANGE_END, '');
};

/**
 * get plain text from rich-text
 */
export const getPlainTextFormBody = (body: IDocumentBody) => {
    let str = body.dataStream;
    if (body.dataStream.endsWith('\r\n')) {
        str = body.dataStream.slice(0, -2);
    }

    return getPlainText(str);
};

/**
 * get plain text from rich-text
 */
export const getPlainTextFormDocument = (data: IDocumentData) => {
    if (!data.body) {
        return '';
    }
    return getPlainTextFormBody(data.body);
};

const tags = [
    DataStreamTreeTokenType.PARAGRAPH, // 段落
    DataStreamTreeTokenType.SECTION_BREAK, // 章节
    DataStreamTreeTokenType.TABLE_START, // 表格开始
    DataStreamTreeTokenType.TABLE_ROW_START, // 表格开始
    DataStreamTreeTokenType.TABLE_CELL_START, // 表格开始
    DataStreamTreeTokenType.TABLE_CELL_END, // 表格开始
    DataStreamTreeTokenType.TABLE_ROW_END, // 表格开始
    DataStreamTreeTokenType.TABLE_END, // 表格结束
    DataStreamTreeTokenType.CUSTOM_RANGE_START, // 自定义范围开始
    DataStreamTreeTokenType.CUSTOM_RANGE_END, // 自定义范围结束
    DataStreamTreeTokenType.COLUMN_BREAK, // 换列
    DataStreamTreeTokenType.PAGE_BREAK, // 换页
    DataStreamTreeTokenType.DOCS_END, // 文档结尾
    DataStreamTreeTokenType.TAB, // 制表符
    DataStreamTreeTokenType.CUSTOM_BLOCK, // 图片 mention 等不参与文档流的场景

];

export function getSelectionText(dataStream: string, start: number, end: number) {
    const text = dataStream.slice(start, end);
    return tags.reduce((res, curr) => res.replaceAll(curr, ''), text);
}
