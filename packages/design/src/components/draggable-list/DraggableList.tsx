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
import type { Layout, ReactGridLayoutProps } from 'react-grid-layout';
import { useMemo } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

export const ReactGridLayout = WidthProvider(RGL);

export interface IDraggableListProps<T> extends Omit<ReactGridLayoutProps, 'layout' | 'onLayoutChange' | 'cols' | 'isResizable'> {
    list: T[];
    onListChange: (list: T[]) => void;
    idKey: keyof T;
    itemRender: (item: T, index: number) => ReactNode;
}

export function DraggableList<T = any>(props: IDraggableListProps<T>) {
    const { list, onListChange, idKey, itemRender, ...gridProps } = props;

    const listMap = useMemo(() => {
        const listMap = new Map<unknown, T>();
        list.forEach((item: T) => {
            const key = item[idKey];
            listMap.set(key, item);
        });
        return listMap;
    }, [idKey, list]);

    const layouts: Layout[] = useMemo(() => {
        return list.map((item, index) => ({
            i: item[idKey] as string,
            w: 12,
            h: 1,
            x: 0,
            y: index,
            col: 12,
        }));
    }, [idKey, list]);

    return (
        <ReactGridLayout
            {...gridProps}
            cols={12}
            preventCollision={false}
            isResizable={false}
            isDraggable
            onLayoutChange={(layout) => {
                const newList = layout.sort((prev, aft) => prev.y - aft.y).map((item) => listMap.get(item.i)!);
                onListChange(newList);
            }}
        >
            {layouts.map((item, index) => (
                <div key={item.i} data-grid={item}>
                    {itemRender(listMap.get(item.i)!, index)}
                </div>
            ))}
        </ReactGridLayout>
    );
}
