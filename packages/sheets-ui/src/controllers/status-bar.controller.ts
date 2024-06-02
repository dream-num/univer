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

import type { ICommandInfo, IRange, ISelectionCell, Nullable, Workbook } from '@univerjs/core';
import {
    createInterceptorKey,
    debounce,
    Disposable,
    ICommandService,
    InterceptorManager,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import type { ArrayValueObject, BaseValueObject, ISheetData } from '@univerjs/engine-formula';
import {
    convertUnitDataToRuntime,
    FormulaDataModel,
    IFunctionService,
    RangeReferenceObject,
} from '@univerjs/engine-formula';
import type {
    ISelectionWithStyle,
} from '@univerjs/sheets';
import {
    INumfmtService,
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
    SetRangeValuesMutation,
} from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import type { IStatusBarServiceStatus } from '../services/status-bar.service';
import { IStatusBarService } from '../services/status-bar.service';

export const STATUS_BAR_PERMISSION_CORRECT = createInterceptorKey<ArrayValueObject[], ArrayValueObject[]>('statusBarPermissionCorrect');

@OnLifecycle(LifecycleStages.Ready, StatusBarController)
export class StatusBarController extends Disposable {
    private _calculateTimeout: number | NodeJS.Timeout = -1;

    public interceptor = new InterceptorManager({ STATUS_BAR_PERMISSION_CORRECT });

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IFunctionService private readonly _functionService: IFunctionService,
        @IStatusBarService private readonly _statusBarService: IStatusBarService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @Inject(INumfmtService) private _numfmtService: INumfmtService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._registerSelectionListener();
    }

    private _registerSelectionListener(): void {
        const _statisticsHandler = debounce((selections: ISelectionWithStyle[]) => {
            const primary = selections[selections.length - 1]?.primary;
            this._calculateSelection(
                selections.map((selection) => selection.range),
                primary
            );
        }, 100);

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoving$.subscribe((selections) => {
                    if (this._selectionManagerService.getCurrent()?.pluginName !== NORMAL_SELECTION_PLUGIN_NAME) {
                        return;
                    }
                    if (selections) {
                        _statisticsHandler(selections);
                    }
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoveEnd$.subscribe((selections) => {
                    if (this._selectionManagerService.getCurrent()?.pluginName !== NORMAL_SELECTION_PLUGIN_NAME) {
                        return;
                    }
                    if (selections) {
                        _statisticsHandler(selections);
                    }
                })
            )
        );

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetRangeValuesMutation.id) {
                    const selections = this._selectionManagerService.getSelections();
                    if (selections) {
                        _statisticsHandler(selections as ISelectionWithStyle[]);
                    }
                }
            })
        );
    }

    private _clearResult(): void {
        this._statusBarService.setState(null);
    }

    private _calculateSelection(selections: IRange[], primary: Nullable<ISelectionCell>) {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return this._clearResult();
        }
        const unitId = workbook.getUnitId();
        const sheetId = workbook.getActiveSheet().getSheetId();
        const sheetData: ISheetData = {};
        const arrayFormulaMatrixCell = this._formulaDataModel.getArrayFormulaCellData();

        this._univerInstanceService
            .getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!
            .getSheets()
            .forEach((sheet) => {
                const sheetConfig = sheet.getConfig();
                sheetData[sheet.getSheetId()] = {
                    cellData: new ObjectMatrix(sheetConfig.cellData),
                    rowCount: sheetConfig.rowCount,
                    columnCount: sheetConfig.columnCount,
                    rowData: sheetConfig.rowData,
                    columnData: sheetConfig.columnData,
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

            let arrayValue = refs.map((ref) => {
                return ref.toArrayValueObject(false);
            });
            const correctArrayValue = this.interceptor.fetchThroughInterceptors(STATUS_BAR_PERMISSION_CORRECT)(arrayValue, arrayValue);
            if (correctArrayValue) {
                arrayValue = correctArrayValue;
            }

            const calcResult = functions.map((f) => {
                const executor = this._functionService.getExecutor(f.func);
                if (!executor) {
                    return undefined;
                }

                const res = executor?.calculate(...arrayValue) as BaseValueObject;
                const value = res?.getValue();
                if (!value) {
                    return undefined;
                }
                return {
                    func: f.func,
                    value,
                };
            });
            if (calcResult.every((r) => r === undefined)) {
                return;
            }
            let pattern = null;
            if (primary) {
                const { actualRow, actualColumn } = primary;
                pattern = this._numfmtService.getValue(unitId, sheetId, actualRow, actualColumn)?.pattern;
            }
            const availableResult = calcResult.filter((r) => r !== undefined);
            const newState = {
                values: availableResult,
                pattern,
            };
            this._statusBarService.setState(newState as IStatusBarServiceStatus);
        } else {
            this._clearResult();
        }
    }
}
