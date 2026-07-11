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

import type { CSSProperties, ReactNode } from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
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
    const [selectedItem, setSelectedItem] = useState<T>(
        value !== undefined ? value : (defaultValue || items[0].value)
    );
    const [slideStyle, setSlideStyle] = useState({});
    const itemRefs = useRef<Map<T, HTMLButtonElement>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);

    // Update internal state when controlled value changes
    useEffect(() => {
        if (value !== undefined && value !== selectedItem) {
            setSelectedItem(value);
        }
    }, [value]);

    const updateSliderPosition = (newValue: T, oldValue?: T) => {
        const newItemElement = itemRefs.current.get(newValue);
        const oldItemElement = oldValue ? itemRefs.current.get(oldValue) : null;

        if (newItemElement && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const newRect = newItemElement.getBoundingClientRect();

            // Calculate position relative to the fixed physical-left slider origin.
            const newLeft = newRect.left - containerRect.left - SEGMENTED_PADDING;

            if (oldItemElement) {
                const oldRect = oldItemElement.getBoundingClientRect();
                const oldLeft = oldRect.left - containerRect.left - SEGMENTED_PADDING;

                setSlideStyle({
                    '--slide-from': `${oldLeft}px`,
                    '--slide-to': `${newLeft}px`,
                    left: `${SEGMENTED_PADDING}px`,
                    width: `${newRect.width}px`,
                    transform: `translateX(${newLeft}px)`,
                } as CSSProperties);
            } else {
                setSlideStyle({
                    left: `${SEGMENTED_PADDING}px`,
                    width: `${newRect.width}px`,
                    transform: `translateX(${newLeft}px)`,
                } as CSSProperties);
            }
        }
    };

    useEffect(() => {
        updateSliderPosition(selectedItem);
    }, [direction, selectedItem]);

    const handleClick = (itemValue: T) => {
        const oldValue = selectedItem;
        setSelectedItem(itemValue);
        onChange?.(itemValue);
        updateSliderPosition(itemValue, oldValue);
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
                  univer-animate-univer-slide univer-absolute univer-h-6 univer-rounded-md univer-bg-white
                  univer-shadow-sm univer-transition-all univer-duration-200
                  dark:!univer-bg-gray-700 dark:!univer-text-gray-400
                `}
                style={slideStyle}
            />

            {items.map((item) => (
                <button
                    key={String(item.value)}
                    ref={(el) => {
                        if (el) itemRefs.current.set(item.value, el);
                    }}
                    className={clsx(`
                      univer-relative univer-box-border univer-min-w-0 univer-flex-1 univer-cursor-pointer
                      univer-truncate univer-border-none univer-bg-transparent univer-px-3 univer-py-1 univer-text-xs
                      univer-font-medium univer-transition-colors
                    `, {
                        'univer-text-gray-900 dark:!univer-text-white': selectedItem === item.value,
                        'univer-text-gray-500 hover:univer-text-gray-900 dark:hover:!univer-text-white': selectedItem !== item.value,
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
