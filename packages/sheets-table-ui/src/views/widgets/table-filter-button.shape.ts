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

import type { IMouseEvent, IPointerEvent, IShapeProps, UniverRenderingContext2D } from '@univerjs/engine-render';
import type { SheetsTableButtonStateEnum } from '@univerjs/sheets-table';
import type { IOpenTableFilterPanelOperationParams } from '../../commands/operations/open-table-filter-dialog.opration';
import { ICommandService } from '@univerjs/core';
import { Shape } from '@univerjs/engine-render';
import { OpenTableFilterPanelOperation } from '../../commands/operations/open-table-filter-dialog.opration';

export const FILTER_ICON_SIZE = 16;
export const FILTER_ICON_PADDING = 1;
const FILTER_TRIGGER_HOVER_RADIUS = 4;

export interface ISheetsTableFilterButtonShapeProps extends IShapeProps {
    cellWidth: number;
    cellHeight: number;
    iconColor: string;
    hoverBackground: string;
    hoverIconColor: string;
    filterParams: { row: number; col: number; unitId: string; subUnitId: string; buttonState: SheetsTableButtonStateEnum; tableId: string };
}

/**
 * The widget to render a filter button on canvas.
 */
export class SheetsTableFilterButtonShape extends Shape<ISheetsTableFilterButtonShapeProps> {
    private _cellWidth: number = 0;
    private _cellHeight: number = 0;

    private _filterParams?: { row: number; col: number; unitId: string; subUnitId: string; buttonState: SheetsTableButtonStateEnum; tableId: string };
    private _iconColor = '#fff';
    private _hoverBackground = 'rgba(255, 255, 255, 0.92)';
    private _hoverIconColor = '#202124';

    private _hovered = false;

    constructor(
        key: string,
        props: ISheetsTableFilterButtonShapeProps,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super(key, props);

        this.setShapeProps(props);

        // Here we need to make sure that the event is on the rectangle range.
        this.onPointerDown$.subscribeEvent((evt) => this.onPointerDown(evt));
        this.onPointerEnter$.subscribeEvent(() => this.onPointerEnter());
        this.onPointerLeave$.subscribeEvent(() => this.onPointerLeave());
    }

    setShapeProps(props: Partial<ISheetsTableFilterButtonShapeProps>): void {
        if (typeof props.cellHeight !== 'undefined') {
            this._cellHeight = props.cellHeight;
        }

        if (typeof props.cellWidth !== 'undefined') {
            this._cellWidth = props.cellWidth;
        }

        if (typeof props.filterParams !== 'undefined') {
            this._filterParams = props.filterParams;
        }

        if (typeof props.iconColor !== 'undefined') {
            this._iconColor = props.iconColor;
        }

        if (typeof props.hoverBackground !== 'undefined') {
            this._hoverBackground = props.hoverBackground;
        }

        if (typeof props.hoverIconColor !== 'undefined') {
            this._hoverIconColor = props.hoverIconColor;
        }

        this.transformByState({
            width: props.width!,
            height: props.height!,
        });
    }

    protected override _draw(ctx: UniverRenderingContext2D): void {
        const cellHeight = this._cellHeight;
        const cellWidth = this._cellWidth;

        const left = FILTER_ICON_SIZE - cellWidth;
        const top = FILTER_ICON_SIZE - cellHeight;

        ctx.save();

        const cellRegion = new Path2D();
        cellRegion.rect(left, top, cellWidth, cellHeight);
        ctx.clip(cellRegion);

        if (this._hovered) {
            ctx.save();
            ctx.fillStyle = this._hoverBackground;
            ctx.beginPath();
            ctx.roundRect?.(0, 0, FILTER_ICON_SIZE, FILTER_ICON_SIZE, FILTER_TRIGGER_HOVER_RADIUS);
            if (!ctx.roundRect) {
                ctx.rect(0, 0, FILTER_ICON_SIZE, FILTER_ICON_SIZE);
            }
            ctx.fill();
            ctx.restore();
        }

        this._drawChevron(ctx, this._hovered ? this._hoverIconColor : this._iconColor);
        ctx.restore();
    }

    private _drawChevron(ctx: UniverRenderingContext2D, color: string): void {
        const centerX = FILTER_ICON_SIZE / 2;
        const centerY = FILTER_ICON_SIZE / 2;

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(centerX - 4.5, centerY - 2.5);
        ctx.lineTo(centerX, centerY + 2);
        ctx.lineTo(centerX + 4.5, centerY - 2.5);
        ctx.stroke();
        ctx.restore();
    }

    onPointerDown(evt: IPointerEvent | IMouseEvent): void {
        // Right click not trigger this event.
        if (evt.button === 2) {
            return;
        }

        const { row, col, unitId, subUnitId, tableId } = this._filterParams!;
        if (!this._commandService.hasCommand(OpenTableFilterPanelOperation.id)) {
            return;
        }

        setTimeout(() => {
            const cmdParams: IOpenTableFilterPanelOperationParams = {
                row,
                col,
                unitId,
                subUnitId,
                tableId,
            };
            this._commandService.executeCommand(OpenTableFilterPanelOperation.id, cmdParams);
        }, 200);
    }

    onPointerEnter(): void {
        this._hovered = true;
        this.makeDirty(true);
    }

    onPointerLeave(): void {
        this._hovered = false;
        this.makeDirty(true);
    }
}
