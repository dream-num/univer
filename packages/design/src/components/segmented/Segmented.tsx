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

import type { ReactNode } from 'react';
import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';

type ItemValue = string | number;
const SEGMENTED_PADDING = 4;

interface ISegmentedItem<T extends ItemValue = ItemValue> {
    label: ReactNode;
    value: T;
}

interface ISegmentedProps<T extends ItemValue = ItemValue> {
    items: ISegmentedItem<T>[];
    value?: T;
    defaultValue?: T;
    onChange?: (value: T) => void;
    className?: string;
}

export function Segmented<T extends ItemValue = ItemValue>({
    items,
    value,
    defaultValue,
    onChange,
    className = '',
}: ISegmentedProps<T>) {
    const { direction } = useContext(ConfigContext);
    const [internalValue, setInternalValue] = useState<T>(defaultValue ?? items[0].value);
    const selectedItem = value ?? internalValue;
    const itemsRef = useRef<Map<T, HTMLButtonElement>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const selectedElement = itemsRef.current.get(selectedItem);
        const slider = sliderRef.current;
        if (selectedElement && containerRef.current && slider) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const selectedRect = selectedElement.getBoundingClientRect();
            slider.style.width = `${selectedRect.width}px`;
            slider.style.transform = `translateX(${selectedRect.left - containerRect.left - SEGMENTED_PADDING}px)`;
        }
    }, [direction, items, selectedItem]);

    const handleClick = (itemValue: T) => {
        setInternalValue(itemValue);
        onChange?.(itemValue);
    };

    return (
        <div
            data-u-comp="segmented"
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
                  univer-absolute univer-h-6 univer-rounded-md univer-bg-gray-0 univer-shadow-sm univer-transition-all
                  univer-duration-200
                  dark:!univer-bg-gray-700 dark:!univer-text-gray-400
                `}
                ref={sliderRef}
                style={{ left: SEGMENTED_PADDING }}
            />

            {items.map((item) => (
                <button
                    key={String(item.value)}
                    ref={(el) => {
                        if (el) itemsRef.current.set(item.value, el);
                    }}
                    className={clsx(`
                      univer-relative univer-box-border univer-min-w-0 univer-flex-1 univer-cursor-pointer
                      univer-truncate univer-border-none univer-bg-transparent univer-px-3 univer-py-1 univer-text-xs
                      univer-font-medium univer-transition-colors
                    `, {
                        'univer-text-gray-900 dark:!univer-text-gray-0': selectedItem === item.value,
                        'univer-text-gray-500 hover:univer-text-gray-900 dark:hover:!univer-text-gray-0': selectedItem !== item.value,
                    })}
                    type="button"
                    onClick={() => handleClick(item.value)}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
