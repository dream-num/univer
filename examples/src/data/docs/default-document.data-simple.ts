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

import type { IDocumentData } from '@univerjs/core';
import { BooleanNumber, DocumentFlavor } from '@univerjs/core';

export const DEFAULT_DOCUMENT_DATA_SIMPLE: IDocumentData = {
    id: 'default-document-id',
    body: {
        dataStream: '荷塘𠮷\r作者：朱自清 👨‍👩‍👧‍👦 Today Office\r\n',
        textRuns: [
            {
                st: 0,
                ed: 4,
                ts: {
                    fs: 24,
                    ff: 'Microsoft YaHei',
                    cl: {
                        rgb: 'rgb(0, 0, 0)',
                    },
                    bl: BooleanNumber.TRUE,
                    ul: {
                        s: BooleanNumber.TRUE,
                    },
                },
            },
            {
                st: 5,
                ed: 36,
                ts: {
                    fs: 18,
                    ff: 'Times New Roman',
                    cl: {
                        rgb: 'rgb(30, 30, 30)',
                    },
                    bl: BooleanNumber.FALSE,
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 4,
                paragraphStyle: {
                    spaceAbove: 10,
                    lineSpacing: 2,
                    spaceBelow: 0,
                },
            },
            {
                startIndex: 36,
                paragraphStyle: {
                    spaceAbove: 10,
                    lineSpacing: 2,
                    spaceBelow: 0,
                },
            },
        ],
        sectionBreaks: [
            {
                startIndex: 37,
                // columnProperties: [
                //     {
                //         width: 250,
                //         paddingEnd: 15,
                //     },
                // ],
                // columnSeparatorType: ColumnSeparatorType.NONE,
                // sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
                // textDirection: textDirectionDocument,
                // contentDirection: textDirection!,
            },
        ],
    },
    documentStyle: {
        pageSize: {
            width: 595,
            height: 842,
        },
        documentFlavor: DocumentFlavor.TRADITIONAL,
        marginTop: 50,
        marginBottom: 50,
        marginRight: 40,
        marginLeft: 40,
        renderConfig: {
            vertexAngle: 90,
            centerAngle: 0,
        },
    },
};
