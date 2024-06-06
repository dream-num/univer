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

import type { ICellDataForSheetInterceptor, IRange, Nullable, Workbook } from '@univerjs/core';
import { DisposableCollection, IPermissionService, IUniverInstanceService, LifecycleStages, OnLifecycle, Rectangle, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { getSheetCommandTarget, RangeProtectionRuleModel, SelectionManagerService, WorkbookEditablePermission, WorksheetEditPermission, WorksheetSetColumnStylePermission, WorksheetSetRowStylePermission } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { IDialogService } from '@univerjs/ui';
import type { IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';

import { UnitAction } from '@univerjs/protocol';
import { HeaderMoveRenderController } from '../render-controllers/header-move.render-controller';
import { HeaderResizeRenderController } from '../render-controllers/header-resize.render-controller';
import { ISelectionRenderService } from '../../services/selection/selection-render.service';
import { HeaderFreezeRenderController } from '../render-controllers/freeze.render-controller';

type ICellPermission = Record<UnitAction, boolean> & { ruleId?: string; ranges?: IRange[] };

export const SHEET_PERMISSION_PASTE_PLUGIN = 'SHEET_PERMISSION_PASTE_PLUGIN';

@OnLifecycle(LifecycleStages.Steady, SheetPermissionInterceptorCanvasRenderController)
export class SheetPermissionInterceptorCanvasRenderController extends RxDisposable implements IRenderModule {
    disposableCollection = new DisposableCollection();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IDialogService private readonly _dialogService: IDialogService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(HeaderMoveRenderController) private _headerMoveRenderController: HeaderMoveRenderController,
        @Inject(HeaderResizeRenderController) private _headerResizeRenderController: HeaderResizeRenderController,
        @ISelectionRenderService private _selectionRenderService: ISelectionRenderService,
        @Inject(HeaderFreezeRenderController) private _headerFreezeRenderController: HeaderFreezeRenderController
    ) {
        super();
        this._initHeaderMovePermissionInterceptor();
        this._initHeaderResizePermissionInterceptor();
        this._initRangeFillPermissionInterceptor();
        this._initRangeMovePermissionInterceptor();
        this._initFreezePermissionInterceptor();
    }

    private _initHeaderMovePermissionInterceptor() {
        this.disposeWithMe(
            this._headerMoveRenderController.interceptor.intercept(this._headerMoveRenderController.interceptor.getInterceptPoints().HEADER_MOVE_PERMISSION_CHECK, {
                handler: (defaultValue: Nullable<boolean>, selectionRange: IRange) => {
                    const target = getSheetCommandTarget(this._univerInstanceService);
                    if (!target) {
                        return false;
                    }
                    const { worksheet, unitId, subUnitId } = target;

                    const workSheetEditPermission = this._permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? false;
                    if (!workSheetEditPermission) {
                        return false;
                    }

                    if (!selectionRange) {
                        return true;
                    }

                    const protectionLapRange = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((p, c) => {
                        return [...p, ...c.ranges];
                    }, [] as IRange[]).filter((range) => {
                        return Rectangle.intersects(range, selectionRange);
                    });

                    const haveNotPermission = protectionLapRange.some((range) => {
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

    private _initHeaderResizePermissionInterceptor() {
        this.disposeWithMe(
            this._headerResizeRenderController.interceptor.intercept(this._headerResizeRenderController.interceptor.getInterceptPoints().HEADER_RESIZE_PERMISSION_CHECK, {
                handler: (defaultValue: Nullable<boolean>, rangeParams: { row?: number; col?: number }) => {
                    const target = getSheetCommandTarget(this._univerInstanceService);
                    if (!target) {
                        return false;
                    }
                    const { worksheet, unitId, subUnitId } = target;

                    const workSheetEditPermission = this._permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? false;
                    if (!workSheetEditPermission) {
                        return false;
                    }

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

                    let selectionRange: Nullable<IRange>;

                    if (rangeParams.row !== undefined) {
                        selectionRange = {
                            startRow: rangeParams.row,
                            endRow: rangeParams.row,
                            startColumn: 0,
                            endColumn: worksheet.getColumnCount() - 1,
                        };
                    } else if (rangeParams.col !== undefined) {
                        selectionRange = {
                            startRow: 0,
                            endRow: worksheet.getRowCount() - 1,
                            startColumn: rangeParams.col,
                            endColumn: rangeParams.col,
                        };
                    }

                    if (!selectionRange) {
                        return true;
                    }

                    const protectionLapRange = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((p, c) => {
                        return [...p, ...c.ranges];
                    }, [] as IRange[]).filter((range) => {
                        return Rectangle.intersects(range, selectionRange);
                    });

                    const haveNotPermission = protectionLapRange.some((range) => {
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

    private _initRangeFillPermissionInterceptor() {
        this.disposeWithMe(
            this._selectionRenderService.interceptor.intercept(this._selectionRenderService.interceptor.getInterceptPoints().RANGE_FILL_PERMISSION_CHECK, {
                handler: (_: Nullable<boolean>, position: { x: number; y: number; skeleton: SpreadsheetSkeleton }) => {
                    const target = getSheetCommandTarget(this._univerInstanceService);
                    if (!target) {
                        return false;
                    }
                    const { worksheet, unitId, subUnitId } = target;

                    const workSheetEditPermission = this._permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? false;
                    if (!workSheetEditPermission) {
                        return false;
                    }

                    const ranges = this._selectionManagerService.getSelections()?.map((selection) => {
                        return selection.range;
                    });

                    const selectionRange = ranges?.find((range) => {
                        const cellPosition = position.skeleton.getCellByIndex(range.endRow, range.endColumn);
                        const missX = Math.abs(cellPosition.endX - position.x);
                        const missY = Math.abs(cellPosition.endY - position.y);
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

                    const workSheetEditPermission = this._permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? false;
                    if (!workSheetEditPermission) {
                        return false;
                    }

                    const ranges = this._selectionManagerService.getSelections()?.map((selection) => {
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
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                    const worksheet = workbook.getActiveSheet();
                    if (!worksheet) {
                        return false;
                    }
                    const permission = this._permissionService.getPermissionPoint(new WorkbookEditablePermission(workbook.getUnitId()).id)?.value ?? false;
                    return permission;
                },
            })
        );
    }
}
