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
import { isAllFormatInTextRuns } from '../range';
import type { IDocumentBody } from '../../types/interfaces';
import { BooleanNumber } from '../../types/enum';

describe('Test isAllFormatInTextRuns', () => {
    it('should return true when all content is bold', () => {
        const body: IDocumentBody = {
            dataStream: 'hello\r\n',
            textRuns: [{
                st: 0,
                ed: 5,
                ts: { bl: BooleanNumber.TRUE },
            }],
        };

        expect(isAllFormatInTextRuns('bl', body)).toBe(BooleanNumber.TRUE);
    });

    it('should return false when any content is not bold', () => {
        const body: IDocumentBody = {
            dataStream: 'hello\r\n',
            textRuns: [{
                st: 0,
                ed: 4,
                ts: { bl: BooleanNumber.TRUE },
            }],
        };

        expect(isAllFormatInTextRuns('bl', body)).toBe(BooleanNumber.FALSE);
    });
});
