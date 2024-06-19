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
import { Inject } from '@wendellhu/redi';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export interface IScrollManagerParam {
    offsetX: number;
    offsetY: number;
    sheetViewStartRow: number;
    sheetViewStartColumn: number;
    viewportScrollX?: number;
    viewportScrollY?: number;
}

export interface IScrollManagerSearchParam {
    unitId: string;
    sheetId: string;
}

export interface IScrollManagerInsertParam extends IScrollManagerSearchParam, IScrollManagerParam {}

export type IScrollInfo = Map<string, Map<string, IScrollManagerParam>>;

/**
 * This service manages and sets the virtual scrolling of the canvas content area.
 * It triggers service changes through SetScrollOperation.
 *
 * ScrollController subscribes to the changes in service data to refresh the view scrolling.
 */
export class SheetScrollManagerService implements IRenderModule {
    private readonly _scrollInfo: IScrollInfo = new Map();
    private readonly _scrollInfo$ = new BehaviorSubject<Nullable<IScrollManagerParam>>(null);
    readonly scrollInfo$ = this._scrollInfo$.asObservable();

    private _searchParamForScroll: Nullable<IScrollManagerSearchParam> = null;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _skeletonManagerService: SheetSkeletonManagerService
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

        const { sheetId } = this._searchParamForScroll;
        const workbook = this._context.unit;
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
     * first time set scrollInfo bt scrollOperation, but offsetXY is derived from scroll event.
     * second time set scrollInfo by viewport.scrollTo(scrol.render-controller --> onScrollAfterObserver), this time offsetXY has been limited.
     *
     * wheelevent --> sheetCanvasView -->  set-scroll.command('sheet.command.set-scroll-relative') --> scrollOperation --> this.setScrollInfo  --> scrollInfo$.next --> scroll.render-controller@viewportMain.scrollTo & notify -->
     * scroll.render-controller@onScrollAfterObserver --> this.setScrollInfoToCurrSheetWithoutNotify --> this._setScrollInfo({}, false)
     * call _setScrollInfo again, a loop!, so we should call setScrollInfoToCurrSheetWithoutNotify
     * @param param
     */
    setScrollInfo(param: IScrollManagerInsertParam) {
        this._setScrollInfo(param);
    }

    setScrollInfoToCurrSheet(scrollInfo: IScrollManagerParam) {
        if (this._searchParamForScroll == null) {
            return;
        }

        this._setScrollInfo({
            ...this._searchParamForScroll,
            ...scrollInfo,
        });
    }

    setScrollInfoToCurrSheetWithoutNotify(scroll: IScrollManagerParam) {
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

    calcViewportScrollFromOffset(scrollInfo: IScrollManagerInsertParam) {
        const { unitId } = scrollInfo;
        const workbookScrollInfo = this._scrollInfo.get(unitId);
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
        const skeleton = this._skeletonManagerService.getCurrentSkeleton();
        const rowAcc = skeleton?.rowHeightAccumulation[sheetViewStartRow - 1] || 0;
        const colAcc = skeleton?.columnWidthAccumulation[sheetViewStartColumn - 1] || 0;
        const viewportScrollX = colAcc + offsetX;
        const viewportScrollY = rowAcc + offsetY;

        return {
            viewportScrollX,
            viewportScrollY,
        };
    }

    private _setScrollInfo(newScrollInfo: IScrollManagerInsertParam, notifyScrollInfo = true): void {
        const { unitId, sheetId, sheetViewStartColumn, sheetViewStartRow, offsetX, offsetY } = newScrollInfo;

        if (!this._scrollInfo.has(unitId)) {
            this._scrollInfo.set(unitId, new Map());
        }

        const worksheetScrollInfoMap = this._scrollInfo.get(unitId)!;
        const scrollLeftTopByRowColOffset = this.calcViewportScrollFromOffset(newScrollInfo);
        const scrollInfo: IScrollManagerParam = {
            sheetViewStartRow,
            sheetViewStartColumn,
            offsetX,
            offsetY,
            viewportScrollX: scrollLeftTopByRowColOffset.viewportScrollX,
            viewportScrollY: scrollLeftTopByRowColOffset.viewportScrollY,
        };
        worksheetScrollInfoMap.set(sheetId, scrollInfo);
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
        return this._scrollInfo.get(unitId)?.get(sheetId);
    }

    private _notifyCurrentScrollInfo(param: IScrollManagerSearchParam): void {
        const scrollInfo = this._getCurrentScroll(param);

        // subscribe this._scrollManagerService.scrollInfo$ in scroll.render-controller
        this._scrollInfo$.next(scrollInfo);
    }
}
