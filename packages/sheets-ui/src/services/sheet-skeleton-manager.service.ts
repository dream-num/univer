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

import type { Nullable, Workbook, Worksheet } from '@univerjs/core';
import { IUniverInstanceService } from '@univerjs/core';
import { SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export interface ISheetSkeletonManagerParam {
    unitId: string;
    sheetId: string;
    skeleton: SpreadsheetSkeleton;
    dirty: boolean;
    commandId?: string;
}

export interface ISheetSkeletonManagerSearch {
    unitId: string;
    sheetId: string;
    commandId?: string; // WTF: why?
}

// TODO@wzhudev: this should be moved to a `RenderUnit` as well.

/**
 * This service manages the drawing of the sheet's viewModel (skeleton).
 * Each time there is a content change, it will trigger the viewModel of the render to recalculate.
 * Each application and sub-table has its own viewModel (skeleton).
 * The viewModel is also a temporary storage variable, which does not need to be persisted,
 * so it is managed uniformly through the service.
 *
 * @todo RenderUnit - We should move this to RenderUnit as well after all dependents have been moved.
 */
export class SheetSkeletonManagerService implements IDisposable {
    private _currentSkeletonSearchParam: ISheetSkeletonManagerSearch = {
        unitId: '',
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
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        // empty
    }

    dispose(): void {
        this._currentSkeletonBefore$.complete();
        this._currentSkeleton$.complete();
        this._sheetSkeletonParam = [];
    }

    /** @deprecated */
    getCurrent(): Nullable<ISheetSkeletonManagerParam> {
        return this._getSkeleton(this._currentSkeletonSearchParam);
    }

    getUnitSkeleton(unitId: string, sheetId: string): Nullable<ISheetSkeletonManagerParam> {
        return this._getSkeleton({ unitId, sheetId });
    }

    setCurrent(searchParam: ISheetSkeletonManagerSearch): Nullable<ISheetSkeletonManagerParam> {
        this._setCurrent(searchParam);
    }

    removeSkeleton(searchParam: Pick<ISheetSkeletonManagerSearch, 'unitId'>) {
        const index = this._sheetSkeletonParam.findIndex((param) => param.unitId === searchParam.unitId);
        if (index !== -1) {
            const skeletonParam = this._sheetSkeletonParam[index];
            skeletonParam.skeleton.dispose();

            this._sheetSkeletonParam.splice(index, 1);
            this._currentSkeletonBefore$.next(null);
            this._currentSkeleton$.next(null);
        }
    }

    private _compareSearch(param1: Nullable<ISheetSkeletonManagerSearch>, param2: Nullable<ISheetSkeletonManagerSearch>) {
        if (param1 == null || param2 == null) {
            return false;
        }

        if (param1.commandId === param2.commandId && param1.sheetId === param2.sheetId && param1.unitId === param2.unitId) {
            return true;
        }
        return false;
    }

    private _setCurrent(searchParam: ISheetSkeletonManagerSearch): Nullable<ISheetSkeletonManagerParam> {
        const param = this._getSkeleton(searchParam);
        if (param != null) {
            this._reCalculate(param);
        } else {
            const { unitId, sheetId } = searchParam;

            const workbook = this._univerInstanceService.getUniverSheetInstance(searchParam.unitId);

            const worksheet = workbook?.getSheetBySheetId(searchParam.sheetId);
            if (worksheet == null || workbook == null) {
                return;
            }

            const skeleton = this._buildSkeleton(worksheet, workbook);

            this._sheetSkeletonParam.push({
                unitId,
                sheetId,
                skeleton,
                dirty: false,
            });
        }

        this._currentSkeletonSearchParam = searchParam;

        const nextParam = this.getCurrent();
        this._currentSkeletonBefore$.next(nextParam);
        this._currentSkeleton$.next(nextParam);
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

    makeDirtyCurrent(state: boolean = true) {
        this.makeDirty(this._currentSkeletonSearchParam, state);
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

        const workbook = this._univerInstanceService.getUniverSheetInstance(searchParam.unitId);
        const worksheet = workbook?.getSheetBySheetId(searchParam.sheetId);
        if (!worksheet || !workbook) {
            return;
        }

        const newSkeleton = this._buildSkeleton(worksheet, workbook);
        this._sheetSkeletonParam.push({
            unitId: searchParam.unitId,
            sheetId: searchParam.sheetId,
            skeleton: newSkeleton,
            dirty: false,
        });

        return newSkeleton;
    }

    private _getSkeleton(searchParm: ISheetSkeletonManagerSearch): Nullable<ISheetSkeletonManagerParam> {
        const item = this._sheetSkeletonParam.find(
            (param) => param.unitId === searchParm.unitId && param.sheetId === searchParm.sheetId
        );

        if (item != null) {
            item.commandId = searchParm.commandId;
        }

        return item;
    }

    private _buildSkeleton(worksheet: Worksheet, workbook: Workbook) {
        const config = worksheet.getConfig();
        const spreadsheetSkeleton = this._injector.createInstance(
            SpreadsheetSkeleton,
            worksheet,
            config,
            worksheet.getCellMatrix(),
            workbook.getStyles()
        );

        return spreadsheetSkeleton;
    }
}
