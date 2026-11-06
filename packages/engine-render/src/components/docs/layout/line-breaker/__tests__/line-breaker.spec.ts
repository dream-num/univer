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

import { BooleanNumber } from '@univerjs/core';
import fs from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { BreakPointType } from '../break';
import { eastAsianQuoteLineBreakExtension } from '../extensions/east-asian-quote-linebreak-extension';
import { tabLineBreakExtension } from '../extensions/tab-linebreak-extension';
import { DocumentLineBreaker, LineBreaker } from '../line-breaker';

it.each(['NFC', 'NFD'] as const)('keeps Korean words intact while preserving mandatory breaks (%s)', (normalization) => {
    const words = ['오늘 ', '회의에서 ', '다음 ', '분기 ', '마케팅 ', '전략을 ', '논의했습니다\r\n', '다음 ', '회의'];
    const content = words.join('').normalize(normalization);
    const breaker = new DocumentLineBreaker(content, BooleanNumber.FALSE);
    const parts: string[] = [];
    let start = 0;
    for (let point = breaker.nextBreakPoint(); point; point = breaker.nextBreakPoint()) {
        parts.push(content.slice(start, point.position));
        start = point.position;
    }
    expect(parts).toEqual(words.map((word) => word.normalize(normalization)));
});

it('keeps nonbreaking spaces inside Korean words', () => {
    const content = '오늘\u00A0회의';
    const breaker = new DocumentLineBreaker(content, BooleanNumber.FALSE);
    expect(breaker.nextBreakPoint()?.position).toBe(content.length);
    expect(breaker.nextBreakPoint()).toBeNull();
});

it('passes supported Unicode line break tests', () => {
    // these tests are weird, possibly incorrect or just tailored differently. we skip them.
    const skip = [
        125,
        127,
        815,
        1161,
        1163,
        1165,
        1167,
        1331,
        2189,
        2191,
        2873,
        2875,
        3567,
        3739,
        4081,
        4083,
        4425,
        4427,
        4473,
        4475,
        4597,
        4599,
        4645,
        4647,
        4943,
        5109,
        5111,
        5459,
        6149,
        6151,
        6153,
        6155,
        6489,
        6491,
        6663,
        6833,
        6835,
        7005,
        7007,
        7177,
        7179,
        7477,
        7486,
        7491,
        7576,
        7577,
        7578,
        7579,
        7580,
        7581,
        7583,
        7584,
        7585,
        7586,
        7587,
        7604,
        7610,
        7611,
        7681,
    ];

    const data = fs.readFileSync(resolve(__dirname, 'LineBreakTest.txt'), 'utf8');
    const lines = data.split('\n');

    return lines.forEach((line, i) => {
        const rowNumber = i + 1;
        if (!line || line.startsWith('#') || skip.includes(rowNumber)) {
            return;
        }

        const [cols] = line.split('#');
        const codePoints = cols
            .split(/\s*[×÷]\s*/)
            .slice(1, -1)
            .map((c) => Number.parseInt(c, 16));
        const str = String.fromCodePoint(...codePoints);

        const breaker = new LineBreaker(str);
        const breaks: string[] = [];
        let last = 0;
        for (let bk = breaker.nextBreakPoint(); bk; bk = breaker.nextBreakPoint()) {
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

        expect(breaks).toStrictEqual(expected);
    });
});

it('preserves Unicode break opportunities outside Hangul when word splitting is disabled', () => {
    const lines = fs.readFileSync(resolve(__dirname, 'LineBreakTest.txt'), 'utf8').split('\n');
    for (const line of lines) {
        if (!line || line.startsWith('#')) {
            continue;
        }
        const content = String.fromCodePoint(...line.split('#')[0].split(/\s*[×÷]\s*/)
            .slice(1, -1)
            .map((code) => Number.parseInt(code, 16)));
        if (/\p{Script=Hangul}/u.test(content)) {
            continue;
        }
        const positions = (wordWrap?: BooleanNumber) => {
            const breaker = wordWrap == null ? new LineBreaker(content) : new DocumentLineBreaker(content, wordWrap);
            const result: Array<{ position: number; type: BreakPointType }> = [];
            for (let point = breaker.nextBreakPoint(); point; point = breaker.nextBreakPoint()) {
                result.push({ position: point.position, type: point.type });
            }
            return result;
        };
        expect(positions(BooleanNumber.FALSE), line).toEqual(positions());
    }
});

describe('line break extensions tests', () => {
    it('should allow an East Asian line to break before a smart opening quote', () => {
        const data = '力” 、“年度';
        const breaker = new LineBreaker(data);
        eastAsianQuoteLineBreakExtension(breaker);
        const breaks: string[] = [];
        let last = 0;

        for (let bk = breaker.nextBreakPoint(); bk; bk = breaker.nextBreakPoint()) {
            breaks.push(data.slice(last, bk.position));
            last = bk.position;
        }

        expect(breaks).toStrictEqual(['力” 、', '“年', '度']);
    });

    it('should break before tab in Chinese', () => {
        const data = '中\t国';
        const breaker = new LineBreaker(data);
        tabLineBreakExtension(breaker);
        const breaks: string[] = [];
        let last = 0;

        for (let bk = breaker.nextBreakPoint(); bk; bk = breaker.nextBreakPoint()) {
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

        for (let bk = breaker.nextBreakPoint(); bk; bk = breaker.nextBreakPoint()) {
            breaks.push(data.slice(last, bk.position));
            last = bk.position;
        }

        expect(breaks).toStrictEqual(['hello', '\t', 'world']);
    });
});
