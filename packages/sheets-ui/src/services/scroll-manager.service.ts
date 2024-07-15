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

import type { Nullable, Workbook } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Inject } from '@univerjs/core';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export interface IScrollManagerParam {
    /**
     * offsetX from startRow, coordinate same as viewport, not scrollbar
     */
    offsetX: number;
    /**
     * offsetY from startColumn, coordinate same as viewport, not scrollbar
     */
    offsetY: number;
    /**
     * currrent start row in viewport visible area
     */
    sheetViewStartRow: number;
    /**
     * current start column in viewport visible area
     */
    sheetViewStartColumn: number;
}

export interface IViewportScrollState extends IScrollManagerParam {
    scrollX: number;
    scrollY: number;
    viewportScrollX: number;
    viewportScrollY: number;
}

export interface IScrollManagerSearchParam {
    unitId: string;
    sheetId: string;
}

export interface IScrollManagerWithSearchParam extends IScrollManagerSearchParam, IScrollManagerParam { }

export type IScrollInfo = Map<string, Map<string, IScrollManagerParam>>;

/**
 * This service manages and sets the virtual scrolling of the canvas content area.
 * It triggers service changes through SetScrollOperation.
 *
 * ScrollController subscribes to the changes in service data to refresh the view scrolling.
 */
export class SheetScrollManagerService implements IRenderModule {
    /**
     * a map holds all scroll info for each sheet
     */
    private readonly _scrollInfoMap: IScrollInfo = new Map();
    /**
     * a subject for current sheet scrollInfo
     */
    private readonly _scrollInfo$ = new BehaviorSubject<Nullable<IScrollManagerParam>>(null);
    /**
     * a subject for current sheet scrollInfo ( events, ex wheel event and point events add deltaXY to rawScrollInfo$)
     */
    readonly rawScrollInfo$ = this._scrollInfo$.asObservable();
    /**
     * a subject for current valid scrollInfo, viewport@_scrollCore would limit rawScrollInfo$ exclude negative value or over max value.
     * use this subject not rawScrollInfo$ when get scrolling state of viewport.
     * The value of this subject is the same as the value of onScrollAfter$
     *
     */
    readonly validViewportScrollInfo$ = new BehaviorSubject<Nullable<IViewportScrollState>>(null);
    /**
     * a subject for current valid scrollInfo, viewport@_scrollCore would limit rawScrollInfo$ exclude negative value or over max value.
     * use this subject not rawScrollInfo$ when get scrolling state of viewport.
     */

    private _searchParamForScroll: Nullable<IScrollManagerSearchParam> = null;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        // empty
    }

    dispose(): void {
        this._scrollInfo$.complete();
    }

    setSearchParam(param: IScrollManagerSearchParam) {
        this._searchParamForScroll = param;
    }

    setSearchParamAndRefresh(param: IScrollManagerSearchParam) {
        this._searchParamForScroll = param;
        this._scrollInfoNext(param);
    }

    getScrollInfoByParam(param: IScrollManagerSearchParam): Readonly<Nullable<IScrollManagerParam>> {
        return this._getCurrentScroll(param);
    }

    getCurrentScrollInfo(): Readonly<Nullable<IScrollManagerParam>> {
        return this._getCurrentScroll(this._searchParamForScroll);
    }

    /**
     * set scrollInfo by cmd, call by scroll operation
     * @param param
     */
    setScrollInfoAndEmitEvent(param: IScrollManagerWithSearchParam) {
        this._setScrollInfo(param);
        this._scrollInfoNext(param);
    }

    /**
     * call by set frozen
     * @param scrollInfo
     */
    setScrollInfoToCurrSheetAndEmitEvent(scrollInfo: IScrollManagerParam) {
        if (this._searchParamForScroll == null) {
            return;
        }

        this._setScrollInfo({
            ...this._searchParamForScroll,
            ...scrollInfo,
        });
        this._scrollInfoNext(this._searchParamForScroll);
    }

    /**
     * call _setScrollInfo but no _scrollInfo$.next
     * @param scroll
     */
    setScrollInfoToCurrSheet(scroll: IScrollManagerParam) {
        if (this._searchParamForScroll == null) {
            return;
        }

        this._setScrollInfo({
            ...this._searchParamForScroll,
            ...scroll,
        });
    }

    clear(): void {
        if (this._searchParamForScroll == null) {
            return;
        }
        this._clearByParamAndNotify(this._searchParamForScroll);
    }

    calcViewportScrollFromRowColOffset(scrollInfo: Nullable<IViewportScrollState>) {
        if (!scrollInfo) {
            return {
                viewportScrollX: 0,
                viewportScrollY: 0,
            };
        }

        let { sheetViewStartColumn, sheetViewStartRow, offsetX, offsetY } = scrollInfo;
        sheetViewStartRow = sheetViewStartRow || 0;
        offsetY = offsetY || 0;

        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        const rowAcc = skeleton?.rowHeightAccumulation[sheetViewStartRow - 1] || 0;
        const colAcc = skeleton?.columnWidthAccumulation[sheetViewStartColumn - 1] || 0;
        const viewportScrollX = colAcc + offsetX;
        const viewportScrollY = rowAcc + offsetY;

        return {
            viewportScrollX,
            viewportScrollY,
        };
    }

    private _setScrollInfo(scrollInfo: IScrollManagerWithSearchParam): void {
        const { unitId, sheetId, sheetViewStartColumn, sheetViewStartRow, offsetX, offsetY } = scrollInfo;

        if (!this._scrollInfoMap.has(unitId)) {
            this._scrollInfoMap.set(unitId, new Map());
        }

        const worksheetScrollInfoMap = this._scrollInfoMap.get(unitId)!;
        // const overallOffsetByRowColOffset = this.calcViewportScrollFromRowColOffset(scrollInfo);
        const newScrollInfo: IScrollManagerParam = {
            sheetViewStartRow,
            sheetViewStartColumn,
            offsetX,
            offsetY,
            // viewportScrollX: overallOffsetByRowColOffset.overallScrollX,
            // viewportScrollY: overallOffsetByRowColOffset.overallScrollY,
        };
        // console.log('newScrollInfo', newScrollInfo);
        worksheetScrollInfoMap.set(sheetId, newScrollInfo);
        // if (notifyScrollInfo === true) {
        //     this._notifyCurrentScrollInfo({ unitId, sheetId });
        // }
    }

    private _clearByParamAndNotify(param: IScrollManagerSearchParam): void {
        this._setScrollInfo({
            ...param,
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: 0,
            offsetY: 0,
        });

        this._scrollInfoNext(param);
    }

    private _getCurrentScroll(param: Nullable<IScrollManagerSearchParam>) {
        if (param == null) {
            return;
        }
        const { unitId, sheetId } = param;
        return this._scrollInfoMap.get(unitId)?.get(sheetId);
    }

    private _scrollInfoNext(param: IScrollManagerSearchParam): void {
        const scrollInfo = this._getCurrentScroll(param);

        // subscriber is scrollManagerService.rawScrollInfo$.subscribe
        this._scrollInfo$.next(scrollInfo);
    }
}
