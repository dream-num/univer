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

import type { IDocumentStatistics, IDocumentStatisticsOptions } from './document-data-model';
import { LOCALE_META } from '../../types/enum/locale-type';
import { DataStreamTreeTokenType } from './types';

const CONTROL_TOKENS = new Set<string>([
    DataStreamTreeTokenType.PARAGRAPH,
    DataStreamTreeTokenType.SECTION_BREAK,
    DataStreamTreeTokenType.TABLE_START,
    DataStreamTreeTokenType.TABLE_ROW_START,
    DataStreamTreeTokenType.TABLE_CELL_START,
    DataStreamTreeTokenType.TABLE_CELL_END,
    DataStreamTreeTokenType.TABLE_ROW_END,
    DataStreamTreeTokenType.TABLE_END,
    DataStreamTreeTokenType.COLUMN_GROUP_START,
    DataStreamTreeTokenType.COLUMN_START,
    DataStreamTreeTokenType.COLUMN_END,
    DataStreamTreeTokenType.COLUMN_GROUP_END,
    DataStreamTreeTokenType.BLOCK_START,
    DataStreamTreeTokenType.BLOCK_END,
    DataStreamTreeTokenType.COLUMN_BREAK,
    DataStreamTreeTokenType.PAGE_BREAK,
    DataStreamTreeTokenType.DOCS_END,
    DataStreamTreeTokenType.CUSTOM_BLOCK,
]);

const EAST_ASIAN_CHARACTER = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Bopomofo}\u3000-\u303F\uFF00-\uFFEF]/u;
const KOREAN_CHARACTER = /\p{Script=Hangul}/u;
const YIELD_INTERVAL = 20_000;

function emptyStatistics(): IDocumentStatistics {
    return {
        words: 0,
        charactersWithoutSpaces: 0,
        charactersWithSpaces: 0,
        paragraphs: 0,
        nonAsianWords: 0,
        asianCharactersAndKoreanWords: 0,
    };
}

function throwIfAborted(signal?: AbortSignal): void {
    if (signal?.aborted) {
        throw new Error('Document statistics calculation aborted');
    }
}

function yieldExecution(signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);

    return new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
}

function getRangeFragments(dataStream: string, ranges: IDocumentStatisticsOptions['ranges']): string[] {
    if (!ranges?.length) {
        return [dataStream];
    }

    const normalizedRanges = ranges
        .filter((range) => !range.collapsed)
        .map((range) => ({
            startOffset: Math.max(0, Math.min(range.startOffset, range.endOffset)),
            endOffset: Math.min(dataStream.length, Math.max(range.startOffset, range.endOffset)),
        }))
        .filter((range) => range.startOffset < range.endOffset)
        .sort((a, b) => a.startOffset - b.startOffset || a.endOffset - b.endOffset);

    const mergedRanges: Array<{ startOffset: number; endOffset: number }> = [];
    for (const range of normalizedRanges) {
        const previous = mergedRanges.at(-1);
        if (previous && range.startOffset <= previous.endOffset) {
            previous.endOffset = Math.max(previous.endOffset, range.endOffset);
        } else {
            mergedRanges.push({ ...range });
        }
    }

    return mergedRanges.map((range) => dataStream.slice(range.startOffset, range.endOffset));
}

function isControlToken(segment: string): boolean {
    return Array.from(segment).every((character) => CONTROL_TOKENS.has(character));
}

export async function calculateDocumentStatistics(
    dataStream: string,
    options: IDocumentStatisticsOptions
): Promise<IDocumentStatistics> {
    const { locale, ranges, signal } = options;
    const localeTag = locale == null ? undefined : LOCALE_META[locale].tag;
    const graphemeSegmenter = new Intl.Segmenter(localeTag, { granularity: 'grapheme' });
    const wordSegmenter = new Intl.Segmenter(localeTag, { granularity: 'word' });
    const statistics = emptyStatistics();

    await yieldExecution(signal);
    throwIfAborted(signal);

    for (const fragment of getRangeFragments(dataStream, ranges)) {
        let processedCharacters = 0;
        let paragraphHasContent = false;

        for (const { segment } of graphemeSegmenter.segment(fragment)) {
            throwIfAborted(signal);

            if (segment.includes(DataStreamTreeTokenType.PARAGRAPH)) {
                if (paragraphHasContent) {
                    statistics.paragraphs += 1;
                }
                paragraphHasContent = false;
            }

            if (!isControlToken(segment)) {
                statistics.charactersWithSpaces += 1;
                if (!/^\s+$/u.test(segment)) {
                    statistics.charactersWithoutSpaces += 1;
                    paragraphHasContent = true;
                }

                if (EAST_ASIAN_CHARACTER.test(segment)) {
                    statistics.asianCharactersAndKoreanWords += 1;
                }
            }

            processedCharacters += segment.length;
            if (processedCharacters >= YIELD_INTERVAL) {
                processedCharacters = 0;
                await yieldExecution(signal);
            }
        }

        let processedWordCharacters = 0;
        for (const word of wordSegmenter.segment(fragment)) {
            throwIfAborted(signal);
            if (word.isWordLike && !EAST_ASIAN_CHARACTER.test(word.segment)) {
                if (KOREAN_CHARACTER.test(word.segment)) {
                    statistics.asianCharactersAndKoreanWords += 1;
                } else {
                    statistics.nonAsianWords += 1;
                }
            }

            processedWordCharacters += word.segment.length;
            if (processedWordCharacters >= YIELD_INTERVAL) {
                processedWordCharacters = 0;
                await yieldExecution(signal);
            }
        }
    }

    throwIfAborted(signal);
    statistics.words = statistics.nonAsianWords + statistics.asianCharactersAndKoreanWords;
    return statistics;
}
