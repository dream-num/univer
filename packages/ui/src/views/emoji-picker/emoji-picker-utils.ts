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

export interface IEmojiItem {
    emoji: string;
    title: string;
}

export interface IEmojiLocaleData {
    emojiSearchIndex?: Record<string, string>;
    emojiTitles?: Record<string, string>;
}

export type EmojiCategory = Exclude<keyof typeof emojis, 'frequent'>;

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

export function getDefaultRecentEmojis(): IEmojiItem[] {
    return emojis.frequent.slice(0, EMOJI_RECENT_LIMIT);
}

export function getAllEmojis(): IEmojiItem[] {
    return EMOJI_CATEGORIES.flatMap((category) => emojis[category.key]);
}

export function searchEmojis(keyword: string, searchIndex?: Record<string, string>): IEmojiItem[] {
    const query = keyword.trim().toLowerCase();
    if (!query) {
        return [];
    }

    return getAllEmojis().filter((item) => getEmojiSearchText(item, searchIndex).includes(query));
}

export function promoteRecentEmoji(recents: IEmojiItem[], item: IEmojiItem): IEmojiItem[] {
    return [
        item,
        ...recents.filter((recent) => recent.emoji !== item.emoji),
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

export function getRandomEmoji(random = Math.random): IEmojiItem {
    const allEmojis = getAllEmojis();
    return allEmojis[Math.floor(random() * allEmojis.length)] ?? getDefaultRecentEmojis()[0];
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
    return [
        item.title,
        searchIndex?.[item.emoji],
    ].filter(Boolean).join(' ').toLowerCase();
}

function normalizeStoredRecentEmojis(value: unknown): IEmojiItem[] {
    if (!Array.isArray(value)) {
        return getDefaultRecentEmojis();
    }

    const valid = value.filter((item) => typeof item?.emoji === 'string' && typeof item?.title === 'string');
    return valid.length ? valid.slice(0, EMOJI_RECENT_LIMIT) : getDefaultRecentEmojis();
}
