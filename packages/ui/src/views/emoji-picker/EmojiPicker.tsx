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
import { borderTopClassName, clsx, Input } from '@univerjs/design';
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

export interface IEmojiPickerPopupProps {
    activeEmoji?: string;
    onSelect?: (emoji: string, options?: { keepOpen?: boolean }) => void;
    recentStorageKey?: string;
}

type EmojiSectionKey = 'recent' | EmojiCategory;
interface IEmojiSection { emojis: IEmojiItem[]; key: EmojiSectionKey; title: string }

export function EmojiPicker(props: { popup?: IPopup<IEmojiPickerPopupProps> }) {
    const extraProps = props.popup?.extraProps;
    const localeService = useDependency(LocaleService);
    const localStorageService = useDependency(ILocalStorageService);
    const currentLocale = useObservable(localeService.currentLocale$, localeService.getCurrentLocale());
    const scrollRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<Partial<Record<EmojiSectionKey, HTMLDivElement | null>>>({});
    const [query, setQuery] = useState('');
    const [activeEmoji, setActiveEmoji] = useState(extraProps?.activeEmoji);
    const [activeTab, setActiveTab] = useState<EmojiSectionKey>('recent');
    const [recents, setRecents] = useState<IEmojiItem[]>(() => getDefaultRecentEmojis());
    const deferredQuery = useDeferredValue(query);
    const emojiLocaleData = useMemo(() => getEmojiLocaleData(localeService), [currentLocale, localeService]);
    const searchResults = useMemo(
        () => searchEmojis(deferredQuery, emojiLocaleData.emojiSearchIndex),
        [deferredQuery, emojiLocaleData]
    );
    const recentStorageKey = extraProps?.recentStorageKey ?? RECENTS_STORAGE_KEY;
    const isSearching = deferredQuery.trim().length > 0;
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
    const renderedSections = sections.filter((section) => section.emojis.length);

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

    const handleSelect = (item: IEmojiItem, options?: { keepOpen?: boolean }) => {
        const nextRecents = promoteRecentEmoji(recents, item);
        setActiveEmoji(item.emoji);
        setRecents(nextRecents);
        writeRecents(localStorageService, recentStorageKey, nextRecents);
        extraProps?.onSelect?.(item.emoji, options);
    };

    const handleRandom = () => {
        handleSelect(getRandomEmoji(), { keepOpen: true });
    };

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        if (isSearching) {
            return;
        }

        setActiveTab(getActiveSectionByScrollTop(normalSections, sectionRefs.current, event.currentTarget.scrollTop));
    };

    const scrollToSection = (section: EmojiSectionKey) => {
        setQuery('');
        setActiveTab(section);
        requestAnimationFrame(() => {
            const sectionElement = sectionRefs.current[section];
            if (scrollRef.current && sectionElement) {
                scrollRef.current.scrollTop = sectionElement.offsetTop;
            }
        });
    };

    return (
        <section
            data-u-comp={EMOJI_PICKER_COMPONENT}
            className="
              univer-flex univer-h-[340px] univer-w-[420px] univer-flex-col univer-overflow-hidden univer-rounded-[10px]
              univer-border univer-border-solid univer-border-gray-200 univer-bg-white univer-shadow-lg
              dark:!univer-border-gray-600 dark:!univer-bg-gray-900
            "
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
                className="univer-relative univer-min-h-0 univer-flex-1 univer-overflow-y-auto univer-px-3"
                onScroll={handleScroll}
            >
                {renderedSections.length
                    ? (
                        <div className="univer-flex univer-flex-col univer-gap-1.5 univer-pb-2">
                            {renderedSections.map((section) => (
                                <EmojiSectionView
                                    key={section.key}
                                    activeEmoji={activeEmoji}
                                    emojiTitles={emojiLocaleData.emojiTitles}
                                    section={section}
                                    onSelect={handleSelect}
                                    refElement={(element) => {
                                        sectionRefs.current[section.key] = element;
                                    }}
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
                    titleKey="ui.emojiPicker.recents"
                    onClick={() => scrollToSection('recent')}
                >
                    <RecentIcon />
                </CategoryButton>
                {EMOJI_CATEGORIES.map((category) => (
                    <CategoryButton
                        key={category.key}
                        selected={!isSearching && activeTab === category.key}
                        titleKey={category.titleKey}
                        onClick={() => scrollToSection(category.key)}
                    >
                        <CategoryIcon category={category.key} />
                    </CategoryButton>
                ))}
            </div>
        </section>
    );
}

function EmojiSectionView(props: {
    activeEmoji?: string;
    emojiTitles?: Record<string, string>;
    onSelect: (item: IEmojiItem, options?: { keepOpen?: boolean }) => void;
    refElement: (element: HTMLDivElement | null) => void;
    section: IEmojiSection;
}) {
    return (
        <section ref={props.refElement} className="univer-flex univer-flex-col univer-gap-1">
            <div
                className="
                  univer-text-xs univer-text-gray-500
                  dark:!univer-text-gray-400
                "
            >
                {props.section.title}
            </div>
            <EmojiGrid
                activeEmoji={props.activeEmoji}
                emojiTitles={props.emojiTitles}
                items={props.section.emojis}
                keyPrefix={props.section.key}
                onSelect={props.onSelect}
            />
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
        <div className="univer-grid univer-grid-cols-10 univer-justify-between univer-gap-1">
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

function CategoryButton(props: { children: ReactElement; onClick: () => void; selected: boolean; titleKey: LocaleKey }) {
    const localeService = useDependency(LocaleService);

    return (
        <button
            type="button"
            aria-label={localeService.t(props.titleKey)}
            aria-selected={props.selected}
            title={localeService.t(props.titleKey)}
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

function getActiveSectionByScrollTop(
    sections: IEmojiSection[],
    sectionElements: Partial<Record<EmojiSectionKey, HTMLDivElement | null>>,
    scrollTop: number
): EmojiSectionKey {
    let active: EmojiSectionKey = 'recent';

    sections.forEach((section) => {
        const element = sectionElements[section.key];
        if (element && element.offsetTop <= scrollTop + ACTIVE_SECTION_SCROLL_OFFSET) {
            active = section.key;
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
