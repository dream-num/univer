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
import { CustomRangeType } from '../../../../types/interfaces';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';

describe('transform()', () => {
    it('insert + insert', () => {
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
                t: TextXActionType.INSERT,
                len: 1,
                body: {
                    dataStream: 'e',
                },
            },
        ];

        const expectedActionsWithPriorityTrue: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
            {
                t: TextXActionType.INSERT,
                len: 1,
                body: {
                    dataStream: 'e',
                },
            },
        ];

        const expectedActionsWithPriorityFalse: TextXAction[] = [
            {
                t: TextXActionType.INSERT,
                len: 1,
                body: {
                    dataStream: 'e',
                },
            },
        ];

        expect(TextX._transform(actionsA, actionsB, 'left')).toEqual(expectedActionsWithPriorityTrue);
        expect(TextX._transform(actionsA, actionsB, 'right')).toEqual(expectedActionsWithPriorityFalse);
    });

    it('insert + retain', () => {
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
                                bl: BooleanNumber.TRUE,
                            },
                        },
                    ],
                },
            },
        ];
        const expectedActionsWithPriorityTrue = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
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
                                bl: BooleanNumber.TRUE,
                            },
                        },
                    ],
                },
            },
        ];

        const expectedActionsWithPriorityFalse: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
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
                                bl: BooleanNumber.TRUE,
                            },
                        },
                    ],
                },
            },
        ];

        expect(TextX._transform(actionsA, actionsB, 'left')).toEqual(expectedActionsWithPriorityTrue);
        expect(TextX._transform(actionsA, actionsB, 'right')).toEqual(expectedActionsWithPriorityFalse);
    });

    it('insert + delete', () => {
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
                t: TextXActionType.DELETE,
                len: 1,
            },
        ];
        const expectedActionsWithPriorityTrue = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
            {
                t: TextXActionType.DELETE,
                len: 1,
            },
        ];

        expect(TextX._transform(actionsA, actionsB, 'left')).toEqual(expectedActionsWithPriorityTrue);
    });

    it('delete + insert', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.DELETE,
                len: 1,
            },
        ];
        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.INSERT,
                len: 1,
                body: {
                    dataStream: 'h',
                },
            },
        ];
        const expectedActionsWithPriorityTrue: TextXAction[] = [
            {
                t: TextXActionType.INSERT,
                len: 1,
                body: {
                    dataStream: 'h',
                },
            },
        ];

        expect(TextX._transform(actionsA, actionsB, 'left')).toEqual(expectedActionsWithPriorityTrue);
    });

    it('delete + retain', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.DELETE,
                len: 1,
            },
        ];
        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
        ];
        const expectedActionsWithPriorityTrue: TextXAction[] = [];

        expect(TextX._transform(actionsA, actionsB, 'left')).toEqual(expectedActionsWithPriorityTrue);
    });

    it('delete + delete', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.DELETE,
                len: 1,
            },
        ];
        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.DELETE,
                len: 1,
            },
        ];
        const expectedActionsWithPriorityTrue: TextXAction[] = [];

        expect(TextX._transform(actionsA, actionsB, 'left')).toEqual(expectedActionsWithPriorityTrue);
    });

    it('retain + insert', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
            },
        ];
        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.INSERT,
                body: {
                    dataStream: 'h',
                },
                len: 1,
            },
        ];
        const expectedActionsWithPriorityTrue: TextXAction[] = [
            {
                t: TextXActionType.INSERT,
                body: {
                    dataStream: 'h',
                },
                len: 1,
            },
        ];

        expect(TextX._transform(actionsA, actionsB, 'left')).toEqual(expectedActionsWithPriorityTrue);
    });

    it('retain + retain', () => {
        const actionsA1: TextXAction[] = [
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
                                cl: { rgb: 'blue' },
                            },
                        },
                    ],
                },
            },
        ];

        const actionsA2: TextXAction[] = [
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
                                cl: { rgb: 'blue' },
                            },
                        },
                    ],
                },
            },
        ];

        const actionsB1: TextXAction[] = [
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
                                cl: { rgb: 'red' },
                                bl: BooleanNumber.TRUE,
                            },
                        },
                    ],
                },
            },
        ];
        const actionsB2: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    customRanges: [],
                    textRuns: [
                        {
                            st: 0,
                            ed: 1,
                            ts: {
                                cl: { rgb: 'red' },
                                bl: BooleanNumber.TRUE,
                            },
                        },
                    ],
                },
            },
        ];
        const expectedActions1: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
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

        const expectedActions2: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [
                        {
                            st: 0,
                            ed: 1,
                            ts: {},
                        },
                    ],
                },
            },
        ];

        expect(TextX._transform(actionsA1, actionsB1, 'left')).toEqual(expectedActions1);
        expect(TextX._transform(actionsB2, actionsA2, 'left')).toEqual(expectedActions2);
    });

    it('retain + retain without priority', () => {
        const actionsA1: TextXAction[] = [
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
                                cl: { rgb: 'blue' },
                            },
                        },
                    ],
                },
            },
        ];

        const actionsA2: TextXAction[] = [
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
                                cl: { rgb: 'blue' },
                            },
                        },
                    ],
                },
            },
        ];

        const actionsB1: TextXAction[] = [
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
                                cl: { rgb: 'red' },
                                bl: BooleanNumber.TRUE,
                            },
                        },
                    ],
                },
            },
        ];
        const actionsB2: TextXAction[] = [
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
                                cl: { rgb: 'red' },
                                bl: BooleanNumber.TRUE,
                            },
                        },
                    ],
                },
            },
        ];
        const expectedActions1: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [
                        {
                            st: 0,
                            ed: 1,
                            ts: {
                                bl: BooleanNumber.TRUE,
                                cl: { rgb: 'red' },
                            },
                        },
                    ],
                },
            },
        ];

        // TODO: @jocs, fix this case after univer normalizeTextRuns are updated.
        const expectedActions2: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    textRuns: [
                        {
                            st: 0,
                            ed: 1,
                            ts: {
                                cl: { rgb: 'blue' },
                            },
                        },
                    ],
                },
            },
        ];

        expect(TextX._transform(actionsA1, actionsB1, 'right')).toEqual(expectedActions1);
        expect(TextX._transform(actionsB2, actionsA2, 'right')).toEqual(expectedActions2);
    });

    it('retain + delete', () => {
        const actionsA: TextXAction[] = [
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
                                cl: { rgb: 'blue' },
                            },
                        },
                    ],
                },
            },
        ];

        const actionsB: TextXAction[] = [
            {
                t: TextXActionType.DELETE,
                len: 1,
            },
        ];

        const expectedActions: TextXAction[] = [
            {
                t: TextXActionType.DELETE,
                len: 1,
            },
        ];

        expect(TextX._transform(actionsA, actionsB, 'right')).toEqual(expectedActions);
    });

    it('retain + retain with paragraph', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                body: {
                    dataStream: '',
                    paragraphs: [
                        {
                            startIndex: 0,
                            paragraphStyle: {
                                lineSpacing: 1,
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
                    paragraphs: [
                        {
                            startIndex: 0,
                            paragraphStyle: {
                                lineSpacing: 5,
                                spaceBelow: { v: 6 },
                            },
                        },
                    ],
                },
            },
        ];

        const expectedActionsWithPriorityTrue: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    paragraphs: [
                        {
                            startIndex: 0,
                            paragraphStyle: {
                                spaceBelow: { v: 6 },
                            },
                        },
                    ],
                },
            },
        ];

        const expectedActionsWithPriorityFalse: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.COVER,
                body: {
                    dataStream: '',
                    paragraphs: [
                        {
                            startIndex: 0,
                            paragraphStyle: {
                                lineSpacing: 5,
                                spaceBelow: { v: 6 },
                            },
                        },
                    ],
                },
            },
        ];

        expect(TextX._transform(actionsA, actionsB, 'right')).toEqual(expectedActionsWithPriorityFalse);
        expect(TextX._transform(actionsA, actionsB, 'left')).toEqual(expectedActionsWithPriorityTrue);
    });

    it('retain + retain with paragraph and REPLACE type', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    paragraphs: [
                        {
                            startIndex: 0,
                            paragraphStyle: {
                                lineSpacing: 1,
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
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    paragraphs: [
                        {
                            startIndex: 0,
                            paragraphStyle: {
                                lineSpacing: 5,
                                spaceBelow: { v: 6 },
                            },
                        },
                    ],
                },
            },
        ];

        const expectedActionsWithPriorityFalse: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    paragraphs: [
                        {
                            startIndex: 0,
                            paragraphStyle: {
                                lineSpacing: 1,
                            },
                        },
                    ],
                },
            },
        ];

        const expectedActionsWithPriorityTrue: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    paragraphs: [
                        {
                            startIndex: 0,
                            paragraphStyle: {
                                lineSpacing: 5,
                                spaceBelow: { v: 6 },
                            },
                        },
                    ],
                },
            },
        ];

        expect(TextX._transform(actionsA, actionsB, 'right')).toEqual(expectedActionsWithPriorityTrue);
        expect(TextX._transform(actionsA, actionsB, 'left')).toEqual(expectedActionsWithPriorityFalse);
    });

    it('retain + retain with custom range', () => {
        const actionsA: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    textRuns: [],
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 0,
                            rangeId: 'rangeId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.example.com',
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
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 0,
                            rangeId: 'rangeId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.baidu.com',
                            },
                        },
                    ],
                },
            },
        ];

        const expectedActionsWithPriorityTrue: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 0,
                            rangeId: 'rangeId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.baidu.com',
                            },
                        },
                    ],
                },
            },
        ];

        const expectedActionsWithPriorityFalse: TextXAction[] = [
            {
                t: TextXActionType.RETAIN,
                len: 1,
                coverType: UpdateDocsAttributeType.REPLACE,
                body: {
                    dataStream: '',
                    customRanges: [
                        {
                            startIndex: 0,
                            endIndex: 0,
                            rangeId: 'rangeId',
                            rangeType: CustomRangeType.HYPERLINK,
                            properties: {
                                url: 'https://www.example.com',
                            },
                        },
                    ],
                },
            },
        ];

        // console.log(JSON.stringify(TextX._transform(actionsA, actionsB, 'right'), null, 2));

        expect(TextX._transform(actionsA, actionsB, 'right')).toEqual(expectedActionsWithPriorityTrue);
        expect(TextX._transform(actionsA, actionsB, 'left')).toEqual(expectedActionsWithPriorityFalse);
    });

    it('insert after the retain attributes', () => {
        const actionA: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: 'e',
            },
        }];

        const actionB: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
            body: {
                dataStream: '',
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
        }];

        const transformedActionA: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: 'e',
            },
        }];

        const transformedActionB: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
            body: {
                dataStream: '',
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
        }];

        expect(TextX._transform(actionB, actionA, 'right')).toEqual(transformedActionA);
        expect(TextX._transform(actionA, actionB, 'left')).toEqual(transformedActionB);
    });

    it('insert before the retain attributes', () => {
        const actionA: TextXAction[] = [{
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: 'e',
            },
        }];

        const actionB: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
            body: {
                dataStream: '',
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
        }];

        const transformedActionA: TextXAction[] = [{
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: 'e',
            },
        }];

        const transformedActionB: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.RETAIN,
            len: 1,
            body: {
                dataStream: '',
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
        }];

        expect(TextX._transform(actionB, actionA, 'right')).toEqual(transformedActionA);
        expect(TextX._transform(actionA, actionB, 'left')).toEqual(transformedActionB);
    });

    it('insert between the retain attributes', () => {
        const actionA: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: 'e',
            },
        }];

        const actionB: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 2,
            body: {
                dataStream: '',
                textRuns: [
                    {
                        st: 0,
                        ed: 2,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            },
        }];

        const transformedActionA: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: 'e',
            },
        }];

        const transformedActionB: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
            body: {
                dataStream: '',
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
        }, {
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.RETAIN,
            len: 1,
            body: {
                dataStream: '',
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
        }];

        expect(TextX._transform(actionB, actionA, 'right')).toEqual(transformedActionA);
        expect(TextX._transform(actionA, actionB, 'left')).toEqual(transformedActionB);
    });
});
