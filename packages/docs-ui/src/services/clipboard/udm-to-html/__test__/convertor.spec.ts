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

import { describe, expect, it } from 'vitest';
import { BooleanNumber } from '@univerjs/core';
import { covertTextRunToHtml, UDMToHtmlService } from '../convertor';

function getTestBody() {
    return {
        dataStream: '荷塘月色\r作者：朱自清\r\n',
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
                },
            },
            {
                st: 5,
                ed: 11,
                ts: {
                    fs: 18,
                    ff: 'Microsoft YaHei',
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
                startIndex: 11,
                paragraphStyle: {
                    spaceAbove: 10,
                    lineSpacing: 2,
                    spaceBelow: 0,
                },
            },
        ],
        sectionBreaks: [
            {
                startIndex: 12,
            },
        ],
    };
}

describe('test case in html and udm convert', () => {
    it('test case in html and udm convert and bodyList length is 1', () => {
        const convertor = new UDMToHtmlService();
        const bodyList = [
            {
                dataStream: '=SUM(F15:G18)',
                textRuns: [
                    {
                        st: 5,
                        ed: 12,
                        ts: {
                            cl: {
                                rgb: '#9e6de3',
                            },
                        },
                    },
                ],
                paragraphs: [
                    {
                        startIndex: 13,
                        paragraphStyle: {
                            horizontalAlign: 0,
                        },
                    },
                ],
            },
        ];

        const html = convertor.convert(bodyList);

        expect(html).toBe('<p class="UniverNormal" >=SUM(<span style="color: #9e6de3;">F15:G18</span>)</p>');
    });

    it('Should convert textRun to Html', () => {
        const documentBody = getTestBody();
        const expectedHtml = '<span style="font-family: Microsoft YaHei; color: rgb(0, 0, 0); font-size: 24pt;"><strong>荷塘月色</strong></span>';

        expect(covertTextRunToHtml(documentBody.dataStream, documentBody.textRuns[0])).toBe(expectedHtml);
    });
});
