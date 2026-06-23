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

export enum DataStreamTreeNodeType {
    // COLUMN_BREAK, // \v column break
    // PAGE_BREAK, // \f page break
    // DOCS_END, // \0  document end
    // TAB, // \t  tab
    PARAGRAPH = 'PARAGRAPH', // \r  paragraph
    SECTION_BREAK = 'SECTION_BREAK', // \n  section break
    TABLE = 'TABLE',
    TABLE_ROW = 'TABLE_ROW',
    TABLE_CELL = 'TABLE_CELL',
    COLUMN_GROUP = 'COLUMN_GROUP',
    COLUMN = 'COLUMN',
    BLOCK = 'BLOCK',
    CUSTOM_BLOCK = 'CUSTOM_BLOCK', // \b  images, mentions, etc. that do not participate in document flow
}

export enum DataStreamTreeTokenType {
    PARAGRAPH = '\r', // paragraph
    SECTION_BREAK = '\n', // section break
    // table.
    TABLE_START = '\x1A', // table start
    TABLE_ROW_START = '\x1B', // table row start
    TABLE_CELL_START = '\x1C', // table cell start
    TABLE_CELL_END = '\x1D', // table cell end
    TABLE_ROW_END = '\x0E', // table row end
    TABLE_END = '\x0F', // table end
    // column group.
    COLUMN_GROUP_START = '\x12', // column group start
    COLUMN_START = '\x13', // column start
    COLUMN_END = '\x14', // column end
    COLUMN_GROUP_END = '\x15', // column group end
    // block.
    BLOCK_START = '\x10', // block start
    BLOCK_END = '\x11', // block end
    // custom range.
    /**
     * @deprecated
     */
    CUSTOM_RANGE_START = '\x1F', // custom range start
    /**
     * @deprecated
     */
    CUSTOM_RANGE_END = '\x1E', // custom range end

    COLUMN_BREAK = '\v', // column break
    PAGE_BREAK = '\f', // page break
    DOCS_END = '\0', // document end
    TAB = '\t', // tab
    // custom block.
    CUSTOM_BLOCK = '\b', // images, mentions, etc. that do not participate in document flow

    LETTER = '',
    SPACE = ' ',
}

/** Wrap your stream in a pair of custom range tokens. */
export function makeCustomRangeStream(stream: string): string {
    return `${stream}`;
}
