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

import type { IPosition, Nullable, Workbook } from '@univerjs/core';
import { Disposable, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { distinctUntilChanged, Subject } from 'rxjs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { getHoverCellPosition } from '../common/utils';
import { ScrollManagerService } from './scroll-manager.service';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export interface IHoverCellPosition {
    position: IPosition;
    location: ISheetLocation;
}

export class HoverManagerService extends Disposable {
    private _currentCell$ = new Subject<Nullable<IHoverCellPosition>>();

    // Notify when hovering over different cells
    currentCell$ = this._currentCell$.asObservable().pipe(distinctUntilChanged((
        (pre, aft) => (
            pre?.location?.unitId === aft?.location?.unitId
            && pre?.location?.subUnitId === aft?.location?.subUnitId
            && pre?.location?.row === aft?.location?.row
            && pre?.location?.col === aft?.location?.col
        )
    )));

    // Notify when mouse position changes
    currentPosition$ = this._currentCell$.asObservable();

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

    override dispose(): void {
        super.dispose();
        this._currentCell$.complete();
    }

    private _initCellDisposableListener(): void {
        this.disposeWithMe(this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            if (!workbook) this._currentCell$.next(null);
        }));
    }

    private _calcActiveCell() {
        if (!this._lastPosition) return;

        const { offsetX, offsetY } = this._lastPosition;
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            this._currentCell$.next(null);
            return;
        }

        const worksheet = workbook.getActiveSheet();
        const skeletonParam = this._sheetSkeletonManagerService.getCurrent();
        const currentRender = this._renderManagerService.getRenderById(workbook.getUnitId());

        const scrollInfo = this._scrollManagerService.getCurrentScrollInfo();

        if (!skeletonParam || !scrollInfo || !currentRender) return;

        const hoverPosition = getHoverCellPosition(currentRender, workbook, worksheet, skeletonParam, offsetX, offsetY);

        if (!hoverPosition) {
            this._currentCell$.next(null);
            return;
        }

        const { location, position } = hoverPosition;

        this._currentCell$.next({
            location,
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

    onScroll() {
        this._currentCell$.next(null);
    }
}
