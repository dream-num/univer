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

import type { LocaleKey } from '../../locale/types';
import type { IPopup } from '../../services/popup/canvas-popup.service';
import type { ISymbolCategory } from './symbols';
import { LocaleService } from '@univerjs/core';
import { clsx, scrollbarClassName } from '@univerjs/design';
import { useState } from 'react';
import { useDependency, useObservable } from '../../utils/di';
import { SYMBOL_CATEGORIES } from './symbols';

export const SYMBOL_PICKER_COMPONENT = 'ui.symbol-picker';

interface ISymbolPickerPopupProps {
    activeSymbol?: string;
    onSelect?: (symbol: string, options?: { keepOpen?: boolean }) => void;
}

interface ISymbolPickerProps {
    className?: string;
    embedded?: boolean;
    onChange?: (symbol: string) => void;
    popup?: IPopup<ISymbolPickerPopupProps>;
}

export function SymbolPicker(props: ISymbolPickerProps) {
    const extraProps = props.popup?.extraProps;
    const localeService = useDependency(LocaleService);
    useObservable(localeService.currentLocale$, localeService.getCurrentLocale());
    const [activeSymbol, setActiveSymbol] = useState(extraProps?.activeSymbol);

    const handleSelect = (symbol: string) => {
        setActiveSymbol(symbol);
        props.onChange?.(symbol);
        extraProps?.onSelect?.(symbol, { keepOpen: true });
    };

    return (
        <section
            data-u-comp={SYMBOL_PICKER_COMPONENT}
            className={clsx(
                'univer-flex univer-h-[340px] univer-w-[420px] univer-flex-col univer-overflow-hidden',
                !props.embedded && `
                  univer-rounded-[10px] univer-border univer-border-solid univer-border-gray-200 univer-bg-gray-0
                  univer-shadow-lg
                  dark:!univer-border-gray-600 dark:!univer-bg-gray-900
                `,
                props.className
            )}
        >
            <div
                className={clsx(
                    'univer-min-h-0 univer-flex-1 univer-overflow-y-auto univer-p-4',
                    scrollbarClassName
                )}
            >
                <div className="univer-flex univer-flex-col univer-gap-5">
                    {SYMBOL_CATEGORIES.map((category) => (
                        <SymbolSection
                            key={category.key}
                            activeSymbol={activeSymbol}
                            category={category}
                            onSelect={handleSelect}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function SymbolSection(props: {
    activeSymbol?: string;
    category: ISymbolCategory;
    onSelect: (symbol: string) => void;
}) {
    const localeService = useDependency(LocaleService);

    return (
        <section className="univer-flex univer-flex-col univer-gap-2">
            <div
                className="
                  univer-text-sm univer-font-semibold univer-text-gray-900
                  dark:!univer-text-gray-100
                "
            >
                {localeService.t<LocaleKey>(props.category.titleKey)}
            </div>
            <div className="univer-grid univer-grid-cols-10 univer-gap-1">
                {props.category.symbols.map((symbol, index) => {
                    const active = props.activeSymbol === symbol;

                    return (
                        <button
                            key={`${props.category.key}-${symbol}-${index}`}
                            type="button"
                            aria-label={symbol}
                            aria-pressed={active}
                            title={symbol}
                            className={clsx(
                                `
                                  univer-flex univer-size-8 univer-cursor-pointer univer-items-center
                                  univer-justify-center univer-rounded-lg univer-border-0 univer-bg-transparent
                                  univer-p-0 univer-text-lg univer-text-gray-900
                                  dark:!univer-text-gray-100
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
                            onClick={() => props.onSelect(symbol)}
                        >
                            {symbol}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
