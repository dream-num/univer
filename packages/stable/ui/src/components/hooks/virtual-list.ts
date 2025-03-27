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
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEvent } from './event';

type ItemHeight<T> = (index: number, data: T) => number;

const isNumber = (value: unknown): value is number => typeof value === 'number';

export interface IVirtualListOptions<T> {
    containerTarget: React.RefObject<HTMLElement>;
    itemHeight: number | ItemHeight<T>;
    overscan?: number;
}

function useLatest<T>(value: T) {
    const ref = useRef(value);
    ref.current = value;
    return ref;
}

// eslint-disable-next-line max-lines-per-function
const useVirtualList = <T>(list: T[], options: IVirtualListOptions<T>) => {
    const { containerTarget, itemHeight, overscan = 5 } = options;

    const itemHeightRef = useLatest(itemHeight);

    const [size, setSize] = useState<Nullable<{ width: number; height: number }>>(null);

    const scrollTriggerByScrollToFunc = useRef(false);

    const [targetList, setTargetList] = useState<{ index: number; data: T }[]>([]);

    const [wrapperStyle, setWrapperStyle] = useState<{ height: string | undefined; marginTop: string | undefined }>({ height: undefined, marginTop: undefined });

    const getVisibleCount = (containerHeight: number, fromIndex: number) => {
        if (typeof itemHeightRef.current === 'number') {
            return Math.ceil(containerHeight / itemHeightRef.current);
        }

        let sum = 0;
        let endIndex = 0;
        for (let i = fromIndex; i < list.length; i++) {
            const height = itemHeightRef.current(i, list[i]);
            sum += height;
            endIndex = i;
            if (sum >= containerHeight) {
                break;
            }
        }
        return endIndex - fromIndex;
    };

    const getOffset = (scrollTop: number) => {
        if (isNumber(itemHeightRef.current)) {
            return Math.floor(scrollTop / itemHeightRef.current);
        }
        let sum = 0;
        let offset = 0;
        for (let i = 0; i < list.length; i++) {
            const height = itemHeightRef.current(i, list[i]);
            sum += height;
            if (sum >= scrollTop) {
                offset = i;
                break;
            }
        }
        return offset + 1;
    };

  // 获取上部高度
    const getDistanceTop = (index: number) => {
        if (typeof (itemHeightRef.current) === 'number') {
            const height = index * itemHeightRef.current;
            return height;
        }
        const height = list
            .slice(0, index)
            .reduce((sum, _, i) => sum + (itemHeightRef.current as ItemHeight<T>)(i, list[i]), 0);
        return height;
    };

    const totalHeight = useMemo(() => {
        if (isNumber(itemHeightRef.current)) {
            return list.length * itemHeightRef.current;
        }
        return list.reduce(
            (sum, _, index) => sum + (itemHeightRef.current as ItemHeight<T>)(index, list[index]),
            0
        );
    }, [list]);

    const calculateRange = () => {
        const container = containerTarget.current;

        if (container) {
            const { scrollTop, clientHeight } = container;

            const offset = getOffset(scrollTop);
            const visibleCount = getVisibleCount(clientHeight, offset);

            const start = Math.max(0, offset - overscan);
            const end = Math.min(list.length, offset + visibleCount + overscan);

            const offsetTop = getDistanceTop(start);

            setWrapperStyle({
                height: `${totalHeight - offsetTop}px`,
                marginTop: `${offsetTop}px`,
            });

            setTargetList(
                list.slice(start, end).map((ele, index) => ({
                    data: ele,
                    index: index + start,
                }))
            );
        }
    };

    useEffect(() => {
        if (containerTarget.current) {
            const getSize = () => {
                const width = containerTarget.current!.clientWidth;
                const height = containerTarget.current!.clientHeight;
                if (width !== size?.width || height !== size?.height) {
                    setSize({ width, height });
                }
            };

            getSize();
            const ob = new ResizeObserver(getSize);
            ob.observe(containerTarget.current);
            return () => {
                ob.disconnect();
            };
        }
    }, []);

    useEffect(() => {
        if (!size?.width || !size?.height) {
            return;
        }
        calculateRange();
    }, [size?.width, size?.height, list]);

    const scrollTo = (index: number) => {
        const container = containerTarget.current;
        if (container) {
            scrollTriggerByScrollToFunc.current = true;
            container.scrollTop = getDistanceTop(index);
            calculateRange();
        }
    };

    return [
        targetList,
        {
            wrapperStyle,
            scrollTo: useEvent(scrollTo),
            containerProps: {
                onScroll: (e: React.UIEvent<HTMLElement, UIEvent>) => {
                    if (scrollTriggerByScrollToFunc.current) {
                        scrollTriggerByScrollToFunc.current = false;
                        return;
                    }
                    e.preventDefault();
                    calculateRange();
                },
            },
        },
    ] as const;
};

export { useVirtualList };
