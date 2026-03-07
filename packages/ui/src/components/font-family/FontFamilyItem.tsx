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

import type { IFontConfig } from '../../services/font.service';
import { ICommandService, LocaleService } from '@univerjs/core';
import { Tooltip } from '@univerjs/design';
import { CheckMarkIcon, InfoIcon } from '@univerjs/icons';
import { useEffect, useMemo, useState } from 'react';
import { IFontService } from '../../services/font.service';
import { useDependency } from '../../utils/di';

export const FontFamilyItem = ({ id, value }: { id: string; value: string }) => {
    const commandService = useDependency(ICommandService);
    const fontService = useDependency(IFontService);

    const [fonts, setFonts] = useState<IFontConfig[]>([]);

    const _value = useMemo(() => value, [value]);

    useEffect(() => {
        const subscription = fontService.fonts$.subscribe((fonts) => {
            setFonts(fonts);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const localeService = useDependency(LocaleService);

    function handleSelectFont(value: string) {
        commandService.executeCommand(id, { value });
    }

    return (
        <ul
            className="univer-m-0 univer-list-none univer-p-0 univer-text-sm"
            style={{ fontFamily: value }}
        >
            {fonts.map((font) => (
                <li
                    key={font.value}
                    onClick={() => handleSelectFont(font.value)}
                    className={`
                      univer-flex univer-h-7 univer-cursor-pointer univer-items-center univer-justify-between
                      univer-gap-2 univer-rounded univer-px-2 univer-py-1
                      hover:univer-bg-gray-100
                      dark:!univer-text-white
                      dark:hover:!univer-bg-gray-700
                    `}
                >
                    <span>
                        {_value === font.value && (
                            <CheckMarkIcon
                                className="univer-block univer-size-4 univer-fill-current univer-text-primary-600"
                            />
                        )}
                    </span>
                    <span
                        className="univer-flex univer-items-center univer-gap-2"
                        style={{
                            fontFamily: font.value,
                        }}
                    >
                        {localeService.t(font.label)}
                        {!fontService.isFontSupported(font.value) && (
                            <Tooltip title={localeService.t('fontFamily.not-supported')}>
                                <InfoIcon
                                    className={`
                                      univer-text-gray-300
                                      dark:!univer-text-gray-400
                                    `}
                                />
                            </Tooltip>
                        )}
                    </span>
                </li>
            ))}
        </ul>
    );
};
