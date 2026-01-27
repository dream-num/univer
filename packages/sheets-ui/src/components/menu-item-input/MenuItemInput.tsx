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

import type { IMenuItemInputProps } from './interface';
import { LocaleService } from '@univerjs/core';
import { InputNumber } from '@univerjs/design';
import { IContextMenuService, useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';

export const MenuItemInput = (props: IMenuItemInputProps) => {
    const {
        prefix,
        suffix,
        value,
        min = Number.MIN_SAFE_INTEGER,
        max = Number.MAX_SAFE_INTEGER,
        disabled$,
        onChange,
    } = props;

    const localeService = useDependency(LocaleService);
    const contextMenuService = useDependency(IContextMenuService);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>(); // Initialized to an empty string

    const handleChange = (value: number | null) => {
        if (!value) {
            setInputValue(min.toString());
            return;
        }

        const inputValue = value.toString();
        setInputValue(inputValue);
        onChange(inputValue);
    };

    useEffect(() => {
        if (!disabled$) {
            return;
        }
        const subscription = disabled$.subscribe((value) => {
            setDisabled(value);
        });
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!contextMenuService.visible) {
            setInputValue(value);
        }
    }, [contextMenuService.visible]);

    useEffect(() => {
        if (+value < min) {
            setInputValue(min.toString());
        } else if (+value > max) {
            setInputValue(max.toString());
        } else {
            setInputValue(value);
        }
    }, [value]);

    function handlePressEnter() {
        if (inputValue) {
            onChange(inputValue);
        }
    }

    return (
        <div className="univer-inline-flex univer-items-center univer-gap-1">
            {localeService.t(prefix)}
            <div className="univer-w-16" onClick={(e) => e.stopPropagation()}>
                <InputNumber
                    disabled={disabled}
                    max={max}
                    min={min}
                    precision={0}
                    size="mini"
                    value={Number(inputValue)}
                    onChange={handleChange}
                    onPressEnter={handlePressEnter}
                />
            </div>
            {localeService.t(suffix)}
        </div>
    );
};
