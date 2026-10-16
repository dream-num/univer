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
import type { LocaleKey } from '../../../locale/types';
import type { IMenuItemInputProps } from '../../menu-item-input/interface';
import { LocaleService } from '@univerjs/core';
import { Button, InputNumber } from '@univerjs/design';
import { useDependency, useObservable } from '@univerjs/ui';
import { useState } from 'react';

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
    const [draft, setDraft] = useState<{ source: string; value: number | null } | null>(null);
    const inputValue = draft !== null && draft.source === value
        ? draft.value
        : Math.min(max, Math.max(min, Number(value)));

    if (draft !== null && draft.source !== value) {
        setDraft(null);
    }

    function handleChange(nextValue: number | null) {
        setDraft({ source: value, value: nextValue });
    }

    function handleConfirm() {
        if (disabled || inputValue == null || !Number.isFinite(inputValue)) {
            return;
        }

        const nextValue = Math.min(max, Math.max(min, inputValue));
        setDraft({ source: value, value: nextValue });
        onChange(nextValue.toString());
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Escape' && !event.nativeEvent.isComposing) {
            return;
        }
        event.stopPropagation();
        if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault();
            handleConfirm();
        }
    }

    return (
        <div
            className="univer-flex univer-min-w-0 univer-flex-1 univer-flex-wrap univer-items-center univer-gap-2"
            onClick={(event) => event.stopPropagation()}
        >
            <span className="univer-shrink-0 univer-text-base univer-font-medium">{localeService.t(prefix)}</span>
            <div className="univer-w-20 univer-shrink-0">
                <InputNumber
                    value={inputValue}
                    size="small"
                    precision={0}
                    allowEmpty
                    disabled={disabled}
                    onKeyDown={handleKeyDown}
                    onChange={handleChange}
                />
            </div>
            <span className="univer-min-w-0 univer-truncate univer-text-base univer-font-medium">
                {localeService.t(suffix)}
            </span>
            <Button
                type="button"
                variant="primary"
                size="large"
                className="univer-shrink-0"
                disabled={disabled || inputValue == null || !Number.isFinite(inputValue)}
                onClick={handleConfirm}
            >
                {localeService.t<LocaleKey>('sheets-ui.button.confirm')}
            </Button>
        </div>
    );
}
