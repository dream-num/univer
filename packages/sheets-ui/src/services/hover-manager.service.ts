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

import type { ICustomRange, IParagraph, IPosition, Nullable, Workbook } from '@univerjs/core';
import type { IBoundRectNoAngle, IMouseEvent, IPointerEvent, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISheetLocation, ISheetLocationBase } from '@univerjs/sheets';
import { Disposable, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { BehaviorSubject, distinctUntilChanged, map, Subject } from 'rxjs';
import { getHoverCellPosition } from '../common/utils';
import { SheetScrollManagerService } from './scroll-manager.service';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';
import { calcPadding, calculateDocSkeletonRects } from './utils/doc-skeleton-util';

export interface IHoverCellPosition {
    position: IPosition;
    /**
     * location of cell
     */
    location: ISheetLocationBase;
}

export interface ICellWithEvent extends IHoverCellPosition {
    event: IMouseEvent | IPointerEvent;
}

export interface ICellPosWithEvent extends ISheetLocationBase {
    event: IMouseEvent | IPointerEvent;
}

export interface IHoverRichTextInfo extends IHoverCellPosition {
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

    drawing?: Nullable<string>;
}

export interface IHoverRichTextPosition extends ISheetLocationBase {
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

    drawing?: Nullable<string>;

    event?: IMouseEvent | IPointerEvent;
}

export function getLocationBase(location: ISheetLocation) {
    const { workbook, worksheet, ...locBase } = location;
    return locBase;
}

export class HoverManagerService extends Disposable {
    private _currentCell$ = new BehaviorSubject<Nullable<IHoverCellPosition>>(null);
    private _currentRichText$ = new BehaviorSubject<Nullable<IHoverRichTextInfo>>(null);
    private _currentClickedCell$ = new Subject<IHoverRichTextInfo>();

    private _currentCellWithEvent$ = new Subject<Nullable<ICellWithEvent>>();
    private _currentPointerDownCell$ = new Subject<ICellPosWithEvent>();
    private _currentPointerUpCell$ = new Subject<ICellPosWithEvent>();

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
    currentRichText$ = this._currentRichText$.pipe(
        distinctUntilChanged(
            // eslint-disable-next-line complexity
            (pre, aft) => (
                pre?.location?.unitId === aft?.location?.unitId
                && pre?.location?.subUnitId === aft?.location?.subUnitId
                && pre?.location?.row === aft?.location?.row
                && pre?.location?.col === aft?.location?.col
                && pre?.customRange?.rangeId === aft?.customRange?.rangeId
                && pre?.bullet?.startIndex === aft?.bullet?.startIndex
                && pre?.customRange?.startIndex === aft?.customRange?.startIndex
                && pre?.customRange?.endIndex === aft?.customRange?.endIndex
                && pre?.drawing === aft?.drawing
            )
        ),
        map((cell) => cell && {
            unitId: cell.location.unitId,
            subUnitId: cell.location.subUnitId,
            row: cell.location.row,
            col: cell.location.col,
            customRange: cell.customRange,
            bullet: cell.bullet,
            rect: cell.rect,
            drawing: cell.drawing,
        } as IHoverRichTextPosition)
    );

    /**
     * Nearly same as currentRichText$, but with event
     */
    currentCellPosWithEvent$ = this._currentCellWithEvent$.pipe(
        distinctUntilChanged(

            (pre, aft) => (
                pre?.location?.unitId === aft?.location?.unitId
                && pre?.location?.subUnitId === aft?.location?.subUnitId
                && pre?.location?.row === aft?.location?.row
                && pre?.location?.col === aft?.location?.col
            )
        ),
        map((cell) => cell && {
            unitId: cell.location.unitId,
            subUnitId: cell.location.subUnitId,
            row: cell.location.row,
            col: cell.location.col,
            event: cell.event,
        } as ICellPosWithEvent)
    );

    // Notify when mouse position changes
    currentPosition$ = this._currentCell$.asObservable();
    currentClickedCell$ = this._currentClickedCell$.asObservable();
    currentPointerDownCell$ = this._currentPointerDownCell$.asObservable();
    currentPointerUpCell$ = this._currentPointerUpCell$.asObservable();

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
        this._currentPointerDownCell$.complete();
        this._currentPointerUpCell$.complete();
        this._currentCellWithEvent$.complete();
    }

    private _initCellDisposableListener(): void {
        this.disposeWithMe(this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            if (!workbook) this._currentCell$.next(null);
        }));

        this.disposeWithMe(this._univerInstanceService.unitDisposed$.subscribe((unit) => {
            if (this._currentCell$.getValue()?.location.unitId === unit.getUnitId()) {
                this._currentCell$.next(null);
            }

            if (this._currentRichText$.getValue()?.location.unitId === unit.getUnitId()) {
                this._currentRichText$.next(null);
            }
        }));
    }

    // eslint-disable-next-line complexity
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
        if (!currentRender) return null;
        const skeletonParam = currentRender.with(SheetSkeletonManagerService).getSkeletonParam(worksheet.getSheetId());
        if (!skeletonParam) return null;

        const scrollManagerService = currentRender.with(SheetScrollManagerService);
        const scrollInfo = scrollManagerService?.getCurrentScrollState();
        const skeleton = skeletonParam?.skeleton as SpreadsheetSkeleton;

        if (!skeleton || !scrollInfo || !currentRender) return;

        const hoverPosition = getHoverCellPosition(currentRender, workbook, worksheet, skeletonParam, offsetX, offsetY);

        if (!hoverPosition) {
            return null;
        }

        const { position, overflowLocation, location } = hoverPosition;

        const font = skeleton.getFont(overflowLocation.row, overflowLocation.col);
        let customRange: Nullable<{
            rects: IBoundRectNoAngle[];
            range: ICustomRange<Record<string, any>>;
        }> = null;
        let bullet: Nullable<{
            rect: IBoundRectNoAngle;
            paragraph: IParagraph;
        }> = null;
        let drawing: Nullable<{
            rect: IBoundRectNoAngle;
            drawingId: string;
        }> = null;

        const cell = skeleton.getCellWithCoordByIndex(overflowLocation.row, overflowLocation.col);
        const cellData = worksheet.getCell(overflowLocation.row, overflowLocation.col);
        const { topOffset = 0, leftOffset = 0 } = cellData?.fontRenderExtension ?? {};
        if (font) {
            const { paddingLeft, paddingTop } = calcPadding(cell, font, (cellData?.v !== null && cellData?.v !== undefined) ? !Number.isNaN(+cellData.v) : false);
            const rects = calculateDocSkeletonRects(font.documentSkeleton, paddingLeft, paddingTop);

            const innerX = offsetX - position.startX - leftOffset;
            const innerY = offsetY - position.startY - topOffset;
            customRange = rects.links.find((link) => link.rects.some((rect) => rect.left <= innerX && innerX <= rect.right && (rect.top) <= innerY && innerY <= (rect.bottom)));
            bullet = rects.checkLists.find((list) => list.rect.left <= innerX && innerX <= list.rect.right && (list.rect.top) <= innerY && innerY <= (list.rect.bottom));
            drawing = rects.drawings.find((drawing) => drawing.rect.left <= innerX && innerX <= drawing.rect.right && (drawing.rect.top) <= innerY && innerY <= (drawing.rect.bottom));
        }

        const rect = customRange?.rects.pop() ?? bullet?.rect ?? drawing?.rect;
        return {
            location,
            position,
            overflowLocation,
            customRange: customRange?.range,
            bullet: bullet?.paragraph,
            drawing: drawing?.drawingId,
            rect: rect && {
                top: rect.top + cell.mergeInfo.startY + topOffset,
                bottom: rect.bottom + cell.mergeInfo.startY + topOffset,
                left: rect.left + cell.mergeInfo.startX + leftOffset,
                right: rect.right + cell.mergeInfo.startX + leftOffset,
            },
        };
    }

    triggerPointerDown(unitId: string, event: IPointerEvent | IMouseEvent) {
        const activeCell = this._calcActiveCell(unitId, event.offsetX, event.offsetY);
        if (activeCell && activeCell.location) {
            const { unitId, subUnitId, row, col } = getLocationBase(activeCell.location);
            this._currentPointerDownCell$.next({
                unitId, subUnitId, row, col,
                event,
            });
        }
    }

    triggerPointerUp(unitId: string, event: IPointerEvent | IMouseEvent) {
        const activeCell = this._calcActiveCell(unitId, event.offsetX, event.offsetY);
        if (activeCell) {
            const location = getLocationBase(activeCell.location);
            this._currentPointerUpCell$.next({
                ...location,
                event,
            });
        }
    }

    triggerMouseMove(unitId: string, event: IPointerEvent | IMouseEvent) {
        const activeCell = this._calcActiveCell(unitId, event.offsetX, event.offsetY);
        this._currentCell$.next(activeCell && {
            location: getLocationBase(activeCell.location),
            position: activeCell.position,
        });

        this._currentRichText$.next(activeCell && {
            ...activeCell,
            location: getLocationBase(activeCell.overflowLocation),
        });

        this._currentCellWithEvent$.next(activeCell && {
            ...activeCell,
            location: getLocationBase(activeCell.location),
            event,
        });
    }

    triggerClick(unitId: string, offsetX: number, offsetY: number) {
        const activeCell = this._calcActiveCell(unitId, offsetX, offsetY);
        if (activeCell) {
            this._currentClickedCell$.next({
                ...activeCell,
                location: getLocationBase(activeCell.location),
            });
        }
    }

    triggerScroll() {
        this._currentCell$.next(null);
    }
}
