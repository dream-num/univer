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

import type { IRange, IRangeWithCoord, Nullable, Workbook, Worksheet } from '@univerjs/core';
import { Disposable, Inject, Injector } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { SpreadsheetSkeleton } from '@univerjs/engine-render';
import { BehaviorSubject } from 'rxjs';

export interface ISheetSkeletonManagerParam {
    unitId?: string;
    sheetId: string;
    skeleton: SpreadsheetSkeleton;
    dirty: boolean;
    commandId?: string;
}

export interface ISheetSkeletonManagerSearch {
    sheetId: string;
    commandId?: string; // WTF: why?
}

/**
 * This service manages the drawing of the sheet's viewModel (skeleton).
 *
 * Each time there is a content change, it will trigger the viewModel of the render to recalculate.
 *
 * Each application and sub-table has its own viewModel (skeleton).
 *
 * The viewModel is also a temporary storage variable, which does not need to be persisted,
 * so it is managed uniformly through the service.
 */
export class SheetSkeletonManagerService extends Disposable implements IRenderModule {
    private _currentSkeletonSearchParam: ISheetSkeletonManagerSearch = {
        sheetId: '',
    };

    private _sheetSkeletonParam: ISheetSkeletonManagerParam[] = [];

    private readonly _currentSkeleton$ = new BehaviorSubject<Nullable<ISheetSkeletonManagerParam>>(null);
    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();

    /**
     * CurrentSkeletonBefore for pre-triggered logic during registration
     */
    private readonly _currentSkeletonBefore$ = new BehaviorSubject<Nullable<ISheetSkeletonManagerParam>>(null);
    readonly currentSkeletonBefore$ = this._currentSkeletonBefore$.asObservable();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        // empty
        super();

        this.disposeWithMe(() => {
            this._currentSkeletonBefore$.complete();
            this._currentSkeleton$.complete();
            this._sheetSkeletonParam = [];
        });

        this._initRemoveSheet();
    }

    private _initRemoveSheet() {
        this.disposeWithMe(this._context.unit.sheetDisposed$.subscribe((sheet) => {
            this.disposeSkeleton({
                sheetId: sheet.getSheetId(),
            });
        }));
    }

    getCurrentSkeleton(): Nullable<SpreadsheetSkeleton> {
        return this.getCurrent()?.skeleton;
    }

    getCurrent(): Nullable<ISheetSkeletonManagerParam> {
        return this._getSkeleton(this._currentSkeletonSearchParam);
    }

    getWorksheetSkeleton(sheetId: string): Nullable<ISheetSkeletonManagerParam> {
        return this._getSkeleton({ sheetId });
    }

    /**
     * unitId is never read?
     */
    getUnitSkeleton(unitId: string, sheetId: string): Nullable<ISheetSkeletonManagerParam> {
        const param = this._getSkeleton({ sheetId });
        if (param != null) {
            param.unitId = unitId;
        }
        return param;
    }

    setCurrent(searchParam: ISheetSkeletonManagerSearch): Nullable<ISheetSkeletonManagerParam> {
        this._setCurrent(searchParam);
    }

    private _setCurrent(searchParam: ISheetSkeletonManagerSearch): Nullable<ISheetSkeletonManagerParam> {
        const param = this._getSkeleton(searchParam);
        if (param != null) {
            this._reCalculate(param);
        } else {
            const { sheetId } = searchParam;
            const workbook = this._context.unit;
            const worksheet = workbook.getSheetBySheetId(searchParam.sheetId);
            if (worksheet == null) {
                return;
            }

            const skeleton = this._buildSkeleton(worksheet);
            this._sheetSkeletonParam.push({
                sheetId,
                skeleton,
                dirty: false,
            });
        }

        this._currentSkeletonSearchParam = searchParam;
        const unitId = this._context.unitId;
        const sheetId = this._currentSkeletonSearchParam.sheetId;
        const sheetSkeletonManagerParam = this.getUnitSkeleton(unitId, sheetId);
        this._currentSkeletonBefore$.next(sheetSkeletonManagerParam);
        this._currentSkeleton$.next(sheetSkeletonManagerParam);
    }

    reCalculate() {
        const param = this.getCurrent();
        if (param == null) {
            return;
        }
        this._reCalculate(param);
    }

    private _reCalculate(param: ISheetSkeletonManagerParam) {
        if (param.dirty) {
            param.skeleton.makeDirty(true);
            param.dirty = false;
        }
        param.skeleton.calculate();
    }

    makeDirty(searchParm: ISheetSkeletonManagerSearch, state: boolean = true) {
        const param = this._getSkeleton(searchParm);
        if (param == null) {
            return;
        }
        param.dirty = state;
    }

    getOrCreateSkeleton(searchParam: ISheetSkeletonManagerSearch) {
        const skeleton = this._getSkeleton(searchParam);
        if (skeleton) {
            return skeleton.skeleton;
        }

        const workbook = this._context.unit;
        const worksheet = workbook.getSheetBySheetId(searchParam.sheetId);
        if (!worksheet) {
            return;
        }

        const newSkeleton = this._buildSkeleton(worksheet);
        this._sheetSkeletonParam.push({
            sheetId: searchParam.sheetId,
            skeleton: newSkeleton,
            dirty: false,
        });

        return newSkeleton;
    }

    disposeSkeleton(searchParm: ISheetSkeletonManagerSearch) {
        const index = this._sheetSkeletonParam.findIndex((param) => param.sheetId === searchParm.sheetId);
        if (index > -1) {
            const skeleton = this._sheetSkeletonParam[index];
            skeleton.skeleton.dispose();
            this._sheetSkeletonParam.splice(index, 1);
        }
    }

    /** @deprecated Use function `attachRangeWithCoord` instead.  */
    attachRangeWithCoord(range: IRange): Nullable<IRangeWithCoord> {
        const skeleton = this.getCurrentSkeleton();
        if (!skeleton) return null;

        return attachRangeWithCoord(skeleton, range);
    }

    private _getSkeleton(searchParm: ISheetSkeletonManagerSearch): Nullable<ISheetSkeletonManagerParam> {
        const item = this._sheetSkeletonParam.find((param) => param.sheetId === searchParm.sheetId);
        if (item != null) {
            item.commandId = searchParm.commandId;
        }

        return item;
    }

    private _buildSkeleton(worksheet: Worksheet) {
        const config = worksheet.getConfig();
        const spreadsheetSkeleton = this._injector.createInstance(
            SpreadsheetSkeleton,
            worksheet,
            config,
            worksheet.getCellMatrix(),
            this._context.unit.getStyles()
        );

        return spreadsheetSkeleton;
    }
}

export function attachRangeWithCoord(skeleton: SpreadsheetSkeleton, range: IRange): IRangeWithCoord {
    const { startRow, startColumn, endRow, endColumn, rangeType } = range;

    // after the selection is moved, it may be stored endRow < startRow or endColumn < startColumn
    // so startCell and endCell need get min value to draw the selection
    const _startRow = endRow < startRow ? endRow : startRow;
    const _endRow = endRow < startRow ? startRow : endRow;

    const _startColumn = endColumn < startColumn ? endColumn : startColumn;
    const _endColumn = endColumn < startColumn ? startColumn : endColumn;

    const startCell = skeleton.getNoMergeCellPositionByIndex(_startRow, _startColumn);
    const endCell = skeleton.getNoMergeCellPositionByIndex(_endRow, _endColumn);

    return {
        startRow,
        startColumn,
        endRow,
        endColumn,
        rangeType,
        startY: startCell?.startY || 0,
        endY: endCell?.endY || 0,
        startX: startCell?.startX || 0,
        endX: endCell?.endX || 0,
    };
}
