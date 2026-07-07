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
import type { ICustomComponentProps } from '../../services/menu/menu';
import { LocaleService } from '@univerjs/core';
import { Tooltip } from '@univerjs/design';
import { InfoIcon } from '@univerjs/icons';
import { useDependency, useObservable } from '../../utils/di';
import { useFontList } from './use-font-list';

export interface IFontFamilyItemProps extends ICustomComponentProps<string> {
    value: string;
}

export const FONT_FAMILY_ITEM_COMPONENT = 'UI_FONT_FAMILY_ITEM_COMPONENT';

export const FontFamilyItem = ({ value, onChange }: IFontFamilyItemProps) => {
    const localeService = useDependency(LocaleService);
    const direction = useObservable(localeService.direction$, localeService.getDirection());
    const { fonts, fontService } = useFontList();

    function handleSelectFont(nextValue: string) {
        onChange(nextValue);
    }

    return (
        <ul
            dir={direction}
            className="univer-m-0 univer-list-none univer-p-0 univer-text-sm"
            style={{ fontFamily: value }}
        >
            {fonts.map((font) => (
                <li key={font.value}>
                    <button
                        className={`
                          univer-flex univer-h-7 univer-w-full univer-appearance-none univer-items-center
                          univer-justify-between univer-gap-6 univer-rounded univer-border-none univer-bg-transparent
                          univer-px-2
                          hover:univer-bg-gray-100
                          dark:!univer-text-white
                          dark:hover:!univer-bg-gray-700
                        `}
                        style={{
                            fontFamily: font.value,
                        }}
                        type="button"
                        onClick={() => handleSelectFont(font.value)}
                    >
                        {localeService.t(font.label)}

                        {!fontService.isFontSupported(font.value) && (
                            <Tooltip title={localeService.t<LocaleKey>('ui.fontFamily.not-supported')}>
                                <InfoIcon
                                    className={`
                                      univer-text-gray-300
                                      dark:!univer-text-gray-400
                                    `}
                                />
                            </Tooltip>
                        )}
                    </button>
                </li>
            ))}
        </ul>
    );
};
