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

import type { CSSProperties, Key, ReactNode } from 'react';
import { useState } from 'react';

export interface IVirtualListProps<T extends object> {
    data: T[];
    itemKey: Key | ((item: T) => Key);
    children: (item: T, index: number) => ReactNode;
    height?: number;
    itemHeight?: number;
    overscan?: number;
    className?: string;
    style?: CSSProperties;
}

export function VirtualList<T extends object>(props: IVirtualListProps<T>) {
    const { data, itemKey, children, height, itemHeight, overscan = 2, className, style } = props;
    const [scrollTop, setScrollTop] = useState(0);

    if (!height || !itemHeight || itemHeight <= 0) {
        return (
            <div className={className} style={style}>
                {data.map((item, index) => {
                    const key = typeof itemKey === 'function' ? itemKey(item) : (item[itemKey as keyof T] as Key);
                    return (
                        <div key={key}>
                            {children(item, index)}
                        </div>
                    );
                })}
            </div>
        );
    }

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(height / itemHeight) + overscan * 2;
    const end = Math.min(data.length, start + visibleCount);
    const offsetY = start * itemHeight;
    const totalHeight = data.length * itemHeight;

    const visibleItems = data.slice(start, end);

    return (
        <div
            className={className}
            style={{
                ...style,
                height,
                overflowY: 'auto',
            }}
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((item, index) => {
                        const key = typeof itemKey === 'function' ? itemKey(item) : (item[itemKey as keyof T] as Key);
                        return (
                            <div key={key}>
                                {children(item, start + index)}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
