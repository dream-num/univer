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
import type { TextXAction } from '../../action-types';
import { ActionType } from '../../action-types';
import { BooleanNumber } from '../../../../types/enum/text-style';
import { TextX } from '../text-x';

describe('compose test cases', () => {
    it('should return empty array when action A and action B are both empty', () => {
        expect(TextX.compose([], [])).toEqual([]);
    });

    it('test compose basic use', () => {
        const actions_a: TextXAction[] = [{
            t: ActionType.RETAIN,
            len: 5,
        }, {
            t: ActionType.DELETE,
            len: 2,
            line: 0,
        }];

        const actions_b: TextXAction[] = [{
            t: ActionType.DELETE,
            len: 8,
            line: 0,
        }];

        const expect_actions: TextXAction[] = [{
            t: ActionType.DELETE,
            len: 10,
            line: 0,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose delete + delete', () => {
        const actions_a: TextXAction[] = [{
            t: ActionType.DELETE,
            len: 2,
            line: 0,
        }];

        const actions_b: TextXAction[] = [{
            t: ActionType.DELETE,
            len: 8,
            line: 0,
        }];

        const expect_actions: TextXAction[] = [{
            t: ActionType.DELETE,
            len: 10,
            line: 0,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose delete + retain', () => {
        const actions_a: TextXAction[] = [{
            t: ActionType.DELETE,
            len: 2,
            line: 0,
        }];

        const actions_b: TextXAction[] = [{
            t: ActionType.RETAIN,
            len: 8,
        }];

        const expect_actions: TextXAction[] = [{
            t: ActionType.DELETE,
            len: 2,
            line: 0,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose delete + insert', () => {
        const actions_a: TextXAction[] = [{
            t: ActionType.DELETE,
            len: 2,
            line: 0,
        }];

        const actions_b: TextXAction[] = [{
            t: ActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
            line: 0,
        }];

        // Always put insert before delete.
        const expect_actions: TextXAction[] = [{
            t: ActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
            line: 0,
        }, {
            t: ActionType.DELETE,
            len: 2,
            line: 0,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose retain + retain', () => {
        const actions_a: TextXAction[] = [{
            t: ActionType.RETAIN,
            len: 2,
        }];

        const actions_b: TextXAction[] = [{
            t: ActionType.RETAIN,
            len: 8,
        }];

        const expect_actions: TextXAction[] = [];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose retain + insert', () => {
        const actions_a: TextXAction[] = [{
            t: ActionType.RETAIN,
            len: 2,
        }];

        const actions_b: TextXAction[] = [{
            t: ActionType.INSERT,
            len: 1,
            body: {
                dataStream: 'h',
            },
            line: 0,
        }];

        const expect_actions: TextXAction[] = [{
            t: ActionType.INSERT,
            len: 1,
            body: {
                dataStream: 'h',
            },
            line: 0,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose retain + delete', () => {
        const actions_a: TextXAction[] = [{
            t: ActionType.RETAIN,
            len: 2,
        }];

        const actions_b: TextXAction[] = [{
            t: ActionType.DELETE,
            len: 1,
            line: 0,
        }];

        const expect_actions: TextXAction[] = [{
            t: ActionType.DELETE,
            len: 1,
            line: 0,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose insert + retain', () => {
        const actions_a: TextXAction[] = [{
            t: ActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
            line: 0,
        }];

        const actions_b: TextXAction[] = [{
            t: ActionType.RETAIN,
            len: 1,
        }];

        const expect_actions: TextXAction[] = [{
            t: ActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
            line: 0,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose insert + insert', () => {
        const actions_a: TextXAction[] = [{
            t: ActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
            line: 0,
        }];

        const actions_b: TextXAction[] = [{
            t: ActionType.INSERT,
            body: {
                dataStream: 'b',
            },
            len: 1,
            line: 0,
        }];

        const expect_actions: TextXAction[] = [{
            t: ActionType.INSERT,
            body: {
                dataStream: 'bh',
            },
            len: 2,
            line: 0,
        }];

        const composed = TextX.compose(actions_a, actions_b);

        expect(composed).toEqual(expect_actions);
    });

    it('test compose insert + delete', () => {
        const actions_a: TextXAction[] = [{
            t: ActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
            line: 0,
        }];

        const actions_b: TextXAction[] = [{
            t: ActionType.DELETE,
            len: 1,
            line: 0,
        }];

        const expect_actions: TextXAction[] = [];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose retain + retain with style', () => {
        const actions_a: TextXAction[] = [{
            t: ActionType.RETAIN,
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
            len: 1,
        }];

        const actions_b: TextXAction[] = [{
            t: ActionType.RETAIN,
            body: {
                dataStream: '',
                textRuns: [{
                    st: 0,
                    ed: 1,
                    ts: {
                        it: BooleanNumber.TRUE,
                    },
                }],
            },
            len: 1,
        }];

        const expect_actions: TextXAction[] = [{
            t: ActionType.RETAIN,
            body: {
                dataStream: '',
                textRuns: [{
                    st: 0,
                    ed: 1,
                    ts: {
                        bl: BooleanNumber.TRUE,
                        it: BooleanNumber.TRUE,
                    },
                }],
            },
            len: 1,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose insert + retain with style', () => {
        const actions_a: TextXAction[] = [{
            t: ActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
            line: 0,
        }];

        const actions_b: TextXAction[] = [{
            t: ActionType.RETAIN,
            body: {
                dataStream: '',
                textRuns: [{
                    st: 0,
                    ed: 1,
                    ts: {
                        it: BooleanNumber.TRUE,
                    },
                }],
            },
            len: 1,
        }];

        const expect_actions: TextXAction[] = [{
            t: ActionType.INSERT,
            body: {
                dataStream: 'h',
                textRuns: [{
                    st: 0,
                    ed: 1,
                    ts: {
                        it: BooleanNumber.TRUE,
                    },
                }],
            },
            len: 1,
            line: 0,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });
});
