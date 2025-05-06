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
import type { IOpenFilterPanelOperationParams } from '../../commands/operations/sheets-filter.operation';
import { ICommandService, IContextService, Inject, ThemeService } from '@univerjs/core';
import { Shape } from '@univerjs/engine-render';
import { FILTER_PANEL_OPENED_KEY, OpenFilterPanelOperation } from '../../commands/operations/sheets-filter.operation';
import { FilterButton } from './drawings';

export const FILTER_ICON_SIZE = 16;
export const FILTER_ICON_PADDING = 1;

export interface ISheetsFilterButtonShapeProps extends IShapeProps {
    cellWidth: number;
    cellHeight: number;
    filterParams: { col: number; unitId: string; subUnitId: string; hasCriteria: boolean };
}

/**
 * The widget to render a filter button on canvas.
 */
export class SheetsFilterButtonShape extends Shape<ISheetsFilterButtonShapeProps> {
    private _cellWidth: number = 0;
    private _cellHeight: number = 0;

    private _filterParams?: { col: number; unitId: string; subUnitId: string; hasCriteria: boolean };

    private _hovered = false;

    constructor(
        key: string,
        props: ISheetsFilterButtonShapeProps,
        @IContextService private readonly _contextService: IContextService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super(key, props);

        this.setShapeProps(props);

        // Here we need to make sure that the event is on the rectangle range.
        this.onPointerDown$.subscribeEvent((evt) => this.onPointerDown(evt));
        this.onPointerEnter$.subscribeEvent(() => this.onPointerEnter());
        this.onPointerLeave$.subscribeEvent(() => this.onPointerLeave());
    }

    setShapeProps(props: Partial<ISheetsFilterButtonShapeProps>): void {
        if (typeof props.cellHeight !== 'undefined') {
            this._cellHeight = props.cellHeight;
        }

        if (typeof props.cellWidth !== 'undefined') {
            this._cellWidth = props.cellWidth;
        }

        if (typeof props.filterParams !== 'undefined') {
            this._filterParams = props.filterParams;
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

        const { hasCriteria } = this._filterParams!;

        const fgColor = this._themeService.getColorFromTheme('primary.600');
        const bgColor = this._hovered
            ? this._themeService.getColorFromTheme('gray.50')
            : 'rgba(255, 255, 255, 1.0)';

        if (hasCriteria) {
            FilterButton.drawHasCriteria(ctx, FILTER_ICON_SIZE, fgColor, bgColor);
        } else {
            FilterButton.drawNoCriteria(ctx, FILTER_ICON_SIZE, fgColor, bgColor);
        }

        ctx.restore();
    }

    onPointerDown(evt: IPointerEvent | IMouseEvent): void {
        // Right click not trigger this event.
        if (evt.button === 2) {
            return;
        }

        const { col, unitId, subUnitId } = this._filterParams!;
        const opened = this._contextService.getContextValue(FILTER_PANEL_OPENED_KEY);
        if (opened || !this._commandService.hasCommand(OpenFilterPanelOperation.id)) {
            return;
        }

        setTimeout(() => {
            this._commandService.executeCommand(OpenFilterPanelOperation.id, {
                unitId,
                subUnitId,
                col,
            } as IOpenFilterPanelOperationParams);
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
