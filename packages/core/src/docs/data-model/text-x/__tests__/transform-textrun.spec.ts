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

import type { IDocumentBody } from '../../../../types/interfaces/i-document-data';
import type { TextXAction } from '../action-types';
import { describe, expect, it } from 'vitest';
import { UpdateDocsAttributeType } from '../../../../shared';
import { BooleanNumber } from '../../../../types/enum';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';

function getDefaultDocWithTextRuns() {
    const doc: IDocumentBody = {
        dataStream: 'w\r\n',
        textRuns: [
            {
                st: 0,
                ed: 1,
                ts: {
                    bl: BooleanNumber.TRUE,
                },
            },
        ],
    };

    return doc;
}

// Test Retain + Retain with different coverType in transform textRun.
describe('transform textRun in body', () => {
    it('should pass test when REPLACE + REPLACE', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 1,
                        ts: {
                            it: BooleanNumber.TRUE,
                            fs: 10,
                        },
                    }],
                },
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 1,
                        ts: {
                            it: BooleanNumber.FALSE,
                            fs: 14,
                        },
                    }],
                },
            },
        ];

        const expectedTransformedActionFalse: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 1,
                        ts: {
                            it: BooleanNumber.TRUE,
                            fs: 10,
                        },
                    }],
                },
            },
        ];

        const expectedTransformedActionTrue: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 1,
                        ts: {
                            it: BooleanNumber.FALSE,
                            fs: 14,
                        },
                    }],
                },
            },
        ];

        expect(TextX.transform(actionsB, actionsA, 'left')).toEqual(expectedTransformedActionTrue);
        expect(TextX.transform(actionsB, actionsA, 'right')).toEqual(expectedTransformedActionFalse);

        const doc1 = getDefaultDocWithTextRuns();
        const doc2 = getDefaultDocWithTextRuns();
        const doc3 = getDefaultDocWithTextRuns();
        const doc4 = getDefaultDocWithTextRuns();

        const resultA = TextX.apply(TextX.apply(doc1, actionsA), TextX.transform(actionsB, actionsA, 'left'));
        const resultB = TextX.apply(TextX.apply(doc2, actionsB), TextX.transform(actionsA, actionsB, 'right'));

        const composedAction1 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'left'));
        const composedAction2 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'right'));

        // console.log(JSON.stringify(TextX.transform(actionsB, actionsA, 'left'), null, 2));
        // console.log(JSON.stringify(composedAction1, null, 2));
        // console.log(JSON.stringify(composedAction2, null, 2));

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
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 1,
                        ts: {
                            it: BooleanNumber.TRUE,
                            fs: 10,
                        },
                    }],
                },
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 1,
                        ts: {
                            bl: BooleanNumber.TRUE,
                            it: BooleanNumber.FALSE,
                            fs: 14,
                        },
                    }],
                },
            },
        ];

        const expectedTransformedActionFalse: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 1,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    }],
                },
            },
        ];

        const expectedTransformedActionTrue: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 1,
                        ts: {
                            bl: BooleanNumber.TRUE,
                            it: BooleanNumber.FALSE,
                            fs: 14,
                        },
                    }],
                },
            },
        ];

        expect(TextX.transform(actionsB, actionsA, 'left')).toEqual(expectedTransformedActionTrue);
        expect(TextX.transform(actionsB, actionsA, 'right')).toEqual(expectedTransformedActionFalse);

        const doc1 = getDefaultDocWithTextRuns();
        const doc2 = getDefaultDocWithTextRuns();
        const doc3 = getDefaultDocWithTextRuns();
        const doc4 = getDefaultDocWithTextRuns();

        const resultA = TextX.apply(TextX.apply(doc1, actionsA), TextX.transform(actionsB, actionsA, 'left'));
        const resultB = TextX.apply(TextX.apply(doc2, actionsB), TextX.transform(actionsA, actionsB, 'right'));

        const composedAction1 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'left'));
        const composedAction2 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'right'));

        // console.log(JSON.stringify(TextX.transform(actionsA, actionsB, 'right'), null, 2));
        // console.log('resultA');
        // console.log(JSON.stringify(resultA, null, 2));
        // console.log('resultB');
        // console.log(JSON.stringify(resultB, null, 2));
        // console.log(JSON.stringify(composedAction1, null, 2));
        // console.log(JSON.stringify(composedAction2, null, 2));

        const resultC = TextX.apply(doc3, composedAction1);
        const resultD = TextX.apply(doc4, composedAction2);

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);

        const doc5 = getDefaultDocWithTextRuns();
        const doc6 = getDefaultDocWithTextRuns();
        const doc7 = getDefaultDocWithTextRuns();
        const doc8 = getDefaultDocWithTextRuns();

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
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 1,
                        ts: {
                            it: BooleanNumber.TRUE,
                            fs: 10,
                            ul: {
                                s: BooleanNumber.TRUE,
                            },
                        },
                    }],
                },
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 1,
                        ts: {
                            bl: BooleanNumber.TRUE,
                            it: BooleanNumber.FALSE,
                            fs: 14,
                        },
                    }],
                },
            },
        ];

        const expectedTransformedActionFalse: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 1,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    }],
                },
            },
        ];

        const expectedTransformedActionTrue: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 1,
                        ts: {
                            bl: BooleanNumber.TRUE,
                            it: BooleanNumber.FALSE,
                            fs: 14,
                        },
                    }],
                },
            },
        ];

        expect(TextX.transform(actionsB, actionsA, 'left')).toEqual(expectedTransformedActionTrue);
        expect(TextX.transform(actionsB, actionsA, 'right')).toEqual(expectedTransformedActionFalse);

        const doc1 = getDefaultDocWithTextRuns();
        const doc2 = getDefaultDocWithTextRuns();
        const doc3 = getDefaultDocWithTextRuns();
        const doc4 = getDefaultDocWithTextRuns();

        const resultA = TextX.apply(TextX.apply(doc1, actionsA), TextX.transform(actionsB, actionsA, 'left'));
        const resultB = TextX.apply(TextX.apply(doc2, actionsB), TextX.transform(actionsA, actionsB, 'right'));

        const composedAction1 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'left'));
        const composedAction2 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'right'));

        // console.log(JSON.stringify(TextX.transform(actionsB, actionsA, 'left'), null, 2));
        // console.log(JSON.stringify(TextX.transform(actionsA, actionsB, 'right'), null, 2));
        // console.log(JSON.stringify(composedAction1, null, 2));
        // console.log(JSON.stringify(composedAction2, null, 2));

        const resultC = TextX.apply(doc3, composedAction1);
        const resultD = TextX.apply(doc4, composedAction2);

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);
    });
});
