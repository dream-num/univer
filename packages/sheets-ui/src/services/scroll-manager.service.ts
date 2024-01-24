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

export interface IScrollManagerParam {
    offsetX: number;
    offsetY: number;
    sheetViewStartRow: number;
    sheetViewStartColumn: number;
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

    private _currentScroll: Nullable<IScrollManagerSearchParam> = null;

    dispose(): void {
        this._scrollInfo$.complete();
    }

    setCurrentScroll(param: IScrollManagerSearchParam) {
        this._currentScroll = param;

        this._refresh(param);
    }

    getScrollByParam(param: IScrollManagerSearchParam): Readonly<Nullable<IScrollManagerParam>> {
        return this._getCurrentScroll(param);
    }

    getCurrentScroll(): Readonly<Nullable<IScrollManagerParam>> {
        return this._getCurrentScroll(this._currentScroll);
    }

    addOrReplace(scroll: IScrollManagerParam) {
        if (this._currentScroll == null) {
            return;
        }

        this._addByParam({
            ...this._currentScroll,
            ...scroll,
        });
    }

    addOrReplaceNoRefresh(scroll: IScrollManagerParam) {
        if (this._currentScroll == null) {
            return;
        }

        this._addByParam(
            {
                ...this._currentScroll,
                ...scroll,
            },
            false
        );
    }

    addOrReplaceByParam(param: IScrollManagerInsertParam) {
        this._addByParam(param);
    }

    clear(): void {
        if (this._currentScroll == null) {
            return;
        }
        this._clearByParam(this._currentScroll);
    }

    // scrollToCell(startRow: number, startColumn: number) {
    //     const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
    //     const scene = this._renderManagerService.getCurrent()?.scene;
    //     if (skeleton == null || scene == null) {
    //         return;
    //     }

    //     const {} = skeleton.getCellByIndex(startRow, startColumn);
    // }

    private _addByParam(insertParam: IScrollManagerInsertParam, isRefresh = true): void {
        const { unitId, sheetId, sheetViewStartColumn, sheetViewStartRow, offsetX, offsetY } = insertParam;

        if (!this._scrollInfo.has(unitId)) {
            this._scrollInfo.set(unitId, new Map());
        }

        const sheetScroll = this._scrollInfo.get(unitId)!;

        sheetScroll.set(sheetId, {
            sheetViewStartRow,
            sheetViewStartColumn,
            offsetX,
            offsetY,
        });

        if (isRefresh === true) {
            this._refresh({ unitId, sheetId });
        }
    }

    private _clearByParam(param: IScrollManagerSearchParam): void {
        this._addByParam({
            ...param,
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: 0,
            offsetY: 0,
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
        this._scrollInfo$.next(this._getCurrentScroll(param));
    }
}
