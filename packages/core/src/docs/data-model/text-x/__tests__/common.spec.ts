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

import type { ITextRun } from '../../../../types/interfaces/i-document-data';

import { describe, expect, it } from 'vitest';
import { BooleanNumber } from '../../../../types/enum/text-style';
import { normalizeTextRuns } from '../apply-utils/common';

describe('common utils test cases', () => {
    describe('normalizeTextRuns', () => {
        it('should normalize text runs', () => {
            const textRuns: ITextRun[] = [
                {
                    st: 0,
                    ed: 0,
                    ts: {
                        bl: BooleanNumber.FALSE,
                    },
                },
                {
                    st: 0,
                    ed: 15,
                    sId: undefined,
                    ts: {},
                },
                {
                    st: 15,
                    ed: 30,
                    ts: {
                        bl: BooleanNumber.FALSE,
                        it: BooleanNumber.TRUE,
                    },
                },
                {
                    st: 30,
                    ed: 35,
                    ts: {
                        bl: BooleanNumber.FALSE,
                        it: BooleanNumber.TRUE,
                    },
                },
            ];

            const expectedTextRuns: ITextRun[] = [
                {
                    st: 15,
                    ed: 35,
                    ts: {
                        bl: BooleanNumber.FALSE,
                        it: BooleanNumber.TRUE,
                    },
                },
            ];

            expect(normalizeTextRuns(textRuns)).toEqual(expectedTextRuns);
        });
    });
});
