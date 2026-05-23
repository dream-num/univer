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

export const TABLE_CONTROL_ANCHOR_HEIGHT = 28;
export const TABLE_CONTROL_ANCHOR_RADIUS = 14;
export const TABLE_CONTROL_MENU_WIDTH = 168;
export const TABLE_CONTROL_MENU_ITEM_HEIGHT = 32;
export const TABLE_CONTROL_INSERT_BUTTON_SIZE = 22;
export const TABLE_CONTROL_TOP_GAP_SIZE = 32;

export type TableControlHitType =
    | 'anchor-main'
    | 'anchor-menu-toggle'
    | 'menu-item'
    | 'insert-row'
    | 'insert-column';

export type TableControlMenuAction = 'rename' | 'update-range' | 'set-theme' | 'delete';

export interface ITableControlHitRegion {
    type: TableControlHitType;
    tableId: string;
    left: number;
    top: number;
    width: number;
    height: number;
    action?: TableControlMenuAction;
    index?: number;
}

export interface ITableControlLineSegment {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
}

export const TABLE_CONTROL_MENU_ACTIONS: TableControlMenuAction[] = ['rename', 'update-range', 'set-theme', 'delete'];

export function isPointInTableControlRegion(region: ITableControlHitRegion, x: number, y: number): boolean {
    return x >= region.left && x <= region.left + region.width && y >= region.top && y <= region.top + region.height;
}

export function hitTestTableControl(regions: ITableControlHitRegion[], x: number, y: number): ITableControlHitRegion | null {
    for (let i = regions.length - 1; i >= 0; i--) {
        if (isPointInTableControlRegion(regions[i], x, y)) {
            return regions[i];
        }
    }

    return null;
}

export function buildTableMenuRegions(tableId: string, left: number, top: number): ITableControlHitRegion[] {
    return TABLE_CONTROL_MENU_ACTIONS.map((action, index) => ({
        type: 'menu-item',
        tableId,
        action,
        left,
        top: top + index * TABLE_CONTROL_MENU_ITEM_HEIGHT,
        width: TABLE_CONTROL_MENU_WIDTH,
        height: TABLE_CONTROL_MENU_ITEM_HEIGHT,
    }));
}

export function buildCenteredPlusSegments(centerX: number, centerY: number, size: number): [ITableControlLineSegment, ITableControlLineSegment] {
    const halfSize = size / 2;

    return [
        { fromX: centerX - halfSize, fromY: centerY, toX: centerX + halfSize, toY: centerY },
        { fromX: centerX, fromY: centerY - halfSize, toX: centerX, toY: centerY + halfSize },
    ];
}
