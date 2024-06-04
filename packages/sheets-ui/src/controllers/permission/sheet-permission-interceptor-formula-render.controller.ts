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
import { DisposableCollection, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, IPermissionService, IUniverInstanceService, LifecycleStages, OnLifecycle, Rectangle, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { getSheetCommandTarget, RangeProtectionPermissionViewPoint, RangeProtectionRuleModel, WorksheetViewPermission } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { debounceTime, filter } from 'rxjs/operators';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import { NullValueObject } from '@univerjs/engine-formula';
import { StatusBarController } from '../status-bar.controller';
import { FormulaEditorController } from '../editor/formula-editor.controller';

type ICellPermission = Record<UnitAction, boolean> & { ruleId?: string; ranges?: IRange[] };

export const SHEET_PERMISSION_PASTE_PLUGIN = 'SHEET_PERMISSION_PASTE_PLUGIN';

@OnLifecycle(LifecycleStages.Steady, SheetPermissionInterceptorFormulaRenderController)
export class SheetPermissionInterceptorFormulaRenderController extends RxDisposable implements IRenderModule {
    disposableCollection = new DisposableCollection();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) private readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(StatusBarController) private readonly _statusBarController: StatusBarController
    ) {
        super();
        this._initFormulaEditorPermissionInterceptor();
        this._initStatusBarPermissionInterceptor();
    }

    private _initStatusBarPermissionInterceptor() {
        this.disposeWithMe(
            this._statusBarController.interceptor.intercept(this._statusBarController.interceptor.getInterceptPoints().STATUS_BAR_PERMISSION_CORRECT, {
                priority: 100,
                handler: (defaultValue, originValue) => {
                    const target = getSheetCommandTarget(this._univerInstanceService);
                    if (!target) {
                        return defaultValue ?? [];
                    }
                    const { worksheet } = target;
                    originValue.forEach((item) => {
                        const itemValue = item.getArrayValue();
                        const startRow = item.getCurrentRow();
                        const startCol = item.getCurrentColumn();
                        itemValue.forEach((row, rowIndex) => {
                            row.forEach((col, colIndex) => {
                                const permission = (worksheet.getCell(rowIndex + startRow, colIndex + startCol) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                                if (permission?.[UnitAction.View] === false) {
                                    itemValue[rowIndex][colIndex] = NullValueObject.create();
                                }
                            });
                        });
                    });
                    return originValue;
                },
            })
        );
    }

    private _initFormulaEditorPermissionInterceptor() {
        let handlerRemove: Nullable<() => boolean>;
        this.disposeWithMe(
            this._univerInstanceService.unitAdded$.pipe(filter((unitInstance) => {
                return unitInstance.type === UniverInstanceType.UNIVER_DOC && unitInstance.getUnitId() === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY;
            }), debounceTime(200)).subscribe(() => {
                const formulaEditorController = this._injector.get(FormulaEditorController);
                handlerRemove && handlerRemove();
                handlerRemove = formulaEditorController.interceptor.intercept(formulaEditorController.interceptor.getInterceptPoints().FORMULA_EDIT_PERMISSION_CHECK, {
                    handler: (_: Nullable<boolean>, cellInfo: { row: number; col: number }) => {
                        const target = getSheetCommandTarget(this._univerInstanceService);
                        if (!target) {
                            return false;
                        }
                        const { unitId, subUnitId } = target;

                        const worksheetViewPermission = this._permissionService.getPermissionPoint(new WorksheetViewPermission(unitId, subUnitId).id)?.value ?? false;
                        if (!worksheetViewPermission) {
                            return false;
                        }

                        const { row, col } = cellInfo;
                        const permissionList = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
                            return rule.ranges.some((range) => {
                                return Rectangle.intersects(range, { startRow: row, endRow: row, startColumn: col, endColumn: col });
                            });
                        });

                        const permissionIds = permissionList.map((rule) => new RangeProtectionPermissionViewPoint(unitId, subUnitId, rule.permissionId).id);
                        const rangeViewPermission = this._permissionService.composePermission(permissionIds).every((permission) => permission.value);
                        return rangeViewPermission;
                    },
                });
            })
        );
    }
}
