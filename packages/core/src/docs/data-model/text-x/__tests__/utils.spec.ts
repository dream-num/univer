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
import type { IDocumentBody } from '../../../../types/interfaces/i-document-data';
import { BooleanNumber } from '../../../../types/enum/text-style';
import { composeBody, getBodySlice } from '../utils';

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

        const sliceBody = getBodySlice(body, 3, 8);
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

    it('test composeBody fn both width paragraphs', () => {
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
                    spaceAbove: 10,
                    lineSpacing: 2,
                    spaceBelow: 0,
                },
            }],
        };

        const composedBody = composeBody(thisBody, otherBody);

        expect(composedBody).toEqual({
            dataStream: 'hello\nworld',
            paragraphs: [{
                startIndex: 5,
                paragraphStyle: {
                    spaceAbove: 10,
                    lineSpacing: 2,
                    spaceBelow: 0,
                },
            }],
        });
    });
});
