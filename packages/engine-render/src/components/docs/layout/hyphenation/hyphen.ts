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

import type { IDisposable, Nullable } from '@univerjs/core';
import type { IHyphenPattern, RawHyphenPattern } from './tools';
import { Lang } from './lang';
import { PATTERN_LOADERS } from './pattern-loaders.gen';
import { EnUs } from './patterns/en-us';
import { createCharIterator, createStringSlicer, parsePattern, snackToPascal } from './tools';

// NOTE: tsdown/rolldown doesn't rewrite dynamic import vars like
// `import(`./patterns/${lang}.ts`)`.
// Use a static import map so the bundler can create code-split chunks
// and rewrite them to the hashed output filenames.

export class Hyphen implements IDisposable {
    private _patterns: Map<Lang, IHyphenPattern> = new Map();
    private _hyphenCache: Map<Lang, Map<string, string[]>> = new Map();

    private static _instance: Nullable<Hyphen> = null;

    static getInstance(): Hyphen {
        if (this._instance == null) {
            this._instance = new Hyphen();
        }

        return this._instance;
    }

    constructor() {
        this._preloadPatterns();
        this.loadPattern(Lang.EnGb);
    }

    private _preloadPatterns() {
        // Preload EnUs pattern.
        this._patterns.set(Lang.EnUs, parsePattern(EnUs as RawHyphenPattern));

        this._loadExceptionsToCache(Lang.EnUs, EnUs as RawHyphenPattern);
    }

    private _loadExceptionsToCache(lang: Lang, pattern: RawHyphenPattern) {
        if (pattern.length < 3) {
            return;
        }

        const exceptions = pattern[2];

        for (const exception of exceptions) {
            const cacheKey = exception.replace(/-/g, '');
            const hyphens = exception.split('-');

            let cache = this._hyphenCache.get(lang);

            if (cache == null) {
                cache = new Map();
                this._hyphenCache.set(lang, cache);
            }

            cache.set(cacheKey, hyphens);
        }
    }

    async loadPattern(lang: Lang) {
        const loader = PATTERN_LOADERS[lang];

        if (!loader) {
            return;
        }

        const loaded = await loader();
        const exported = Array.isArray(loaded)
            ? loaded
            : (loaded as Record<string, unknown> | null)?.[snackToPascal(lang)];

        const pattern = exported as RawHyphenPattern | undefined;

        if (pattern == null) {
            return;
        }

        this._patterns.set(lang, parsePattern(pattern));
        this._loadExceptionsToCache(lang, pattern);
    }

    // Only used for text.
    fetchHyphenCache(lang: Lang) {
        return this._hyphenCache.get(lang);
    }

    hasPattern(lang: Lang) {
        return this._patterns.has(lang);
    }

    hyphenate(word: string, lang: Lang) {
        let cache = this._hyphenCache.get(lang);

        if (cache?.has(word)) {
            return cache.get(word);
        }

        if (!this._patterns.has(lang)) {
            throw new Error(`Language pattern not found for ${lang}, please load pattern before hyphenating`);
        }

        const { levelsTable, pattern } = this._patterns.get(lang)!;

        const levels = new Array(word.length + 1).fill(0);
        const loweredText = (`.${word.toLocaleLowerCase()}.`).split('');
        const [nextSlice, isFirstCharacter] = createStringSlicer(loweredText);
        let wordSlice;
        let letter;
        let treePtr;
        let nextPtr;
        let patternLevelsIndex;
        let patternLevels;
        let patternEntityIndex = -1;
        let charIterator;
        let nextLetter;
        let isLastLetter;

        // eslint-disable-next-line no-cond-assign
        while ((wordSlice = nextSlice()).length > 0) {
            patternEntityIndex++;
            if (isFirstCharacter()) {
                patternEntityIndex--;
            }

            treePtr = pattern;

            charIterator = createCharIterator(wordSlice);
            nextLetter = charIterator[0];
            isLastLetter = charIterator[1];

            // eslint-disable-next-line no-cond-assign
            while ((letter = nextLetter())) {
                if (treePtr[letter] === undefined) {
                    break;
                }

                nextPtr = treePtr[letter];
                treePtr = nextPtr[0];
                patternLevelsIndex = nextPtr[1];

                if (treePtr === undefined) {
                    treePtr = {};
                    patternLevelsIndex = nextPtr;
                }

                if (isLastLetter()) {
                    // ignore patterns for last letter
                    continue;
                }

                if (patternLevelsIndex === undefined) {
                    continue;
                }

                patternLevels = levelsTable[patternLevelsIndex];

                for (let k = 0; k < patternLevels.length; k++) {
                    levels[patternEntityIndex + k] = Math.max(
                        +patternLevels[k],
                        levels[patternEntityIndex + k]
                    );
                }
            }
        }

        levels[0] = levels[1] = levels[levels.length - 1] = levels[levels.length - 2] = 0;

        let hyphenatedText = '';

        for (let i = 0; i < levels.length; i++) {
            hyphenatedText += (levels[i] % 2 === 1 ? '-' : '') + word.charAt(i);
        }

        if (cache == null) {
            cache = new Map();
            this._hyphenCache.set(lang, cache);
        }

        const hyphenatedSlices = hyphenatedText.split('-');

        cache.set(word, hyphenatedSlices);

        return hyphenatedSlices;
    }

    dispose(): void {
        this._patterns.clear();
        this._hyphenCache.clear();
    }
}
