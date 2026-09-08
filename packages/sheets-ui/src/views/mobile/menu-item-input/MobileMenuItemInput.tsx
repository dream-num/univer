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
import type { IMenuItemInputProps } from '../../menu-item-input/interface';
import { LocaleService } from '@univerjs/core';
import { InputNumber } from '@univerjs/design';
import { useDependency, useObservable } from '@univerjs/ui';

export function MobileMenuItemInput(props: IMenuItemInputProps) {
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
    const disabled = useObservable(disabled$ ?? null, false);
    const inputValue = Math.min(max, Math.max(min, Number(value)));

    function handleChange(nextValue: number | null) {
        if (nextValue == null) {
            return;
        }

        onChange(nextValue.toString());
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        event.stopPropagation();
    }

    return (
        <div className="univer-flex univer-min-w-0 univer-flex-1 univer-items-center univer-gap-2">
            <span className="univer-shrink-0 univer-text-base univer-font-medium">{localeService.t(prefix)}</span>
            <div className="univer-w-20 univer-shrink-0" onClick={(event) => event.stopPropagation()}>
                <InputNumber
                    value={inputValue}
                    size="small"
                    precision={0}
                    min={min}
                    max={max}
                    disabled={disabled}
                    onKeyDown={handleKeyDown}
                    onChange={handleChange}
                />
            </div>
            <span className="univer-min-w-0 univer-truncate univer-text-base univer-font-medium">
                {localeService.t(suffix)}
            </span>
        </div>
    );
}
