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

import type { IRange } from '@univerjs/core';
import {
    Disposable,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import type { BaseValueObject, ISheetData } from '@univerjs/engine-formula';
import {
    convertUnitDataToRuntime,
    FormulaDataModel,
    IFunctionService,
    RangeReferenceObject,
} from '@univerjs/engine-formula';
import { SelectionManagerService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import type { IStatusBarServiceStatus } from '../services/status-bar.service';
import { IStatusBarService } from '../services/status-bar.service';

@OnLifecycle(LifecycleStages.Ready, StatusBarController)
export class StatusBarController extends Disposable {
    private _calculateTimeout: number | NodeJS.Timeout = -1;
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IFunctionService private readonly _functionService: IFunctionService,
        @IStatusBarService private readonly _statusBarService: IStatusBarService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._registerSelectionListener();
    }

    private _registerSelectionListener(): void {
        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoving$.subscribe((selections) => {
                    if (selections) {
                        clearTimeout(this._calculateTimeout);
                        this._calculateTimeout = setTimeout(() => {
                            this._calculateSelection(selections.map((selection) => selection.range));
                        }, 100);
                    }
                })
            )
        );
        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoveEnd$.subscribe((selections) => {
                    if (selections) {
                        this._calculateSelection(selections.map((selection) => selection.range));
                    }
                })
            )
        );
    }

    private _calculateSelection(selections: IRange[]) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const unitId = workbook.getUnitId();
        const sheetId = workbook.getActiveSheet().getSheetId();
        const sheetData: ISheetData = {};
        const arrayFormulaMatrixCell = this._formulaDataModel.getArrayFormulaCellData();
        this._univerInstanceService
            .getCurrentUniverSheetInstance()
            .getSheets()
            .forEach((sheet) => {
                const sheetConfig = sheet.getConfig();
                sheetData[sheet.getSheetId()] = {
                    cellData: new ObjectMatrix(sheetConfig.cellData),
                    rowCount: sheetConfig.rowCount,
                    columnCount: sheetConfig.columnCount,
                };
            });
        if (selections?.length) {
            const refs = selections.map((s) => new RangeReferenceObject(s, sheetId, unitId));
            refs.forEach((ref) => {
                ref.setUnitData({
                    [unitId]: sheetData,
                });

                arrayFormulaMatrixCell && ref.setArrayFormulaCellData(convertUnitDataToRuntime(arrayFormulaMatrixCell));
            });

            const functions = this._statusBarService.getFunctions();
            const calcResult = functions.map((f) => {
                const executor = this._functionService.getExecutor(f.func);
                if (!executor) {
                    return undefined;
                }
                const arrayValue = refs.map((ref) => {
                    return ref.toArrayValueObject(false);
                });
                const res = executor?.calculate(...arrayValue) as BaseValueObject;
                if (!res.getValue) {
                    return undefined;
                }
                return {
                    func: f.func,
                    value: (executor?.calculate(...arrayValue) as BaseValueObject).getValue(),
                };
            });
            if (calcResult.every((r) => r === undefined)) {
                return;
            }
            const availableResult = calcResult.filter((r) => r !== undefined);
            this._statusBarService.setState(availableResult as IStatusBarServiceStatus);
        } else {
            this._statusBarService.setState(null);
        }
    }

    private _isSingleCell(range: IRange) {
        return range.startRow === range.endRow && range.startColumn === range.endColumn;
    }
}
