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

import type {
    ICellCustomRender,
    ICellDataForSheetInterceptor,
    ICellRenderContext,
    Nullable,
    Workbook,
} from '@univerjs/core';
import type {
    IMouseEvent,
    IPointerEvent,
    IRenderContext,
    IRenderModule,
    RenderManagerService,
    Scene,
    Spreadsheet,
    SpreadsheetSkeleton,
} from '@univerjs/engine-render';
import type { ICellPermission, ISheetSkeletonManagerParam } from '@univerjs/sheets';
import {
    Disposable,
    DisposableCollection,
    fromEventSubject,
    Inject,
    IPermissionService,
    sortRules,
} from '@univerjs/core';
import { IRenderManagerService, Vector2 } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import { WorkbookEditablePermission, WorksheetEditPermission } from '@univerjs/sheets';
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

    private _initEventBinding() {
        const disposableCollection = new DisposableCollection();
        const handleSkeletonChange = (skeletonParam: Nullable<ISheetSkeletonManagerParam>) => {
            disposableCollection.dispose();
            if (skeletonParam) {
                this._bindEvents(skeletonParam.skeleton, disposableCollection);
            }
        };

        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe(handleSkeletonChange));
        handleSkeletonChange(this._sheetSkeletonManagerService.getCurrentParam());
        this.disposeWithMe(disposableCollection);
    }

    private _getActiveRender(evt: IPointerEvent | IMouseEvent, skeleton: SpreadsheetSkeleton, scene: Scene) {
        const { offsetX, offsetY } = evt;
        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return;
        }

        const activeViewport = scene.getActiveViewportByCoord(Vector2.FromArray([offsetX, offsetY]));
        if (!activeViewport) {
            return;
        }

        const { scaleX, scaleY } = scene.getAncestorScale();
        const scrollXY = { x: activeViewport.viewportScrollX, y: activeViewport.viewportScrollY };
        const cellPos = skeleton.getCellIndexByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);
        const mergeCell = skeleton.worksheet.getMergedCell(cellPos.row, cellPos.column);
        const row = mergeCell ? mergeCell.startRow : cellPos.row;
        const col = mergeCell ? mergeCell.startColumn : cellPos.column;
        const cellData = worksheet.getCell(row, col);
        if (!cellData?.customRender?.length) {
            return;
        }

        const info: ICellRenderContext = {
            data: cellData,
            style: worksheet.getComposedCellStyleByCellData(row, col, cellData),
            primaryWithCoord: skeleton.getCellWithCoordByIndex(row, col),
            unitId: this._context.unitId,
            subUnitId: worksheet.getSheetId(),
            row,
            col,
            workbook,
            worksheet,
        };
        const position = {
            x: scrollXY.x + (offsetX / scaleX),
            y: scrollXY.y + (offsetY / scaleY),
        };
        const activeRender = cellData.customRender.sort(sortRules).find((render) => render.isHit?.(position, info));
        if (activeRender) {
            return [activeRender, info] as const;
        }
    }

    private _bindEvents(skeleton: SpreadsheetSkeleton, disposableCollection: DisposableCollection) {
        const currentRender = this._renderManagerService.getRenderUnitById(this._context.unitId);
        if (!currentRender?.mainComponent) {
            return;
        }

        const spreadsheet = currentRender.mainComponent as Spreadsheet;
        const disposable = spreadsheet.onPointerDown$.subscribeEvent((evt) => {
            const activeRenderInfo = this._getActiveRender(evt, skeleton, currentRender.scene);
            if (!activeRenderInfo) {
                return;
            }

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
        });
        const moveDisposable = fromEventSubject(spreadsheet.onPointerMove$).pipe(throttleTime(30)).subscribe((evt) => {
            this._handlePointerMove(evt, skeleton, currentRender.scene);
        });

        disposable && disposableCollection.add(disposable);
        disposableCollection.add(moveDisposable);
    }

    private _handlePointerMove(evt: IPointerEvent | IMouseEvent, skeleton: SpreadsheetSkeleton, scene: Scene) {
        const activeRenderInfo = this._getActiveRender(evt, skeleton, scene);
        if (activeRenderInfo) {
            const [activeRender, cellContext] = activeRenderInfo;
            if (this._enterActiveRender?.render === activeRender) {
                return;
            }

            this._enterActiveRender?.render.onPointerLeave?.(this._enterActiveRender.cellContext, evt);
            this._enterActiveRender = { render: activeRender, cellContext };
            activeRender.onPointerEnter?.(cellContext, evt);
        } else if (this._enterActiveRender) {
            this._enterActiveRender.render.onPointerLeave?.(this._enterActiveRender.cellContext, evt);
            this._enterActiveRender = null;
        }
    }
}
