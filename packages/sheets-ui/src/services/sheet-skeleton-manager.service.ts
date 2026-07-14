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

import type { DependencyIdentifier, Nullable, Workbook } from '@univerjs/core';
import type { IRender, IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISheetSkeletonManagerParam } from '@univerjs/sheets';
import { Disposable, Inject } from '@univerjs/core';
import { SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { SheetSkeletonService, SheetsSelectionsService } from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import {
    SetColumnHeaderHeightCommand,
    SetRowHeaderWidthCommand,
} from '../commands/commands/headersize-changed.command';
import { ISheetSelectionRenderService } from './selection/base-selection-render.service';

export interface ISheetSkeletonManagerSearch {
    sheetId: string;
    commandId?: string; // WTF: why?
}

/**
 * SheetSkeletonManagerService is registered in a render unit
 */
export class SheetSkeletonManagerService extends Disposable implements IRenderModule {
    private _sheetId: string = '';

    private readonly _currentSkeleton$ = new BehaviorSubject<Nullable<ISheetSkeletonManagerParam>>(null);
    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();

    /**
     * CurrentSkeletonBefore for pre-triggered logic during registration
     */
    private readonly _currentSkeletonBefore$ = new BehaviorSubject<Nullable<ISheetSkeletonManagerParam>>(null);
    readonly currentSkeletonBefore$ = this._currentSkeletonBefore$.asObservable();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonService) private readonly _sheetSkeletonService: SheetSkeletonService
    ) {
        super();

        const { unitId, scene } = this._context;
        this._sheetSkeletonService.setScene(unitId, scene);

        this._initSkeletonsRegisterGetCellHeight(unitId);
    }

    private _initSkeletonsRegisterGetCellHeight(unitId: string) {
        const skeletons = this._sheetSkeletonService.getSkeletonsByUnitId(unitId);
        skeletons.forEach((skeleton) => skeleton.registerGetCellHeight());

        this.disposeWithMe(
            this._sheetSkeletonService.buildSkeleton$.subscribe((skeleton) => skeleton.registerGetCellHeight())
        );
    }

    override dispose(): void {
        super.dispose();

        this._currentSkeletonBefore$.complete();
        this._currentSkeleton$.complete();
    }

    getCurrentSkeleton(): Nullable<SpreadsheetSkeleton> {
        return this.getCurrentParam()?.skeleton;
    }

    /**
     * get ISheetSkeletonManagerParam from _currentSkeletonSearchParam
     */
    getCurrentParam(): Nullable<ISheetSkeletonManagerParam> {
        return this._getSkeletonParam(this._sheetId);
    }

    /**
     * Get skeleton by sheetId
     */
    getSkeleton(sheetId: string): Nullable<SpreadsheetSkeleton> {
        return this._getSkeleton(sheetId);
    }

    /**
     * Get SkeletonParam by sheetId
     */
    getSkeletonParam(sheetId: string): Nullable<ISheetSkeletonManagerParam> {
        return this._getSkeletonParam(sheetId);
    }

    /**
     * Command in COMMAND_LISTENER_SKELETON_CHANGE would cause setCurrent, see @packages/sheets-ui/src/controllers/render-controllers/sheet.render-controller.ts
     */
    setCurrent(searchParam: ISheetSkeletonManagerSearch) {
        this._setCurrent(searchParam.sheetId);
    }

    private _setCurrent(sheetId: string) {
        this._sheetId = sheetId;

        let skeletonParam = this._getSkeletonParam(sheetId);
        if (!skeletonParam) {
            const workbook = this._context.unit;
            const worksheet = workbook.getSheetBySheetId(sheetId);
            const unitId = this._context.unitId;

            if (!worksheet) {
                return;
            }

            skeletonParam = this._sheetSkeletonService.newSkeletonParam(unitId, sheetId, worksheet, workbook.getStyles());
        } else {
            this.reCalculate(skeletonParam);
        }

        this._currentSkeletonBefore$.next(skeletonParam);
        this._currentSkeleton$.next(skeletonParam);
    }

    // @TODO why need this function? How about caller get skeleton and call sk.calculate()?
    reCalculate(param?: Nullable<ISheetSkeletonManagerParam>) {
        const skeletonParam = param || this.getCurrentParam();

        if (!skeletonParam) {
            return;
        }

        if (skeletonParam.dirty) {
            skeletonParam.skeleton.makeDirty(true);
            skeletonParam.dirty = false;
        }

        skeletonParam.skeleton.calculate();
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

    ensureSkeleton(sheetId: string): SpreadsheetSkeleton | undefined {
        return this._sheetSkeletonService.ensureSkeleton(this._context.unitId, sheetId);
    }

    private _getSkeletonParam(sheetId: string): Nullable<ISheetSkeletonManagerParam> {
        return this._sheetSkeletonService.getSkeletonParam(this._context.unitId, sheetId);
    }

    private _getSkeleton(sheetId: string): Nullable<SpreadsheetSkeleton> {
        return this._sheetSkeletonService.getSkeleton(this._context.unitId, sheetId);
    }

    setColumnHeaderSize(render: Nullable<IRender>, sheetId: string, size: number) {
        if (!render) return;
        const skeleton = this.getSkeleton(sheetId);
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
        this._resetSelectionsIfAvailable(render);

        const sheetSkeletonManagerParam = this._sheetSkeletonService.getSkeletonParam(render.unitId, sheetId);
        if (sheetSkeletonManagerParam) {
            sheetSkeletonManagerParam.commandId = SetColumnHeaderHeightCommand.id;
            this._currentSkeleton$.next(sheetSkeletonManagerParam);
        }
    }

    setRowHeaderSize(render: Nullable<IRender>, sheetId: string, size: number) {
        if (!render) return;
        const skeleton = this.getSkeleton(sheetId);
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
        this._resetSelectionsIfAvailable(render);

        const sheetSkeletonManagerParam = this._sheetSkeletonService.getSkeletonParam(render.unitId, sheetId);
        if (sheetSkeletonManagerParam) {
            sheetSkeletonManagerParam.commandId = SetRowHeaderWidthCommand.id;
            this._currentSkeleton$.next(sheetSkeletonManagerParam);
        }
    }

    private _resetSelectionsIfAvailable(render: IRender): void {
        const selectionService = this._tryGetRenderDependency(render, SheetsSelectionsService);
        const selectionRenderService = this._tryGetRenderDependency(render, ISheetSelectionRenderService);
        if (!selectionService || !selectionRenderService) {
            return;
        }

        const currSelections = selectionService.getCurrentSelections();
        selectionRenderService.resetSelectionsByModelData(currSelections);
    }

    private _tryGetRenderDependency<T>(render: IRender, dependency: DependencyIdentifier<T>): Nullable<T> {
        try {
            return render.with(dependency);
        } catch (error) {
            if (error instanceof Error && (error.message.includes('DependencyNotFoundError') || error.message.includes('Cannot find'))) {
                return null;
            }

            throw error;
        }
    }
}
