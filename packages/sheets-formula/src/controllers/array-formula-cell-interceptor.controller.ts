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

import type { ICellData, ICommandInfo } from '@univerjs/core';
import type { IArrayFormulaRangeType, IArrayFormulaUnitCellType, ISetArrayFormulaDataMutationParams } from '@univerjs/engine-formula';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { IUniverSheetsFormulaBaseConfig } from './config.schema';
import { CellValueType, Disposable, ICommandService, IConfigService, Inject, InterceptorEffectEnum, isRealNum, ObjectMatrix } from '@univerjs/core';
import { FormulaDataModel, serializeRange, SetArrayFormulaDataMutation, stripErrorMargin } from '@univerjs/engine-formula';
import { INTERCEPTOR_POINT, SetRangeValuesMutation, SheetInterceptorService } from '@univerjs/sheets';
import { PLUGIN_CONFIG_KEY_BASE } from './config.schema';

export class ArrayFormulaCellInterceptorController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();

        this._initInterceptorCellContent();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                // Synchronous data from worker
                if (command.id !== SetArrayFormulaDataMutation.id) {
                    return;
                }

                const params = command.params as ISetArrayFormulaDataMutationParams;

                if (params == null) {
                    return;
                }

                const { arrayFormulaRange, arrayFormulaCellData } = params;
                this._formulaDataModel.setArrayFormulaRange(arrayFormulaRange);
                this._formulaDataModel.setArrayFormulaCellData(arrayFormulaCellData);

                // Note the logic should only be executed in exporting and hence shall be set once.
                if (this._configService.getConfig<IUniverSheetsFormulaBaseConfig>(PLUGIN_CONFIG_KEY_BASE)?.writeArrayFormulaToSnapshot) {
                    this._writeArrayFormulaToSnapshot(arrayFormulaRange, arrayFormulaCellData);
                }
            })
        );
    }

    private _writeArrayFormulaToSnapshot(arrayFormulaRange: IArrayFormulaRangeType, arrayFormulaCellData: IArrayFormulaUnitCellType) {
        // Write values to the `ref` property of the array formula range.
        Object.entries(arrayFormulaRange).forEach(([unitId, subUnitData]) => {
            subUnitData && Array.from(Object.entries(subUnitData)).forEach(([subUnitId, rangeData]) => {
                // Convert from IObjectMatrixPrimitiveType<IRange> to IObjectMatrixPrimitiveType<ICellData>
                const cellValue = new ObjectMatrix<ICellData>();
                const matrix = new ObjectMatrix(rangeData);
                matrix.forValue((row, col, value) => {
                    cellValue.setValue(row, col, { ref: serializeRange(value) }); // convert to ref string
                });

                // Keep this local to avoid triggering re-calculate in the worker.
                this._commandService.executeCommand<ISetRangeValuesMutationParams>(SetRangeValuesMutation.id, {
                    unitId,
                    subUnitId,
                    cellValue: cellValue.getMatrix(),
                }, {
                    onlyLocal: true,
                    fromFormula: true,
                });
            });
        });

        // Write values to the 'v' property of the cell data.
        Array.from(Object.entries(arrayFormulaCellData)).forEach(([unitId, subUnitData]) => {
            subUnitData && Array.from(Object.entries(subUnitData)).forEach(([subUnitId, rowData]) => {
                // Keep this local to avoid triggering re-calculate in the worker.
                this._commandService.executeCommand<ISetRangeValuesMutationParams>(SetRangeValuesMutation.id, {
                    unitId,
                    subUnitId,
                    cellValue: rowData,
                }, {
                    onlyLocal: true,
                    fromFormula: true,
                });
            });
        });
    }

    private _initInterceptorCellContent() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                priority: 100,
                effect: InterceptorEffectEnum.Value,
                handler: (cell_, location, next) => {
                    let cell = cell_;
                    const { unitId, subUnitId, row, col } = location;
                    const arrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData();
                    const cellData = arrayFormulaCellData?.[unitId]?.[subUnitId]?.[row]?.[col];
                    if (cellData == null) {
                        return next(cell);
                    }

                    if (!cell || cell === location.rawData) {
                        cell = { ...location.rawData };
                    }

                    // The cell in the upper left corner of the array formula also triggers the default value determination
                    if (cellData.v == null && cellData.t == null) {
                        cell.v = 0; // Default value for empty cell
                        cell.t = CellValueType.NUMBER;
                        return next(cell);
                    }

                    // Dealing with precision issues
                    // Need to be compatible with the case where v is a string but the cell type is a number
                    // e.g.
                    // "v": "123413.23000000001",
                    // "t": 2,
                    if (cell?.t === CellValueType.NUMBER && cell.v !== undefined && cell.v !== null && isRealNum(cell.v)) {
                        cell.v = stripErrorMargin(Number(cell.v));
                        return next(cell);
                    }

                    cell.v = cellData.v;
                    cell.t = cellData.t;

                    return next(cell);
                },
            })
        );
    }
}
