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

import type { IDropdownMenuProps } from '@univerjs/design';
import { Button, clsx, DropdownMenu, Input } from '@univerjs/design';
import { useEffect, useRef, useState } from 'react';
import { IconManager } from '../../common';
import { useDependency } from '../../utils/di';

export interface IZoomInputProps {
    value?: number;
    min?: number;
    max?: number;
    shortcuts: number[];
    disabled?: boolean;
    className?: string;
    onChange?: (value: number) => void;
}

export function ZoomInput(props: IZoomInputProps) {
    const iconManager = useDependency(IconManager);
    const {
        value = 100,
        min = 0,
        max = 400,
        shortcuts,
        disabled = false,
        className,
        onChange,
    } = props;
    const isEditingRef = useRef(false);
    const [listVisible, setListVisible] = useState(false);
    const [inputValue, setInputValue] = useState(() => `${value}%`);

    useEffect(() => {
        if (!isEditingRef.current) {
            setInputValue(`${value}%`);
        }
    }, [value]);

    function clampValue(value: number) {
        return Math.min(Math.max(value, min), max);
    }

    function handleSelect(value: number) {
        if (disabled) return;

        setListVisible(false);
        onChange?.(value);
    }

    function parseInput(rawValue: string) {
        const normalizedValue = rawValue.trim().replace(/%$/, '').trim();
        if (normalizedValue === '') return null;

        const parsedValue = Number(normalizedValue);
        if (!Number.isFinite(parsedValue)) return null;

        return Math.round(clampValue(parsedValue));
    }

    function handleFocus() {
        if (disabled) return;

        isEditingRef.current = true;
        setInputValue(String(value));
    }

    function commitInput() {
        if (disabled || !isEditingRef.current) return;

        const parsedValue = parseInput(inputValue);
        isEditingRef.current = false;

        if (parsedValue == null) {
            setInputValue(`${value}%`);
            return;
        }

        setInputValue(`${parsedValue}%`);
        if (parsedValue !== value) {
            onChange?.(parsedValue);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        e.stopPropagation();

        if (e.key === 'Enter') {
            e.preventDefault();
            commitInput();
            e.currentTarget.blur();
        }
    }

    const items: IDropdownMenuProps['items'] = [{
        type: 'radio',
        value: value.toString(),
        options: shortcuts.map((item) => ({ value: item.toString(), label: `${item}%` })),
        onSelect: (value: string) => handleSelect(+value),
    }];
    const MoreDownIcon = iconManager.get('MoreDownIcon');

    return (
        <div
            className={clsx(`
              univer-flex univer-h-6 univer-w-[68px] univer-flex-shrink-0 univer-items-center univer-overflow-hidden
              univer-rounded-md univer-border univer-border-gray-200 univer-bg-gray-0
              dark:!univer-border-gray-600 dark:!univer-bg-gray-800
            `, className, {
                'univer-opacity-60': disabled,
            })}
            onClick={(e) => e.stopPropagation()}
        >
            <Input
                className={`
                  univer-box-border univer-h-6 univer-min-w-0 univer-flex-1 univer-border-none univer-bg-transparent
                  [&_input:focus]:!univer-ring-0
                  [&_input]:univer-h-6 [&_input]:univer-w-full [&_input]:univer-border-none
                  [&_input]:!univer-bg-transparent [&_input]:univer-px-1 [&_input]:univer-text-center
                  [&_input]:univer-text-xs [&_input]:univer-tabular-nums
                `}
                inputClass="univer-w-full"
                size="mini"
                value={inputValue}
                disabled={disabled}
                type="text"
                onChange={setInputValue}
                onFocus={handleFocus}
                onBlur={commitInput}
                onKeyDown={handleKeyDown}
            />

            <DropdownMenu
                align="end"
                items={items}
                open={listVisible}
                disabled={disabled}
                onOpenChange={setListVisible}
            >
                <Button
                    className="univer-h-6 univer-w-4 univer-rounded-none univer-p-0"
                    size="small"
                    variant="text"
                    disabled={disabled}
                >
                    <MoreDownIcon
                        className="
                          univer-size-3 univer-text-gray-500
                          dark:!univer-text-gray-300
                        "
                    />
                </Button>
            </DropdownMenu>
        </div>
    );
}
