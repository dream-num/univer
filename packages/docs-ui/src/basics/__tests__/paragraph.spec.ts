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

import { DataStreamTreeTokenType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getTextRunAtInputPosition, getTextRunAtPosition } from '../paragraph';

describe('getTextRunAtPosition', () => {
    it.each(['i', ''])('inherits the first column paragraph style when inserting before %j', (text) => {
        const token = DataStreamTreeTokenType;
        const prefix = `${token.COLUMN_GROUP_START}${token.COLUMN_START}Heading\r${token.COLUMN_END}${token.COLUMN_START}`;
        const position = prefix.length;
        const body = {
            dataStream: `${prefix}${text}\r${token.COLUMN_END}${token.COLUMN_GROUP_END}\n`,
            textRuns: [
                { st: 2, ed: 10, ts: { ff: 'Heading', fs: 14 } },
                {
                    st: position,
                    ed: position + text.length + 1,
                    ts: { ff: 'Monospace', fs: 10 },
                },
            ],
        };

        expect(getTextRunAtInputPosition(body, position, { ff: 'Heading', fs: 14 }, null, false, true).ts)
            .toEqual({ ff: 'Monospace', fs: 10 });
        expect(getTextRunAtInputPosition(body, position, {}, { fs: 12 }, false, true).ts)
            .toEqual({ ff: 'Monospace', fs: 12 });
    });

    it('retains left-run inheritance inside a column at an ordinary style boundary', () => {
        const body = {
            dataStream: `${DataStreamTreeTokenType.COLUMN_START}AB\r`,
            textRuns: [
                { st: 1, ed: 2, ts: { ff: 'Left', fs: 10 } },
                { st: 2, ed: 3, ts: { ff: 'Right', fs: 14 } },
            ],
        };

        expect(getTextRunAtInputPosition(body, 2, {}, null).ts).toEqual({ ff: 'Left', fs: 10 });
    });

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

    it('inherits the following run at a non-empty paragraph start', () => {
        const body = {
            dataStream: 'A\rB\r\n',
            textRuns: [
                {
                    st: 0,
                    ed: 2,
                    ts: { ff: 'Previous', fs: 20 },
                },
                {
                    st: 2,
                    ed: 3,
                    ts: {
                        ff: 'Following',
                        fs: 8,
                    },
                },
            ],
        };

        expect(getTextRunAtPosition(body, 2, {}, null).ts).toEqual({
            ff: 'Previous',
            fs: 20,
        });
        expect(getTextRunAtInputPosition(body, 2, {}, null).ts).toEqual({
            ff: 'Previous',
            fs: 20,
        });
        expect(getTextRunAtInputPosition(body, 2, {}, null, false, true).ts).toEqual({
            ff: 'Following',
            fs: 8,
        });
    });
});
