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

import type { ChangeEvent, KeyboardEvent } from 'react';
import type { IFontConfig } from '../../services/font.service';
import type { IFontFamilyProps } from './interface';
import { ICommandService, LocaleService } from '@univerjs/core';

import { useEffect, useMemo, useState } from 'react';
import { IFontService } from '../../services/font.service';
import { useDependency, useObservable } from '../../utils/di';

export const FontFamily = ({ id, value, disabled$ }: IFontFamilyProps) => {
    const disabled = useObservable(disabled$);

    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const fontService = useDependency(IFontService);

    const [inputValue, setInputValue] = useState('');
    const [fonts, setFonts] = useState<IFontConfig[]>([]);

    useEffect(() => {
        const subscription = fontService.fonts$.subscribe((fonts) => {
            setFonts(fonts);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const viewValue = useMemo(() => {
        if (value == null) return '';
        let fontFamily = localeService.t(`fontFamily.${(`${value ?? ''}`).replace(/\s/g, '')}`);

        // Handle font family from copy paste.
        if (fontFamily.startsWith('fontFamily.') && typeof value === 'string') {
            fontFamily = value.split(',')[0];
        }

        return fontFamily;
    }, [value]);

    useMemo(() => {
        setInputValue(viewValue);
    }, [value]);

    function resetValue() {
        setInputValue(value);
    }

    function handleChangeSelection(e: ChangeEvent<HTMLInputElement>) {
        setInputValue(e.target.value);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        e.stopPropagation();

        if (disabled) return;

        if (e.key === 'Enter') {
            confirm();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            resetValue();
        }
    }

    function handleBlur() {
        if (inputValue !== value) resetValue();
    }

    function confirm() {
        if (inputValue.toLowerCase() === value.toLowerCase()) {
            resetValue();
            return;
        }

        const font = fonts.find((item) => item.value.toLowerCase() === inputValue.trim().toLowerCase());

        if (!font) {
            resetValue();
            return;
        };

        handleSelectFont(font.value);
    }

    function handleSelectFont(value: string) {
        commandService.executeCommand(id, { value });
    }

    return (
        <div
            className="univer-w-32 univer-truncate univer-text-sm"
            style={{ fontFamily: value as string }}
        >
            <input
                className={`
                  univer-block univer-h-6 univer-border-none univer-bg-transparent univer-leading-6
                  focus:univer-outline-none
                  dark:!univer-text-white
                  [&_input:focus]:!univer-ring-0
                  [&_input]:univer-h-6 [&_input]:univer-w-7 [&_input]:univer-border-none
                  [&_input]:!univer-bg-transparent [&_input]:univer-p-0 [&_input]:univer-text-sm
                `}
                type="text"
                value={inputValue}
                onChange={handleChangeSelection}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                disabled={disabled}
            />
        </div>
    );
};
