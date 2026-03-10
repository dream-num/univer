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
import { DataStreamTreeTokenType } from '../../../types';
import { fromPlainText, getPlainText, isEmptyDocument } from '../parse';

describe('parse build utils', () => {
    it('should strip non-flow tokens and detect empty documents', () => {
        const dataStream = `${DataStreamTreeTokenType.TABLE_START}Hello${DataStreamTreeTokenType.TABLE_END}\r\n`;

        expect(getPlainText(dataStream)).toBe('Hello');
        expect(isEmptyDocument(`${DataStreamTreeTokenType.TABLE_START}\r${DataStreamTreeTokenType.TABLE_END}`)).toBe(true);
        expect(isEmptyDocument('Hello\r\n')).toBe(false);
        expect(isEmptyDocument()).toBe(true);
    });

    it('should convert plain text into paragraphs and hyperlink ranges', () => {
        const body = fromPlainText('https://univer.ai\nSecond line');
        const singleCharBody = fromPlainText('A');

        expect(body).toMatchObject({
            dataStream: 'https://univer.ai\rSecond line',
            paragraphs: [{ startIndex: 17 }],
            customRanges: [
                {
                    startIndex: 0,
                    endIndex: 16,
                    rangeType: 0,
                    properties: {
                        url: 'https://univer.ai\nSecond line',
                    },
                },
            ],
        });
        expect(singleCharBody).toEqual({
            dataStream: 'A',
            paragraphs: [],
            customRanges: [],
        });
    });
});
