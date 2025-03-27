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
import { PresetListType } from '../../preset-list-type';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';

function getDefaultDocWithParagraph() {
    const doc: IDocumentBody = {
        dataStream: '\r\n',
        paragraphs: [
            {
                startIndex: 0,
            },
        ],
    };

    return doc;
}

// Test Retain + Retain with different coverType in transform paragraph.
describe('transform paragraph in body', () => {
    it('should pass test when REPLACE + REPLACE', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            lineSpacing: 1,
                        },
                        bullet: {
                            listType: PresetListType.BULLET_LIST,
                            listId: 'testBullet',
                            nestingLevel: 0,
                            textStyle: {
                                fs: 15,
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
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            lineSpacing: 1,
                            spaceBelow: {
                                v: 20,
                            },
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
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            lineSpacing: 1,
                        },
                        bullet: {
                            listType: PresetListType.BULLET_LIST,
                            listId: 'testBullet',
                            nestingLevel: 0,
                            textStyle: {
                                fs: 15,
                            },
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
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            lineSpacing: 1,
                            spaceBelow: {
                                v: 20,
                            },
                        },
                    }],
                },
            },
        ];

        const doc1 = getDefaultDocWithParagraph();
        const doc2 = getDefaultDocWithParagraph();
        const doc3 = getDefaultDocWithParagraph();
        const doc4 = getDefaultDocWithParagraph();

        const resultA = TextX.apply(TextX.apply(doc1, actionsA), TextX.transform(actionsB, actionsA, 'left'));
        const resultB = TextX.apply(TextX.apply(doc2, actionsB), TextX.transform(actionsA, actionsB, 'right'));

        const composedAction1 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'left'));
        const composedAction2 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'right'));

        const resultC = TextX.apply(doc3, composedAction1);
        const resultD = TextX.apply(doc4, composedAction2);

        expect(TextX.transform(actionsB, actionsA, 'left')).toEqual(expectedTransformedActionTrue);
        expect(TextX.transform(actionsB, actionsA, 'right')).toEqual(expectedTransformedActionFalse);

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
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            lineSpacing: 2,
                        },
                        bullet: {
                            listType: PresetListType.BULLET_LIST,
                            listId: 'testBullet',
                            nestingLevel: 0,
                            textStyle: {
                                fs: 15,
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
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            lineSpacing: 1,
                            spaceBelow: {
                                v: 20,
                            },
                        },
                        bullet: {
                            listType: PresetListType.BULLET_LIST,
                            listId: 'testBullet',
                            nestingLevel: 0,
                            textStyle: {
                                fs: 15,
                            },
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
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            lineSpacing: 1,
                            spaceBelow: {
                                v: 20,
                            },
                        },
                        bullet: {
                            listType: PresetListType.BULLET_LIST,
                            listId: 'testBullet',
                            nestingLevel: 0,
                            textStyle: {
                                fs: 15,
                            },
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
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            lineSpacing: 2,
                            spaceBelow: {
                                v: 20,
                            },
                        },
                        bullet: {
                            listType: PresetListType.BULLET_LIST,
                            listId: 'testBullet',
                            nestingLevel: 0,
                            textStyle: {
                                fs: 15,
                            },
                        },
                    }],
                },
            },
        ];

        expect(TextX.transform(actionsB, actionsA, 'left')).toEqual(expectedTransformedActionTrue);
        expect(TextX.transform(actionsB, actionsA, 'right')).toEqual(expectedTransformedActionFalse);

        const doc1 = getDefaultDocWithParagraph();
        const doc2 = getDefaultDocWithParagraph();
        const doc3 = getDefaultDocWithParagraph();
        const doc4 = getDefaultDocWithParagraph();

        const resultA = TextX.apply(TextX.apply(doc1, actionsA), TextX.transform(actionsB, actionsA, 'right'));
        const resultB = TextX.apply(TextX.apply(doc2, actionsB), TextX.transform(actionsA, actionsB, 'left'));

        const composedAction1 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'right'));
        const composedAction2 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'left'));

        const resultC = TextX.apply(doc3, composedAction1);
        const resultD = TextX.apply(doc4, composedAction2);

        // console.log(JSON.stringify(resultA, null, 2));
        // console.log(JSON.stringify(resultB, null, 2));

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);

        const doc5 = getDefaultDocWithParagraph();
        const doc6 = getDefaultDocWithParagraph();
        const doc7 = getDefaultDocWithParagraph();
        const doc8 = getDefaultDocWithParagraph();

        const resultE = TextX.apply(TextX.apply(doc5, actionsA), TextX.transform(actionsB, actionsA, 'left'));
        const resultF = TextX.apply(TextX.apply(doc6, actionsB), TextX.transform(actionsA, actionsB, 'right'));

        const composedAction3 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'left'));
        const composedAction4 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'right'));

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
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            lineSpacing: 2,
                        },
                        bullet: {
                            listType: PresetListType.BULLET_LIST,
                            listId: 'testBullet',
                            nestingLevel: 0,
                            textStyle: {
                                fs: 15,
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
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            lineSpacing: 1,
                            spaceBelow: {
                                v: 20,
                            },
                            spaceAbove: {
                                v: 30,
                            },
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
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            lineSpacing: 1,
                            spaceBelow: {
                                v: 20,
                            },
                            spaceAbove: {
                                v: 30,
                            },
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
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            spaceBelow: {
                                v: 20,
                            },
                            spaceAbove: {
                                v: 30,
                            },
                        },
                    }],
                },
            },
        ];

        expect(TextX.transform(actionsB, actionsA, 'left')).toEqual(expectedTransformedActionTrue);
        expect(TextX.transform(actionsB, actionsA, 'right')).toEqual(expectedTransformedActionFalse);

        const doc1 = getDefaultDocWithParagraph();
        const doc2 = getDefaultDocWithParagraph();
        const doc3 = getDefaultDocWithParagraph();
        const doc4 = getDefaultDocWithParagraph();

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
