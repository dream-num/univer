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
import { prepareParagraphBody, prepareTextChunks } from '../utils';

function getDocumentBody(): IDocumentBody {
    return ({
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
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
            {
                startIndex: 36,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            },
        ],
        sectionBreaks: [
            {
                startIndex: 37,
            },
        ],
    });
}

describe('Text shaping test cases', () => {
    describe('Test prepareParagraphBody', () => {
        it('Should return correct paragraph body', () => {
            const body: IDocumentBody = getDocumentBody();
            const paragraphIndex = 36;
            const expectedParagraphBody: IDocumentBody = {
                dataStream: '作者：朱自清 👨‍👩‍👧‍👦 Today Office\r',
                textRuns: [
                    {
                        st: 0,
                        ed: 31,
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
            };

            expect(prepareParagraphBody(body, paragraphIndex)).toEqual(expectedParagraphBody);
        });
    });

    describe('Test prepareTextChunks', () => {
        it('Should return correct text chunks', () => {
            const body: IDocumentBody = {
                dataStream: '作者：朱自清 👨‍👩‍👧‍👦 Today Office\r',
                textRuns: [
                    {
                        st: 4,
                        ed: 31,
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
            };
            const expectedTextChunks = [
                {
                    content: '作者：朱',
                },
                {
                    content: '自清 👨‍👩‍👧‍👦 Today Office',
                    style: {
                        fs: 18,
                        ff: 'Times New Roman',
                        cl: {
                            rgb: 'rgb(30, 30, 30)',
                        },
                        bl: BooleanNumber.FALSE,
                    },
                },
                {
                    content: '\r',
                },
            ];

            expect(prepareTextChunks(body)).toEqual(expectedTextChunks);
        });
    });
});
