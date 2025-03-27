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

/* eslint-disable antfu/consistent-list-newline */
import fs from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { tabLineBreakExtension } from '../extensions/tab-linebreak-extension';
import { LineBreaker } from '../line-breaker';

describe('unicode line break tests', () => {
    // these tests are weird, possibly incorrect or just tailored differently. we skip them.
    const skip = [
        125, 127, 815, 1161, 1163, 1165, 1167, 1331, 2189, 2191, 2873, 2875, 3567, 3739, 4081, 4083, 4425, 4427, 4473,
        4475, 4597, 4599, 4645, 4647, 4943, 5109, 5111, 5459, 6149, 6151, 6153, 6155, 6489, 6491, 6663, 6833, 6835,
        7005, 7007, 7177, 7179, 7477, 7486, 7491, 7576, 7577, 7578, 7579, 7580, 7581, 7583, 7584, 7585, 7586, 7587,
        7604, 7610, 7611, 7681,
    ];

    const data = fs.readFileSync(resolve(__dirname, 'LineBreakTest.txt'), 'utf8');
    const lines = data.split('\n');

    return lines.forEach((line, i) => {
        const rowNumber = i + 1;
        let bk;
        if (!line || line.startsWith('#')) {
            return;
        }

        const [cols, comment] = line.split('#');
        const codePoints = cols
            .split(/\s*[×÷]\s*/)
            .slice(1, -1)
            .map((c) => Number.parseInt(c, 16));
        const str = String.fromCodePoint(...codePoints);

        const breaker = new LineBreaker(str);
        const breaks: string[] = [];
        let last = 0;
        while ((bk = breaker.nextBreakPoint())) {
            breaks.push(str.slice(last, bk.position));
            last = bk.position;
        }

        const expected = cols
            .split(/\s*÷\s*/)
            .slice(0, -1)
            .map((c) => {
                let codes: string[] | number[] = c.split(/\s*×\s*/);
                if (codes[0] === '') {
                    codes.shift();
                }
                codes = codes.map((c) => Number.parseInt(c, 16));
                return String.fromCodePoint(...codes);
            });

        if (skip.includes(rowNumber)) {
            it.skip(cols, () => { /* empty */ });
            return;
        }

        expect(breaks).toStrictEqual(expected);
    });
});

describe('line break extensions tests', () => {
    it('should break before tab in Chinese', () => {
        const data = '中\t国';
        const breaker = new LineBreaker(data);
        tabLineBreakExtension(breaker);
        const breaks: string[] = [];
        let last = 0;
        let bk;

        while ((bk = breaker.nextBreakPoint())) {
            breaks.push(data.slice(last, bk.position));
            last = bk.position;
        }

        expect(breaks).toStrictEqual(['中', '\t', '国']);
    });

    it('should break before tab in English', () => {
        const data = 'hello\tworld';
        const breaker = new LineBreaker(data);
        tabLineBreakExtension(breaker);
        const breaks: string[] = [];
        let last = 0;
        let bk;

        while ((bk = breaker.nextBreakPoint())) {
            breaks.push(data.slice(last, bk.position));
            last = bk.position;
        }

        expect(breaks).toStrictEqual(['hello', '\t', 'world']);
    });
});
