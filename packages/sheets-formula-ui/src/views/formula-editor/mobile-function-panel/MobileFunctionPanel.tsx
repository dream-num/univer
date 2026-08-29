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

import type { IFunctionInfo, ISearchItem } from '@univerjs/engine-formula';
import type { LocaleKey } from '../../../locale/types';
import { LocaleService } from '@univerjs/core';
import { clsx, scrollbarClassName } from '@univerjs/design';
import { FunctionType, IDescriptionService } from '@univerjs/engine-formula';
import { useDependency } from '@univerjs/ui';
import { useEffect, useMemo, useState } from 'react';
import { getFunctionTypeValues } from '../../../services/utils';

const RECENT_FUNCTIONS_KEY = 'univer-mobile-recent-formula-functions';
const RECOMMENDED_FUNCTIONS = ['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN', 'IF', 'XLOOKUP', 'ROUND'];

type MobileFunctionCategory = 'recommended' | 'recent' | 'all' | number;

function readRecentFunctions(): string[] {
    try {
        return JSON.parse(globalThis.localStorage?.getItem(RECENT_FUNCTIONS_KEY) ?? '[]');
    } catch {
        return [];
    }
}

function rememberFunction(name: string): void {
    try {
        const recent = [name, ...readRecentFunctions().filter((item) => item !== name)].slice(0, 8);
        globalThis.localStorage?.setItem(RECENT_FUNCTIONS_KEY, JSON.stringify(recent));
    } catch {
        // Storage is optional in embedded webviews.
    }
}

export function MobileFunctionPanel(props: {
    open: boolean;
    onClose: () => void;
    onInsert: (name: string) => void;
}) {
    const { open, onClose, onInsert } = props;
    const descriptionService = useDependency(IDescriptionService);
    const localeService = useDependency(LocaleService);
    const copy = {
        title: localeService.t<LocaleKey>('sheets-formula-ui.mobileFunction.title'),
        search: localeService.t<LocaleKey>('sheets-formula-ui.moreFunctions.searchFunctionPlaceholder'),
        recommended: localeService.t<LocaleKey>('sheets-formula-ui.mobileFunction.recommended'),
        recent: localeService.t<LocaleKey>('sheets-formula-ui.mobileFunction.recent'),
        all: localeService.t<LocaleKey>('sheets-formula-ui.moreFunctions.allFunctions'),
        details: localeService.t<LocaleKey>('sheets-formula-ui.mobileFunction.details'),
        back: localeService.t<LocaleKey>('sheets-formula-ui.moreFunctions.prev'),
        insert: localeService.t<LocaleKey>('sheets-formula-ui.mobileFunction.insert'),
        empty: localeService.t<LocaleKey>('sheets-formula-ui.mobileFunction.empty'),
        syntax: localeService.t<LocaleKey>('sheets-formula-ui.moreFunctions.syntax'),
        close: localeService.t<LocaleKey>('sheets-formula-ui.mobileFunction.close'),
    };
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<MobileFunctionCategory>('recommended');
    const [details, setDetails] = useState<IFunctionInfo | null>(null);
    const [recentVersion, setRecentVersion] = useState(0);

    useEffect(() => {
        if (!open) return;
        setQuery('');
        setCategory('recommended');
        setDetails(null);
    }, [open]);

    const categories = useMemo(() => {
        if (!open) return [];

        return [
            { label: copy.recommended, value: 'recommended' as const },
            { label: copy.recent, value: 'recent' as const },
            { label: copy.all, value: 'all' as const },
            ...getFunctionTypeValues(localeService, false).map((item) => ({ label: item.label, value: Number(item.value) })),
        ].filter((item) => typeof item.value !== 'number' || (
            item.value !== FunctionType.DefinedName &&
            item.value !== FunctionType.Table &&
            descriptionService.getSearchListByType(item.value).length > 0
        ));
    }, [copy.all, copy.recent, copy.recommended, descriptionService, localeService, open]);

    const functions = useMemo<ISearchItem[]>(() => {
        if (!open) return [];
        if (query.trim()) return descriptionService.getSearchListByName(query).slice(0, 60);

        if (category === 'recommended') {
            return RECOMMENDED_FUNCTIONS
                .map((name) => descriptionService.getFunctionInfo(name))
                .filter((item): item is IFunctionInfo => Boolean(item))
                .map((item) => ({ name: item.functionName, desc: item.abstract }));
        }

        if (category === 'recent') {
            return readRecentFunctions()
                .map((name) => descriptionService.getFunctionInfo(name))
                .filter((item): item is IFunctionInfo => Boolean(item))
                .map((item) => ({ name: item.functionName, desc: item.abstract }));
        }

        return descriptionService.getSearchListByType(category === 'all' ? -1 : category).slice(0, 100);
    }, [category, descriptionService, open, query, recentVersion]);

    const handleInsert = (name: string) => {
        rememberFunction(name);
        setRecentVersion((value) => value + 1);
        onInsert(name);
    };

    if (!open) return null;

    return (
        <div
            data-u-comp="mobile-formula-function-panel"
            className="univer-fixed univer-inset-0 univer-z-[1200] univer-bg-black/20"
            onPointerDown={(event) => event.stopPropagation()}
        >
            <section
                role="dialog"
                aria-label={copy.title}
                className="
                  univer-absolute univer-inset-x-0 univer-bottom-0 univer-flex univer-h-[80dvh] univer-flex-col
                  univer-overflow-hidden univer-rounded-t-2xl univer-bg-gray-0 univer-shadow-lg
                  dark:!univer-bg-gray-900
                "
            >
                <div className="univer-flex univer-justify-center univer-pb-2 univer-pt-3">
                    <div
                        className="
                          univer-h-1 univer-w-10 univer-rounded-full univer-bg-gray-300
                          dark:!univer-bg-gray-600
                        "
                    />
                </div>
                <header className="univer-flex univer-h-12 univer-items-center univer-gap-2 univer-px-4">
                    {details && (
                        <button
                            type="button"
                            className="
                              univer-h-10 univer-appearance-none univer-rounded-lg univer-border-0 univer-bg-transparent
                              univer-px-3 univer-text-sm univer-text-primary-600 univer-outline-none
                              active:univer-bg-primary-50
                            "
                            onClick={() => setDetails(null)}
                        >
                            {copy.back}
                        </button>
                    )}
                    <h2
                        className="
                          univer-m-0 univer-flex-1 univer-text-base univer-font-semibold univer-text-gray-900
                          dark:!univer-text-gray-0
                        "
                    >
                        {details?.functionName ?? copy.title}
                    </h2>
                    <button
                        type="button"
                        aria-label={copy.close}
                        className="
                          univer-size-10 univer-appearance-none univer-rounded-lg univer-border-0 univer-bg-transparent
                          univer-text-xl univer-text-gray-600 univer-outline-none
                          active:univer-bg-gray-100
                          dark:!univer-text-gray-200
                          dark:active:!univer-bg-gray-700
                        "
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>

                {details
                    ? (
                        <div className={clsx('univer-flex-1 univer-overflow-y-auto univer-px-4 univer-pb-4', scrollbarClassName)}>
                            <div
                                className="
                                  univer-rounded-xl univer-bg-gray-50 univer-p-4
                                  dark:!univer-bg-gray-800
                                "
                            >
                                <p
                                    className="
                                      univer-m-0 univer-text-sm univer-leading-6 univer-text-gray-700
                                      dark:!univer-text-gray-200
                                    "
                                >
                                    {details.description}
                                </p>
                                <div
                                    className="
                                      univer-mt-4 univer-text-xs univer-text-gray-500
                                      dark:!univer-text-gray-300
                                    "
                                >
                                    {copy.syntax}
                                </div>
                                <code
                                    className="
                                      univer-mt-2 univer-block univer-break-words univer-rounded-lg univer-bg-gray-0
                                      univer-p-3 univer-text-sm
                                      dark:!univer-bg-gray-900
                                    "
                                >
                                    {`${details.functionName}(${details.functionParameter.map((item) => item.name).join(', ')})`}
                                </code>
                            </div>
                            <button
                                type="button"
                                data-u-comp="mobile-formula-insert"
                                className="
                                  univer-mt-4 univer-h-12 univer-w-full univer-appearance-none univer-rounded-xl
                                  univer-border-0 univer-bg-primary-600 univer-text-sm univer-font-medium
                                  univer-text-white univer-outline-none
                                  active:univer-bg-primary-700
                                "
                                onClick={() => handleInsert(details.functionName)}
                            >
                                {copy.insert}
                            </button>
                        </div>
                    )
                    : (
                        <>
                            <div className="univer-px-4 univer-pb-3">
                                <input
                                    value={query}
                                    aria-label={copy.search}
                                    placeholder={copy.search}
                                    className="
                                      univer-box-border univer-h-11 univer-w-full univer-rounded-xl univer-border
                                      univer-border-solid univer-border-gray-200 univer-bg-gray-50 univer-px-4
                                      univer-text-base univer-outline-none
                                      focus:univer-border-primary-500
                                      dark:!univer-border-gray-700 dark:!univer-bg-gray-800 dark:!univer-text-gray-0
                                    "
                                    onChange={(event) => setQuery(event.target.value)}
                                />
                            </div>
                            {!query && (
                                <div
                                    className="
                                      univer-flex univer-shrink-0 univer-gap-2 univer-overflow-x-auto univer-px-4
                                      univer-pb-3
                                    "
                                    style={{ scrollbarWidth: 'none' }}
                                >
                                    {categories.map((item) => (
                                        <button
                                            key={String(item.value)}
                                            type="button"
                                            className={clsx(`
                                              univer-h-10 univer-shrink-0 univer-appearance-none univer-rounded-xl
                                              univer-border-0 univer-px-4 univer-text-sm univer-outline-none
                                              active:univer-scale-[0.98]
                                            `, {
                                                'univer-bg-primary-100 univer-text-primary-700 dark:!univer-bg-primary-900 dark:!univer-text-primary-200': category === item.value,
                                                'univer-bg-gray-100 univer-text-gray-700 dark:!univer-bg-gray-800 dark:!univer-text-gray-200': category !== item.value,
                                            })}
                                            onClick={() => setCategory(item.value)}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className={clsx('univer-flex-1 univer-overflow-y-auto univer-px-4 univer-pb-4', scrollbarClassName)}>
                                {functions.length === 0 && (
                                    <div
                                        className="univer-py-12 univer-text-center univer-text-sm univer-text-gray-400"
                                    >
                                        {copy.empty}
                                    </div>
                                )}
                                {functions.map((item) => (
                                    <div
                                        key={item.name}
                                        className="
                                          univer-mb-2 univer-flex univer-min-h-14 univer-items-center univer-rounded-xl
                                          univer-bg-gray-50 univer-pl-4
                                          dark:!univer-bg-gray-800
                                        "
                                    >
                                        <button
                                            type="button"
                                            className="
                                              univer-min-w-0 univer-flex-1 univer-appearance-none univer-border-0
                                              univer-bg-transparent univer-py-3 univer-text-left univer-outline-none
                                              active:univer-opacity-60
                                            "
                                            onClick={() => handleInsert(item.name)}
                                        >
                                            <span
                                                className="
                                                  univer-block univer-text-sm univer-font-medium univer-text-gray-900
                                                  dark:!univer-text-gray-0
                                                "
                                            >
                                                {item.name}
                                            </span>
                                            <span
                                                className="
                                                  univer-mt-1 univer-block univer-truncate univer-text-xs
                                                  univer-text-gray-500
                                                  dark:!univer-text-gray-300
                                                "
                                            >
                                                {item.desc}
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            className="
                                              univer-h-12 univer-shrink-0 univer-appearance-none univer-border-0
                                              univer-bg-transparent univer-px-4 univer-text-sm univer-text-primary-600
                                              univer-outline-none
                                              active:univer-bg-primary-50
                                            "
                                            onClick={() => setDetails(descriptionService.getFunctionInfo(item.name) ?? null)}
                                        >
                                            {copy.details}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
            </section>
        </div>
    );
}
