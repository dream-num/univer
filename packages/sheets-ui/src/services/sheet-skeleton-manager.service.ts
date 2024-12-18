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
import type { IRender, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, Inject, Injector } from '@univerjs/core';
import { SHEET_VIEWPORT_KEY, SpreadsheetSkeleton } from '@univerjs/engine-render';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { SetColumnHeaderHeightCommand, SetRowHeaderWidthCommand } from '../commands/commands/headersize-changed.command';
import { ISheetSelectionRenderService } from './selection/base-selection-render.service';
import { attachRangeWithCoord } from './selection/util';

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
    private _currentSkeletonSearchParam: ISheetSkeletonManagerSearch = {
        sheetId: '',
    };

    private _sheetSkeletonStore: Map<string, ISheetSkeletonManagerParam> = new Map();

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
            this._sheetSkeletonStore = new Map();
        });

        this._initRemoveSheet();
        window.sks = this;
    }

    private _initRemoveSheet() {
        this.disposeWithMe(this._context.unit.sheetDisposed$.subscribe((sheet) => {
            this.disposeSkeleton(sheet.getSheetId());
        }));
    }

    getCurrentSkeleton(): Nullable<SpreadsheetSkeleton> {
        return this.getCurrent()?.skeleton;
    }

    getCurrent(): Nullable<ISheetSkeletonManagerParam> {
        return this._getSkeleton(this._currentSkeletonSearchParam.sheetId);
    }

    getWorksheetSkeleton(sheetId: string): Nullable<ISheetSkeletonManagerParam> {
        return this._getSkeleton(sheetId);
    }

    /**
     * unitId is never read?
     * why ?? what does unitId for ???
     */
    getUnitSkeleton(unitId: string, sheetId: string): Nullable<ISheetSkeletonManagerParam> {
        const param = this._getSkeleton(sheetId);
        if (param) {
            param.unitId = unitId;
        }
        return param;
    }

    setCurrent(searchParam: ISheetSkeletonManagerSearch): Nullable<ISheetSkeletonManagerParam> {
        this._setCurrent(searchParam);
    }

    private _setCurrent(searchParam: ISheetSkeletonManagerSearch): Nullable<ISheetSkeletonManagerParam> {
        const skParam = this._getSkeleton(searchParam.sheetId);
        const unitId = this._context.unitId;
        if (skParam != null) {
            this._reCalculate(skParam);
        } else {
            const { sheetId } = searchParam;
            const workbook = this._context.unit;
            const worksheet = workbook.getSheetBySheetId(searchParam.sheetId);
            if (worksheet == null) {
                return;
            }

            const skeleton = this._buildSkeleton(worksheet);
            this._sheetSkeletonStore.set(sheetId, {
                unitId,
                sheetId,
                skeleton,
                dirty: false,
            });
        }

        this._currentSkeletonSearchParam = searchParam;
        const sheetId = this._currentSkeletonSearchParam.sheetId;
        const sheetSkeletonManagerParam = this.getUnitSkeleton(unitId, sheetId);

        console.log('curr sk !!!');
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

    private _reCalculate(skParam: ISheetSkeletonManagerParam) {
        if (skParam.dirty) {
            skParam.skeleton.makeDirty(true);
            skParam.dirty = false;
        }
        skParam.skeleton.calculate();
    }

    /**
     * Make param dirty, if param is dirty, then the skeleton will be makeDirty in _reCalculate()
     * @param searchParm
     * @param state
     */
    makeDirty(searchParm: ISheetSkeletonManagerSearch, state: boolean = true) {
        const param = this._getSkeleton(searchParm.sheetId);
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
        this.ensureSkeleton(searchParam.sheetId);
    }

    ensureSkeleton(sheetId: string) {
        const skeleton = this._getSkeleton(sheetId);
        if (skeleton) {
            return skeleton.skeleton;
        }

        const workbook = this._context.unit;
        const worksheet = workbook.getSheetBySheetId(sheetId);
        if (!worksheet) {
            return;
        }

        const newSkeleton = this._buildSkeleton(worksheet);
        this._sheetSkeletonStore.set(sheetId, {
            unitId: this._context.unitId,
            sheetId,
            skeleton: newSkeleton,
            dirty: false,
        });

        return newSkeleton;
    }

    disposeSkeleton(sheetId: string) {
        const skParam = this.getWorksheetSkeleton(sheetId);
        if (skParam) {
            skParam.skeleton.dispose();
            this._sheetSkeletonStore.delete(sheetId);
        }
        // const index = this._sheetSkeletonStore.findIndex((param) => param.sheetId === searchParm.sheetId);
        // if (index > -1) {
        //     const skeleton = this._sheetSkeletonStore[index];
        //     skeleton.skeleton.dispose();
        //     this._sheetSkeletonStore.splice(index, 1);
        // }
    }

    /** @deprecated Use function `attachRangeWithCoord` instead.  */
    attachRangeWithCoord(range: IRange): Nullable<IRangeWithCoord> {
        const skeleton = this.getCurrentSkeleton();
        if (!skeleton) return null;

        return attachRangeWithCoord(skeleton, range);
    }

    private _getSkeleton(sheetId: string): Nullable<ISheetSkeletonManagerParam> {
        // const item = this._sheetSkeletonStore.find((param) => param.sheetId === searchParm.sheetId);
        const item = this._sheetSkeletonStore.get(sheetId);
        // if (item) {
        //     item.commandId = searchParm.commandId;
        // }

        return item;
    }

    private _buildSkeleton(worksheet: Worksheet) {
        const spreadsheetSkeleton = this._injector.createInstance(
            SpreadsheetSkeleton,
            worksheet,
            this._context.unit.getStyles()
        );

        return spreadsheetSkeleton;
    }

    setColumnHeaderSize(render: Nullable<IRender>, sheetId: string, size: number) {
        if (!render) return;
        const skeleton = this.getWorksheetSkeleton(sheetId)?.skeleton;
        if (!skeleton) return;

        skeleton.columnHeaderHeight = size;
        render.scene.getViewports()[0].top = size;
        render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT)!.setViewportSize({
            height: size,
        });
        render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT)!.setViewportSize({
            height: size,
        });
        render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM)!.setViewportSize({
            top: size,
        });
        render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_ROW_TOP)!.setViewportSize({
            top: size,
        });
        render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP)!.setViewportSize({
            height: size,
        });
        const selectionService = render?.with(SheetsSelectionsService);
        const selectionRenderService = render?.with(ISheetSelectionRenderService);
        const currSelections = selectionService.getCurrentSelections();
        selectionRenderService.resetSelectionsByModelData(currSelections);

        const sheetSkeletonManagerParam = this.getUnitSkeleton(render.unitId, sheetId);
        if (sheetSkeletonManagerParam) {
            sheetSkeletonManagerParam.commandId = SetColumnHeaderHeightCommand.id;
            this._currentSkeleton$.next(sheetSkeletonManagerParam);
        }
    }

    setRowHeaderSize(render: Nullable<IRender>, sheetId: string, size: number) {
        const skeleton = this.getWorksheetSkeleton(sheetId)?.skeleton;
        if (!render) return;
        if (!skeleton) return;
        skeleton.rowHeaderWidth = size;
        const originWidth = render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP)!.width || 46;
        const deltaX = size - originWidth;

        const originLeftOfViewMain = render.scene.getViewports()[0].left;
        render.scene.getViewports()[0].left = originLeftOfViewMain + deltaX;

        render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM)!.setViewportSize({
            width: size,
        });
        render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_ROW_TOP)!.setViewportSize({
            width: size,
        });
        render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT)!.setViewportSize({
            left: size,
        });
        const prevLeft = render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT)!.left || 0;
        render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT)!.setViewportSize({
            left: prevLeft + deltaX,
        });
        render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP)!.setViewportSize({
            width: size,
        });
        const selectionService = render?.with(SheetsSelectionsService);
        const selectionRenderService = render?.with(ISheetSelectionRenderService);
        const currSelections = selectionService.getCurrentSelections();
        selectionRenderService.resetSelectionsByModelData(currSelections);

        const sheetSkeletonManagerParam = this.getCurrent();
        if (sheetSkeletonManagerParam) {
            sheetSkeletonManagerParam.commandId = SetRowHeaderWidthCommand.id;
            this._currentSkeleton$.next(sheetSkeletonManagerParam);
        }
    }
}
