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

import type { IShapeProps, SpreadsheetSkeleton, UniverRenderingContext, Vector2 } from '@univerjs/engine-render';
import type { ITableControlHitRegion, TableControlMenuAction } from './table-controls-util';
import { DEFAULT_FONTFACE_PLANE, Rect, Shape } from '@univerjs/engine-render';
import {
    buildCenteredPlusSegments,
    buildTableMenuRegions,
    hitTestTableControl,
    TABLE_CONTROL_ANCHOR_HEIGHT,
    TABLE_CONTROL_ANCHOR_RADIUS,
    TABLE_CONTROL_MENU_ITEM_HEIGHT,
    TABLE_CONTROL_MENU_WIDTH,
} from './table-controls-util';

const ANCHOR_MIN_WIDTH = 122;
const ANCHOR_MAX_WIDTH = 240;
const ANCHOR_PADDING_X = 12;
const ANCHOR_TOGGLE_WIDTH = 30;
const ANCHOR_OFFSET_Y = 0;
const ANCHOR_BORDER = 'rgba(0, 0, 0, 0.22)';
const ANCHOR_DIVIDER = 'rgba(0, 0, 0, 0.20)';
const ANCHOR_TOGGLE_BG_ACTIVE = 'rgba(0, 0, 0, 0.12)';
const MENU_RADIUS = 8;
const MENU_BORDER = '#d9dee7';
const MENU_HOVER_BG = '#f1f3f4';
const INSERT_BUTTON_VISUAL_SIZE = 18;
const INSERT_BUTTON_PLUS_SIZE = 8;

export interface ITableControlRenderItem {
    tableId: string;
    tableName: string;
    range: { startRow: number; endRow: number; startColumn: number; endColumn: number };
    fill: string;
    text: string;
}

export interface ITableControlMenuLabels {
    rename: string;
    'update-range': string;
    'set-theme': string;
    delete: string;
}

export class SheetTableControlsShape extends Shape<IShapeProps> {
    private _items: ITableControlRenderItem[] = [];
    private _regions: ITableControlHitRegion[] = [];
    private _openedMenuTableId: string | null = null;
    private _hoveredRegion: ITableControlHitRegion | null = null;
    private _hoveredInsertRegion: ITableControlHitRegion | null = null;
    private _menuLabels: ITableControlMenuLabels = {
        rename: 'Rename table',
        'update-range': 'Update range',
        'set-theme': 'Set theme',
        delete: 'Remove table',
    };

    constructor(
        key: string,
        private readonly _getSkeleton: () => SpreadsheetSkeleton | null | undefined
    ) {
        super(key, {
            evented: true,
            fill: 'rgba(0, 0, 0, 0)',
            zIndex: 5001,
        });
    }

    setItems(items: ITableControlRenderItem[]): void {
        this._items = items;
        this.makeDirty(true);
    }

    setMenuLabels(labels: ITableControlMenuLabels): void {
        this._menuLabels = labels;
        this.makeDirty(true);
    }

    setOpenedMenuTableId(tableId: string | null): void {
        if (this._openedMenuTableId === tableId) {
            return;
        }

        this._openedMenuTableId = tableId;
        this.makeDirty(true);
    }

    getOpenedMenuTableId(): string | null {
        return this._openedMenuTableId;
    }

    setHoveredRegion(region: ITableControlHitRegion | null): void {
        if (this._hoveredRegion === region) {
            return;
        }

        this._hoveredRegion = region;
        this.makeDirty(true);
    }

    setHoveredInsertRegion(region: ITableControlHitRegion | null): void {
        if (this._hoveredInsertRegion === region) {
            return;
        }

        this._hoveredInsertRegion = region;
        this.makeDirty(true);
    }

    hitTest(x: number, y: number): ITableControlHitRegion | null {
        return hitTestTableControl(this._regions, x, y);
    }

    override isHit(coord: Vector2): boolean {
        return this.hitTest(coord.x, coord.y) != null;
    }

    refreshBounds(): void {
        const skeleton = this._getSkeleton();
        if (!skeleton) {
            this.hide();
            return;
        }

        this.show();
        this.transformByState({
            left: 0,
            top: 0,
            width: skeleton.rowHeaderWidth + skeleton.columnTotalWidth,
            height: skeleton.columnHeaderHeight + skeleton.rowTotalHeight,
        });
    }

    protected override _draw(ctx: UniverRenderingContext): void {
        this._regions = [];
        const skeleton = this._getSkeleton();
        if (!skeleton) {
            return;
        }

        ctx.save();
        ctx.textBaseline = 'middle';

        for (const item of this._items) {
            this._drawAnchor(ctx, skeleton, item);
        }

        if (this._hoveredInsertRegion) {
            const item = this._items.find((renderItem) => renderItem.tableId === this._hoveredInsertRegion?.tableId);
            this._drawInsertButton(ctx, this._hoveredInsertRegion, item?.fill ?? '#355bb7');
            this._regions.push(this._hoveredInsertRegion);
        }

        ctx.restore();
    }

    private _drawAnchor(ctx: UniverRenderingContext, skeleton: SpreadsheetSkeleton, item: ITableControlRenderItem): void {
        const position = skeleton.getNoMergeCellWithCoordByIndex(item.range.startRow, item.range.startColumn);
        const left = position.startX;
        const rawTop = position.startY - TABLE_CONTROL_ANCHOR_HEIGHT - ANCHOR_OFFSET_Y;
        const top = Math.max(0, rawTop);
        const width = Math.max(ANCHOR_MIN_WIDTH, Math.min(ANCHOR_MAX_WIDTH, item.tableName.length * 8.5 + ANCHOR_PADDING_X * 2 + ANCHOR_TOGGLE_WIDTH));
        const toggleRegion: ITableControlHitRegion = {
            type: 'anchor-menu-toggle',
            tableId: item.tableId,
            left: left + width - ANCHOR_TOGGLE_WIDTH,
            top,
            width: ANCHOR_TOGGLE_WIDTH,
            height: TABLE_CONTROL_ANCHOR_HEIGHT,
        };

        ctx.save();
        ctx.translateWithPrecision(left, top);
        this._drawTopRoundedRect(ctx, width, TABLE_CONTROL_ANCHOR_HEIGHT, TABLE_CONTROL_ANCHOR_RADIUS, item.fill, ANCHOR_BORDER);
        this._drawAnchorToggle(ctx, width, item.text, this._openedMenuTableId === item.tableId || this._isSameRegion(this._hoveredRegion, toggleRegion));
        ctx.font = `600 13px ${DEFAULT_FONTFACE_PLANE}`;
        ctx.fillStyle = item.text;
        ctx.textAlign = 'left';
        ctx.fillText(item.tableName, ANCHOR_PADDING_X, TABLE_CONTROL_ANCHOR_HEIGHT / 2);
        ctx.restore();

        this._regions.push({
            type: 'anchor-main',
            tableId: item.tableId,
            left,
            top,
            width,
            height: TABLE_CONTROL_ANCHOR_HEIGHT,
        });
        this._regions.push(toggleRegion);

        if (this._openedMenuTableId === item.tableId) {
            this._drawMenu(ctx, item.tableId, left, top + TABLE_CONTROL_ANCHOR_HEIGHT);
        }
    }

    private _drawAnchorToggle(ctx: UniverRenderingContext, anchorWidth: number, color: string, active: boolean): void {
        const toggleLeft = anchorWidth - ANCHOR_TOGGLE_WIDTH;
        if (active) {
            this._drawRightTopRoundedRect(ctx, toggleLeft, anchorWidth, TABLE_CONTROL_ANCHOR_HEIGHT, TABLE_CONTROL_ANCHOR_RADIUS, ANCHOR_TOGGLE_BG_ACTIVE);
        }

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = ANCHOR_DIVIDER;
        ctx.lineWidth = 1;
        ctx.moveTo(toggleLeft + 0.5, 5);
        ctx.lineTo(toggleLeft + 0.5, TABLE_CONTROL_ANCHOR_HEIGHT - 5);
        ctx.stroke();
        ctx.restore();

        const centerX = anchorWidth - ANCHOR_TOGGLE_WIDTH / 2;
        const centerY = TABLE_CONTROL_ANCHOR_HEIGHT / 2;

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.moveTo(centerX - 5, centerY - 4);
        ctx.lineTo(centerX + 5, centerY - 4);
        ctx.moveTo(centerX - 5, centerY);
        ctx.lineTo(centerX + 5, centerY);
        ctx.moveTo(centerX - 5, centerY + 4);
        ctx.lineTo(centerX + 5, centerY + 4);
        ctx.stroke();
        ctx.restore();
    }

    private _drawTopRoundedRect(ctx: UniverRenderingContext, width: number, height: number, radius: number, fill: string, stroke?: string): void {
        const r = Math.min(radius, width / 2, height);

        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, r);
        ctx.arcTo(0, 0, r, 0, r);
        ctx.lineTo(width - r, 0);
        ctx.arcTo(width, 0, width, r, r);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    private _drawRightTopRoundedRect(ctx: UniverRenderingContext, left: number, width: number, height: number, radius: number, fill: string): void {
        const r = Math.min(radius, width - left, height);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(left, height);
        ctx.lineTo(left, 0);
        ctx.lineTo(width - r, 0);
        ctx.arcTo(width, 0, width, r, r);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.restore();
    }

    private _drawMenu(ctx: UniverRenderingContext, tableId: string, left: number, top: number): void {
        const regions = buildTableMenuRegions(tableId, left, top);

        ctx.save();
        ctx.translateWithPrecision(left, top);
        Rect.drawWith(ctx, {
            width: TABLE_CONTROL_MENU_WIDTH,
            height: regions.length * TABLE_CONTROL_MENU_ITEM_HEIGHT,
            radius: MENU_RADIUS,
            fill: '#fff',
            stroke: MENU_BORDER,
        });
        ctx.restore();

        for (const region of regions) {
            const hovered = this._isSameRegion(this._hoveredRegion, region);
            if (hovered) {
                ctx.save();
                ctx.fillStyle = MENU_HOVER_BG;
                ctx.fillRectByPrecision(region.left, region.top, region.width, region.height);
                ctx.restore();
            }

            ctx.save();
            ctx.font = `12px ${DEFAULT_FONTFACE_PLANE}`;
            ctx.fillStyle = region.action === 'delete' ? '#d92d20' : '#344054';
            ctx.textAlign = 'left';
            ctx.fillText(this._menuLabels[region.action as TableControlMenuAction], region.left + 12, region.top + region.height / 2);
            ctx.restore();
        }

        this._regions.push(...regions);
    }

    private _drawInsertButton(ctx: UniverRenderingContext, region: ITableControlHitRegion, fill: string): void {
        const centerX = region.left + region.width / 2;
        const centerY = region.top + region.height / 2;
        const radius = INSERT_BUTTON_VISUAL_SIZE / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = fill;
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = fill;
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        for (const segment of buildCenteredPlusSegments(centerX, centerY, INSERT_BUTTON_PLUS_SIZE)) {
            ctx.moveTo(segment.fromX, segment.fromY);
            ctx.lineTo(segment.toX, segment.toY);
        }
        ctx.stroke();
        ctx.restore();
    }

    private _isSameRegion(a: ITableControlHitRegion | null, b: ITableControlHitRegion): boolean {
        return Boolean(a && a.type === b.type && a.tableId === b.tableId && a.action === b.action && a.index === b.index);
    }
}
