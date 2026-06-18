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

import type { Nullable } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Hyphen } from '../hyphen';
import { Lang } from '../lang';
import { PATTERN_LOADERS } from '../pattern-loaders.gen';

describe('test hyphenation', () => {
    let hyphen: Nullable<Hyphen> = null;
    const PATTERN_LOADER_CHUNK_SIZE = 8;
    const patternLoaderChunks = Object.entries(PATTERN_LOADERS).reduce<Array<Array<[string, () => Promise<unknown>]>>>(
        (chunks, entry) => {
            const lastChunk = chunks[chunks.length - 1];
            if (!lastChunk || lastChunk.length >= PATTERN_LOADER_CHUNK_SIZE) {
                chunks.push([entry]);
            } else {
                lastChunk.push(entry);
            }

            return chunks;
        },
        []
    );

    beforeEach(() => {
        hyphen = new Hyphen();
    });

    afterEach(() => {
        hyphen && hyphen.dispose();
        hyphen = null;
    });

    describe('test preload lang', () => {
        it('should preload lang', () => {
            expect(hyphen?.hasPattern(Lang.EnUs)).toBe(true);
        });
    });

    describe('test async load pattern', () => {
        it('should load lang Af pattern async', async () => {
            await hyphen?.loadPattern(Lang.Af);

            expect(hyphen?.hasPattern(Lang.Af)).toBe(true);
        });

        it('registers generated hyphenation pattern loaders and loads representative modules', async () => {
            const supportedLangs = Object.values(Lang).filter((lang) => lang !== Lang.UNKNOWN);
            const entries = Object.entries(PATTERN_LOADERS);

            expect(entries).toHaveLength(supportedLangs.length);
            expect(supportedLangs.every((lang) => typeof PATTERN_LOADERS[lang] === 'function')).toBe(true);

            const patterns = await Promise.all([
                PATTERN_LOADERS[Lang.Af]?.(),
                PATTERN_LOADERS[Lang.EnGb]?.(),
                PATTERN_LOADERS[Lang.ZhLatnPinyin]?.(),
            ]);
            expect(patterns.every((pattern) => pattern != null)).toBe(true);
        });

        it.each(patternLoaderChunks.map((entries) => [entries]))('loads generated hyphenation pattern modules %#', async (entries) => {
            const patterns = await Promise.all(entries.map(([, loader]) => loader()));

            expect(patterns.every((pattern) => pattern != null)).toBe(true);
        });
    });

    describe('test basic use of hyphen', () => {
        it('should hyphenate word correctly', () => {
            const cache = hyphen?.fetchHyphenCache(Lang.EnUs);
            let wordCache = cache?.get('hyphenation');
            expect(wordCache).not.toBeDefined();

            const result = hyphen?.hyphenate('hyphenation', Lang.EnUs);
            expect(result).toEqual(['hy', 'phen', 'ation']);

            wordCache = cache?.get('hyphenation');
            expect(wordCache).toBeDefined();
            expect(cache?.get('hyphenation')).toEqual(['hy', 'phen', 'ation']);
        });
    });

    describe('test hyphen dispose', () => {
        it('should dispose hyphen object', () => {
            hyphen?.dispose();

            expect(hyphen?.hasPattern(Lang.EnUs)).toBe(false);
        });
    });
});
