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
import { UpdateDocsAttributeType } from '../../../../shared/command-enum';
import { BooleanNumber } from '../../../../types/enum';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';

describe('test TextX static methods invert and makeInvertible', () => {
    it('test TextX static method invert', () => {
        const actions: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 5,
        }, {
            t: TextXActionType.INSERT,
            len: 5,
            body: {
                dataStream: 'hello',
            },
        }, {
            t: TextXActionType.DELETE,
            len: 5,
            body: {
                dataStream: 'world',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            },
        }, {
            t: TextXActionType.RETAIN,
            len: 2,
            body: {
                dataStream: '',
                textRuns: [
                    {
                        st: 0,
                        ed: 2,
                        ts: {
                            it: BooleanNumber.TRUE,
                        },
                    },
                ],
            },
            oldBody: {
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

        const invertedActions = TextX.invert(actions);
        const exceptActions = [{
            t: TextXActionType.RETAIN,
            len: 5,
        }, {
            t: TextXActionType.DELETE,
            len: 5,
            body: {
                dataStream: 'hello',
            },
        }, {
            t: TextXActionType.INSERT,
            len: 5,
            body: {
                dataStream: 'world',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            },
        }, {
            t: TextXActionType.RETAIN,
            len: 2,
            coverType: UpdateDocsAttributeType.REPLACE,
            oldBody: {
                dataStream: '',
                textRuns: [
                    {
                        st: 0,
                        ed: 2,
                        ts: {
                            it: BooleanNumber.TRUE,
                        },
                    },
                ],
            },
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

        expect(invertedActions).toEqual(exceptActions);
    });

    it('test TextX static method makeInvertible when `retain` action occur', () => {
        const docBody: IDocumentBody = {
            dataStream: 'hello\r\n',
            textRuns: [
                {
                    st: 0,
                    ed: 5,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                },
            ],
        };

        const textX = new TextX();

        textX.retain(3, {
            dataStream: '',
            textRuns: [{
                st: 0,
                ed: 3,
                ts: {
                    it: BooleanNumber.TRUE,
                },
            }],
        }, UpdateDocsAttributeType.COVER);

        TextX.makeInvertible(textX.serialize(), docBody);

        const expectedActions = [{
            t: TextXActionType.RETAIN,
            len: 3,
            body: {
                dataStream: '',
                textRuns: [{
                    st: 0,
                    ed: 3,
                    ts: {
                        it: BooleanNumber.TRUE,
                    },
                }],
            },
            oldBody: {
                dataStream: '',
                textRuns: [{
                    st: 0,
                    ed: 3,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                }],
                customRanges: [],
                customDecorations: [],
            },
            coverType: UpdateDocsAttributeType.COVER,
        }];

        expect(textX.serialize()).toEqual(expectedActions);
    });

    it('test TextX static method makeInvertible when `delete` action occur', () => {
        const docBody: IDocumentBody = {
            dataStream: 'hello\r\n',
            textRuns: [
                {
                    st: 0,
                    ed: 5,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                },
            ],
        };

        const textX = new TextX();
        textX.retain(3);
        textX.delete(2);

        TextX.makeInvertible(textX.serialize(), docBody);

        const expectedActions: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 3,
        }, {
            t: TextXActionType.DELETE,
            len: 2,
            body: {
                dataStream: 'lo',
                textRuns: [{
                    st: 0,
                    ed: 2,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                }],
            },
        }];

        expect(textX.serialize()).toEqual(expectedActions);
    });
});
