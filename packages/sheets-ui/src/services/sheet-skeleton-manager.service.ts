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
import type { IRenderContext, IRenderModule, Scene } from '@univerjs/engine-render';
import { Disposable, Inject, Injector } from '@univerjs/core';
import { SpreadsheetSkeleton } from '@univerjs/engine-render';
import { SheetSkeletonService } from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { attachRangeWithCoord } from './selection/util';

 // Why need this SkParam? what is Param used for? Could unitId & sheetId & dirty in skeleton itself ?
export interface ISheetSkeletonManagerParam {
    unitId: string;
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
 * SheetSkeletonManagerService is registered in a render unit
 */
export class SheetSkeletonManagerService extends Disposable implements IRenderModule {
    private _sheetId: string = '';

    // @TODO lumixraku, why need this?  How about put dirty & sheetId & unitId in skeleton itself z?
    private _sheetSkeletonParamStore: Map<string, ISheetSkeletonManagerParam> = new Map();

    private readonly _currentSkeleton$ = new BehaviorSubject<Nullable<ISheetSkeletonManagerParam>>(null);
    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();

    /**
     * CurrentSkeletonBefore for pre-triggered logic during registration
     */
    private readonly _currentSkeletonBefore$ = new BehaviorSubject<Nullable<ISheetSkeletonManagerParam>>(null);
    readonly currentSkeletonBefore$ = this._currentSkeletonBefore$.asObservable();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetSkeletonService) private readonly _sheetSkService: SheetSkeletonService

    ) {
        // empty
        super();

        this.disposeWithMe(() => {
            this._currentSkeletonBefore$.complete();
            this._currentSkeleton$.complete();
            this._sheetSkeletonParamStore = new Map();
        });

        this._initRemoveSheet();
    }

    private _initRemoveSheet() {
        this.disposeWithMe(this._context.unit.sheetDisposed$.subscribe((sheet) => {
            this.disposeSkeleton(sheet.getSheetId());
        }));
    }

    getCurrentSkeleton(): Nullable<SpreadsheetSkeleton> {
        return this.getCurrentParam()?.skeleton;
    }

    /**
     * @deprecated use `getCurrentSkeleton` instead.
     */
    getCurrent(): Nullable<ISheetSkeletonManagerParam> {
        return this.getCurrentParam();
    }

    /**
     * get ISheetSkeletonManagerParam from _currentSkeletonSearchParam
     * @returns
     */
    getCurrentParam(): Nullable<ISheetSkeletonManagerParam> {
        return this._getSkeletonParam(this._sheetId);
    }

    /**
     * Get skeleton by sheetId
     * @param sheetId
     */
    getSkeleton(sheetId: string): Nullable<SpreadsheetSkeleton> {
        return this._getSkeleton(sheetId);
    }

    /**
     * Get SkeletonParam by sheetId
     * @param sheetId
     */
    getSkeletonParam(sheetId: string): Nullable<ISheetSkeletonManagerParam> {
        return this._getSkeletonParam(sheetId);
    }

    /**
     * @deprecated use `getSkeleton` instead.
     */
    getWorksheetSkeleton(sheetId: string): Nullable<ISheetSkeletonManagerParam> {
        return this.getSkeletonParam(sheetId);
    }

    /**
     * unitId is never read?
     * why ?? what does unitId for ??? no need unitId this service is registered in render unit already.
     */
    // getUnitSkeleton(sheetId: string): Nullable<ISheetSkeletonManagerParam> {
    //     const param = this._getSkeleton(sheetId);
    //     // if (param) {
    //     //     param.unitId = unitId;
    //     // }
    //     return param;
    // }

    setCurrent(searchParam: ISheetSkeletonManagerSearch): Nullable<ISheetSkeletonManagerParam> {
        this._setCurrent(searchParam.sheetId);
    }

    setSkeletonParam(sheetId: string, skp: ISheetSkeletonManagerParam) {
        this._sheetSkService.setSkeleton(skp.unitId, sheetId, skp.skeleton);
        this._sheetSkeletonParamStore.set(sheetId, skp);
    }

    private _setCurrent(sheetId: string): Nullable<ISheetSkeletonManagerParam> {
        this._sheetId = sheetId;
        const skParam = this._getSkeletonParam(sheetId);
        const unitId = this._context.unitId;
        if (skParam != null) {
            this.reCalculate(skParam);
        } else {
            const workbook = this._context.unit;
            const worksheet = workbook.getSheetBySheetId(sheetId);
            if (worksheet == null) {
                return;
            }

            const scene = this._context.scene;
            const skeleton = this._buildSkeleton(worksheet, scene);
            this.setSkeletonParam(sheetId, {
                unitId,
                sheetId,
                skeleton,
                dirty: false,
            });
        }

        const sheetSkeletonManagerParam = this._getSkeletonParam(sheetId);
        this._currentSkeletonBefore$.next(sheetSkeletonManagerParam);
        this._currentSkeleton$.next(sheetSkeletonManagerParam);
    }

    // @TODO why need this? How about caller get skeleton and call sk.calculate()?
    reCalculate(param?: ISheetSkeletonManagerParam) {
        if (!param) {
            param = this.getCurrentParam();
        }
        if (param == null) {
            return;
        }
        if (param.dirty) {
            param.skeleton.makeDirty(true);
            param.dirty = false;
        }
        param.skeleton.calculate();
    }

    /**
     * Make param dirty, if param is dirty, then the skeleton will be makeDirty in _reCalculate()
     * @param searchParm
     * @param state
     */
    makeDirty(searchParm: ISheetSkeletonManagerSearch, state: boolean = true) {
        const param = this._getSkeletonParam(searchParm.sheetId);
        if (param == null) {
            return;
        }
        param.dirty = state;
    }

    /**
     * @deprecated Use function `ensureSkeleton` instead.
     * @param searchParam
     */
    getOrCreateSkeleton(searchParam: ISheetSkeletonManagerSearch) {
        return this.ensureSkeleton(searchParam.sheetId);
    }

    ensureSkeleton(sheetId: string) {
        const skeleton = this._getSkeletonParam(sheetId);
        if (skeleton) {
            return skeleton.skeleton;
        }

        const workbook = this._context.unit;
        const worksheet = workbook.getSheetBySheetId(sheetId);
        if (!worksheet) {
            return;
        }

        const newSkeleton = this._buildSkeleton(worksheet);
        this.setSkeletonParam(sheetId, {
            unitId: this._context.unitId,
            sheetId,
            skeleton: newSkeleton,
            dirty: false,
        });

        return newSkeleton;
    }

    disposeSkeleton(sheetId: string) {
        const skParam = this.getSkeletonParam(sheetId);
        if (skParam) {
            skParam.skeleton.dispose();
            this._sheetSkeletonParamStore.delete(sheetId);
            this._sheetSkService.deleteSkeleton(skParam.unitId, sheetId);
        }
    }

    /** @deprecated Use function `attachRangeWithCoord` instead.  */
    attachRangeWithCoord(range: IRange): Nullable<IRangeWithCoord> {
        const skeleton = this.getCurrentSkeleton();
        if (!skeleton) return null;

        return attachRangeWithCoord(skeleton, range);
    }

    private _getSkeletonParam(sheetId: string): Nullable<ISheetSkeletonManagerParam> {
        const item = this._sheetSkeletonParamStore.get(sheetId);
        return item;
    }

    private _getSkeleton(sheetId: string): Nullable<SpreadsheetSkeleton> {
        const param = this._getSkeletonParam(sheetId);
        return param ? param.skeleton : null;
    }

    private _buildSkeleton(worksheet: Worksheet, scene: Nullable<Scene>) {
        const spreadsheetSkeleton = this._injector.createInstance(
            SpreadsheetSkeleton,
            worksheet,
            this._context.unit.getStyles()
        );
        if (scene) {
            spreadsheetSkeleton.setScene(scene);
        }
        return spreadsheetSkeleton;
    }
}
