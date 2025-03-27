/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
import type { IDragEvent } from '@univerjs/engine-render';
import type { IHoverCellPosition } from './hover-manager.service';
import { Disposable, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { distinctUntilChanged, Subject } from 'rxjs';
import { getHoverCellPosition } from '../common/utils';
import { SheetScrollManagerService } from './scroll-manager.service';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export interface IDragCellPosition extends IHoverCellPosition {
    dataTransfer: DataTransfer;
}

export class DragManagerService extends Disposable {
    private _currentCell$ = new Subject<Nullable<IDragCellPosition>>();
    currentCell$ = this._currentCell$.asObservable().pipe(distinctUntilChanged(
        (pre, aft) => (
            pre?.location?.unitId === aft?.location?.unitId
            && pre?.location?.subUnitId === aft?.location?.subUnitId
            && pre?.location?.row === aft?.location?.row
            && pre?.location?.col === aft?.location?.col
        )
    ));

    private _endCell$ = new Subject<Nullable<IDragCellPosition>>();
    endCell$ = this._endCell$.asObservable();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._initCellDisposableListener();
    }

    override dispose(): void {
        super.dispose();
        this._currentCell$.complete();
        this._endCell$.complete();
    }

    private _initCellDisposableListener(): void {
        this.disposeWithMe(this._univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            if (!workbook) {
                this._currentCell$.next(null);
                this._endCell$.next(null);
            }
        }));
    }

    private _calcActiveCell(offsetX: number, offsetY: number): Nullable<IHoverCellPosition> {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return;
        // const skeletonParam = this._sheetSkeletonManagerService.getCurrent();
        const currentRender = this._renderManagerService.getRenderById(workbook.getUnitId());
        if (!currentRender) return;

        const skeletonParam = currentRender.with(SheetSkeletonManagerService).getCurrentParam();
        const scrollManagerService = currentRender.with(SheetScrollManagerService);
        const scrollInfo = scrollManagerService.getCurrentScrollState();

        if (!skeletonParam || !scrollInfo || !currentRender) return;

        return getHoverCellPosition(currentRender, workbook, worksheet, skeletonParam, offsetX, offsetY);
    }

    onDragOver(evt: IDragEvent) {
        const { offsetX, offsetY, dataTransfer } = evt;
        const activeCell = this._calcActiveCell(offsetX, offsetY);

        if (!activeCell) {
            this._currentCell$.next(null);
            return;
        }

        const { location, position } = activeCell;

        this._currentCell$.next({
            location,
            position,
            dataTransfer,
        });
    }

    onDrop(evt: IDragEvent) {
        const { offsetX, offsetY, dataTransfer } = evt;
        const activeCell = this._calcActiveCell(offsetX, offsetY);

        if (!activeCell) {
            this._endCell$.next(null);
            return;
        }

        const { location, position } = activeCell;

        this._endCell$.next({
            location,
            position,
            dataTransfer,
        });
    }
}
