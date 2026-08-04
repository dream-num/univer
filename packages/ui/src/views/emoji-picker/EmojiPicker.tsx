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

import type { ReactElement, UIEvent } from 'react';
import type { LocaleKey } from '../../locale/types';
import type { IPopup } from '../../services/popup/canvas-popup.service';
import type { EmojiCategory, IEmojiItem } from './emoji-picker-utils';
import { ILocalStorageService, LocaleService } from '@univerjs/core';
import { borderTopClassName, clsx, Input, scrollbarClassName } from '@univerjs/design';
import {
    ActivityIcon,
    FoodsIcon,
    NatureIcon,
    ObjectsIcon,
    PeopleIcon,
    PlacesIcon,
    RandomIcon,
    RecentIcon,
    SearchIcon,
    SymbolsIcon,
} from '@univerjs/icons';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useDependency, useObservable } from '../../utils/di';
import { useVirtualList } from '../hooks/virtual-list';
import {
    EMOJI_CATEGORIES,
    getDefaultRecentEmojis,
    getEmojiLocaleData,
    getLocalizedEmojiTitle,
    getRandomEmoji,
    parseStoredRecentEmojis,
    promoteRecentEmoji,
    searchEmojis,
} from './emoji-picker-utils';
import { emojis } from './emojis.generated';

export const EMOJI_PICKER_COMPONENT = 'ui.emoji-picker';

const RECENTS_STORAGE_KEY = 'univer.ui.recent-emojis';
const ACTIVE_SECTION_SCROLL_OFFSET = 28;
const EMOJI_COLUMN_COUNT = 10;
const EMOJI_ROW_HEIGHT = 32;
const EMOJI_SECTION_HEADER_HEIGHT = 24;
const EMOJI_VIRTUAL_OVERSCAN = 3;

interface IEmojiPickerPopupProps {
    activeEmoji?: string;
    onSelect?: (emoji: string, options?: { keepOpen?: boolean }) => void;
    recentStorageKey?: string;
}

interface IEmojiPickerProps {
    embedded?: boolean;
    onChange?: (emoji: string) => void;
    popup?: IPopup<IEmojiPickerPopupProps>;
}

type EmojiSectionKey = 'recent' | EmojiCategory;
interface IEmojiSection { emojis: IEmojiItem[]; key: EmojiSectionKey; title: string }
interface IEmojiSectionPosition { key: EmojiSectionKey; rowIndex: number; top: number }
type EmojiVirtualRow =
    | { key: string; title: string; type: 'header' }
    | { items: IEmojiItem[]; key: string; type: 'emojis' };

export function EmojiPicker(props: IEmojiPickerProps) {
    const extraProps = props.popup?.extraProps;
    const localeService = useDependency(LocaleService);
    const localStorageService = useDependency(ILocalStorageService);
    const currentLocale = useObservable(localeService.currentLocale$, localeService.getCurrentLocale());
    const scrollRef = useRef<HTMLDivElement>(undefined!);
    const pendingSectionRef = useRef<EmojiSectionKey | null>(null);
    const [query, setQuery] = useState('');
    const [activeEmoji, setActiveEmoji] = useState(extraProps?.activeEmoji);
    const [activeTab, setActiveTab] = useState<EmojiSectionKey>('recent');
    const [recents, setRecents] = useState<IEmojiItem[]>(() => getDefaultRecentEmojis());
    const deferredQuery = useDeferredValue(query);
    const emojiLocaleData = getEmojiLocaleData(localeService);
    const searchResults = useMemo(
        () => searchEmojis(deferredQuery, emojiLocaleData.emojiSearchIndex),
        [deferredQuery, emojiLocaleData]
    );
    const recentStorageKey = extraProps?.recentStorageKey ?? RECENTS_STORAGE_KEY;
    const isSearching = deferredQuery.trim().length > 0;
    // TODO(@ai-review): Verify category jumps stay aligned if the emoji row or section header spacing changes.
    const { rows, sectionPositions } = useMemo(() => {
        const normalSections = [
            { key: 'recent' as const, title: localeService.t<LocaleKey>('ui.emojiPicker.recents'), emojis: recents },
            ...EMOJI_CATEGORIES.map((category) => ({
                key: category.key,
                title: localeService.t(category.titleKey),
                emojis: emojis[category.key],
            })),
        ];
        const sections = isSearching
            ? [{ key: 'people' as const, title: localeService.t<LocaleKey>('ui.emojiPicker.searchResults'), emojis: searchResults }]
            : normalSections;

        return createEmojiVirtualRows(sections, currentLocale);
    }, [currentLocale, isSearching, localeService, recents, searchResults]);
    const [virtualRows, { containerProps, scrollTo, wrapperStyle }] = useVirtualList(rows, {
        containerTarget: scrollRef,
        itemHeight: getEmojiVirtualRowHeight,
        overscan: EMOJI_VIRTUAL_OVERSCAN,
    });

    useEffect(() => {
        let disposed = false;

        localStorageService
            .getItem<IEmojiItem[] | string>(recentStorageKey)
            .then((storedRecents) => {
                if (!disposed) {
                    setRecents(parseStoredRecentEmojis(storedRecents));
                }
            })
            .catch(() => undefined);

        return () => {
            disposed = true;
        };
    }, [localStorageService, recentStorageKey]);

    useEffect(() => {
        const pendingSection = pendingSectionRef.current;
        if (isSearching || !pendingSection) {
            return;
        }

        const position = sectionPositions.find((item) => item.key === pendingSection);
        if (position) {
            scrollTo(position.rowIndex);
        }
        pendingSectionRef.current = null;
    }, [isSearching, scrollTo, sectionPositions]);

    const handleSelect = (item: IEmojiItem, options?: { keepOpen?: boolean }) => {
        const nextRecents = promoteRecentEmoji(recents, item);
        setActiveEmoji(item.emoji);
        setRecents(nextRecents);
        writeRecents(localStorageService, recentStorageKey, nextRecents);
        props.onChange?.(item.emoji);
        extraProps?.onSelect?.(item.emoji, options);
    };

    const handleRandom = () => {
        handleSelect(getRandomEmoji(), { keepOpen: true });
    };

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        containerProps.onScroll(event);
        if (isSearching) {
            return;
        }

        setActiveTab(getActiveSectionByScrollTop(sectionPositions, event.currentTarget.scrollTop));
    };

    const scrollToSection = (section: EmojiSectionKey) => {
        setQuery('');
        setActiveTab(section);
        const position = sectionPositions.find((item) => item.key === section);
        if (!isSearching && position) {
            scrollTo(position.rowIndex);
            return;
        }

        pendingSectionRef.current = section;
    };

    return (
        <section
            data-u-comp={EMOJI_PICKER_COMPONENT}
            className={clsx(
                'univer-flex univer-h-[340px] univer-w-[420px] univer-flex-col univer-overflow-hidden',
                !props.embedded && `
                  univer-rounded-[10px] univer-border univer-border-solid univer-border-gray-200 univer-bg-white
                  univer-shadow-lg
                  dark:!univer-border-gray-600 dark:!univer-bg-gray-900
                `
            )}
        >
            <div className="univer-flex univer-items-center univer-gap-1 univer-px-3 univer-pb-2 univer-pt-3">
                <Input
                    aria-label={localeService.t<LocaleKey>('ui.emojiPicker.search')}
                    placeholder={localeService.t<LocaleKey>('ui.emojiPicker.search')}
                    className="univer-min-w-0 univer-flex-1"
                    value={query}
                    onChange={setQuery}
                    slot={(
                        <SearchIcon
                            className="
                              univer-size-4 univer-text-gray-500
                              dark:!univer-text-gray-400
                            "
                        />
                    )}
                />
                <button
                    type="button"
                    aria-label={localeService.t<LocaleKey>('ui.emojiPicker.random')}
                    title={localeService.t<LocaleKey>('ui.emojiPicker.random')}
                    className="
                      univer-box-border univer-flex univer-size-8 univer-cursor-pointer univer-items-center
                      univer-justify-center univer-rounded-lg univer-border univer-border-solid univer-border-gray-300
                      univer-bg-white univer-p-0 univer-text-gray-500
                      hover:univer-border-gray-400 hover:univer-bg-gray-50
                      dark:!univer-border-gray-600 dark:!univer-bg-gray-800 dark:!univer-text-gray-400
                      dark:hover:!univer-bg-gray-700
                    "
                    onClick={handleRandom}
                >
                    <RandomIcon />
                </button>
            </div>

            <div
                ref={scrollRef}
                className={clsx(
                    'univer-relative univer-min-h-0 univer-flex-1 univer-overflow-y-auto univer-px-3',
                    scrollbarClassName
                )}
                onScroll={handleScroll}
            >
                {rows.length
                    ? (
                        <div style={wrapperStyle}>
                            {virtualRows.map(({ data: row }) => row.type === 'header'
                                ? (
                                    <div
                                        key={row.key}
                                        className="
                                          univer-flex univer-h-6 univer-items-center univer-text-xs univer-text-gray-500
                                          dark:!univer-text-gray-400
                                        "
                                    >
                                        {row.title}
                                    </div>
                                )
                                : (
                                    <EmojiGrid
                                        key={row.key}
                                        activeEmoji={activeEmoji}
                                        emojiTitles={emojiLocaleData.emojiTitles}
                                        items={row.items}
                                        keyPrefix={row.key}
                                        onSelect={handleSelect}
                                    />
                                ))}
                        </div>
                    )
                    : (
                        <div
                            className="
                              univer-py-7 univer-text-center univer-text-sm univer-text-gray-400
                              dark:!univer-text-gray-500
                            "
                        >
                            {localeService.t<LocaleKey>('ui.emojiPicker.noResults')}
                        </div>
                    )}
            </div>

            <div
                className={clsx(`
                  univer-flex univer-h-10 univer-shrink-0 univer-items-center univer-border-gray-200 univer-px-2.5
                  dark:!univer-border-gray-600
                  [&_svg]:univer-size-5
                `, borderTopClassName)}
            >
                <CategoryButton
                    selected={!isSearching && activeTab === 'recent'}
                    title={localeService.t<LocaleKey>('ui.emojiPicker.recents')}
                    onClick={() => scrollToSection('recent')}
                >
                    <RecentIcon />
                </CategoryButton>
                {EMOJI_CATEGORIES.map((category) => (
                    <CategoryButton
                        key={category.key}
                        selected={!isSearching && activeTab === category.key}
                        title={localeService.t(category.titleKey)}
                        onClick={() => scrollToSection(category.key)}
                    >
                        <CategoryIcon category={category.key} />
                    </CategoryButton>
                ))}
            </div>
        </section>
    );
}

function EmojiGrid(props: {
    activeEmoji?: string;
    emojiTitles?: Record<string, string>;
    items: IEmojiItem[];
    keyPrefix: string;
    onSelect: (item: IEmojiItem, options?: { keepOpen?: boolean }) => void;
}) {
    return (
        <div className="univer-grid univer-h-8 univer-grid-cols-10 univer-justify-between univer-gap-1">
            {props.items.map((item) => {
                const title = getLocalizedEmojiTitle(item, props.emojiTitles);
                const active = props.activeEmoji === item.emoji;

                return (
                    <button
                        key={`${props.keyPrefix}-${item.emoji}-${item.title}`}
                        type="button"
                        aria-label={title}
                        title={title}
                        className={clsx(
                            `
                              univer-flex univer-size-7 univer-cursor-pointer univer-items-center univer-justify-center
                              univer-rounded-lg univer-border-0 univer-bg-transparent univer-p-0 univer-text-lg
                              dark:!univer-text-gray-200
                            `,
                            active
                                ? `
                                  univer-bg-primary-50 univer-shadow-sm
                                  dark:!univer-bg-gray-800 dark:!univer-shadow-sm
                                `
                                : `
                                  hover:univer-bg-gray-100
                                  dark:hover:!univer-bg-gray-800
                                `
                        )}
                        onClick={() => props.onSelect(item, { keepOpen: true })}
                    >
                        {item.emoji}
                    </button>
                );
            })}
        </div>
    );
}

function CategoryButton(props: { children: ReactElement; onClick: () => void; selected: boolean; title: string }) {
    return (
        <button
            type="button"
            aria-label={props.title}
            aria-selected={props.selected}
            title={props.title}
            className={clsx(
                `
                  univer-flex univer-h-[30px] univer-flex-1 univer-cursor-pointer univer-items-center
                  univer-justify-center univer-rounded-lg univer-border-0 univer-bg-transparent univer-p-0
                  univer-text-gray-500
                  dark:!univer-text-gray-400
                `,
                props.selected
                    ? `
                      univer-bg-primary-50 univer-text-primary-500
                      dark:!univer-bg-gray-800 dark:!univer-text-primary-400
                    `
                    : `
                      hover:univer-bg-gray-50 hover:univer-text-gray-700
                      dark:hover:!univer-bg-gray-800 dark:hover:!univer-text-gray-300
                    `
            )}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}

function writeRecents(localStorageService: ILocalStorageService, storageKey: string, recents: IEmojiItem[]): void {
    localStorageService
        .setItem(storageKey, recents)
        .catch(() => undefined);
}

function createEmojiVirtualRows(sections: IEmojiSection[], locale: string): {
    rows: EmojiVirtualRow[];
    sectionPositions: IEmojiSectionPosition[];
} {
    const rows: EmojiVirtualRow[] = [];
    const sectionPositions: IEmojiSectionPosition[] = [];
    let top = 0;

    sections.forEach((section) => {
        if (!section.emojis.length) {
            return;
        }

        sectionPositions.push({ key: section.key, rowIndex: rows.length, top });
        rows.push({ key: `${locale}-${section.key}-header`, title: section.title, type: 'header' });
        top += EMOJI_SECTION_HEADER_HEIGHT;

        for (let start = 0; start < section.emojis.length; start += EMOJI_COLUMN_COUNT) {
            rows.push({
                items: section.emojis.slice(start, start + EMOJI_COLUMN_COUNT),
                key: `${locale}-${section.key}-${start / EMOJI_COLUMN_COUNT}`,
                type: 'emojis',
            });
            top += EMOJI_ROW_HEIGHT;
        }
    });

    return { rows, sectionPositions };
}

function getEmojiVirtualRowHeight(_index: number, row: EmojiVirtualRow): number {
    return row.type === 'header' ? EMOJI_SECTION_HEADER_HEIGHT : EMOJI_ROW_HEIGHT;
}

function getActiveSectionByScrollTop(sectionPositions: IEmojiSectionPosition[], scrollTop: number): EmojiSectionKey {
    let active: EmojiSectionKey = 'recent';

    sectionPositions.forEach((position) => {
        if (position.top <= scrollTop + ACTIVE_SECTION_SCROLL_OFFSET) {
            active = position.key;
        }
    });

    return active;
}

function CategoryIcon(props: { category: EmojiCategory }) {
    switch (props.category) {
        case 'activity':
            return <ActivityIcon />;
        case 'foods':
            return <FoodsIcon />;
        case 'nature':
            return <NatureIcon />;
        case 'objects':
            return <ObjectsIcon />;
        case 'people':
            return <PeopleIcon />;
        case 'places':
            return <PlacesIcon />;
        case 'symbols':
        default:
            return <SymbolsIcon />;
    }
}
