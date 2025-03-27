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
import type { IRetainAction } from '../action-types';
import { describe, expect, it } from 'vitest';
import { BooleanNumber } from '../../../../types/enum/text-style';
import { PresetListType } from '../../preset-list-type';
import { TextXActionType } from '../action-types';
import { composeBody, getBodySlice, isUselessRetainAction } from '../utils';

describe('test text-x utils', () => {
    it('test getBodySlice fn', () => {
        const body: IDocumentBody = {
            dataStream: 'hello\nworld',
            textRuns: [
                {
                    st: 0,
                    ed: 5,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                },
                {
                    st: 6,
                    ed: 10,
                    ts: {
                        bl: BooleanNumber.FALSE,
                        it: BooleanNumber.TRUE,
                    },
                },
            ],
            paragraphs: [{
                startIndex: 5,
            }],
        };

        const sliceBody = getBodySlice(body, 3, 8, false);
        expect(sliceBody).toEqual({
            dataStream: 'lo\nwo',
            textRuns: [
                {
                    st: 0,
                    ed: 2,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                },
                {
                    st: 3,
                    ed: 5,
                    ts: {
                        bl: BooleanNumber.FALSE,
                        it: BooleanNumber.TRUE,
                    },
                },
            ],
            paragraphs: [{
                startIndex: 2,
            }],
        } as IDocumentBody);
    });

    it('test getBodySlice fn with a larger range', () => {
        const body: IDocumentBody = {
            dataStream: 'hello\nworld',
            textRuns: [
                {
                    st: 0,
                    ed: 3,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                },
                {
                    st: 3,
                    ed: 5,
                    ts: {
                        bl: BooleanNumber.FALSE,
                    },
                },
                {
                    st: 6,
                    ed: 10,
                    ts: {
                        bl: BooleanNumber.FALSE,
                        it: BooleanNumber.TRUE,
                    },
                },
            ],
            paragraphs: [{
                startIndex: 5,
            }],
        };

        const sliceBody = getBodySlice(body, 2, 8, false);
        expect(sliceBody).toEqual({
            dataStream: 'llo\nwo',
            textRuns: [
                {
                    st: 0,
                    ed: 1,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                },
                {
                    st: 1,
                    ed: 3,
                    ts: {
                        bl: BooleanNumber.FALSE,
                    },
                },
                {
                    st: 4,
                    ed: 6,
                    ts: {
                        bl: BooleanNumber.FALSE,
                        it: BooleanNumber.TRUE,
                    },
                },
            ],
            paragraphs: [{
                startIndex: 3,
            }],
        });
    });

    it('test composeBody fn with textRuns', () => {
        const thisBody: IDocumentBody = {
            dataStream: 'hello\nworld',
            textRuns: [
                {
                    st: 0,
                    ed: 5,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                },
                {
                    st: 6,
                    ed: 10,
                    ts: {
                        bl: BooleanNumber.FALSE,
                        it: BooleanNumber.TRUE,
                    },
                },
            ],
            paragraphs: [{
                startIndex: 5,
            }],
        };

        const otherBody: IDocumentBody = {
            dataStream: '',
            textRuns: [
                {
                    st: 0,
                    ed: 3,
                    ts: {
                        bl: BooleanNumber.FALSE,
                    },
                },
                {
                    st: 3,
                    ed: 5,
                    ts: {
                        it: BooleanNumber.TRUE,
                    },
                },
            ],
        };

        const composedBody = composeBody(thisBody, otherBody);

        expect(composedBody).toEqual({
            dataStream: 'hello\nworld',
            textRuns: [
                {
                    st: 0,
                    ed: 3,
                    ts: {
                        bl: BooleanNumber.FALSE,
                    },
                },
                {
                    st: 3,
                    ed: 5,
                    ts: {
                        bl: BooleanNumber.TRUE,
                        it: BooleanNumber.TRUE,
                    },
                },
                {
                    st: 6,
                    ed: 10,
                    ts: {
                        bl: BooleanNumber.FALSE,
                        it: BooleanNumber.TRUE,
                    },
                },
            ],
            paragraphs: [{
                startIndex: 5,
            }],
        });
    });

    it('test composeBody and throw error', () => {
        const thisBody: IDocumentBody = {
            dataStream: 'hello\nworld',
            textRuns: [],
        };
        const otherBody: IDocumentBody = {
            dataStream: 'error',
            textRuns: [],
        };

        expect(() => {
            composeBody(thisBody, otherBody);
        }).toThrowError();
    });

    it('test composeBody both with paragraphs', () => {
        const thisBody: IDocumentBody = {
            dataStream: 'hello\nworld',
            paragraphs: [{
                startIndex: 5,
            }],
        };

        const otherBody: IDocumentBody = {
            dataStream: '',
            paragraphs: [{
                startIndex: 5,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            }],
        };

        const composedBody = composeBody(thisBody, otherBody);

        expect(composedBody).toEqual({
            dataStream: 'hello\nworld',
            paragraphs: [{
                startIndex: 5,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            }],
        });
    });

    it('test composeBody both with paragraphs and one has bullet list', () => {
        const thisBody: IDocumentBody = {
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
        };

        const otherBody: IDocumentBody = {
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
        };

        const composedBody = composeBody(thisBody, otherBody);

        expect(composedBody).toEqual({
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
        });
    });

    it('test composeBody fn both width paragraphs and from retain', () => {
        const thisBody: IDocumentBody = {
            dataStream: '',
            paragraphs: [{
                startIndex: 2,
            }],
        };

        const otherBody: IDocumentBody = {
            dataStream: '',
            paragraphs: [{
                startIndex: 5,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            }],
        };

        const composedBody = composeBody(thisBody, otherBody);

        expect(composedBody).toEqual({
            dataStream: '',
            paragraphs: [{
                startIndex: 2,
            }, {
                startIndex: 5,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            }],
        });
    });

    it('test composeBody fn both width paragraphs and from retain 2', () => {
        const thisBody: IDocumentBody = {
            dataStream: '',
            paragraphs: [{
                startIndex: 8,
            }],
        };

        const otherBody: IDocumentBody = {
            dataStream: '',
            paragraphs: [{
                startIndex: 5,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            }],
        };

        const composedBody = composeBody(thisBody, otherBody);

        expect(composedBody).toEqual({
            dataStream: '',
            paragraphs: [{
                startIndex: 5,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            }, {
                startIndex: 8,
            }],
        });
    });

    it('test isUselessRetainAction()', () => {
        const action1: IRetainAction = {
            t: TextXActionType.RETAIN,
            len: 10,
        };

        const action2: IRetainAction = {
            t: TextXActionType.RETAIN,
            len: 10,
            body: {
                dataStream: '',
                textRuns: [],
            },
        };

        const action3: IRetainAction = {
            t: TextXActionType.RETAIN,
            len: 10,
            body: {
                dataStream: '',
                textRuns: [{
                    st: 0,
                    ed: 10,
                    ts: {
                        bl: BooleanNumber.FALSE,
                    },
                }],
            },
        };

        expect(isUselessRetainAction(action1)).toBe(true);
        expect(isUselessRetainAction(action2)).toBe(false);
        expect(isUselessRetainAction(action3)).toBe(false);
    });
});
