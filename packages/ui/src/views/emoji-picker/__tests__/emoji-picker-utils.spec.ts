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
import {
    getDefaultRecentEmojis,
    parseStoredRecentEmojis,
    promoteRecentEmoji,
    searchEmojis,
} from '../emoji-picker-utils';
import { emojis } from '../emojis.generated';

describe('emoji picker utils', () => {
    it('falls back to frequent emojis when recents are empty or invalid', () => {
        expect(parseStoredRecentEmojis(null)).toEqual(getDefaultRecentEmojis());
        expect(parseStoredRecentEmojis('broken')).toEqual(getDefaultRecentEmojis());
    });

    it('accepts recent emojis already decoded by local storage service', () => {
        expect(parseStoredRecentEmojis([{ emoji: '💡', title: 'Light Bulb' }])).toEqual([{ emoji: '💡', title: 'Light Bulb' }]);
    });

    it('promotes the selected emoji to the front and removes duplicates', () => {
        const result = promoteRecentEmoji([
            { emoji: '😀', title: 'Grinning Face' },
            { emoji: '💡', title: 'Light Bulb' },
        ], { emoji: '💡', title: 'Light Bulb' });

        expect(result.map((item) => item.emoji)).toEqual(['💡', '😀']);
    });

    it('searches emoji title case-insensitively', () => {
        const result = searchEmojis('light bulb');

        expect(result.some((item) => item.emoji === '💡')).toBe(true);
    });

    it('searches localized emoji titles', () => {
        const result = searchEmojis('灯泡', { '💡': '灯泡 电灯泡 主意' });

        expect(result.some((item) => item.emoji === '💡')).toBe(true);
    });

    it('keeps generated locale search indexes aligned with generated emojis', async () => {
        const allEmojis = [...new Set(Object.values(emojis).flat().map((item) => item.emoji))];
        const { default: zhCNEmojiLocale } = await import('../../../locale/emoji-locale/zh-CN.generated');
        const { emojiSearchIndex } = zhCNEmojiLocale;

        expect(allEmojis.every((emoji) => typeof emojiSearchIndex[emoji] === 'string' && emojiSearchIndex[emoji].length > 0)).toBe(true);
    });
});
