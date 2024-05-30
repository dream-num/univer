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

import type { Nullable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { Inject } from '@wendellhu/redi';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export interface IScrollManagerParam {
    offsetX: number;
    offsetY: number;
    sheetViewStartRow: number;
    sheetViewStartColumn: number;
    scrollLeft?: number;
    scrollTop?: number;
    viewportScrollLeft?: number;
    viewportScrollTop?: number;
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
export class ScrollManagerService {
    private readonly _scrollInfo: IScrollInfo = new Map();

    private readonly _scrollInfo$ = new BehaviorSubject<Nullable<IScrollManagerParam>>(null);
    readonly scrollInfo$ = this._scrollInfo$.asObservable();

    private _searchParamForScroll: Nullable<IScrollManagerSearchParam> = null;

    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        window.sms = this;
    }

    dispose(): void {
        this._scrollInfo$.complete();
    }

    setSearchParam(param: IScrollManagerSearchParam) {
        this._searchParamForScroll = param;
    }

    setSearchParamAndRefresh(param: IScrollManagerSearchParam) {
        this._searchParamForScroll = param;
        this._refresh(param);
    }

    getScrollInfoByParam(param: IScrollManagerSearchParam): Readonly<Nullable<IScrollManagerParam>> {
        return this._getCurrentScroll(param);
    }

    getCurrentScroll(): Readonly<Nullable<IScrollManagerParam>> {
        return this._getCurrentScroll(this._searchParamForScroll);
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

    /**
     * set scrollInfo by cmd,
     * wheelevent --> sheetCanvasView -->  cmd('sheet.operation.set-scroll') --> scrollOperation --> this.setScrollInfo  --> scrollInfo$.next --> scroll.render-controller --> viewportMain.scrollTo & notify -->
     * scroll.render-controller@onScrollAfterObserver --> this.setScrollInfoToCurrSheetWithoutNotify --> this._setScrollInfo
     * @param param
     */
    setScrollInfo(param: IScrollManagerInsertParam) {
        this._setScrollInfo(param);
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

    calcViewportScrollFromOffset(newScrollInfo: IScrollManagerInsertParam) {
        const { unitId } = newScrollInfo;
        const workbookScrollInfo = this._scrollInfo.get(unitId);
        if (workbookScrollInfo == null) {
            return {
                scrollTop: 0,
                scrollLeft: 0,
            };
        }
        // const scrollInfo = workbookScrollInfo.get(param.sheetId);
        let { sheetViewStartColumn, sheetViewStartRow, offsetX, offsetY } = newScrollInfo;
        sheetViewStartRow = sheetViewStartRow || 0;
        offsetY = offsetY || 0;
        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        const rowAcc = skeleton?.rowHeightAccumulation[sheetViewStartRow - 1] || 0;
        const colAcc = skeleton?.columnWidthAccumulation[sheetViewStartColumn - 1] || 0;
        const viewportScrollLeft = colAcc + offsetX;
        const viewportScrollTop = rowAcc + offsetY;

        return {
            viewportScrollLeft,
            viewportScrollTop,
            // scrollTop: rowAcc + offsetY,
            // scrollLeft: colAcc + offsetX,
        };
    }

    private _setScrollInfo(newScrollInfo: IScrollManagerInsertParam, isRefresh = true): void {
        const { unitId, sheetId, sheetViewStartColumn, sheetViewStartRow, offsetX, offsetY } = newScrollInfo;

        if (!this._scrollInfo.has(unitId)) {
            this._scrollInfo.set(unitId, new Map());
        }

        const workbookScrollInfo = this._scrollInfo.get(unitId)!;
        const scrollLeftTopByRowColOffset = this.calcViewportScrollFromOffset(newScrollInfo);
        console.log('scrollTop', newScrollInfo.sheetId, newScrollInfo.scrollTop, scrollLeftTopByRowColOffset.scrollTop);
        const scrollInfo: IScrollManagerParam = {
            sheetViewStartRow,
            sheetViewStartColumn,
            offsetX,
            offsetY,
            viewportScrollLeft: scrollLeftTopByRowColOffset.viewportScrollLeft,
            viewportScrollTop: scrollLeftTopByRowColOffset.viewportScrollTop,
        };
        workbookScrollInfo.set(sheetId, scrollInfo);
        if (isRefresh === true) {
            this._refresh({ unitId, sheetId });
        }
    }

    private _clearByParam(param: IScrollManagerSearchParam): void {
        this._setScrollInfo({
            ...param,
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: 0,
            offsetY: 0,
            // scrollLeft: 0,
            // scrollTop: 0,
        });

        this._refresh(param);
    }

    private _getCurrentScroll(param: Nullable<IScrollManagerSearchParam>) {
        if (param == null) {
            return;
        }
        const { unitId, sheetId } = param;
        return this._scrollInfo.get(unitId)?.get(sheetId);
    }

    private _refresh(param: IScrollManagerSearchParam): void {
        const scrollInfo = this._getCurrentScroll(param);

        // subscribe this._scrollManagerService.scrollInfo$ in scroll.render-controller
        this._scrollInfo$.next(scrollInfo);
    }
}
