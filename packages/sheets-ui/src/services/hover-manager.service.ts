/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICustomRange, IParagraph, IPosition, ISelectionCellWithMergeInfo, Nullable, Workbook } from '@univerjs/core';
import { Disposable, HorizontalAlign, IUniverInstanceService, UniverInstanceType, VerticalAlign } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { BehaviorSubject, distinctUntilChanged, Subject } from 'rxjs';
import type { IBoundRectNoAngle, IFontCacheItem } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { getHoverCellPosition } from '../common/utils';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';
import { SheetScrollManagerService } from './scroll-manager.service';
import { calculateDocSkeletonRects } from './utils/doc-skeleton-util';

export interface IHoverCellPosition {
    position: IPosition;
    location: ISheetLocation;
    /**
     * active custom range in cell, if cell is rich-text
     */
    customRange?: Nullable<ICustomRange>;
    /**
     * active bullet in cell, if cell is rich-text
     */
    bullet?: Nullable<IParagraph>;
    /**
     * rect of custom-range or bullet
     */
    rect?: Nullable<IBoundRectNoAngle>;
}

function calcPadding(cell: ISelectionCellWithMergeInfo, font: IFontCacheItem) {
    const height = font.documentSkeleton.getSkeletonData()?.pages[0].height ?? 0;
    const width = font.documentSkeleton.getSkeletonData()?.pages[0].width ?? 0;
    const vt = font.verticalAlign;
    const ht = font.horizontalAlign;

    let paddingTop = 0;
    switch (vt) {
        case VerticalAlign.UNSPECIFIED:
        case VerticalAlign.BOTTOM:
            paddingTop = cell.mergeInfo.endY - cell.mergeInfo.startY - height;
            break;
        case VerticalAlign.MIDDLE:
            paddingTop = (cell.mergeInfo.endY - cell.mergeInfo.startY - height) / 2;
            break;
        default:
            break;
    }

    let paddingLeft = 0;
    switch (ht) {
        case HorizontalAlign.RIGHT:
            paddingLeft = cell.mergeInfo.endX - cell.mergeInfo.startX - width;
            break;
        case HorizontalAlign.CENTER:
            paddingLeft = (cell.mergeInfo.endX - cell.mergeInfo.startX - width) / 2;
            break;
        default:
            break;
    }

    return {
        paddingLeft,
        paddingTop,
    };
}

export class HoverManagerService extends Disposable {
    private _currentCell$ = new BehaviorSubject<Nullable<IHoverCellPosition>>(null);
    private _currentClickedCell$ = new Subject<IHoverCellPosition>();

    // Notify when hovering over different cells
    currentCell$ = this._currentCell$.asObservable().pipe(
        distinctUntilChanged(
            (pre, aft) => (
                pre?.location?.unitId === aft?.location?.unitId
                && pre?.location?.subUnitId === aft?.location?.subUnitId
                && pre?.location?.row === aft?.location?.row
                && pre?.location?.col === aft?.location?.col
            )
        )
    );

    // Notify when hovering over different cells and different custom range or bullet
    currentCellWithDoc$ = this._currentCell$.pipe(
        distinctUntilChanged(
            // eslint-disable-next-line complexity
            (pre, aft) => (
                pre?.location?.unitId === aft?.location?.unitId
                && pre?.location?.subUnitId === aft?.location?.subUnitId
                && pre?.location?.row === aft?.location?.row
                && pre?.location?.col === aft?.location?.col
                && pre?.customRange?.rangeId === aft?.customRange?.rangeId
                && pre?.bullet?.startIndex === aft?.bullet?.startIndex
            )
        )
    );

    // Notify when mouse position changes
    currentPosition$ = this._currentCell$.asObservable();
    currentClickedCell$ = this._currentClickedCell$.asObservable();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        // TODO@weird94: any better solution here?
        this._initCellDisposableListener();
    }

    override dispose(): void {
        super.dispose();
        this._currentCell$.complete();
        this._currentClickedCell$.complete();
    }

    private _initCellDisposableListener(): void {
        this.disposeWithMe(this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            if (!workbook) this._currentCell$.next(null);
        }));
    }

    private _calcActiveCell(unitId: string, offsetX: number, offsetY: number) {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return null;
        }

        const currentRender = this._renderManagerService.getRenderById(workbook.getUnitId());
        const skeletonParam = currentRender?.with(SheetSkeletonManagerService).getWorksheetSkeleton(worksheet.getSheetId());
        const scrollManagerService = currentRender?.with(SheetScrollManagerService);
        const scrollInfo = scrollManagerService?.getCurrentScrollState();
        const skeleton = skeletonParam?.skeleton;

        if (!skeleton || !scrollInfo || !currentRender) return;

        const hoverPosition = getHoverCellPosition(currentRender, workbook, worksheet, skeletonParam, offsetX, offsetY);

        if (!hoverPosition) {
            return null;
        }

        const { location, position } = hoverPosition;

        const font = skeleton.getFont(location.row, location.col);

        let customRange: Nullable<{
            rects: IBoundRectNoAngle[];
            range: ICustomRange<Record<string, any>>;
        }> = null;
        let bullet: Nullable<{
            rect: IBoundRectNoAngle;
            paragraph: IParagraph;
        }> = null;

        const cell = skeleton.getCellByIndex(location.row, location.col);
        if (font) {
            const { paddingLeft, paddingTop } = calcPadding(cell, font);
            const rects = calculateDocSkeletonRects(font.documentSkeleton, paddingLeft, paddingTop);
            const innerX = offsetX - position.startX;
            const innerY = offsetY - position.startY;
            customRange = rects.links.find((link) => link.rects.some((rect) => rect.left <= innerX && innerX <= rect.right && (rect.top) <= innerY && innerY <= (rect.bottom)));
            bullet = rects.checkLists.find((list) => list.rect.left <= innerX && innerX <= list.rect.right && (list.rect.top) <= innerY && innerY <= (list.rect.bottom));
        }

        const rect = customRange?.rects.pop() ?? bullet?.rect;

        return {
            location,
            position,
            unitId,
            subUnitId: worksheet.getSheetId(),
            customRange: customRange?.range,
            bullet: bullet?.paragraph,
            rect: rect && {
                top: rect.top + cell.mergeInfo.startY,
                bottom: rect.bottom + cell.mergeInfo.startY,
                left: rect.left + cell.mergeInfo.startX,
                right: rect.right + cell.mergeInfo.startX,
            },
        };
    }

    triggerMouseMove(unitId: string, offsetX: number, offsetY: number) {
        const activeCell = this._calcActiveCell(unitId, offsetX, offsetY);
        this._currentCell$.next(activeCell);
    }

    triggerClick(unitId: string, offsetX: number, offsetY: number) {
        const activeCell = this._calcActiveCell(unitId, offsetX, offsetY);
        if (activeCell) {
            this._currentClickedCell$.next(activeCell);
        }
    }

    triggerScroll() {
        this._currentCell$.next(null);
    }
}
