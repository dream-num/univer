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
import { getTextRunAtPosition } from '../paragraph';

describe('getTextRunAtPosition', () => {
    it('uses the concrete default text color without overriding inherited or cached colors', () => {
        const defaultStyle = { cl: { rgb: '#F7F9FC' }, ff: 'Arial', fs: 11 };

        expect(getTextRunAtPosition({ dataStream: '\r\n' }, 0, defaultStyle, null).ts).toEqual({
            cl: { rgb: '#F7F9FC' },
        });
        expect(getTextRunAtPosition({
            dataStream: 'A\r\n',
            textRuns: [{ st: 0, ed: 1, ts: { cl: { rgb: '#000000' } } }],
        }, 1, defaultStyle, null).ts).toEqual({
            cl: { rgb: '#000000' },
        });
        expect(getTextRunAtPosition({ dataStream: '\r\n' }, 0, defaultStyle, { cl: { rgb: '#FF0000' } }).ts).toEqual({
            cl: { rgb: '#FF0000' },
        });
        expect(getTextRunAtPosition({ dataStream: '\r\n' }, 0, defaultStyle, null, true).ts).toEqual({
            cl: { rgb: '#F7F9FC' },
        });
        expect(getTextRunAtPosition({
            dataStream: 'A\r\n',
            textRuns: [{ st: 0, ed: 1, ts: { cl: { rgb: '#000000' } } }],
        }, 1, defaultStyle, null, true).ts).toEqual({
            cl: { rgb: '#000000' },
        });
    });
});
