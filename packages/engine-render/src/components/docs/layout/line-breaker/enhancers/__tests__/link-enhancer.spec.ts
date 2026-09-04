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
import { BreakPointType } from '../../break';
import { LineBreaker } from '../../line-breaker';
import { LineBreakerLinkEnhancer } from '../link-enhancer';

function collectBreaks(content: string, allowLinkBreaks = true) {
    const enhancer = new LineBreakerLinkEnhancer(new LineBreaker(content), allowLinkBreaks);
    const points: Array<{ position: number; type: BreakPointType }> = [];
    while (true) {
        const bk = enhancer.nextBreakPoint();
        if (!bk) {
            break;
        }
        points.push({
            position: bk.position,
            type: bk.type,
        });
    }
    return points;
}

describe('link enhancer', () => {
    it.each([
        ['需以本公司', 'http://www.swsresearch.com', '网站刊载为准'],
        ['visit ', 'https://foo123bar.example/path-now', ' and continue'],
        ['', `www.${'a'.repeat(40)}.com`, ''],
    ])('keeps a link intact when character-level wrapping is disabled: %s%s%s', (prefix, link, suffix) => {
        const content = prefix + link + suffix;
        const breaks = collectBreaks(content, false);
        expect(breaks.some((point) => point.position > prefix.length && point.position < prefix.length + link.length)).toBe(false);
        expect(breaks[breaks.length - 1].position).toBe(content.length);
        expect(breaks.every((point, index) => index === 0 || point.position > breaks[index - 1].position)).toBe(true);
    });

    it('keeps normal text breaking behavior without links', () => {
        const breaks = collectBreaks('hello world');
        expect(breaks.length).toBeGreaterThan(0);
        expect(breaks.some((point) => point.type === BreakPointType.Link)).toBe(false);
        expect(breaks[breaks.length - 1].position).toBe('hello world'.length);
    });

    it('adds link break opportunities for url-like words', () => {
        const content = 'visit https://foo123bar.example/path-now and continue';
        const breaks = collectBreaks(content);
        const linkBreaks = breaks.filter((point) => point.type === BreakPointType.Link);

        expect(linkBreaks.length).toBeGreaterThan(0);
        expect(linkBreaks[0].position).toBeGreaterThanOrEqual(content.indexOf('https://'));
        expect(breaks[breaks.length - 1].position).toBe(content.length);
    });

    it('supports long links by splitting aggressively', () => {
        const content = `www.${'a'.repeat(40)}.com end`;
        const breaks = collectBreaks(content);
        const linkBreaks = breaks.filter((point) => point.type === BreakPointType.Link);

        expect(linkBreaks.length).toBeGreaterThan(5);
        expect(linkBreaks.every((point, idx) => idx === 0 || point.position > linkBreaks[idx - 1].position)).toBe(true);
    });
});
