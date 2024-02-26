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

import type { IRange, Nullable } from '@univerjs/core';
import { IUniverInstanceService, Range } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { distinctUntilChanged, Subject } from 'rxjs';
import { IRenderManagerService, Vector2 } from '@univerjs/engine-render';
import { ScrollManagerService } from './scroll-manager.service';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export class HoverManagerService {
    private _currentCell$ = new Subject<Nullable<ISheetLocation>>();
    currentCell$ = this._currentCell$.asObservable().pipe(distinctUntilChanged((
        (pre, aft) => (
            pre?.unitId === aft?.unitId
            && pre?.subUnitId === aft?.subUnitId
            && pre?.row === aft?.row
            && pre?.col === aft?.col
        )
    )));

    private _lastPosition: Nullable<{ offsetX: number; offsetY: number }> = null;

    constructor(
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(ScrollManagerService) private _scrollManagerService: ScrollManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) { }

    private _calcActiveCell() {
        if (!this._lastPosition) {
            return;
        }
        const { offsetX, offsetY } = this._lastPosition;
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const skeletonParam = this._sheetSkeletonManagerService.getCurrent();
        const currentRender = this._renderManagerService.getRenderById(workbook.getUnitId());

        const scrollInfo = this._scrollManagerService.getCurrentScroll();

        if (!skeletonParam || !scrollInfo || !currentRender) {
            return;
        }

        const { scene } = currentRender;

        const { skeleton, sheetId, unitId } = skeletonParam;

        const activeViewport = scene.getActiveViewportByCoord(
            Vector2.FromArray([offsetX, offsetY])
        );

        if (!activeViewport) {
            this._currentCell$.next(null);
            return;
        }

        const { scaleX, scaleY } = scene.getAncestorScale();
        const cellPos = skeleton.getCellPositionByOffset(offsetX, offsetY, scaleX, scaleY, {
            x: activeViewport.actualScrollX,
            y: activeViewport.actualScrollY,
        });

        const mergeCell = skeleton.mergeData.find((range) => {
            const { startColumn, startRow, endColumn, endRow } = range;
            return cellPos.row >= startRow && cellPos.column >= startColumn && cellPos.row <= endRow && cellPos.column <= endColumn;
        });

        const params: ISheetLocation = {
            unitId,
            subUnitId: sheetId,
            workbook,
            worksheet,
            row: mergeCell ? mergeCell.startRow : cellPos.row,
            col: mergeCell ? mergeCell.startColumn : cellPos.column,
        };

        this._currentCell$.next(params);
    }

    onMouseMove(offsetX: number, offsetY: number) {
        this._lastPosition = {
            offsetX,
            offsetY,
        };
        this._calcActiveCell();
    }

    onScrollStart() {
        this._currentCell$.next(null);
    }

    onScrollEnd() {
        this._calcActiveCell();
    }
}
