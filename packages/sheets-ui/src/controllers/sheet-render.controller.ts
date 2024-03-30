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

import type { ICommandInfo, Workbook, IRange } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    RxDisposable,
    toDisposable,
    UniverInstanceType,
    Tools,
} from '@univerjs/core';
import type { Rect, SpreadsheetColumnHeader, SpreadsheetRowHeader, Engine, SpreadsheetSkeleton, IBoundRectNoAngle, Viewport, IBounds, IViewportBounds } from '@univerjs/engine-render';
import { IRenderManagerService, RENDER_RAW_FORMULA_KEY, Spreadsheet } from '@univerjs/engine-render';
import {
    COMMAND_LISTENER_SKELETON_CHANGE,
    COMMAND_LISTENER_VALUE_CHANGE,
    SetRangeValuesMutation,
    SetWorksheetActiveOperation,
} from '@univerjs/sheets';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';

import { distinctUntilChanged, takeUntil } from 'rxjs';
import { SHEET_VIEW_KEY } from '../common/keys';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

interface ISetWorksheetMutationParams {
    unitId: string;
    subUnitId: string;
}

@OnLifecycle(LifecycleStages.Ready, SheetRenderController)
export class SheetRenderController extends RxDisposable {
    private _skeletonChangeMutations = new Set<string>();

    constructor(
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._init();
    }

    /**
     * Register a mutation id that will trigger the skeleton change.
     *
     * @param mutationId the id of the mutation
     * @returns a disposable to unregister the mutation
     */
    registerSkeletonChangingMutations(mutationId: string): IDisposable {
        if (this._skeletonChangeMutations.has(mutationId)) {
            throw new Error(`[SheetRenderController]: the mutationId ${mutationId} has already been registered!`);
        }

        this._skeletonChangeMutations.add(mutationId);
        return toDisposable(() => this._skeletonChangeMutations.delete(mutationId));
    }

    private _init() {
        this._initialRenderRefresh();
        this._initSheetDisposeListener();
        this._initCommandListener();
        this._initContextListener();
    }

    private _initialRenderRefresh(): void {
        this.disposeWithMe(
            this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
                if (!param) return null;

                const { skeleton: spreadsheetSkeleton, unitId, sheetId } = param;
                const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
                const worksheet = workbook?.getSheetBySheetId(sheetId);
                if (workbook == null || worksheet == null) return;

                const currentRender = this._renderManagerService.getRenderById(unitId);
                if (currentRender == null) return;

                const { mainComponent, components } = currentRender;
                const spreadsheet = mainComponent as Spreadsheet;
                const spreadsheetRowHeader = components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetRowHeader;
                const spreadsheetColumnHeader = components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
                const spreadsheetLeftTopPlaceholder = components.get(SHEET_VIEW_KEY.LEFT_TOP) as Rect;
                const { rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;

                spreadsheet?.updateSkeleton(spreadsheetSkeleton);
                spreadsheetRowHeader?.updateSkeleton(spreadsheetSkeleton);
                spreadsheetColumnHeader?.updateSkeleton(spreadsheetSkeleton);
                spreadsheetLeftTopPlaceholder?.transformByState({
                    width: rowHeaderWidth,
                    height: columnHeaderHeight,
                });
            })
        );
    }

    private _initSheetDisposeListener(): void {
        this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET)
            .pipe(takeUntil(this.dispose$))
            .subscribe((workbook) => {
                const unitId = workbook.getUnitId();

                this._sheetSkeletonManagerService.removeSkeleton({ unitId });
            });
    }

    private _initCommandListener(): void {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                if (!workbook) return;

                const unitId = workbook.getUnitId();
                if (COMMAND_LISTENER_SKELETON_CHANGE.includes(command.id) || this._skeletonChangeMutations.has(command.id)) {
                    const worksheet = workbook.getActiveSheet();
                    const sheetId = worksheet.getSheetId();
                    const params = command.params;
                    const { unitId, subUnitId } = params as ISetWorksheetMutationParams;

                    if (!(unitId === workbook.getUnitId() && subUnitId === worksheet.getSheetId())) {
                        return;
                    }


                    if (command.id !== SetWorksheetActiveOperation.id) {
                        this._sheetSkeletonManagerService.makeDirty(
                            {
                                unitId,
                                sheetId,
                                commandId: command.id,
                            },
                            true
                        );
                    }

                    // Change the skeleton to render when the sheet is changed.
                    // Should also check the init sheet.
                    this._sheetSkeletonManagerService.setCurrent({
                        unitId,
                        sheetId,
                        commandId: command.id,
                    });
                    const sk = this._sheetSkeletonManagerService.getCurrent();
                    // const { rowHeightAccumulation, columnWidthAccumulation, rowHeaderWidth, columnHeaderHeight } = sk.skeleton;
                    // console.log('sk', rowHeightAccumulation, columnWidthAccumulation, rowHeaderWidth, columnHeaderHeight)

                } else if (COMMAND_LISTENER_VALUE_CHANGE.includes(command.id)) {
                    this._sheetSkeletonManagerService.reCalculate();
                }

                if (command.type === CommandType.MUTATION) {
                    this._renderManagerService.getRenderById(unitId)?.mainComponent?.makeDirty(); // refresh spreadsheet
                    // 还有个概念和这个很像， SetRangeValuesCommand
                    if(command.id === SetRangeValuesMutation.id) {
                        const sk = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                        const currentRender = this._renderManagerService.getRenderById(unitId);
                        if (currentRender == null) {
                            return;
                        }

                        const { mainComponent, components, engine, scene } = currentRender;
                        const spreadsheet = mainComponent as Spreadsheet;

                        // TODO command.params 数据结构有很多种
                        const dirtyRange = this._cellValueToRange(command.params?.cellValue);
                        const dirtyBounds = this._rangeToBounds([dirtyRange], sk!);
                        const viewports = scene.getViewports();
                        this.dirtyViewBounds(viewports, dirtyBounds);
                        spreadsheet.makeDirtyArea(dirtyBounds);
                        scene.makeDirty();
                    }
                }
            })
        );
    }

    private _initContextListener(): void {
        // If we toggle the raw formula, we need to refresh all spreadsheets.
        this._contextService.subscribeContextValue$(RENDER_RAW_FORMULA_KEY)
            .pipe(distinctUntilChanged(), takeUntil(this.dispose$))
            .subscribe(() => {
                this._renderManagerService.getRenderAll().forEach((renderer) => {
                    if (renderer.mainComponent instanceof Spreadsheet) {
                        renderer.mainComponent.makeForceDirty(true);
                    }
                });
            });
    }

    private _cellValueToRange(cellValue: Record<number, Record<number, object>>) {
        let rows = Object.keys(cellValue).map(Number);
        let columns = [];

        for (let [row, columnObj] of Object.entries(cellValue)) {
          for (let column in columnObj) {
            columns.push(Number(column));
          }
        }

        let startRow = Math.min(...rows);
        let endRow = Math.max(...rows);
        let startColumn = Math.min(...columns);
        let endColumn = Math.max(...columns);

        return {
          startRow: startRow,
          endRow: endRow,
          startColumn: startColumn,
          endColumn: endColumn
        } as IRange;
    }

    private _rangeToBounds(ranges: IRange[], sk: SpreadsheetSkeleton) {
        const { rowHeightAccumulation, columnWidthAccumulation, rowHeaderWidth, columnHeaderHeight } = sk;
        // rowHeightAccumulation 已经表示的是行底部的高度
        const dirtyBounds:IViewportBounds[] = [];
        for (let r of ranges) {
            let { startRow, endRow, startColumn, endColumn } = r;
            let top = startRow == 0 ? 0: rowHeightAccumulation[startRow -1] + columnHeaderHeight;
            let bottom = rowHeightAccumulation[endRow] + columnHeaderHeight;
            let left = startColumn == 0 ? 0 : columnWidthAccumulation[startColumn -1] + rowHeaderWidth;
            let right = columnWidthAccumulation[endColumn] + rowHeaderWidth;
            dirtyBounds.push({top, left, bottom, right, width: right - left, height: bottom - top});
        }
        return dirtyBounds;
    }

    private dirtyViewBounds(viewports: Viewport[], dirtyBounds:IViewportBounds[]) {
        for (const vp of viewports) {
            for(const b of dirtyBounds) {
                if(Tools.hasIntersectionBetweenTwoBounds(vp.cacheBound, b)) {
                    vp.makeDirty(true);
                }
            }
        }
    }
}
