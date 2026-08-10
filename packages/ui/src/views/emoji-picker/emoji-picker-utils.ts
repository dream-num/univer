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

import type { LocaleService } from '@univerjs/core';
import type { LocaleKey } from '../../locale/types';
import { emojis } from './emojis.generated';

export interface IEmojiVariant {
    emoji: string;
    title: string;
}

export interface IEmojiItem extends IEmojiVariant {
    skinToneVariants?: IEmojiVariant[];
}

export interface IEmojiLocaleData {
    emojiSearchIndex?: Record<string, string>;
    emojiTitles?: Record<string, string>;
}

export type EmojiCategory = Exclude<keyof typeof emojis, 'frequent'>;

export const EMOJI_SKIN_TONES = ['', '🏻', '🏼', '🏽', '🏾', '🏿'] as const;
export type EmojiSkinTone = (typeof EMOJI_SKIN_TONES)[number];

export const EMOJI_SKIN_TONE_OPTIONS: ReadonlyArray<IEmojiVariant & { value: EmojiSkinTone }> = [
    { emoji: '✋', title: 'Raised Hand', value: '' },
    { emoji: '✋🏻', title: 'Raised Hand: Light Skin Tone', value: '🏻' },
    { emoji: '✋🏼', title: 'Raised Hand: Medium-light Skin Tone', value: '🏼' },
    { emoji: '✋🏽', title: 'Raised Hand: Medium Skin Tone', value: '🏽' },
    { emoji: '✋🏾', title: 'Raised Hand: Medium-dark Skin Tone', value: '🏾' },
    { emoji: '✋🏿', title: 'Raised Hand: Dark Skin Tone', value: '🏿' },
];

export const EMOJI_RECENT_LIMIT = 11;

const EMOJI_CATEGORY_LABEL_KEYS: Record<EmojiCategory, LocaleKey> = {
    activity: 'ui.emojiPicker.activities',
    foods: 'ui.emojiPicker.food',
    nature: 'ui.emojiPicker.animals',
    objects: 'ui.emojiPicker.objects',
    people: 'ui.emojiPicker.emojis',
    places: 'ui.emojiPicker.places',
    symbols: 'ui.emojiPicker.symbols',
};

export const EMOJI_CATEGORIES = Object.keys(emojis)
    .filter((category): category is EmojiCategory => category !== 'frequent')
    .map((category) => ({
        key: category,
        titleKey: EMOJI_CATEGORY_LABEL_KEYS[category],
    }));

const EMOJI_SKIN_TONE_MODIFIER_REGEX = /[\u{1F3FB}-\u{1F3FF}]/gu;
const emojiFamilyByEmoji = new Map<string, IEmojiItem>();

getEmojiFamilies().forEach((family) => {
    [family, ...(family.skinToneVariants ?? [])].forEach((item) => {
        emojiFamilyByEmoji.set(item.emoji, family);
    });
});

export function getDefaultRecentEmojis(): IEmojiItem[] {
    return emojis.frequent.slice(0, EMOJI_RECENT_LIMIT);
}

export function getAllEmojis(): IEmojiItem[] {
    return getEmojiFamilies().flatMap((family) => [family, ...(family.skinToneVariants ?? [])]);
}

export function searchEmojis(keyword: string, searchIndex?: Record<string, string>): IEmojiItem[] {
    const query = keyword.trim().toLowerCase();
    if (!query) {
        return [];
    }

    return getEmojiFamilies().filter((item) => getEmojiSearchText(item, searchIndex).includes(query));
}

export function promoteRecentEmoji(recents: IEmojiItem[], item: IEmojiItem): IEmojiItem[] {
    const recentItem = { emoji: item.emoji, title: item.title };
    const familyKey = getEmojiFamilyKey(item.emoji);

    return [
        recentItem,
        ...recents
            .filter((recent) => getEmojiFamilyKey(recent.emoji) !== familyKey)
            .map((recent) => ({ emoji: recent.emoji, title: recent.title })),
    ].slice(0, EMOJI_RECENT_LIMIT);
}

export function parseStoredRecentEmojis(value: IEmojiItem[] | string | null): IEmojiItem[] {
    if (!value) {
        return getDefaultRecentEmojis();
    }

    if (Array.isArray(value)) {
        return normalizeStoredRecentEmojis(value);
    }

    try {
        const parsed = JSON.parse(value) as IEmojiItem[];
        return normalizeStoredRecentEmojis(parsed);
    } catch {
        return getDefaultRecentEmojis();
    }
}

export function getRandomEmoji(random = Math.random, skinTone: EmojiSkinTone = ''): IEmojiItem {
    const families = getEmojiFamilies();
    const family = families[Math.floor(random() * families.length)] ?? getDefaultRecentEmojis()[0];
    return applyEmojiSkinTone(family, skinTone);
}

export function applyEmojiSkinTone(item: IEmojiItem, skinTone: EmojiSkinTone): IEmojiItem {
    const family = emojiFamilyByEmoji.get(item.emoji) ?? item;
    if (!skinTone) {
        return family;
    }

    const variant = family.skinToneVariants?.find((candidate) => {
        const modifiers = candidate.emoji.match(EMOJI_SKIN_TONE_MODIFIER_REGEX) ?? [];
        return modifiers.length > 0 && modifiers.every((modifier) => modifier === skinTone);
    });

    return variant ? { ...variant, skinToneVariants: family.skinToneVariants } : family;
}

export function getEmojiFamilyKey(emoji: string): string {
    return emojiFamilyByEmoji.get(emoji)?.emoji ?? emoji;
}

export function getEmojiFamilyVariants(emoji: string): IEmojiVariant[] {
    const family = emojiFamilyByEmoji.get(emoji);
    return family
        ? [{ emoji: family.emoji, title: family.title }, ...(family.skinToneVariants ?? [])]
        : [];
}

export function hasMixedSkinToneVariants(item: IEmojiItem): boolean {
    const family = emojiFamilyByEmoji.get(item.emoji) ?? item;
    return Boolean(family.skinToneVariants?.some((variant) => (
        variant.emoji.match(EMOJI_SKIN_TONE_MODIFIER_REGEX) ?? []
    ).length > 1));
}

export function parseStoredEmojiSkinTone(value: unknown): EmojiSkinTone {
    return EMOJI_SKIN_TONES.find((skinTone) => skinTone === value) ?? '';
}

export function getLocalizedEmojiTitle(item: IEmojiItem, emojiTitles?: Record<string, string>): string {
    return emojiTitles?.[item.emoji] ?? item.title;
}

export function getEmojiLocaleData(localeService: Pick<LocaleService, 'getLocales'>): IEmojiLocaleData {
    const localePack = localeService.getLocales();
    const uiLocale = localePack?.ui as { emojiPicker?: unknown } | undefined;
    const emojiPicker = uiLocale?.emojiPicker;

    if (!emojiPicker || typeof emojiPicker !== 'object' || Array.isArray(emojiPicker)) {
        return {};
    }

    return emojiPicker as IEmojiLocaleData;
}

function getEmojiSearchText(item: IEmojiItem, searchIndex?: Record<string, string>): string {
    return [item, ...(item.skinToneVariants ?? [])]
        .flatMap((candidate) => [candidate.title, searchIndex?.[candidate.emoji]])
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}

function normalizeStoredRecentEmojis(value: unknown): IEmojiItem[] {
    if (!Array.isArray(value)) {
        return getDefaultRecentEmojis();
    }

    const valid = value.filter((item) => typeof item?.emoji === 'string' && typeof item?.title === 'string');
    const seenFamilies = new Set<string>();
    const recents = valid
        .filter((item) => {
            const familyKey = getEmojiFamilyKey(item.emoji);
            if (seenFamilies.has(familyKey)) {
                return false;
            }

            seenFamilies.add(familyKey);
            return true;
        })
        .map((item) => ({ emoji: item.emoji, title: item.title }))
        .slice(0, EMOJI_RECENT_LIMIT);

    return recents.length ? recents : getDefaultRecentEmojis();
}

function getEmojiFamilies(): IEmojiItem[] {
    return EMOJI_CATEGORIES.flatMap((category) => emojis[category.key]);
}
