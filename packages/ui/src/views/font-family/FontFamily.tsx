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
import type { Observable } from 'rxjs';
import type { ICustomComponentProps } from '../../services/menu/menu';
import { LocaleService } from '@univerjs/core';
import { clsx } from '@univerjs/design';

import { useMemo, useState } from 'react';
import { useDependency, useObservable } from '../../utils/di';
import { useFontList } from './use-font-list';

export interface IFontFamilyProps extends ICustomComponentProps<string> {
    className?: string;

    disabled?: boolean;

    value: string;

    disabled$?: Observable<boolean>;
}

export const FONT_FAMILY_COMPONENT = 'UI_FONT_FAMILY_COMPONENT';

export const FontFamily = ({ className, disabled: disabledProp, value, disabled$, onChange }: IFontFamilyProps) => {
    const disabledObservableValue = useObservable(disabled$);
    const disabled = Boolean(disabledProp || disabledObservableValue);

    const localeService = useDependency(LocaleService);
    const { fonts } = useFontList();

    const [draftValue, setDraftValue] = useState<string | null>(null);

    const viewValue = useMemo(() => {
        if (value == null) return '';

        const font = fonts.find((font) => {
            return font.value === value;
        });

        if (!font) {
            return localeService.t(value);
        }

        return localeService.t(font.label);
    }, [value, fonts, localeService]);
    const inputValue = draftValue ?? viewValue;

    function resetValue() {
        setDraftValue(null);
    }

    function handleChangeSelection(e: ChangeEvent<HTMLInputElement>) {
        setDraftValue(e.target.value);
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
        if (draftValue !== null && inputValue !== viewValue) resetValue();
    }

    function confirm() {
        const font = fonts.find((item) => {
            const label = localeService.t(item.label);
            return label.toLowerCase().includes(inputValue.trim().toLowerCase());
        });

        if (!font) {
            resetValue();
            return;
        }

        handleSelectFont(font.value);
    }

    function handleSelectFont(nextValue: string) {
        resetValue();
        onChange(nextValue);
    }

    return (
        <div
            className={clsx('univer-w-32 univer-truncate univer-text-sm', className)}
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
