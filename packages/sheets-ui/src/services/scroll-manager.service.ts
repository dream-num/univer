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
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Inject } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export interface IScrollState {
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

export interface IViewportScrollState extends IScrollState {
    scrollX: number;
    scrollY: number;
    viewportScrollX: number;
    viewportScrollY: number;
}

export interface IScrollStateSearchParam {
    unitId: string;
    sheetId: string;
}

export interface IScrollStateWithSearchParam extends IScrollStateSearchParam, IScrollState { }

export type IScrollStateMap = Map<string, Map<string, IScrollState>>;

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
    private readonly _scrollStateMap: IScrollStateMap = new Map();
    /**
     * a subject for current sheet scrollInfo, no limit by viewport.
     */
    private readonly _rawScrollInfo$ = new BehaviorSubject<Nullable<IScrollState>>(null);
    /**
     * a subject for current sheet scrollInfo ( events, ex wheel event and point events add deltaXY to rawScrollInfo$)
     */
    readonly rawScrollInfo$ = this._rawScrollInfo$.asObservable();
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

    private _searchParamForScroll: Nullable<IScrollStateSearchParam> = null;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        // empty
    }

    dispose(): void {
        this._rawScrollInfo$.complete();
    }

    setSearchParam(param: IScrollStateSearchParam) {
        this._searchParamForScroll = param;
    }

    setSearchParamAndRefresh(param: IScrollStateSearchParam) {
        this._searchParamForScroll = param;
        this._scrollStateNext(param);
    }

    getScrollStateByParam(param: IScrollStateSearchParam): Readonly<Nullable<IScrollState>> {
        return this._getCurrentScroll(param);
    }

    getCurrentScrollState(): Readonly<Nullable<IScrollState>> {
        return this._getCurrentScroll(this._searchParamForScroll);
    }

    /**
     * Set scrollInfo by SetScrollOperation, call by ScrollCommand.id.
     * @param param
     */
    setScrollInfoAndEmitEvent(param: IScrollStateWithSearchParam) {
        this._setScrollState(param);
        this._scrollStateNext(param);
    }

    /**
     * call by set frozen
     * @param scrollInfo
     */
    setScrollStateToCurrSheetAndEmitEvent(scrollInfo: IScrollState) {
        if (this._searchParamForScroll == null) {
            return;
        }

        this._setScrollState({
            ...this._searchParamForScroll,
            ...scrollInfo,
        });
        this._scrollStateNext(this._searchParamForScroll);
    }

    /**
     * set _scrollStateMap but no _scrollInfo$.next
     * @param scroll
     */
    setScrollStateToCurrSheet(scroll: IScrollState) {
        if (this._searchParamForScroll == null) {
            return;
        }

        this._setScrollState({
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

    private _setScrollState(scrollInfo: IScrollStateWithSearchParam): void {
        const { unitId, sheetId, sheetViewStartColumn, sheetViewStartRow, offsetX, offsetY } = scrollInfo;

        if (!this._scrollStateMap.has(unitId)) {
            this._scrollStateMap.set(unitId, new Map());
        }

        const worksheetScrollInfoMap = this._scrollStateMap.get(unitId)!;
        const newScrollInfo: IScrollState = {
            sheetViewStartRow,
            sheetViewStartColumn,
            offsetX,
            offsetY,
        };
        worksheetScrollInfoMap.set(sheetId, newScrollInfo);
    }

    private _clearByParamAndNotify(param: IScrollStateSearchParam): void {
        this._setScrollState({
            ...param,
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: 0,
            offsetY: 0,
        });

        this._scrollStateNext(param);
    }

    private _getCurrentScroll(param: Nullable<IScrollStateSearchParam>) {
        if (param == null) {
            return;
        }
        const { unitId, sheetId } = param;
        return this._scrollStateMap.get(unitId)?.get(sheetId);
    }

    private _scrollStateNext(param: IScrollStateSearchParam): void {
        const scrollInfo = this._getCurrentScroll(param);

        // subscriber can be found in scrollManagerService.rawScrollInfo$.subscribe
        this._rawScrollInfo$.next(scrollInfo);
    }
}
