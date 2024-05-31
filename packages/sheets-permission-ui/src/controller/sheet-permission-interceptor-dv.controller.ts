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

import type { ICellDataForSheetInterceptor, IRange, ISheetDataValidationRule, Nullable, Workbook, Worksheet } from '@univerjs/core';
import { Disposable, DisposableCollection, IPermissionService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { WorksheetViewPermission } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { DataValidationController, DataValidationFormulaController } from '@univerjs/sheets-data-validation';
import { UnitAction } from '@univerjs/protocol';
import { deserializeRangeWithSheet, LexerTreeBuilder } from '@univerjs/engine-formula';

type ICellPermission = Record<UnitAction, boolean> & { ruleId?: string; ranges?: IRange[] };
export const SHEET_PERMISSION_PASTE_PLUGIN = 'SHEET_PERMISSION_PASTE_PLUGIN';

@OnLifecycle(LifecycleStages.Steady, SheetPermissionInterceptorDvController)
export class SheetPermissionInterceptorDvController extends Disposable {
    disposableCollection = new DisposableCollection();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @Inject(DataValidationController) private readonly _dataValidationController: DataValidationController,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @Inject(DataValidationFormulaController) private readonly _dataValidationFormulaController: DataValidationFormulaController
    ) {
        super();
        this._initDataValidationPermissionInterceptor();
        this._initDvFormulaPermissionInterceptor();
    }

    private _initDataValidationPermissionInterceptor() {
        this.disposeWithMe(
            this._dataValidationController.interceptor.intercept(this._dataValidationController.interceptor.getInterceptPoints().DATA_VALIDATION_PERMISSION_CHECK, {
                handler: (_: Nullable<(ISheetDataValidationRule & { disable?: boolean })[]>, rules: ISheetDataValidationRule[]) => {
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                    const worksheet = workbook.getActiveSheet();
                    const rulesByPermissionCheck = rules.map((rule) => {
                        const { ranges } = rule;
                        const haveNotPermission = ranges?.some((range) => {
                            const { startRow, startColumn, endRow, endColumn } = range;
                            for (let row = startRow; row <= endRow; row++) {
                                for (let col = startColumn; col <= endColumn; col++) {
                                    const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                                    if (permission?.[UnitAction.Edit] === false || permission?.[UnitAction.View] === false) {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        });
                        if (haveNotPermission) {
                            return { ...rule, disable: true };
                        } else {
                            return { ...rule };
                        }
                    });
                    return rulesByPermissionCheck;
                },
            })
        );
    }

    private _initDvFormulaPermissionInterceptor() {
        this._dataValidationFormulaController.interceptor.intercept(this._dataValidationFormulaController.interceptor.getInterceptPoints().DV_FORMULA_PERMISSION_CHECK, {
            priority: 100,
            handler: (_, formulaString: string) => {
                const sequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formulaString);
                if (!sequenceNodes) {
                    return true;
                }
                for (let i = 0; i < sequenceNodes.length; i++) {
                    const node = sequenceNodes[i];
                    if (typeof node === 'string') {
                        continue;
                    }
                    const { token } = node;
                    const sequenceGrid = deserializeRangeWithSheet(token);
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                    let targetSheet: Nullable<Worksheet> = workbook.getActiveSheet();
                    const unitId = workbook.getUnitId();
                    if (sequenceGrid.sheetName) {
                        targetSheet = workbook.getSheetBySheetName(sequenceGrid.sheetName);
                        if (!targetSheet) {
                            return false;
                        }
                        const subUnitId = targetSheet?.getSheetId();
                        const viewPermission = this._permissionService.getPermissionPoint(new WorksheetViewPermission(unitId, subUnitId).id);
                        if (!viewPermission) return false;
                    }
                    if (!targetSheet) {
                        return false;
                    }
                    const { startRow, endRow, startColumn, endColumn } = sequenceGrid.range;
                    for (let i = startRow; i <= endRow; i++) {
                        for (let j = startColumn; j <= endColumn; j++) {
                            const permission = (targetSheet.getCell(i, j) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                            if (permission?.[UnitAction.View] === false) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            },
        });
    }
}
