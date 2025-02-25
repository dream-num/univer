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

import type { TextXAction } from '../action-types';
import { describe, expect, it } from 'vitest';
import { UpdateDocsAttributeType } from '../../../../shared';
import { BooleanNumber } from '../../../../types/enum';
import { CustomRangeType, type IDocumentBody } from '../../../../types/interfaces/i-document-data';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';

function getDefaultDocWithCustomRange() {
    const doc: IDocumentBody = {
        dataStream: 'Google\r\n',
        customRanges: [
            {
                startIndex: 0,
                endIndex: 5,
                rangeId: 'jocsId',
                rangeType: CustomRangeType.HYPERLINK,
                properties: {
                    url: 'https://www.google.com',
                },
            },
        ],
    };

    return doc;
}

// Test Retain + Retain with different coverType in transform textRun.
describe('transform custom range in body', () => {
    it('should pass test when REPLACE + REPLACE', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            rangeId: 'xxxId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.baidu.com',
                            },
                        },
                    ],
                },
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            rangeId: 'yyyId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.yahoo.com',
                            },
                        },
                    ],
                },
            },
        ];

        const expectedTransformedActionFalse: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            rangeId: 'xxxId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.baidu.com',
                            },
                        },
                    ],
                },
            },
        ];

        const expectedTransformedActionTrue: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            rangeId: 'yyyId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.yahoo.com',
                            },
                        },
                    ],
                },
            },
        ];

        expect(TextX.transform(actionsB, actionsA, 'left')).toEqual(expectedTransformedActionTrue);
        expect(TextX.transform(actionsB, actionsA, 'right')).toEqual(expectedTransformedActionFalse);

        const doc1 = getDefaultDocWithCustomRange();
        const doc2 = getDefaultDocWithCustomRange();
        const doc3 = getDefaultDocWithCustomRange();
        const doc4 = getDefaultDocWithCustomRange();

        const resultA = TextX.apply(TextX.apply(doc1, actionsA), TextX.transform(actionsB, actionsA, 'left'));
        const resultB = TextX.apply(TextX.apply(doc2, actionsB), TextX.transform(actionsA, actionsB, 'right'));

        const composedAction1 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'left'));
        const composedAction2 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'right'));

        const resultC = TextX.apply(doc3, composedAction1);
        const resultD = TextX.apply(doc4, composedAction2);

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);
    });

    it('should pass test when REPLACE + COVER', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            rangeId: 'xxxId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.baidu.com',
                            },
                        },
                    ],
                },
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            rangeId: 'jocsId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.yahoo.com',
                            },
                        },
                    ],
                },
            },
        ];

        const expectedTransformedActionFalse: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            rangeId: 'xxxId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.baidu.com',
                            },
                        },
                    ],
                },
            },
        ];

        const expectedTransformedActionTrue: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            rangeId: 'jocsId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.yahoo.com',
                            },
                        },
                    ],
                },
            },
        ];

        expect(TextX.transform(actionsB, actionsA, 'left')).toEqual(expectedTransformedActionTrue);
        expect(TextX.transform(actionsB, actionsA, 'right')).toEqual(expectedTransformedActionFalse);

        const doc1 = getDefaultDocWithCustomRange();
        const doc2 = getDefaultDocWithCustomRange();
        const doc3 = getDefaultDocWithCustomRange();
        const doc4 = getDefaultDocWithCustomRange();

        const resultA = TextX.apply(TextX.apply(doc1, actionsA), TextX.transform(actionsB, actionsA, 'left'));
        const resultB = TextX.apply(TextX.apply(doc2, actionsB), TextX.transform(actionsA, actionsB, 'right'));

        const composedAction1 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'left'));
        const composedAction2 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'right'));

        const resultC = TextX.apply(doc3, composedAction1);
        const resultD = TextX.apply(doc4, composedAction2);

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);

        const doc5 = getDefaultDocWithCustomRange();
        const doc6 = getDefaultDocWithCustomRange();
        const doc7 = getDefaultDocWithCustomRange();
        const doc8 = getDefaultDocWithCustomRange();

        const resultE = TextX.apply(TextX.apply(doc5, actionsA), TextX.transform(actionsB, actionsA, 'right'));
        const resultF = TextX.apply(TextX.apply(doc6, actionsB), TextX.transform(actionsA, actionsB, 'left'));

        const composedAction3 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'right'));
        const composedAction4 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'left'));

        const resultG = TextX.apply(doc7, composedAction3);
        const resultH = TextX.apply(doc8, composedAction4);

        expect(resultE).toEqual(resultF);
        expect(resultG).toEqual(resultH);
        expect(resultE).toEqual(resultG);
        expect(composedAction3).toEqual(composedAction4);
    });

    it('should pass test when COVER + COVER', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            rangeId: 'jocsId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.baidu.com',
                            },
                        },
                    ],
                },
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            rangeId: 'jocsId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.yahoo.com',
                            },
                        },
                    ],
                },
            },
        ];

        const expectedTransformedActionFalse: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            rangeId: 'jocsId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.baidu.com',
                            },
                        },
                    ],
                },
            },
        ];

        const expectedTransformedActionTrue: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            rangeId: 'jocsId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.yahoo.com',
                            },
                        },
                    ],
                },
            },
        ];

        expect(TextX.transform(actionsB, actionsA, 'left')).toEqual(expectedTransformedActionTrue);
        expect(TextX.transform(actionsB, actionsA, 'right')).toEqual(expectedTransformedActionFalse);

        const doc1 = getDefaultDocWithCustomRange();
        const doc2 = getDefaultDocWithCustomRange();
        const doc3 = getDefaultDocWithCustomRange();
        const doc4 = getDefaultDocWithCustomRange();

        const resultA = TextX.apply(TextX.apply(doc1, actionsA), TextX.transform(actionsB, actionsA, 'left'));
        const resultB = TextX.apply(TextX.apply(doc2, actionsB), TextX.transform(actionsA, actionsB, 'right'));

        const composedAction1 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'left'));
        const composedAction2 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'right'));

        const resultC = TextX.apply(doc3, composedAction1);
        const resultD = TextX.apply(doc4, composedAction2);

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);
    });

    it('should pass test when any is empty', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [
                        {
                            st: 0,
                            ed: 6,
                            ts: {
                                it: BooleanNumber.TRUE,
                            },
                        },
                    ],
                    customRanges: [],
                },
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [
                        {
                            st: 0,
                            ed: 6,
                            ts: {
                                bl: BooleanNumber.FALSE,
                            },
                        },
                    ],
                    customRanges: [],
                },
            },
        ];

        const expectedTransformedActionFalse: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [
                        {
                            st: 0,
                            ed: 6,
                            ts: {
                                bl: BooleanNumber.FALSE,
                            },
                        },
                    ],
                    customRanges: [],
                },
            },
        ];

        const expectedTransformedActionTrue: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [
                        {
                            st: 0,
                            ed: 6,
                            ts: {
                                bl: BooleanNumber.FALSE,
                            },
                        },
                    ],
                    customRanges: [],
                },
            },
        ];

        expect(TextX.transform(actionsB, actionsA, 'left')).toEqual(expectedTransformedActionTrue);
        expect(TextX.transform(actionsB, actionsA, 'right')).toEqual(expectedTransformedActionFalse);

        const doc1 = getDefaultDocWithCustomRange();
        const doc2 = getDefaultDocWithCustomRange();
        const doc3 = getDefaultDocWithCustomRange();
        const doc4 = getDefaultDocWithCustomRange();

        const resultA = TextX.apply(TextX.apply(doc1, actionsA), TextX.transform(actionsB, actionsA, 'left'));
        const resultB = TextX.apply(TextX.apply(doc2, actionsB), TextX.transform(actionsA, actionsB, 'right'));

        const composedAction1 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'left'));
        const composedAction2 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'right'));

        const resultC = TextX.apply(doc3, composedAction1);
        const resultD = TextX.apply(doc4, composedAction2);

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);
    });
});
