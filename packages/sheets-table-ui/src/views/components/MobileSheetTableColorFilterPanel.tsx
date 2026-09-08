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
import type { ITableFilterColorItem, ITableFilterColorList } from '../../types';
import { LocaleService } from '@univerjs/core';
import { clsx, resetButtonClassName } from '@univerjs/design';
import { AIcon, BanIcon, CheckMarkIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';

interface IMobileSheetTableColorFilterPanelProps {
    colors: ITableFilterColorList;
    onChange: (colors: ITableFilterColorList) => void;
}

function MobileColorOption(props: {
    item: ITableFilterColorItem;
    label: string;
    textColor?: boolean;
    onClick: () => void;
}) {
    const { item, label, textColor = false, onClick } = props;
    return (
        <button
            type="button"
            aria-label={item.color ?? label}
            aria-pressed={item.checked}
            className={clsx(resetButtonClassName, `
              univer-relative univer-flex univer-size-12 univer-items-center univer-justify-center univer-rounded-full
              univer-border univer-border-solid univer-border-gray-200 univer-bg-gray-0
              dark:!univer-border-gray-600 dark:!univer-bg-gray-800
            `)}
            style={!textColor && item.color ? { backgroundColor: item.color } : undefined}
            onClick={onClick}
        >
            {!item.color && <BanIcon className="univer-size-7" />}
            {textColor && item.color && <AIcon className="univer-size-7" style={{ color: item.color }} />}
            {item.checked && (
                <span
                    className="
                      univer-absolute -univer-bottom-1 -univer-right-1 univer-flex univer-size-5 univer-items-center
                      univer-justify-center univer-rounded-full univer-bg-primary-600 univer-text-gray-0
                    "
                >
                    <CheckMarkIcon className="univer-size-3" />
                </span>
            )}
        </button>
    );
}

export function MobileSheetTableColorFilterPanel(props: IMobileSheetTableColorFilterPanelProps) {
    const { colors, onChange } = props;
    const localeService = useDependency(LocaleService);
    const fillLabel = localeService.t<LocaleKey>('sheets-table-ui.filter.filter-by-cell-fill-color');
    const textLabel = localeService.t<LocaleKey>('sheets-table-ui.filter.filter-by-cell-text-color');
    const hasMultipleColors = colors.cellFillColors.length > 1 || colors.cellTextColors.length > 1;

    function toggleColor(item: ITableFilterColorItem, fillColor: boolean) {
        const key = fillColor ? 'cellFillColors' : 'cellTextColors';
        const otherKey = fillColor ? 'cellTextColors' : 'cellFillColors';
        onChange({
            ...colors,
            [key]: colors[key].map((color) => color.color === item.color
                ? { ...color, checked: !color.checked }
                : color),
            [otherKey]: colors[otherKey].map((color) => ({ ...color, checked: false })),
        });
    }

    return (
        <div data-u-comp="mobile-sheet-table-filter-by-colors" className="univer-grid univer-gap-6">
            {colors.cellFillColors.length > 1 && (
                <section>
                    <h3 className="univer-m-0 univer-mb-4 univer-text-base univer-font-medium">{fillLabel}</h3>
                    <div className="univer-flex univer-flex-wrap univer-gap-4">
                        {colors.cellFillColors.map((item) => (
                            <MobileColorOption
                                key={item.color ?? 'none'}
                                item={item}
                                label={fillLabel}
                                onClick={() => toggleColor(item, true)}
                            />
                        ))}
                    </div>
                </section>
            )}
            {colors.cellTextColors.length > 1 && (
                <section>
                    <h3 className="univer-m-0 univer-mb-4 univer-text-base univer-font-medium">{textLabel}</h3>
                    <div className="univer-flex univer-flex-wrap univer-gap-4">
                        {colors.cellTextColors.map((item) => (
                            <MobileColorOption
                                key={item.color ?? 'none'}
                                item={item}
                                label={textLabel}
                                textColor
                                onClick={() => toggleColor(item, false)}
                            />
                        ))}
                    </div>
                </section>
            )}
            {!hasMultipleColors && (
                <div
                    className="
                      univer-flex univer-min-h-40 univer-items-center univer-justify-center univer-text-gray-500
                    "
                >
                    {localeService.t<LocaleKey>('sheets-table-ui.filter.filter-by-color-none')}
                </div>
            )}
        </div>
    );
}
