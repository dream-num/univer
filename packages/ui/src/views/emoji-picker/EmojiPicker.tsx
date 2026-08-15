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

import type { KeyboardEvent, ReactElement, UIEvent } from 'react';
import type { LocaleKey } from '../../locale/types';
import type { IPopup } from '../../services/popup/canvas-popup.service';
import type { EmojiCategory, EmojiSkinTone, IEmojiItem, IEmojiVariant } from './emoji-picker-utils';
import { ILocalStorageService, LocaleService } from '@univerjs/core';
import { borderTopClassName, Button, clsx, Dropdown, Input, scrollbarClassName } from '@univerjs/design';
import {
    ActivityIcon,
    FoodsIcon,
    MoreDownIcon,
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
    applyEmojiSkinTone,
    EMOJI_CATEGORIES,
    EMOJI_SKIN_TONE_OPTIONS,

    getDefaultRecentEmojis,
    getEmojiFamilyKey,

    getEmojiFamilyVariants,
    getEmojiLocaleData,
    getLocalizedEmojiTitle,
    getRandomEmoji,
    hasMixedSkinToneVariants,

    parseStoredEmojiSkinTone,
    parseStoredRecentEmojis,
    promoteRecentEmoji,
    searchEmojis,
} from './emoji-picker-utils';
import { emojis } from './emojis.generated';

export const EMOJI_PICKER_COMPONENT = 'ui.emoji-picker';

const RECENTS_STORAGE_KEY = 'univer.ui.recent-emojis';
const SKIN_TONE_STORAGE_KEY = 'univer.ui.emoji-skin-tone';
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
    const skinToneChangedRef = useRef(false);
    const [query, setQuery] = useState('');
    const [activeEmoji, setActiveEmoji] = useState(extraProps?.activeEmoji);
    const [activeTab, setActiveTab] = useState<EmojiSectionKey>('recent');
    const [recents, setRecents] = useState<IEmojiItem[]>(() => getDefaultRecentEmojis());
    const [skinTone, setSkinTone] = useState<EmojiSkinTone>('');
    const [skinToneMenuOpen, setSkinToneMenuOpen] = useState(false);
    const deferredQuery = useDeferredValue(query);
    const emojiLocaleData = getEmojiLocaleData(localeService);
    const searchResults = useMemo(
        () => searchEmojis(deferredQuery, emojiLocaleData.emojiSearchIndex),
        [deferredQuery, emojiLocaleData]
    );
    const recentStorageKey = extraProps?.recentStorageKey ?? RECENTS_STORAGE_KEY;
    const isSearching = deferredQuery.trim().length > 0;
    const { rows, sectionPositions } = useMemo(() => {
        const normalSections: IEmojiSection[] = [
            { key: 'recent', title: localeService.t<LocaleKey>('ui.emojiPicker.recents'), emojis: recents },
            ...EMOJI_CATEGORIES.map((category) => ({
                key: category.key,
                title: localeService.t(category.titleKey),
                emojis: emojis[category.key].map((item) => applyEmojiSkinTone(item, skinTone)),
            })),
        ];
        const sections: IEmojiSection[] = isSearching
            ? [{
                key: 'people',
                title: localeService.t<LocaleKey>('ui.emojiPicker.searchResults'),
                emojis: searchResults.map((item) => applyEmojiSkinTone(item, skinTone)),
            }]
            : normalSections;

        return createEmojiVirtualRows(sections, currentLocale);
    }, [currentLocale, isSearching, localeService, recents, searchResults, skinTone]);
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
        let disposed = false;

        localStorageService
            .getItem<unknown>(SKIN_TONE_STORAGE_KEY)
            .then((storedSkinTone) => {
                if (!disposed && !skinToneChangedRef.current) {
                    setSkinTone(parseStoredEmojiSkinTone(storedSkinTone));
                }
            })
            .catch(() => undefined);

        return () => {
            disposed = true;
        };
    }, [localStorageService]);

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
        writeStorageItem(localStorageService, recentStorageKey, nextRecents);
        props.onChange?.(item.emoji);
        extraProps?.onSelect?.(item.emoji, options);
    };

    const handleRandom = () => {
        handleSelect(getRandomEmoji(Math.random, skinTone), { keepOpen: true });
    };

    const handleSkinToneChange = (nextSkinTone: EmojiSkinTone) => {
        skinToneChangedRef.current = true;
        setSkinTone(nextSkinTone);
        writeStorageItem(localStorageService, SKIN_TONE_STORAGE_KEY, nextSkinTone);
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
            onClick={(event) => {
                event.stopPropagation();
                setSkinToneMenuOpen(false);
            }}
            className={clsx(
                'univer-flex univer-h-[340px] univer-w-[420px] univer-flex-col univer-overflow-hidden',
                !props.embedded && `
                  univer-rounded-[10px] univer-border univer-border-solid univer-border-gray-200 univer-bg-gray-0
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
                <Button
                    aria-label={localeService.t<LocaleKey>('ui.emojiPicker.random')}
                    title={localeService.t<LocaleKey>('ui.emojiPicker.random')}
                    className="
                      univer-flex-shrink-0 univer-text-gray-500
                      dark:!univer-text-gray-400
                    "
                    size="icon"
                    onClick={handleRandom}
                >
                    <RandomIcon />
                </Button>
                <SkinToneDropdown
                    emojiTitles={emojiLocaleData.emojiTitles}
                    open={skinToneMenuOpen}
                    skinTone={skinTone}
                    onChange={handleSkinToneChange}
                    onOpenChange={setSkinToneMenuOpen}
                />
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
                                        style={{ height: EMOJI_SECTION_HEADER_HEIGHT }}
                                        className="
                                          univer-flex univer-items-center univer-text-xs univer-text-gray-500
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
                                        moreTitle={localeService.t<LocaleKey>('ui.ribbon.more')}
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
    moreTitle: string;
    onSelect: (item: IEmojiItem, options?: { keepOpen?: boolean }) => void;
}) {
    return (
        <div
            className="univer-grid univer-grid-cols-10 univer-justify-between univer-gap-1"
            style={{ height: EMOJI_ROW_HEIGHT }}
        >
            {props.items.map((item) => {
                return (
                    <EmojiButton
                        key={`${props.keyPrefix}-${item.emoji}-${item.title}`}
                        activeEmoji={props.activeEmoji}
                        emojiTitles={props.emojiTitles}
                        item={item}
                        moreTitle={props.moreTitle}
                        onSelect={props.onSelect}
                    />
                );
            })}
        </div>
    );
}

function EmojiButton(props: {
    activeEmoji?: string;
    emojiTitles?: Record<string, string>;
    item: IEmojiItem;
    moreTitle: string;
    onSelect: (item: IEmojiItem, options?: { keepOpen?: boolean }) => void;
}) {
    const [variantsOpen, setVariantsOpen] = useState(false);
    const title = getLocalizedEmojiTitle(props.item, props.emojiTitles);
    const active = props.activeEmoji != null
        && getEmojiFamilyKey(props.activeEmoji) === getEmojiFamilyKey(props.item.emoji);
    const mixedToneVariants = hasMixedSkinToneVariants(props.item);
    const button = (
        <button
            type="button"
            aria-label={title}
            title={title}
            className={clsx(
                `
                  univer-flex univer-size-7 univer-cursor-pointer univer-items-center univer-justify-center
                  univer-rounded-lg univer-border-0 univer-bg-transparent univer-p-0 univer-text-lg
                  focus-visible:univer-outline-none focus-visible:univer-ring-1 focus-visible:univer-ring-primary-600
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
            onClick={() => props.onSelect(props.item, { keepOpen: true })}
        >
            {props.item.emoji}
        </button>
    );

    if (!mixedToneVariants) {
        return button;
    }

    const variants = getEmojiFamilyVariants(props.item.emoji);
    return (
        <div className="univer-relative univer-size-7">
            {button}
            <Dropdown
                align="end"
                open={variantsOpen}
                onOpenChange={setVariantsOpen}
                overlay={(
                    <div
                        data-u-comp="ui.emoji-picker.skin-tone-variants"
                        className="univer-grid univer-grid-cols-6 univer-gap-1 univer-p-1"
                    >
                        {variants.map((variant) => (
                            <EmojiVariantButton
                                key={variant.emoji}
                                active={props.activeEmoji === variant.emoji}
                                emojiTitles={props.emojiTitles}
                                item={variant}
                                onSelect={(item) => {
                                    setVariantsOpen(false);
                                    props.onSelect(item, { keepOpen: true });
                                }}
                            />
                        ))}
                    </div>
                )}
            >
                <button
                    type="button"
                    aria-label={`${title}, ${props.moreTitle}`}
                    title={`${title}, ${props.moreTitle}`}
                    className="
                      univer-bg-gray-0/90
                      dark:!univer-bg-gray-800/90
                      univer-absolute univer-bottom-0 univer-right-0 univer-flex univer-size-3 univer-cursor-pointer
                      univer-items-center univer-justify-center univer-rounded-sm univer-border-0 univer-p-0
                      univer-text-gray-500
                      hover:univer-bg-gray-100 hover:univer-text-gray-700
                      focus-visible:univer-outline-none focus-visible:univer-ring-1
                      focus-visible:univer-ring-primary-600
                      dark:!univer-text-gray-300
                      dark:hover:!univer-bg-gray-700
                    "
                >
                    <MoreDownIcon className="!univer-size-2.5" />
                </button>
            </Dropdown>
        </div>
    );
}

function EmojiVariantButton(props: {
    active: boolean;
    emojiTitles?: Record<string, string>;
    item: IEmojiVariant;
    onSelect: (item: IEmojiVariant) => void;
}) {
    const title = getLocalizedEmojiTitle(props.item, props.emojiTitles);

    return (
        <button
            type="button"
            aria-label={title}
            aria-pressed={props.active}
            title={title}
            className={clsx(`
              univer-flex univer-size-8 univer-cursor-pointer univer-items-center univer-justify-center
              univer-rounded-md univer-border-0 univer-bg-transparent univer-p-0 univer-text-lg
              hover:univer-bg-gray-100
              focus-visible:univer-outline-none focus-visible:univer-ring-1 focus-visible:univer-ring-primary-600
              dark:hover:!univer-bg-gray-700
            `, {
                'univer-bg-primary-50 univer-ring-1 univer-ring-primary-600 dark:!univer-bg-gray-700': props.active,
            })}
            onClick={() => props.onSelect(props.item)}
        >
            {props.item.emoji}
        </button>
    );
}

function SkinToneDropdown(props: {
    emojiTitles?: Record<string, string>;
    open: boolean;
    skinTone: EmojiSkinTone;
    onChange: (skinTone: EmojiSkinTone) => void;
    onOpenChange: (open: boolean) => void;
}) {
    const currentOption = EMOJI_SKIN_TONE_OPTIONS.find((option) => option.value === props.skinTone)
        ?? EMOJI_SKIN_TONE_OPTIONS[0];
    const currentTitle = getLocalizedEmojiTitle(currentOption, props.emojiTitles);

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown'
            ? 1
            : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
                ? -1
                : 0;
        if (!direction) {
            return;
        }

        event.preventDefault();
        const nextIndex = (index + direction + EMOJI_SKIN_TONE_OPTIONS.length) % EMOJI_SKIN_TONE_OPTIONS.length;
        const nextOption = EMOJI_SKIN_TONE_OPTIONS[nextIndex];
        props.onChange(nextOption.value);
        const radioButtons = event.currentTarget.parentElement
            ?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
        radioButtons?.[nextIndex]?.focus();
    };

    return (
        <div className="univer-flex-shrink-0" onClick={(event) => event.stopPropagation()}>
            <Dropdown
                align="end"
                open={props.open}
                onOpenChange={props.onOpenChange}
                overlay={(
                    <div
                        data-u-comp="ui.emoji-picker.skin-tone-menu"
                        role="radiogroup"
                        aria-label={currentTitle}
                        className="univer-flex univer-gap-1 univer-p-1"
                    >
                        {EMOJI_SKIN_TONE_OPTIONS.map((option, index) => {
                            const title = getLocalizedEmojiTitle(option, props.emojiTitles);
                            const selected = option.value === props.skinTone;

                            return (
                                <button
                                    key={option.value || 'default'}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    aria-label={title}
                                    title={title}
                                    tabIndex={selected ? 0 : -1}
                                    className={clsx(`
                                      univer-flex univer-size-8 univer-cursor-pointer univer-items-center
                                      univer-justify-center univer-rounded-md univer-border-0 univer-bg-transparent
                                      univer-p-0 univer-text-lg
                                      hover:univer-bg-gray-100
                                      focus-visible:univer-outline-none focus-visible:univer-ring-1
                                      focus-visible:univer-ring-primary-600
                                      dark:hover:!univer-bg-gray-700
                                    `, {
                                        'univer-bg-primary-50 univer-ring-1 univer-ring-primary-600 dark:!univer-bg-gray-700': selected,
                                    })}
                                    onClick={() => {
                                        props.onChange(option.value);
                                        props.onOpenChange(false);
                                    }}
                                    onKeyDown={(event) => handleKeyDown(event, index)}
                                >
                                    {option.emoji}
                                </button>
                            );
                        })}
                    </div>
                )}
            >
                <Button
                    aria-label={currentTitle}
                    title={currentTitle}
                    className="univer-relative univer-flex-shrink-0"
                    size="icon"
                >
                    <span className="univer-text-lg">{currentOption.emoji}</span>
                    <MoreDownIcon
                        className="
                          !univer-absolute !univer-bottom-0.5 !univer-right-0.5 !univer-size-2.5 univer-text-gray-500
                          dark:!univer-text-gray-300
                        "
                    />
                </Button>
            </Dropdown>
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

function writeStorageItem<T>(localStorageService: ILocalStorageService, storageKey: string, value: T): void {
    localStorageService
        .setItem(storageKey, value)
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
