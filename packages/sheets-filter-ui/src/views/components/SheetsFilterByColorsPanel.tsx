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
import { SuccessIcon } from '@univerjs/icons';
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

    return (
        <div
            data-u-comp="sheets-filter-panel-colors-container"
            className="univer-flex univer-h-full univer-min-h-[300px] univer-flex-col"
        >
            <div
                data-u-comp="sheets-filter-panel"
                className={clsx(`
                  univer-mt-2 univer-box-border univer-flex univer-h-[300px] univer-flex-grow univer-flex-col
                  univer-overflow-auto univer-rounded-md univer-px-2 univer-py-2.5
                `, borderClassName)}
            >
                {cellFillColors.length > 1 && (
                    <div>
                        <div className="univer-mb-2 univer-text-sm univer-text-gray-900">{localeService.t('sheets-filter.panel.filter-by-cell-fill-color')}</div>
                        <div
                            className={`
                              univer-grid univer-grid-cols-8 univer-items-center univer-justify-start univer-gap-2
                            `}
                        >
                            {cellFillColors.map((color, index) => (
                                <div
                                    key={`sheets-filter-bg-color-${index}`}
                                    className="univer-relative univer-h-6 univer-w-6"
                                    onClick={() => handleSelectCellFillColor(color)}
                                >
                                    {color.color === ''
                                        ? (
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                                className={`
                                                  univer-cursor-pointer univer-rounded-full
                                                  hover:univer-ring-2 hover:univer-ring-offset-2
                                                  hover:univer-ring-offset-white
                                                `}
                                            >
                                                <g>
                                                    <path
                                                        d="M12.5962 3.40382L3.4038 12.5962M1.5 8C1.5 11.5899 4.41015 14.5 8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8Z"
                                                        stroke="#333333"
                                                        strokeWidth="1"
                                                        strokeLinejoin="round"
                                                        fill="none"
                                                        vectorEffect="non-scaling-stroke"
                                                    />
                                                </g>
                                            </svg>
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

                                    {color.checked && (
                                        <SuccessIcon
                                            className={`
                                              univer-absolute -univer-bottom-0.5 -univer-right-0.5 univer-h-3 univer-w-3
                                              univer-cursor-pointer univer-text-[#418F1F]
                                            `}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
