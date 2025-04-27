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

import type { KeyboardEvent } from 'react';
import type { IMenuItemInputProps } from './interface';
import { LocaleService } from '@univerjs/core';
import { InputNumber } from '@univerjs/design';
import { IContextMenuService, useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';

export const MenuItemInput = (props: IMenuItemInputProps) => {
    const { prefix, suffix, value, onChange, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = props;

    const localeService = useDependency(LocaleService);
    const contextMenuService = useDependency(IContextMenuService);
    const [inputValue, setInputValue] = useState<string>(); // Initialized to an empty string

    const handleChange = (value: number | null) => {
        if (!value) {
            setInputValue(min.toString());
            return;
        }
        setInputValue(value?.toString());
    };

    useEffect(() => {
        if (!contextMenuService.visible) {
            setInputValue(value);
        }
    }, [contextMenuService.visible]);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Backspace') {
            e.stopPropagation();
        }
        if (e.key === 'Enter') {
            e.stopPropagation();
            if (inputValue) {
                onChange(inputValue);
            }
        }
    }

    return (
        <div className="univer-inline-flex univer-items-center univer-gap-1">
            {localeService.t(prefix)}
            <div className="univer-w-16" onClick={(e) => e.stopPropagation()}>
                <InputNumber
                    value={Number(inputValue)}
                    precision={0}
                    min={min}
                    max={max}
                    onKeyDown={handleKeyDown}
                    onChange={handleChange}
                />
            </div>
            {localeService.t(suffix)}
        </div>
    );
};
