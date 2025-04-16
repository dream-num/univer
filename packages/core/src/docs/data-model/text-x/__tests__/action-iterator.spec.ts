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

import { describe, expect, it } from 'vitest';
import { BooleanNumber } from '../../../../types/enum/text-style';
import { ActionIterator } from '../action-iterator';
import { TextXActionType } from '../action-types';

describe('Test action iterator', () => {
    it('test action iterator basic use', () => {
        const iterator = new ActionIterator([{
            t: TextXActionType.RETAIN,
            len: 5,
        }, {
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'hello',
                textRuns: [{
                    st: 0,
                    ed: 5,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                }],
            },
            len: 5,
        }, {
            t: TextXActionType.DELETE,
            len: 5,
        }]);

        expect(iterator.hasNext()).toBe(true);

        expect(iterator.peekType()).toBe(TextXActionType.RETAIN);

        expect(iterator.peekLength()).toBe(5);

        expect(iterator.peek()).toEqual({
            t: TextXActionType.RETAIN,
            len: 5,
        });

        let action = iterator.next();

        expect(action).toEqual({
            t: TextXActionType.RETAIN,
            len: 5,
        });

        expect(iterator.peekType()).toBe(TextXActionType.INSERT);

        action = iterator.next(2);

        expect(action).toEqual({
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'he',
                textRuns: [{
                    st: 0,
                    ed: 2,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                }],
            },
            len: 2,
        });

        expect(iterator.peekType()).toBe(TextXActionType.INSERT);

        action = iterator.next(4);

        expect(action).toEqual({
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'llo',
                textRuns: [{
                    st: 0,
                    ed: 3,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                }],
            },
            len: 3,
        });

        expect(iterator.peekType()).toBe(TextXActionType.DELETE);

        action = iterator.next();

        expect(action).toEqual({
            t: TextXActionType.DELETE,
            len: 5,
        });

        expect(iterator.hasNext()).toBe(false);

        expect(iterator.peekType()).toBe(TextXActionType.RETAIN);

        expect(iterator.peekLength()).toBe(Number.POSITIVE_INFINITY);

        expect(iterator.peek()).toBe(undefined);

        expect(iterator.rest()).toEqual([]);

        action = iterator.next();

        expect(action).toEqual({
            t: TextXActionType.RETAIN,
            len: Number.POSITIVE_INFINITY,
        });
    });

    it('test action iterator rest', () => {
        const iterator = new ActionIterator([{
            t: TextXActionType.RETAIN,
            len: 5,
        }, {
            t: TextXActionType.DELETE,
            len: 5,
        }]);

        expect(iterator.rest()).toEqual([{
            t: TextXActionType.RETAIN,
            len: 5,
        }, {
            t: TextXActionType.DELETE,
            len: 5,
        }]);

        iterator.next(3);

        expect(iterator.rest()).toEqual([{
            t: TextXActionType.RETAIN,
            len: 2,
        }, {
            t: TextXActionType.DELETE,
            len: 5,
        }]);
    });
});
