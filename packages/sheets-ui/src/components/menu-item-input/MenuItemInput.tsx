/**
 * Copyright 2023-present DreamNum Inc.
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

import { LocaleService, useDependency } from '@univerjs/core';
import { InputNumber } from '@univerjs/design';
import { IContextMenuService } from '@univerjs/ui';

import React, { useEffect, useState } from 'react';
import styles from './index.module.less';
import type { IMenuItemInputProps } from './interface';

export const MenuItemInput = (props: IMenuItemInputProps) => {
    const { prefix, suffix, value, onChange, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = props;

    const localeService = useDependency(LocaleService);
    const contextMenuService = useDependency(IContextMenuService);
    const [inputValue, setInputValue] = useState<string>(); // Initialized to an empty string

    const handleChange = (value: number | null) => {
        setInputValue(value?.toString());
        onChange(value?.toString() ?? '');
    };

    useEffect(() => {
        if (!contextMenuService.visible) {
            setInputValue(value);
        }
    }, [contextMenuService.visible]);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Backspace') {
            e.stopPropagation();
        }
    }

    return (
        <div className={styles.sheetsUiContextMenuInput}>
            {localeService.t(prefix)}
            <span className={styles.sheetsUiContextMenuInputContainer} onClick={(e) => e.stopPropagation()}>
                <InputNumber
                    className={styles.sheetsUiContextMenuInputNumber}
                    value={Number(inputValue)}
                    precision={0}
                    onKeyDown={handleKeyDown}
                    onChange={handleChange}
                    min={min}
                    max={max}
                />
            </span>
            {localeService.t(suffix)}
        </div>
    );
};
