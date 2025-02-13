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

import type { IRange, IRangeWithCoord, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { IRender, IRenderContext, IRenderModule, Scene } from '@univerjs/engine-render';
import { Disposable, Inject, Injector } from '@univerjs/core';
import { SHEET_VIEWPORT_KEY, SpreadsheetSkeleton } from '@univerjs/engine-render';
import { SheetSkeletonService, SheetsSelectionsService } from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { SetColumnHeaderHeightCommand, SetRowHeaderWidthCommand } from '../commands/commands/headersize-changed.command';
import { ISheetSelectionRenderService } from './selection/base-selection-render.service';
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

    // @TODO lumixraku, why need this?  How about put dirty & sheetId & unitId in skeleton itself?
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

            this._sheetSkeletonParamStore.forEach((sk) => this.disposeSkeleton(sk.sheetId));
            this._sheetSkeletonParamStore.clear();
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

    // why ?? what does unitId for ??? no need unitId, this service is registered in render unit already.
    getUnitSkeleton(unitId: string, sheetId: string): Nullable<ISheetSkeletonManagerParam> {
        const param = this._getSkeletonParam(sheetId);
        if (param != null) {
            // unitId is never read?
            param.unitId = unitId;
        }
        return param;
    }

    /**
     * Command in COMMAND_LISTENER_SKELETON_CHANGE would cause setCurrent, see @packages/sheets-ui/src/controllers/render-controllers/sheet.render-controller.ts
     * @param searchParam
     */
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

    // @TODO why need this function? How about caller get skeleton and call sk.calculate()?
    reCalculate(param?: Nullable<ISheetSkeletonManagerParam>) {
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

    private _buildSkeleton(worksheet: Worksheet, _scene?: Nullable<Scene>) {
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
