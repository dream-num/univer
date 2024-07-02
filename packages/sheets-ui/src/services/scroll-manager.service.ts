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

import { IUniverInstanceService, type Nullable, UniverInstanceType } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export interface IViewportScrollState {
    scrollX: number;
    scrollY: number;
    viewportScrollX: number;
    viewportScrollY: number;
}

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

    /**
     * overall offsetX from sheet cotent topleft, should be same as startRow * rowHeight + offsetY
     * coordinate same as viewport, not scrollbar
     */
    viewportScrollX?: number;
    /**
     * overall offsetY from sheet content topleft, should be same as startColumn * columnWidth + offsetX
     * coordinate same as viewport, not scrollbar
     */
    viewportScrollY?: number;
}

export interface IScrollManagerSearchParam {
    unitId: string;
    sheetId: string;
}

export interface IScrollManagerWithSearchParam extends IScrollManagerSearchParam, IScrollManagerParam {}

export type IScrollInfo = Map<string, Map<string, IScrollManagerParam>>;

/**
 * This service manages and sets the virtual scrolling of the canvas content area.
 * It triggers service changes through SetScrollOperation.
 *
 * ScrollController subscribes to the changes in service data to refresh the view scrolling.
 */
export class ScrollManagerService {
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
     */
    readonly validViewportScrollInfo$ = new BehaviorSubject<Nullable<IViewportScrollState>>(null);
    /**
     * a subject for current valid scrollInfo, viewport@_scrollCore would limit rawScrollInfo$ exclude negative value or over max value.
     * use this subject not rawScrollInfo$ when get scrolling state of viewport.
     */

    private _searchParamForScroll: Nullable<IScrollManagerSearchParam> = null;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        // init
        // TODO @lumixraku test
        (window as any).sms = this;
    }

    dispose(): void {
        this._scrollInfo$.complete();
    }

    setSearchParam(param: IScrollManagerSearchParam) {
        this._searchParamForScroll = param;
    }

    setSearchParamAndRefresh(param: IScrollManagerSearchParam) {
        this._searchParamForScroll = param;
        this._notifyCurrentScrollInfo(param);
    }

    getScrollInfoByParam(param: IScrollManagerSearchParam): Readonly<Nullable<IScrollManagerParam>> {
        return this._getCurrentScroll(param);
    }

    getCurrentScrollInfo(): Readonly<Nullable<IScrollManagerParam>> {
        return this._getCurrentScroll(this._searchParamForScroll);
    }

    setScrollInfoToSnapshot(scrollInfo: IScrollManagerParam) {
        if (this._searchParamForScroll == null) {
            return;
        }
        const { unitId, sheetId } = this._searchParamForScroll;
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        const worksheet = workbook?.getSheetBySheetId(sheetId);
        const snapshot = worksheet?.getConfig();
        if (snapshot) {
            snapshot.scrollLeft = scrollInfo.viewportScrollX || 0;
            snapshot.scrollTop = scrollInfo.viewportScrollY || 0;
        }
    }

    /**
     * set scrollInfo by cmd,
     * call _setScrollInfo twice after one scrolling.
     * first time set scrollInfo by scrollOperation, but offsetXY is derived from scroll event.
     * second time set scrollInfo by viewport.scrollTo(scrol.render-controller --> onScrollAfterObserver), this time offsetXY has been limited.
     *
     * wheelevent --> sheetCanvasView -->  set-scroll.command('sheet.command.set-scroll-relative') --> scrollOperation --> scrollManagerService.setScrollInfo  --> scrollInfo$.next --> scroll.render-controller@viewportMain.scrollTo & notify -->
     * scroll.render-controller@onScrollAfter$ --> this.setScrollInfoToCurrSheetWithoutNotify --> this._setScrollInfo({}, false)
     * call _setScrollInfo again, a loop!, so we should call setScrollInfoToCurrSheetWithoutNotify
     * @param param
     */
    setScrollInfoAndEmitEvent(param: IScrollManagerWithSearchParam) {
        this._setScrollInfo(param, true);
    }

    setScrollInfoToCurrSheetAndEmitEvent(scrollInfo: IScrollManagerParam) {
        if (this._searchParamForScroll == null) {
            return;
        }

        this._setScrollInfo({
            ...this._searchParamForScroll,
            ...scrollInfo,
        }, true);
    }

    /**
     * call _setScrollInfo but no _scrollInfo$.next
     * @param scroll
     */
    justSetScrollInfoToCurrSheet(scroll: IScrollManagerParam) {
        if (this._searchParamForScroll == null) {
            return;
        }

        this._setScrollInfo(
            {
                ...this._searchParamForScroll,
                ...scroll,
            },
            false
        );
    }

    clear(): void {
        if (this._searchParamForScroll == null) {
            return;
        }
        this._clearByParam(this._searchParamForScroll);
    }

    // scrollToCell(startRow: number, startColumn: number) {
    //     const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
    //     const scene = this._renderManagerService.getCurrent()?.scene;
    //     if (skeleton == null || scene == null) {
    //         return;
    //     }

    //     const {} = skeleton.getCellByIndex(startRow, startColumn);
    // }

    calcViewportScrollFromRowColOffset(scrollInfo: IScrollManagerWithSearchParam) {
        const { unitId } = scrollInfo;
        const workbookScrollInfo = this._scrollInfoMap.get(unitId);
        if (workbookScrollInfo == null) {
            return {
                scrollTop: 0,
                scrollLeft: 0,
            };
        }
        // const scrollInfo = workbookScrollInfo.get(param.sheetId);
        let { sheetViewStartColumn, sheetViewStartRow, offsetX, offsetY } = scrollInfo;
        sheetViewStartRow = sheetViewStartRow || 0;
        offsetY = offsetY || 0;

        // const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        const skeleton = this._renderManagerService.withCurrentTypeOfUnit(UniverInstanceType.UNIVER_SHEET, SheetSkeletonManagerService)?.getCurrentSkeleton();
        const rowAcc = skeleton?.rowHeightAccumulation[sheetViewStartRow - 1] || 0;
        const colAcc = skeleton?.columnWidthAccumulation[sheetViewStartColumn - 1] || 0;
        const overallScrollX = colAcc + offsetX;
        const overallScrollY = rowAcc + offsetY;

        return {
            overallScrollX,
            overallScrollY,
        };
    }

    private _setScrollInfo(scrollInfo: IScrollManagerWithSearchParam, notifyScrollInfo = true): void {
        const { unitId, sheetId, sheetViewStartColumn, sheetViewStartRow, offsetX, offsetY } = scrollInfo;

        if (!this._scrollInfoMap.has(unitId)) {
            this._scrollInfoMap.set(unitId, new Map());
        }

        const worksheetScrollInfoMap = this._scrollInfoMap.get(unitId)!;
        const overallOffsetByRowColOffset = this.calcViewportScrollFromRowColOffset(scrollInfo);
        const newScrollInfo: IScrollManagerParam = {
            sheetViewStartRow,
            sheetViewStartColumn,
            offsetX,
            offsetY,
            viewportScrollX: overallOffsetByRowColOffset.overallScrollX,
            viewportScrollY: overallOffsetByRowColOffset.overallScrollY,
        };
        // console.log('newScrollInfo', newScrollInfo);
        worksheetScrollInfoMap.set(sheetId, newScrollInfo);
        if (notifyScrollInfo === true) {
            this._notifyCurrentScrollInfo({ unitId, sheetId });
        }
    }

    private _clearByParam(param: IScrollManagerSearchParam): void {
        this._setScrollInfo({
            ...param,
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: 0,
            offsetY: 0,
        });

        this._notifyCurrentScrollInfo(param);
    }

    private _getCurrentScroll(param: Nullable<IScrollManagerSearchParam>) {
        if (param == null) {
            return;
        }
        const { unitId, sheetId } = param;
        return this._scrollInfoMap.get(unitId)?.get(sheetId);
    }

    private _notifyCurrentScrollInfo(param: IScrollManagerSearchParam): void {
        const scrollInfo = this._getCurrentScroll(param);

        // subscriber is scrollManagerService.rawScrollInfo$.subscribe
        this._scrollInfo$.next(scrollInfo);
    }
}
