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

import type { IDocumentBody } from '../../../../types/interfaces';
import type { TextXAction } from '../action-types';
import { describe, expect, it } from 'vitest';
import { UpdateDocsAttributeType } from '../../../../shared';
import { BooleanNumber, HorizontalAlign } from '../../../../types/enum';
import { CustomRangeType } from '../../../../types/interfaces';
import { PresetListType } from '../../preset-list-type';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';

function getDefaultDoc() {
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

function getDefaultDocWithLength2() {
    const doc: IDocumentBody = {
        dataStream: 'ww\r\n',
        textRuns: [
            {
                st: 0,
                ed: 2,
                ts: {
                    bl: BooleanNumber.TRUE,
                },
            },
        ],
    };

    return doc;
}

function getDefaultDocWithParagraph() {
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
        paragraphs: [
            {
                startIndex: 1,
            },
        ],
    };

    return doc;
}

function getDefaultDocWithCustomRange() {
    const doc: IDocumentBody = {
        dataStream: 'helloworld\r\n',
        textRuns: [],
        customRanges: [{
            startIndex: 0,
            endIndex: 4,
            rangeId: 'rangeId',
            rangeType: CustomRangeType.HYPERLINK,
            properties: {
                url: 'http://www.baidu.com',
            },
        }, {
            startIndex: 5,
            endIndex: 9,
            rangeId: 'rangeId',
            rangeType: CustomRangeType.HYPERLINK,
            properties: {
                url: 'http://www.yahoo.com',
            },
        }],
        paragraphs: [
            {
                startIndex: 10,
            },
        ],
    };

    return doc;
}

describe('apply method', () => {
    it('should get the same result when apply two actions by order OR composed first case 1', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.INSERT,
                len: 1,
                body: {
                    dataStream: 'h',
                },
            },
        ];
        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    textRuns: [
                        {
                            st: 0,
                            ed: 1,
                            ts: {
                                bl: BooleanNumber.FALSE,
                            },
                        },
                    ],
                },
            },
        ];

        const doc1 = getDefaultDoc();
        const doc2 = getDefaultDoc();
        const doc3 = getDefaultDoc();
        const doc4 = getDefaultDoc();

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

    // https://github.com/dream-num/univer-pro/issues/2943
    it('should get the same result when apply two actions by order OR composed first case 2', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
            {
                t: TextXActionType.INSERT,
                len: 1,
                body: {
                    dataStream: 'h',
                    textRuns: [
                        {
                            st: 0,
                            ed: 1,
                            ts: {
                                bl: BooleanNumber.TRUE,
                            },
                        },
                    ],
                },
            },
        ];
        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    textRuns: [
                        {
                            st: 0,
                            ed: 1,
                            ts: {
                                bl: BooleanNumber.FALSE,
                            },
                        },
                    ],
                },
            },
        ];

        const doc1 = getDefaultDoc();
        const doc2 = getDefaultDoc();
        const doc3 = getDefaultDoc();
        const doc4 = getDefaultDoc();

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

    it('should get the same result when apply two actions by order OR composed first case 3', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
            {
                t: TextXActionType.INSERT,
                len: 1,
                body: {
                    dataStream: 'h',
                    textRuns: [
                        {
                            st: 0,
                            ed: 1,
                            ts: {
                                bl: BooleanNumber.TRUE,
                            },
                        },
                    ],
                },
            },
        ];
        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 2,
                body: {
                    dataStream: '',
                    textRuns: [
                        {
                            st: 0,
                            ed: 2,
                            ts: {
                                bl: BooleanNumber.FALSE,
                            },
                        },
                    ],
                },
            },
        ];

        const doc1 = getDefaultDocWithLength2();
        const doc2 = getDefaultDocWithLength2();
        const doc3 = getDefaultDocWithLength2();
        const doc4 = getDefaultDocWithLength2();

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

    it('should get the same result when set paragraph align type at 2 clients', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
            {
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            horizontalAlign: HorizontalAlign.LEFT,
                        },
                    }],
                },
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
            {
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            horizontalAlign: HorizontalAlign.RIGHT,
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

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);
    });

    it('should get the same result when set paragraph align with REPLACE cover type at 2 clients', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            horizontalAlign: HorizontalAlign.LEFT,
                        },
                    }],
                },
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            horizontalAlign: HorizontalAlign.RIGHT,
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

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);
    });

    it('should get the same result when set different list style with REPLACE cover type at 2 clients', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    paragraphs: [{
                        startIndex: 0,
                        bullet: {
                            listId: 'J7FZTm',
                            listType: PresetListType.CHECK_LIST,
                            nestingLevel: 0,
                            textStyle: {
                                fs: 20,
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
            },
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    paragraphs: [{
                        startIndex: 0,
                        bullet: {
                            listId: 'uODEbf',
                            listType: PresetListType.BULLET_LIST,
                            nestingLevel: 0,
                            textStyle: {
                                fs: 20,
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

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);
    });

    it('should get the same result when set different style at 2 clients', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
            {
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 1,
                        ts: { fs: 9 },
                    }],
                },
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 2,
                body: {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: 2,
                        ts: {
                            cl: {
                                rgb: '#ee0000',
                            },
                        },
                    }],
                },
            },
        ];

        const doc1 = getDefaultDocWithLength2();
        const doc2 = getDefaultDocWithLength2();
        const doc3 = getDefaultDocWithLength2();
        const doc4 = getDefaultDocWithLength2();

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

    it('should get the same result when one is break line and the other is edit after the break point', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
            {
                t: TextXActionType.INSERT,
                len: 1,
                body: {
                    dataStream: '\r',
                    paragraphs: [{
                        startIndex: 0,
                        paragraphStyle: {
                            horizontalAlign: HorizontalAlign.LEFT,
                        },
                    }],
                },
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 2,
            },
            {
                t: TextXActionType.INSERT,
                len: 1,
                body: {
                    dataStream: 'X',
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

        const doc1 = getDefaultDocWithLength2();
        const doc2 = getDefaultDocWithLength2();
        const doc3 = getDefaultDocWithLength2();
        const doc4 = getDefaultDocWithLength2();

        const resultA = TextX.apply(TextX.apply(doc1, actionsA), TextX.transform(actionsB, actionsA, 'left'));
        const resultB = TextX.apply(TextX.apply(doc2, actionsB), TextX.transform(actionsA, actionsB, 'right'));

        const composedAction1 = TextX.compose(actionsA, TextX.transform(actionsB, actionsA, 'left'));
        const composedAction2 = TextX.compose(actionsB, TextX.transform(actionsA, actionsB, 'right'));

        const resultC = TextX.apply(doc3, composedAction1);
        const resultD = TextX.apply(doc4, composedAction2);

        // console.log(JSON.stringify(resultA, null, 2));
        // console.log(JSON.stringify(resultB, null, 2));

        // console.log('composedAction1', JSON.stringify(composedAction1, null, 2));
        // console.log('composedAction2', JSON.stringify(composedAction2, null, 2));

        // console.log(JSON.stringify(resultC, null, 2));

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);
    });

    it('should get the same result when one is delete actions and the other is insert actions', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.DELETE,
                len: 2,
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 2,
            },
            {
                t: TextXActionType.INSERT,
                len: 1,
                body: {
                    dataStream: '1',
                },
            },
            {
                t: TextXActionType.INSERT,
                len: 1,
                body: {
                    dataStream: '1',
                },
            },
        ];

        const doc1 = getDefaultDocWithLength2();
        const doc2 = getDefaultDocWithLength2();
        const doc3 = getDefaultDocWithLength2();
        const doc4 = getDefaultDocWithLength2();

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

    it('should get the same result when one is undo actions and the other is cancel link', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 5,
                body: {
                    dataStream: '',
                    customRanges: [],
                },
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 5,
            },
            {
                t: TextXActionType.RETAIN,
                len: 5,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    customDecorations: [],
                    customRanges: [],
                },
            },
        ];

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

        // console.log(JSON.stringify(resultA, null, 2));
        // console.log(JSON.stringify(resultB, null, 2));

        // console.log('composedAction1', JSON.stringify(composedAction1, null, 2));
        // console.log('composedAction2', JSON.stringify(composedAction2, null, 2));

        // console.log(JSON.stringify(resultC, null, 2));
        // console.log(JSON.stringify(resultD, null, 2));

        expect(resultA).toEqual(resultB);
        expect(resultC).toEqual(resultD);
        expect(resultA).toEqual(resultC);
        expect(composedAction1).toEqual(composedAction2);
    });
});
