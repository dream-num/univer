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
import { BooleanNumber } from '../../../../types/enum/text-style';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';

describe('compose test cases', () => {
    it('should return empty array when action A and action B are both empty', () => {
        expect(TextX.compose([], [])).toEqual([]);
    });

    it('should return second actions when action A is empty', () => {
        const actions_a: TextXAction[] = [];
        const actions_b: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 5,
        }, {
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'w',
                customRanges: [],
                customDecorations: [],
            },
            len: 5,
        }];
        const expect_actions = actions_b;

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('should return first actions when action B is empty', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 5,
        }, {
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'w',
                customRanges: [],
                customDecorations: [],
            },
            len: 5,
        }];
        const actions_b: TextXAction[] = [];
        const expect_actions = actions_a;

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose basic use', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 5,
        }, {
            t: TextXActionType.DELETE,
            len: 2,
        }];

        const actions_b: TextXAction[] = [{
            t: TextXActionType.DELETE,
            len: 8,
        }];

        const expect_actions: TextXAction[] = [{
            t: TextXActionType.DELETE,
            len: 10,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose delete + delete', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.DELETE,
            len: 2,
        }];

        const actions_b: TextXAction[] = [{
            t: TextXActionType.DELETE,
            len: 8,
        }];

        const expect_actions: TextXAction[] = [{
            t: TextXActionType.DELETE,
            len: 10,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose delete + retain', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.DELETE,
            len: 2,
        }];

        const actions_b: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 8,
        }];

        const expect_actions: TextXAction[] = [{
            t: TextXActionType.DELETE,
            len: 2,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose delete + insert', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.DELETE,
            len: 2,
        }];

        const actions_b: TextXAction[] = [{
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
        }];

        // Always put insert before delete.
        const expect_actions: TextXAction[] = [{
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
        }, {
            t: TextXActionType.DELETE,
            len: 2,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose retain + retain', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 2,
        }];

        const actions_b: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 8,
        }];

        const expect_actions: TextXAction[] = [];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose retain + insert', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 2,
        }];

        const actions_b: TextXAction[] = [{
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: 'h',
            },
        }];

        const expect_actions: TextXAction[] = [{
            t: TextXActionType.INSERT,
            len: 1,
            body: {
                dataStream: 'h',
            },
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose retain + delete', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 2,
        }];

        const actions_b: TextXAction[] = [{
            t: TextXActionType.DELETE,
            len: 1,
        }];

        const expect_actions: TextXAction[] = [{
            t: TextXActionType.DELETE,
            len: 1,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose insert + retain', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
        }];

        const actions_b: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }];

        const expect_actions: TextXAction[] = [{
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose insert + insert', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
        }];

        const actions_b: TextXAction[] = [{
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'b',
            },
            len: 1,
        }];

        const expect_actions: TextXAction[] = [{
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'bh',
            },
            len: 2,
        }];

        const composed = TextX.compose(actions_a, actions_b);

        // expect(composed).toEqual(expect_actions);
    });

    it('test compose insert + delete', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
        }];

        const actions_b: TextXAction[] = [{
            t: TextXActionType.DELETE,
            len: 1,
        }];

        const expect_actions: TextXAction[] = [];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose retain + retain with style', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.RETAIN,
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
            t: TextXActionType.RETAIN,
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
            t: TextXActionType.RETAIN,
            coverType: UpdateDocsAttributeType.COVER,
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
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
        }];

        const actions_b: TextXAction[] = [{
            t: TextXActionType.RETAIN,
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
            t: TextXActionType.INSERT,
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
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose retain with no body + retain with style', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }];

        const actions_b: TextXAction[] = [{
            t: TextXActionType.RETAIN,
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
            t: TextXActionType.RETAIN,
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

        expect(TextX.compose(actions_a, actions_b)).toEqual(expect_actions);
    });

    it('test compose r-i with r-i-d', () => {
        const actions_a: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'h',
            },
            len: 1,
        }];

        const actions_b: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'ab',
            },
            len: 2,
        }, {
            t: TextXActionType.DELETE,
            len: 1,
        }];

        const inner_actions: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'ab',
            },
            len: 2,
        }];

        expect(TextX.compose(actions_a, actions_b)).toEqual(inner_actions);

        const actions_c: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'c',
            },
            len: 1,
        }, {
            t: TextXActionType.DELETE,
            len: 2,
        }];

        const expect_actions: TextXAction[] = [{
            t: TextXActionType.RETAIN,
            len: 1,
        }, {
            t: TextXActionType.INSERT,
            body: {
                dataStream: 'c',
            },
            len: 1,
        }];

        expect(TextX.compose(inner_actions, actions_c)).toEqual(expect_actions);
    });
});
