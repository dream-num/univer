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

import type { ICellDataForSheetInterceptor, IRange, Nullable, Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule, Scene, SpreadsheetSkeleton } from '@univerjs/engine-render';
import { DisposableCollection, Inject, IPermissionService, IUniverInstanceService, Optional, RANGE_TYPE, Rectangle, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { UnitAction } from '@univerjs/protocol';

import { getSheetCommandTarget, RangeProtectionCache, RangeProtectionRuleModel, SheetsSelectionsService, WorkbookEditablePermission, WorksheetEditPermission, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission, WorksheetSetColumnStylePermission, WorksheetSetRowStylePermission } from '@univerjs/sheets';
import { ISheetSelectionRenderService } from '../../services/selection/base-selection-render.service';
import { HeaderFreezeRenderController } from '../render-controllers/freeze.render-controller';
import { HeaderMoveRenderController } from '../render-controllers/header-move.render-controller';
import { HeaderResizeRenderController } from '../render-controllers/header-resize.render-controller';
import { getTransformCoord } from '../utils/component-tools';

type ICellPermission = Record<UnitAction, boolean> & { ruleId?: string; ranges?: IRange[] };

export class SheetPermissionInterceptorCanvasRenderController extends RxDisposable implements IRenderModule {
    disposableCollection = new DisposableCollection();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(HeaderMoveRenderController) private _headerMoveRenderController: HeaderMoveRenderController,
        @ISheetSelectionRenderService private _selectionRenderService: ISheetSelectionRenderService,
        @Inject(HeaderFreezeRenderController) private _headerFreezeRenderController: HeaderFreezeRenderController,
        @Inject(RangeProtectionCache) private _rangeProtectionCache: RangeProtectionCache,
        @Optional(HeaderResizeRenderController) private _headerResizeRenderController?: HeaderResizeRenderController
    ) {
        super();
        this._initHeaderMovePermissionInterceptor();
        this._initHeaderResizePermissionInterceptor();
        this._initRangeFillPermissionInterceptor();
        this._initRangeMovePermissionInterceptor();
    }

    private _initHeaderMovePermissionInterceptor() {
        const headerMoveInterceptor = this._headerMoveRenderController.interceptor.getInterceptPoints().HEADER_MOVE_PERMISSION_CHECK;
        this.disposeWithMe(
            this._headerMoveRenderController.interceptor.intercept(headerMoveInterceptor, {
                handler: (defaultValue: Nullable<boolean>, selectionRange: IRange) => {
                    const target = getSheetCommandTarget(this._univerInstanceService);
                    if (!target) {
                        return false;
                    }
                    const { unitId, subUnitId } = target;

                    const worksheetEditPermission = this._permissionService.composePermission([new WorkbookEditablePermission(unitId).id, new WorksheetEditPermission(unitId, subUnitId).id]).every((permission) => permission.value);
                    if (!worksheetEditPermission) {
                        return false;
                    }

                    if (!selectionRange) {
                        return true;
                    }

                    if (selectionRange.rangeType !== RANGE_TYPE.ROW && selectionRange.rangeType !== RANGE_TYPE.COLUMN) {
                        return defaultValue;
                    }

                    if (selectionRange.rangeType === RANGE_TYPE.ROW) {
                        for (let i = selectionRange.startRow; i <= selectionRange.endRow; i++) {
                            const rowAllowed = this._rangeProtectionCache.getRowPermissionInfo(unitId, subUnitId, i, [UnitAction.Edit]);
                            if (rowAllowed === false) {
                                return false;
                            }
                        }
                    } else {
                        for (let i = selectionRange.startColumn; i <= selectionRange.endColumn; i++) {
                            const colAllowed = this._rangeProtectionCache.getColPermissionInfo(unitId, subUnitId, i, [UnitAction.Edit]);
                            if (colAllowed === false) {
                                return false;
                            }
                        }
                    }

                    return true;
                },
            })
        );
    }

    private _initHeaderResizePermissionInterceptor() {
        if (!this._headerResizeRenderController) {
            return;
        }

        this.disposeWithMe(
            this._headerResizeRenderController.interceptor.intercept(this._headerResizeRenderController.interceptor.getInterceptPoints().HEADER_RESIZE_PERMISSION_CHECK, {
                handler: (defaultValue: Nullable<boolean>, rangeParams: { row?: number; col?: number }) => {
                    const target = getSheetCommandTarget(this._univerInstanceService);
                    if (!target) {
                        return false;
                    }
                    const { unitId, subUnitId } = target;

                    if (rangeParams.row) {
                        const setRowStylePermission = this._permissionService.getPermissionPoint(new WorksheetSetRowStylePermission(unitId, subUnitId).id)?.value ?? false;
                        if (setRowStylePermission === false) {
                            return false;
                        }
                    } else if (rangeParams.col) {
                        const setColStylePermission = this._permissionService.getPermissionPoint(new WorksheetSetColumnStylePermission(unitId, subUnitId).id)?.value ?? false;
                        if (setColStylePermission === false) {
                            return false;
                        }
                    }

                    return true;
                },
            })
        );
    }

    private _initRangeFillPermissionInterceptor() {
        this.disposeWithMe(
            this._selectionRenderService.interceptor.intercept(this._selectionRenderService.interceptor.getInterceptPoints().RANGE_FILL_PERMISSION_CHECK, {
                handler: (_: Nullable<boolean>, position: { x: number; y: number; skeleton: SpreadsheetSkeleton; scene: Scene }) => {
                    const target = getSheetCommandTarget(this._univerInstanceService);
                    if (!target) {
                        return false;
                    }
                    const { worksheet, unitId, subUnitId } = target;

                    const worksheetEditPermission = this._permissionService.composePermission([
                        new WorkbookEditablePermission(unitId).id,
                        new WorksheetEditPermission(unitId, subUnitId).id,
                        new WorksheetSetCellValuePermission(unitId, subUnitId).id,
                        new WorksheetSetCellStylePermission(unitId, subUnitId).id,
                    ]).every((permission) => permission.value);
                    if (!worksheetEditPermission) {
                        return false;
                    }

                    const ranges = this._selectionManagerService.getCurrentSelections()?.map((selection) => {
                        return selection.range;
                    });

                    const selectionRange = ranges?.find((range) => {
                        const transformCoord = getTransformCoord(position.x, position.y, position.scene, position.skeleton);
                        const cellPosition = position.skeleton.getCellWithCoordByIndex(range.endRow, range.endColumn);
                        const missX = Math.abs(cellPosition.endX - transformCoord.x);
                        const missY = Math.abs(cellPosition.endY - transformCoord.y);
                        return missX <= 5 && missY <= 5;
                    });

                    if (!selectionRange) {
                        return true;
                    }

                    const { startRow, endRow, startColumn, endColumn } = selectionRange;

                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startColumn; col <= endColumn; col++) {
                            const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                            if (permission?.[UnitAction.Edit] === false || permission?.[UnitAction.View] === false) {
                                return false;
                            }
                        }
                    }
                    return true;
                },
            })
        );
    }

    private _initRangeMovePermissionInterceptor() {
        this.disposeWithMe(
            this._selectionRenderService.interceptor.intercept(this._selectionRenderService.interceptor.getInterceptPoints().RANGE_MOVE_PERMISSION_CHECK, {
                handler: (_: Nullable<boolean>, _cellInfo: null) => {
                    const target = getSheetCommandTarget(this._univerInstanceService);
                    if (!target) {
                        return false;
                    }
                    const { worksheet, unitId, subUnitId } = target;

                    const worksheetEditPermission = this._permissionService.composePermission([new WorkbookEditablePermission(unitId).id, new WorksheetEditPermission(unitId, subUnitId).id]).every((permission) => permission.value);
                    if (!worksheetEditPermission) {
                        return false;
                    }

                    const ranges = this._selectionManagerService.getCurrentSelections()?.map((selection) => {
                        return selection.range;
                    });

                    const ruleRanges = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((p, c) => {
                        return [...p, ...c.ranges];
                    }, [] as IRange[]);

                    const permissionLapRanges = ranges?.filter((range) => {
                        return ruleRanges.some((ruleRange) => {
                            return Rectangle.intersects(ruleRange, range);
                        });
                    });

                    const haveNotPermission = permissionLapRanges?.some((range) => {
                        const { startRow, startColumn, endRow, endColumn } = range;
                        for (let row = startRow; row <= endRow; row++) {
                            for (let col = startColumn; col <= endColumn; col++) {
                                const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                                if (permission?.[UnitAction.Edit] === false) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    });

                    return !haveNotPermission;
                },
            })
        );
    }

    private _initFreezePermissionInterceptor() {
        this.disposeWithMe(
            this._headerFreezeRenderController.interceptor.intercept(this._headerFreezeRenderController.interceptor.getInterceptPoints().FREEZE_PERMISSION_CHECK, {
                handler: (_: Nullable<boolean>, __) => {
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                    const worksheet = workbook?.getActiveSheet();
                    if (!worksheet || !workbook) {
                        return false;
                    }
                    const permission = this._permissionService.getPermissionPoint(new WorkbookEditablePermission(workbook.getUnitId()).id)?.value ?? false;
                    return permission;
                },
            })
        );
    }
}
