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

export interface ISheetTabLayoutItem {
    id: string;
    left: number;
    width: number;
}

export interface ISheetTabDragSortResult {
    targetIndex: number;
    itemOffsets: number[];
}

function getMidline(item: ISheetTabLayoutItem): number {
    return item.left + item.width / 2;
}

export function calculateSheetTabDragSort(
    items: ISheetTabLayoutItem[],
    activeIndex: number,
    dragOffsetX: number
): ISheetTabDragSortResult {
    const itemOffsets = items.map(() => 0);
    const activeItem = items[activeIndex];

    if (!activeItem) {
        return {
            targetIndex: activeIndex,
            itemOffsets,
        };
    }

    itemOffsets[activeIndex] = dragOffsetX;

    const activeLeft = activeItem.left + dragOffsetX;
    const activeRight = activeLeft + activeItem.width;
    let targetIndex = activeIndex;

    if (dragOffsetX > 0) {
        for (let index = activeIndex + 1; index < items.length; index++) {
            if (activeRight > getMidline(items[index])) {
                itemOffsets[index] = -activeItem.width;
                targetIndex = index;
            }
        }
    } else if (dragOffsetX < 0) {
        for (let index = activeIndex - 1; index >= 0; index--) {
            if (activeLeft < getMidline(items[index])) {
                itemOffsets[index] = activeItem.width;
                targetIndex = index;
            }
        }
    }

    return {
        targetIndex,
        itemOffsets,
    };
}

export function reorderItems<T>(items: T[], fromIndex: number, toIndex: number): T[] {
    if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= items.length ||
        toIndex >= items.length
    ) {
        return [...items];
    }

    const nextItems = [...items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);
    return nextItems;
}

export function getSheetTabTargetOrder(sheetOrder: readonly string[], visibleSheetIds: string[], targetIndex: number): number {
    return sheetOrder.indexOf(visibleSheetIds[targetIndex]);
}
