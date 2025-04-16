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
import { CustomDecorationType, type IDocumentBody } from '../../../../types/interfaces/i-document-data';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';

function getDefaultDocWithCustomDecorations() {
    const doc: IDocumentBody = {
        dataStream: 'Google\r\n',
        customDecorations: [
            {
                startIndex: 0,
                endIndex: 5,
                id: 'commentId',
                type: CustomDecorationType.COMMENT,
            },
        ],
    };

    return doc;
}

// Test Retain + Retain with different coverType in transform textRun.
describe('transform custom range in body', () => {
    it('should pass test when normal transform', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 6,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    customDecorations: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            id: 'commentId',
                            type: CustomDecorationType.DELETED,
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
                    customDecorations: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            id: 'commentId',
                            type: CustomDecorationType.COMMENT,
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
                    customDecorations: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            id: 'commentId',
                            type: CustomDecorationType.DELETED,
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
                    customDecorations: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            id: 'commentId',
                            type: CustomDecorationType.DELETED,
                        },
                    ],
                },
            },
        ];

        expect(TextX.transform(actionsB, actionsA, 'left')).toEqual(expectedTransformedActionTrue);
        expect(TextX.transform(actionsB, actionsA, 'right')).toEqual(expectedTransformedActionFalse);

        const doc1 = getDefaultDocWithCustomDecorations();
        const doc2 = getDefaultDocWithCustomDecorations();
        const doc3 = getDefaultDocWithCustomDecorations();
        const doc4 = getDefaultDocWithCustomDecorations();

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
                    customDecorations: [],
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
                    customDecorations: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            id: 'commentId',
                            type: CustomDecorationType.DELETED,
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
                    textRuns: [
                        {
                            st: 0,
                            ed: 6,
                            ts: {
                                bl: BooleanNumber.FALSE,
                            },
                        },
                    ],
                    customDecorations: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            id: 'commentId',
                            type: CustomDecorationType.DELETED,
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
                    textRuns: [
                        {
                            st: 0,
                            ed: 6,
                            ts: {
                                bl: BooleanNumber.FALSE,
                            },
                        },
                    ],
                    customDecorations: [
                        {
                            startIndex: 0,
                            endIndex: 5,
                            id: 'commentId',
                            type: CustomDecorationType.DELETED,
                        },
                    ],
                },
            },
        ];

        expect(TextX.transform(actionsB, actionsA, 'left')).toEqual(expectedTransformedActionTrue);
        expect(TextX.transform(actionsB, actionsA, 'right')).toEqual(expectedTransformedActionFalse);
    });
});
