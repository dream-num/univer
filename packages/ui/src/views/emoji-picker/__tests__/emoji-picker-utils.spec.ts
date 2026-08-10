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
    applyEmojiSkinTone,
    getDefaultRecentEmojis,
    getRandomEmoji,
    hasMixedSkinToneVariants,
    parseStoredEmojiSkinTone,
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

    it('groups skin tones into one generated emoji family', () => {
        const wavingHand = emojis.people.find((item) => item.emoji === '👋');

        expect(wavingHand?.skinToneVariants?.map((item) => item.emoji)).toEqual([
            '👋🏻',
            '👋🏼',
            '👋🏽',
            '👋🏾',
            '👋🏿',
        ]);
        expect(emojis.people.some((item) => item.emoji === '👋🏽')).toBe(false);
    });

    it('applies one preferred skin tone and falls back for unsupported emoji', () => {
        const wavingHand = emojis.people.find((item) => item.emoji === '👋')!;
        const lightBulb = emojis.objects.find((item) => item.emoji === '💡')!;

        expect(applyEmojiSkinTone(wavingHand, '🏽').emoji).toBe('👋🏽');
        expect(applyEmojiSkinTone(lightBulb, '🏽').emoji).toBe('💡');
        expect(applyEmojiSkinTone(wavingHand, '').emoji).toBe('👋');
    });

    it('deduplicates recent skin tone variants by family', () => {
        const result = promoteRecentEmoji([
            { emoji: '👋🏻', title: 'Waving Hand: Light Skin Tone' },
            { emoji: '💡', title: 'Light Bulb' },
        ], { emoji: '👋🏿', title: 'Waving Hand: Dark Skin Tone' });

        expect(result.map((item) => item.emoji)).toEqual(['👋🏿', '💡']);
    });

    it('keeps mixed skin tone combinations inside their family', () => {
        const handshake = emojis.people.find((item) => item.emoji === '🤝')!;

        expect(hasMixedSkinToneVariants(handshake)).toBe(true);
        expect(handshake.skinToneVariants).toHaveLength(25);
    });

    it('randomizes families before applying the preferred skin tone', () => {
        const families = Object.entries(emojis)
            .filter(([category]) => category !== 'frequent')
            .flatMap(([, items]) => items);
        const wavingHandIndex = families.findIndex((item) => item.emoji === '👋');
        const random = () => (wavingHandIndex + 0.1) / families.length;

        expect(getRandomEmoji(random, '🏽').emoji).toBe('👋🏽');
    });

    it('validates stored skin tone preferences', () => {
        expect(parseStoredEmojiSkinTone('🏾')).toBe('🏾');
        expect(parseStoredEmojiSkinTone('invalid')).toBe('');
        expect(parseStoredEmojiSkinTone(null)).toBe('');
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
