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

import type { ICellCustomRender, ICellDataForSheetInterceptor, ICellRenderContext, Nullable, Workbook } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, RenderManagerService, Spreadsheet } from '@univerjs/engine-render';
import type { ICellPermission } from '@univerjs/sheets';
import type { ISheetSkeletonManagerParam } from '../services/sheet-skeleton-manager.service';
import { Disposable, DisposableCollection, fromEventSubject, Inject, IPermissionService, sortRules } from '@univerjs/core';
import { IRenderManagerService, Vector2 } from '@univerjs/engine-render';
import { UnitAction, WorkbookEditablePermission, WorksheetEditPermission } from '@univerjs/sheets';
import { throttleTime } from 'rxjs';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

export class CellCustomRenderController extends Disposable implements IRenderModule {
    private _enterActiveRender: Nullable<{
        render: ICellCustomRender;
        cellContext: ICellRenderContext;
    }>;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: RenderManagerService,
        @IPermissionService private readonly _permissionService: IPermissionService
    ) {
        super();
        this._initEventBinding();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initEventBinding() {
        const disposableCollection = new DisposableCollection();

        const workbook = this._context.unit;
        // eslint-disable-next-line max-lines-per-function
        const handleSkeletonChange = (skeletonParam: Nullable<ISheetSkeletonManagerParam>) => {
            disposableCollection.dispose();
            if (!skeletonParam) {
                return;
            }

            const unitId = this._context.unitId;
            const { skeleton } = skeletonParam;
            const currentRender = this._renderManagerService.getRenderById(unitId);
            if (currentRender && currentRender.mainComponent) {
                const spreadsheet = currentRender.mainComponent as Spreadsheet;
                // eslint-disable-next-line max-lines-per-function
                const getActiveRender = (evt: IPointerEvent | IMouseEvent) => {
                    const { offsetX, offsetY } = evt;
                    const scene = currentRender.scene;
                    const worksheet = workbook.getActiveSheet();

                    if (!worksheet) {
                        return;
                    }

                    const activeViewport = scene.getActiveViewportByCoord(
                        Vector2.FromArray([offsetX, offsetY])
                    );

                    if (!activeViewport) {
                        return;
                    }

                    const { scaleX, scaleY } = scene.getAncestorScale();

                    const scrollXY = {
                        x: activeViewport.viewportScrollX,
                        y: activeViewport.viewportScrollY,
                    };

                    const cellPos = skeleton.getCellIndexByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);

                    // const mergeCell = skeleton.mergeData.find((range) => {
                    //     const { startColumn, startRow, endColumn, endRow } = range;
                    //     return cellPos.row >= startRow && cellPos.column >= startColumn && cellPos.row <= endRow && cellPos.column <= endColumn;
                    // });
                    const mergeCell = skeleton.worksheet.getMergedCell(cellPos.row, cellPos.column);

                    const cellIndex = {
                        actualRow: mergeCell ? mergeCell.startRow : cellPos.row,
                        actualCol: mergeCell ? mergeCell.startColumn : cellPos.column,
                        mergeCell,
                        row: cellPos.row,
                        col: cellPos.column,
                    };

                    if (!cellIndex || !skeleton) {
                        return;
                    }

                    const cellData = worksheet.getCell(cellIndex.actualRow, cellIndex.actualCol);
                    if (!cellData) {
                        return;
                    }

                    const renders = cellData.customRender;

                    if (!renders?.length) {
                        return;
                    }
                    const row = cellIndex.actualRow;
                    const col = cellIndex.actualCol;
                    const sortedRenders = renders.sort(sortRules);
                    const subUnitId = worksheet.getSheetId();

                    const info: ICellRenderContext = {
                        data: cellData,
                        style: skeleton.getStyles().getStyleByCell(cellData),
                        primaryWithCoord: skeleton.getCellWithCoordByIndex(cellIndex.actualRow, cellIndex.actualCol),
                        unitId,
                        subUnitId,
                        row,
                        col,
                        workbook,
                        worksheet,
                    };

                    const position = {
                        x: scrollXY.x + (offsetX / scaleX),
                        y: scrollXY.y + (offsetY / scaleY),
                    };

                    const activeRender = sortedRenders.find((render) => render.isHit?.(position, info));
                    if (!activeRender) {
                        return;
                    }
                    return [activeRender, info] as const;
                };

                const disposable = spreadsheet.onPointerDown$.subscribeEvent((evt) => {
                    const activeRenderInfo = getActiveRender(evt);
                    if (activeRenderInfo) {
                        const [activeRender, cellContext] = activeRenderInfo;
                        const { row, col, worksheet, unitId, subUnitId } = cellContext;
                        const sheetEditable = this._permissionService.composePermission(
                            [new WorkbookEditablePermission(unitId).id, new WorksheetEditPermission(unitId, subUnitId).id]
                        )?.every((permission) => permission.value);

                        if (!sheetEditable) {
                            return false;
                        }

                        const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                        if (permission?.[UnitAction.Edit] === false) {
                            return false;
                        }

                        activeRender.onPointerDown?.(cellContext, evt);
                    }
                });

                const moveDisposable = fromEventSubject(spreadsheet.onPointerMove$).pipe(throttleTime(30)).subscribe((evt) => {
                    const activeRenderInfo = getActiveRender(evt);
                    if (activeRenderInfo) {
                        const [activeRender, cellContext] = activeRenderInfo;
                        if (this._enterActiveRender) {
                            if (this._enterActiveRender.render !== activeRender) {
                                this._enterActiveRender.render.onPointerLeave?.(this._enterActiveRender.cellContext, evt);
                                this._enterActiveRender = {
                                    render: activeRender,
                                    cellContext,
                                };
                                activeRender.onPointerEnter?.(cellContext, evt);
                            }
                        } else {
                            this._enterActiveRender = {
                                render: activeRender,
                                cellContext,
                            };
                            activeRender.onPointerEnter?.(cellContext, evt);
                        }
                    } else {
                        if (this._enterActiveRender) {
                            this._enterActiveRender.render.onPointerLeave?.(this._enterActiveRender.cellContext, evt);
                            this._enterActiveRender = null;
                        }
                    }
                });

                disposable && disposableCollection.add(disposable);
                moveDisposable && disposableCollection.add(moveDisposable);
            }
        };

        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe(handleSkeletonChange));
        handleSkeletonChange(this._sheetSkeletonManagerService.getCurrentParam());
        this.disposeWithMe(disposableCollection);
    }
}
