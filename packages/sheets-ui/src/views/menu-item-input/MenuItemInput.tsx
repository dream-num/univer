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
import { IContextMenuService, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';

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
    const disabled = useObservable(disabled$ ?? null, false);
    const [inputValue, setInputValue] = useState<string>(); // Initialized to an empty string
    const composingRef = useRef(false);
    const compositionEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (compositionEndTimerRef.current !== null) {
            clearTimeout(compositionEndTimerRef.current);
        }
    }, []);

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

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Escape' && !event.nativeEvent.isComposing && !composingRef.current) {
            return;
        }
        event.stopPropagation();
    }

    function resetComposition() {
        if (compositionEndTimerRef.current !== null) {
            clearTimeout(compositionEndTimerRef.current);
            compositionEndTimerRef.current = null;
        }
        composingRef.current = false;
    }

    function handleCompositionStart() {
        resetComposition();
        composingRef.current = true;
    }

    function handleCompositionEnd() {
        resetComposition();
        composingRef.current = true;
        // Safari may dispatch the ending key after compositionend in the same task.
        compositionEndTimerRef.current = setTimeout(resetComposition, 0);
    }

    return (
        <div className="univer-inline-flex univer-items-center univer-gap-1">
            {localeService.t(prefix)}
            <div
                className="univer-w-16"
                onClick={(e) => e.stopPropagation()}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                onBlur={resetComposition}
            >
                <InputNumber
                    value={Number(inputValue)}
                    size="mini"
                    precision={0}
                    min={min}
                    max={max}
                    disabled={disabled}
                    onPressEnter={handlePressEnter}
                    onKeyDown={handleKeyDown}
                    onChange={handleChange}
                />
            </div>
            {localeService.t(suffix)}
        </div>
    );
};
