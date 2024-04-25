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

import type { IPosition, IRange, Nullable, Workbook } from '@univerjs/core';
import { Disposable, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { distinctUntilChanged, Subject } from 'rxjs';
import { IRenderManagerService, Vector2 } from '@univerjs/engine-render';
import { getCellIndexByOffsetWithMerge } from '../common/utils';
import { ScrollManagerService } from './scroll-manager.service';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export interface IHoverCellPosition {
    position: IPosition;
    location: ISheetLocation;
}

export class HoverManagerService extends Disposable {
    private _currentCell$ = new Subject<Nullable<IHoverCellPosition>>();
    currentCell$ = this._currentCell$.asObservable().pipe(distinctUntilChanged((
        (pre, aft) => (
            pre?.location?.unitId === aft?.location?.unitId
            && pre?.location?.subUnitId === aft?.location?.subUnitId
            && pre?.location?.row === aft?.location?.row
            && pre?.location?.col === aft?.location?.col
        )
    )));

    private _lastPosition: Nullable<{ offsetX: number; offsetY: number }> = null;

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ScrollManagerService) private readonly _scrollManagerService: ScrollManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        // TODO@weird94: any better solution here?
        this._initCellDisposableListener();
    }

    private _initCellDisposableListener(): void {
        this.disposeWithMe(this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.SHEET).subscribe((workbook) => {
            if (!workbook) this._currentCell$.next(null);
        }));
    }

    private _calcActiveCell() {
        if (!this._lastPosition) return;

        const { offsetX, offsetY } = this._lastPosition;
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.SHEET);
        if (!workbook) {
            this._currentCell$.next(null);
            return;
        }

        const worksheet = workbook.getActiveSheet();
        const skeletonParam = this._sheetSkeletonManagerService.getCurrent();
        const currentRender = this._renderManagerService.getRenderById(workbook.getUnitId());

        const scrollInfo = this._scrollManagerService.getCurrentScroll();

        if (!skeletonParam || !scrollInfo || !currentRender) return;

        const { scene } = currentRender;

        const { skeleton, sheetId, unitId } = skeletonParam;

        const cellIndex = getCellIndexByOffsetWithMerge(offsetX, offsetY, scene, skeleton);

        if (!cellIndex) {
            this._currentCell$.next(null);
            return;
        }
        const { row, col, mergeCell, actualCol, actualRow } = cellIndex;

        const params: ISheetLocation = {
            unitId,
            subUnitId: sheetId,
            workbook,
            worksheet,
            row: actualRow,
            col: actualCol,
        };

        let anchorCell: IRange;

        if (mergeCell) {
            anchorCell = mergeCell;
        } else {
            anchorCell = {
                startRow: row,
                endRow: row,
                startColumn: col,
                endColumn: col,
            };
        }

        const activeViewport = scene.getActiveViewportByCoord(
            Vector2.FromArray([offsetX, offsetY])
        );

        if (!activeViewport) {
            return;
        }

        const { scaleX, scaleY } = scene.getAncestorScale();

        const scrollXY = {
            x: activeViewport.actualScrollX,
            y: activeViewport.actualScrollY,
        };

        const position: IPosition = {
            startX: (skeleton.getOffsetByPositionX(anchorCell.startColumn - 1) - scrollXY.x) * scaleX,
            endX: (skeleton.getOffsetByPositionX(anchorCell.endColumn) - scrollXY.x) * scaleX,
            startY: (skeleton.getOffsetByPositionY(anchorCell.startRow - 1) - scrollXY.y) * scaleY,
            endY: (skeleton.getOffsetByPositionY(anchorCell.endRow) - scrollXY.y) * scaleY,
        };

        this._currentCell$.next({
            location: params,
            position,
        });
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
