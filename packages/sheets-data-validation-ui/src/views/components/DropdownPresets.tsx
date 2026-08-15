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

import type { ICustomComponentProps } from '@univerjs/ui';
import type { LocaleKey } from '../../locale/types';
import { LocaleService } from '@univerjs/core';
import { Separator } from '@univerjs/design';
import { serializeListOptions } from '@univerjs/sheets';
import { useDependency } from '@univerjs/ui';

export const DROPDOWN_PRESETS_COMPONENT = 'SHEETS_DATA_VALIDATION_DROPDOWN_PRESETS';

export function DropdownPresets({ onChange }: ICustomComponentProps<string | undefined>) {
    const localeService = useDependency(LocaleService);
    const presets = [
        [
            localeService.t<LocaleKey>('sheets-data-validation-ui.ribbon.presets.yes'),
            localeService.t<LocaleKey>('sheets-data-validation-ui.ribbon.presets.no'),
        ],
        [
            localeService.t<LocaleKey>('sheets-data-validation-ui.ribbon.presets.notStarted'),
            localeService.t<LocaleKey>('sheets-data-validation-ui.ribbon.presets.inProgress'),
            localeService.t<LocaleKey>('sheets-data-validation-ui.ribbon.presets.completed'),
        ],
        ['A', 'B', 'C'],
    ];

    return (
        <div className="univer-box-border univer-w-[360px]">
            <div className="univer-px-2 univer-text-sm univer-font-semibold">
                {localeService.t<LocaleKey>('sheets-data-validation-ui.ribbon.dropdownPresetTitle')}
            </div>

            <div className="univer-mt-2 univer-grid univer-grid-cols-3 univer-gap-1.5">
                {presets.map((values) => (
                    <button
                        key={values.join('\0')}
                        type="button"
                        aria-label={values.join(' / ')}
                        className={`
                          univer-flex univer-min-h-20 univer-cursor-pointer univer-flex-col univer-items-start
                          univer-gap-1.5 univer-rounded-md univer-border-0 univer-bg-gray-50 univer-p-3 univer-text-left
                          univer-text-sm univer-leading-5 univer-text-gray-900 univer-transition-colors
                          hover:univer-bg-gray-100
                          focus-visible:univer-outline-none focus-visible:univer-ring-2
                          focus-visible:univer-ring-primary-600 focus-visible:univer-ring-offset-0
                          dark:!univer-bg-gray-800 dark:!univer-text-gray-0
                          dark:hover:!univer-bg-gray-700
                        `}
                        onClick={() => onChange(serializeListOptions(values))}
                    >
                        {values.map((value) => <span key={value} className="univer-w-full univer-break-words">{value}</span>)}
                    </button>
                ))}
            </div>

            <Separator className="univer-mt-2" />
        </div>
    );
}
