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

import type { ButtonHTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { focusClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';

type ItemValue = string | number;

interface ISegmentedItem<T extends ItemValue = ItemValue> extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'id' | 'aria-controls' | 'disabled'> {
    label: ReactNode;
    value: T;
}

interface ISegmentedProps<T extends ItemValue = ItemValue> {
    items: ReadonlyArray<ISegmentedItem<T>>;
    value?: T;
    defaultValue?: T;
    onChange?: (value: T) => void;
    className?: string;
    role?: 'group' | 'tablist';
    'aria-label'?: string;
}

export function Segmented<T extends ItemValue = ItemValue>({
    items,
    value,
    defaultValue,
    onChange,
    className = '',
    role = 'group',
    'aria-label': ariaLabel,
}: ISegmentedProps<T>) {
    const { direction } = useContext(ConfigContext);
    const padding = 4;
    const [internalValue, setInternalValue] = useState(defaultValue ?? items.find((item) => !item.disabled)?.value);
    const selectedItem = value ?? internalValue;
    const itemsRef = useRef<Map<T, HTMLButtonElement>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const selectedElement = selectedItem === undefined ? undefined : itemsRef.current.get(selectedItem);
        const slider = sliderRef.current;
        const container = containerRef.current;
        if (!selectedElement || !container || !slider) {
            return;
        }
        const updateSlider = () => {
            const containerRect = container.getBoundingClientRect();
            const selectedRect = selectedElement.getBoundingClientRect();
            slider.style.width = `${selectedRect.width}px`;
            slider.style.transform = `translateX(${selectedRect.left - containerRect.left - padding}px)`;
        };
        updateSlider();
        const observer = new ResizeObserver(updateSlider);
        observer.observe(container);
        observer.observe(selectedElement);
        return () => observer.disconnect();
    }, [direction, items, padding, selectedItem]);

    const handleClick = (itemValue: T) => {
        setInternalValue(itemValue);
        onChange?.(itemValue);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, itemValue: T) => {
        if (role !== 'tablist') {
            return;
        }
        const enabledItems = items.filter((item) => !item.disabled);
        const index = enabledItems.findIndex((item) => item.value === itemValue);
        let nextIndex = index;
        const step = direction === 'rtl' ? -1 : 1;
        if (event.key === 'ArrowRight') {
            nextIndex = (index + step + enabledItems.length) % enabledItems.length;
        } else if (event.key === 'ArrowLeft') {
            nextIndex = (index - step + enabledItems.length) % enabledItems.length;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = enabledItems.length - 1;
        } else {
            return;
        }
        event.preventDefault();
        const nextItem = enabledItems[nextIndex];
        if (nextItem) {
            handleClick(nextItem.value);
            itemsRef.current.get(nextItem.value)?.focus();
        }
    };

    return (
        <div
            data-u-comp="segmented"
            role={role}
            aria-label={ariaLabel}
            dir={direction}
            ref={containerRef}
            className={clsx(`
              univer-relative univer-box-border univer-flex univer-min-w-0 univer-gap-1 univer-rounded-lg
              univer-bg-gray-100 univer-p-1
              dark:!univer-bg-gray-800
            `, className)}
        >
            <div
                className={`
                  univer-absolute univer-rounded-md univer-bg-gray-0 univer-shadow-sm univer-transition-all
                  univer-duration-200
                  dark:!univer-bg-gray-700 dark:!univer-text-gray-400
                `}
                ref={sliderRef}
                style={{ left: padding, top: padding, bottom: padding }}
            />

            {items.map((item) => (
                <button
                    key={String(item.value)}
                    id={item.id}
                    aria-controls={item['aria-controls']}
                    aria-selected={role === 'tablist' ? selectedItem === item.value : undefined}
                    aria-pressed={role === 'group' ? selectedItem === item.value : undefined}
                    role={role === 'tablist' ? 'tab' : undefined}
                    tabIndex={role === 'tablist' && selectedItem !== item.value ? -1 : 0}
                    disabled={item.disabled}
                    ref={(el) => {
                        if (el) {
                            itemsRef.current.set(item.value, el);
                        } else {
                            itemsRef.current.delete(item.value);
                        }
                    }}
                    className={clsx(`
                      univer-relative univer-box-border univer-min-w-0 univer-flex-1 univer-cursor-pointer
                      univer-truncate univer-border-none univer-bg-transparent univer-px-3 univer-py-1 univer-text-xs
                      univer-font-medium univer-transition-colors
                      disabled:univer-cursor-not-allowed disabled:univer-opacity-50
                    `, focusClassName, {
                        'univer-text-gray-900 dark:!univer-text-gray-0': selectedItem === item.value,
                        'univer-text-gray-500 hover:univer-text-gray-900 dark:!univer-text-gray-300 dark:hover:!univer-text-gray-0': selectedItem !== item.value,
                    })}
                    type="button"
                    onClick={() => handleClick(item.value)}
                    onKeyDown={(event) => handleKeyDown(event, item.value)}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
