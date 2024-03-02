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

import { BooleanNumber } from '../../../types/enum/text-style';
import { replaceInDocumentBody } from '../replacement';

function getTestDocumentBody() {
    const documentBody = {
        dataStream: '荷塘月色\r作者：朱月色\r\n',
        textRuns: [
            {
                st: 0,
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
            {
                st: 3,
                ed: 4,
                ts: {
                    fs: 24,
                    ff: 'Microsoft YaHei',
                    cl: {
                        rgb: 'rgb(23, 23, 23)',
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

    return documentBody;
}

describe('test case in replaceInDocumentBody utils', () => {
    it('Should replace all `query` to `target`', () => {
        const documentBody = getTestDocumentBody();
        const expectedBody = {
            dataStream: '荷塘Jocs\r作者：朱Jocs\r\n',
            textRuns: [
                {
                    st: 0,
                    ed: 6,
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
                    st: 7,
                    ed: 15,
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
                    startIndex: 6,
                    paragraphStyle: {
                        spaceAbove: 10,
                        lineSpacing: 2,
                        spaceBelow: 0,
                    },
                },
                {
                    startIndex: 15,
                    paragraphStyle: {
                        spaceAbove: 10,
                        lineSpacing: 2,
                        spaceBelow: 0,
                    },
                },
            ],
            sectionBreaks: [
                {
                    startIndex: 16,
                },
            ],
        };

        expect(replaceInDocumentBody(documentBody, '月色', 'Jocs')).toEqual(expectedBody);
    });

    it('Should replace all `query` to `target` when `target` is empty', () => {
        const documentBody = getTestDocumentBody();
        const expectedBody = {
            dataStream: '荷塘\r作者：朱\r\n',
            textRuns: [
                {
                    st: 0,
                    ed: 2,
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
                    st: 3,
                    ed: 7,
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
                    startIndex: 2,
                    paragraphStyle: {
                        spaceAbove: 10,
                        lineSpacing: 2,
                        spaceBelow: 0,
                    },
                },
                {
                    startIndex: 7,
                    paragraphStyle: {
                        spaceAbove: 10,
                        lineSpacing: 2,
                        spaceBelow: 0,
                    },
                },
            ],
            sectionBreaks: [
                {
                    startIndex: 8,
                },
            ],
        };

        expect(replaceInDocumentBody(documentBody, '月色', '')).toEqual(expectedBody);
    });

    it('Should return the origin body when the query is empty', () => {
        const documentBody = getTestDocumentBody();

        expect(replaceInDocumentBody(documentBody, '', 'Jocs')).toEqual(documentBody);
    });
});
