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

import type { ByColorsModel, IFilterByColorItem } from '../../services/sheets-filter-panel.service';
import { LocaleService } from '@univerjs/core';
import { borderClassName, clsx } from '@univerjs/design';
import { AIcon, BanIcon, SuccessIcon } from '@univerjs/icons';
import { useDependency, useObservable } from '@univerjs/ui';
import { useCallback } from 'react';

/**
 * Filter by colors.
 */
export function FilterByColor(props: { model: ByColorsModel }) {
    const { model } = props;
    const localeService = useDependency(LocaleService);
    const cellFillColors = useObservable(model.cellFillColors$, [], true);
    const cellTextColors = useObservable(model.cellTextColors$, [], true);

    const handleSelectCellFillColor = useCallback((color: IFilterByColorItem) => {
        model.onFilterCheckToggled(color);
    }, [model]);

    const handleSelectCellTextColor = useCallback((color: IFilterByColorItem) => {
        model.onFilterCheckToggled(color, false);
    }, [model]);

    return (
        <div
            data-u-comp="sheets-filter-panel-colors-container"
            className="univer-flex univer-h-full univer-min-h-[300px] univer-flex-col"
        >
            <div
                data-u-comp="sheets-filter-panel"
                className={clsx(`
                  univer-mt-2 univer-box-border univer-flex univer-h-[300px] univer-flex-grow univer-flex-col
                  univer-gap-4 univer-overflow-auto univer-rounded-md univer-px-2 univer-py-2.5
                `, borderClassName)}
            >
                {cellFillColors.length > 1 && (
                    <div>
                        <div
                            className={`
                              univer-mb-2 univer-text-sm univer-text-gray-900
                              dark:!univer-text-white
                            `}
                        >
                            {localeService.t('sheets-filter.panel.filter-by-cell-fill-color')}
                        </div>
                        <div
                            className={`
                              univer-grid univer-grid-cols-8 univer-items-center univer-justify-start univer-gap-2
                            `}
                        >
                            {cellFillColors.map((color, index) => (
                                <div
                                    key={`sheets-filter-cell-fill-color-${index}`}
                                    className="univer-relative univer-h-6 univer-w-6"
                                    onClick={() => handleSelectCellFillColor(color)}
                                >
                                    {!color.color
                                        ? (
                                            <BanIcon
                                                className={`
                                                  univer-h-6 univer-w-6 univer-cursor-pointer univer-rounded-full
                                                  hover:univer-ring-2 hover:univer-ring-offset-2
                                                  hover:univer-ring-offset-white
                                                `}
                                            />
                                        )
                                        : (
                                            <button
                                                type="button"
                                                className={clsx(`
                                                  univer-box-border univer-h-6 univer-w-6 univer-cursor-pointer
                                                  univer-rounded-full univer-border univer-border-solid
                                                  univer-border-transparent univer-bg-gray-300 univer-transition-shadow
                                                  hover:univer-ring-2 hover:univer-ring-offset-2
                                                  hover:univer-ring-offset-white
                                                `)}
                                                style={{ backgroundColor: color.color }}
                                            />
                                        )}

                                    {color.checked && <CheckedIcon />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {cellTextColors.length > 1 && (
                    <div>
                        <div
                            className={`
                              univer-mb-2 univer-text-sm univer-text-gray-900
                              dark:!univer-text-white
                            `}
                        >
                            {localeService.t('sheets-filter.panel.filter-by-cell-text-color')}
                        </div>
                        <div
                            className={`
                              univer-grid univer-grid-cols-8 univer-items-center univer-justify-start univer-gap-2
                            `}
                        >
                            {cellTextColors.map((color, index) => (
                                <div
                                    key={`sheets-filter-cell-text-color-${index}`}
                                    className="univer-relative univer-h-6 univer-w-6"
                                    onClick={() => handleSelectCellTextColor(color)}
                                >
                                    <div
                                        className={`
                                          univer-box-border univer-flex univer-h-full univer-w-full
                                          univer-cursor-pointer univer-items-center univer-justify-center
                                          univer-rounded-full univer-border univer-border-solid
                                          univer-border-[rgba(13,13,13,0.06)] univer-p-0.5
                                          hover:univer-ring-2 hover:univer-ring-offset-2 hover:univer-ring-offset-white
                                          dark:!univer-border-[rgba(255,255,255,0.06)]
                                        `}
                                    >
                                        <AIcon style={{ color: color.color as string }} />
                                    </div>

                                    {color.checked && <CheckedIcon />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {cellFillColors.length <= 1 && cellTextColors.length <= 1 && (
                    <div
                        className={`
                          univer-flex univer-h-full univer-w-full univer-items-center univer-justify-center
                          univer-text-sm univer-text-gray-900
                          dark:!univer-text-gray-200
                        `}
                    >
                        {localeService.t('sheets-filter.panel.filter-by-color-none')}
                    </div>
                )}
            </div>
        </div>
    );
}

function CheckedIcon() {
    return (
        <div
            className={`
              univer-absolute -univer-bottom-0.5 -univer-right-0.5 univer-flex univer-h-3 univer-w-3
              univer-cursor-pointer univer-items-center univer-justify-center univer-rounded-full univer-bg-white
            `}
        >
            <SuccessIcon
                className="univer-h-full univer-w-full univer-font-bold univer-text-[#418F1F]"
            />
        </div>
    );
}
