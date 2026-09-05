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

import type { Nullable } from '@univerjs/core';
import type { RefObject } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useEvent } from './event';

type ItemHeight<T> = (index: number, data: T) => number;

const isNumber = (value: unknown): value is number => typeof value === 'number';

export interface IVirtualListOptions<T> {
    containerTarget: RefObject<HTMLElement | null>;
    itemHeight: number | ItemHeight<T>;
    overscan?: number;
}

const useVirtualList = <T>(list: T[], options: IVirtualListOptions<T>) => {
    const { containerTarget, itemHeight, overscan = 5 } = options;

    const [size, setSize] = useState<Nullable<{ width: number; height: number }>>(null);
    const [scrollTop, setScrollTop] = useState(0);

    const getVisibleCount = useCallback((containerHeight: number, fromIndex: number) => {
        if (typeof itemHeight === 'number') {
            return Math.ceil(containerHeight / itemHeight);
        }

        let sum = 0;
        let endIndex = 0;
        for (let i = fromIndex; i < list.length; i++) {
            const height = itemHeight(i, list[i]);
            sum += height;
            endIndex = i;
            if (sum >= containerHeight) {
                break;
            }
        }
        return endIndex - fromIndex;
    }, [itemHeight, list]);

    const getOffset = useCallback((offsetTop: number) => {
        if (isNumber(itemHeight)) {
            return Math.floor(offsetTop / itemHeight);
        }
        let sum = 0;
        let offset = 0;
        for (let i = 0; i < list.length; i++) {
            const height = itemHeight(i, list[i]);
            sum += height;
            if (sum >= offsetTop) {
                offset = i;
                break;
            }
        }
        return offset + 1;
    }, [itemHeight, list]);

    const getDistanceTop = useCallback((index: number) => {
        if (typeof itemHeight === 'number') {
            const height = index * itemHeight;
            return height;
        }
        const height = list
            .slice(0, index)
            .reduce((sum, _, i) => sum + itemHeight(i, list[i]), 0);
        return height;
    }, [itemHeight, list]);

    const totalHeight = useMemo(() => getDistanceTop(list.length), [getDistanceTop, list.length]);
    const { targetList, wrapperStyle } = useMemo(() => {
        if (!size?.width || !size.height) {
            return {
                targetList: [] as { index: number; data: T }[],
                wrapperStyle: { height: undefined, marginTop: undefined },
            };
        }

        const offset = getOffset(scrollTop);
        const visibleCount = getVisibleCount(size.height, offset);
        const start = Math.max(0, offset - overscan);
        const end = Math.min(list.length, offset + visibleCount + overscan);
        const offsetTop = getDistanceTop(start);

        return {
            wrapperStyle: {
                height: `${totalHeight - offsetTop}px`,
                marginTop: `${offsetTop}px`,
            },
            targetList: list.slice(start, end).map((data, index) => ({ data, index: index + start })),
        };
    }, [getDistanceTop, getOffset, getVisibleCount, list, overscan, scrollTop, size?.height, size?.width, totalHeight]);

    useEffect(() => {
        if (containerTarget.current) {
            const getSize = () => {
                const width = containerTarget.current!.clientWidth;
                const height = containerTarget.current!.clientHeight;
                setSize((currentSize) => width === currentSize?.width && height === currentSize.height
                    ? currentSize
                    : { width, height });
            };

            getSize();
            const ob = new ResizeObserver(getSize);
            ob.observe(containerTarget.current);
            return () => {
                ob.disconnect();
            };
        }
    }, [containerTarget]);

    const scrollTo = (index: number) => {
        const container = containerTarget.current;
        if (container) {
            const nextScrollTop = getDistanceTop(index);
            container.scrollTo({ top: nextScrollTop });
            setScrollTop(nextScrollTop);
        }
    };

    return [
        targetList,
        {
            wrapperStyle,
            scrollTo: useEvent(scrollTo),
            containerProps: {
                onScroll: (e: React.UIEvent<HTMLElement, UIEvent>) => {
                    setScrollTop(e.currentTarget.scrollTop);
                },
            },
        },
    ] as const;
};

export { useVirtualList };
