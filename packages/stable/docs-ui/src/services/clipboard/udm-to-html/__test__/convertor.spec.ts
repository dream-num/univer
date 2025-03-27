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
import { BooleanNumber } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { convertBodyToHtml, covertTextRunToHtml, getBodySliceHtml, UDMToHtmlService } from '../convertor';

function getTestBody() {
    return {
        dataStream: '荷塘月色\r作者：朱自清',
        textRuns: [
            {
                st: 1,
                ed: 3,
                ts: {
                    fs: 24,
                    ff: 'Microsoft YaHei',
                    cl: {
                        rgb: 'rgb(0, 0, 0)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 4,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 11,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
        ],
    } as IDocumentBody;
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

        const html = convertor.convert(bodyList.map((b) => ({ body: b, id: '', documentStyle: {} })));

        expect(html).toBe('<p class="UniverNormal" >=SUM(<span style="color: #9e6de3;">F15:G18</span>)</p>');
    });

    it('Should convert textRun to Html', () => {
        const documentBody = getTestBody();
        const expectedHtml = '<span style="font-family: Microsoft YaHei; color: rgb(0, 0, 0); font-size: 24pt;"><strong>塘月</strong></span>';

        expect(covertTextRunToHtml(documentBody.dataStream, documentBody.textRuns![0])).toBe(expectedHtml);
    });

    it('Should get getBodySliceHtml', () => {
        const documentBody = getTestBody();
        let startIndex = 1;
        let endIndex = 3;

        let expectedHtml = '<span style="font-family: Microsoft YaHei; color: rgb(0, 0, 0); font-size: 24pt;"><strong>塘月</strong></span>';

        expect(getBodySliceHtml({ body: documentBody, id: '', documentStyle: {} }, startIndex, endIndex)).toEqual(expectedHtml);

        startIndex = 0;
        endIndex = 4;

        expectedHtml = '荷<span style="font-family: Microsoft YaHei; color: rgb(0, 0, 0); font-size: 24pt;"><strong>塘月</strong></span>色';
        expect(getBodySliceHtml({ body: documentBody, id: '', documentStyle: {} }, startIndex, endIndex)).toEqual(expectedHtml);
    });

    it('Should convert document body To Html(convertBodyToHtml)', () => {
        const documentBody = getTestBody();
        const expectedHtml = '<p class="UniverNormal" style="margin-top: 10px; margin-bottom: 0px; line-height: 2;">荷<span style="font-family: Microsoft YaHei; color: rgb(0, 0, 0); font-size: 24pt;"><strong>塘月</strong></span>色</p><p class="UniverNormal" style="margin-top: 10px; margin-bottom: 0px; line-height: 2;">作者：朱自清</p>';

        expect(convertBodyToHtml({ body: documentBody, id: '', documentStyle: {} })).toEqual(expectedHtml);
    });
});
