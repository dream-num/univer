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

import type { ICellDataForSheetInterceptor, ICommandInfo, IObjectMatrixPrimitiveType, IRange, IRowAutoHeightInfo, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISelectionWithStyle, ISetWorksheetRowAutoHeightMutationParams } from '@univerjs/sheets';
import {
    ColorKit,
    Disposable,
    ICommandService,
    ILogService,
    Inject,
    ObjectMatrix,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import {
    ErrorType,
    FormulaDataModel,
    SetArrayFormulaDataMutation,
    SetFormulaCalculationResultMutation,
} from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { BEFORE_CELL_EDIT, SetWorksheetRowAutoHeightMutation, SheetInterceptorService } from '@univerjs/sheets';
import {
    attachSelectionWithCoord,
    SELECTION_SHAPE_DEPTH,
    SelectionControl,
    SheetSkeletonManagerService,
} from '@univerjs/sheets-ui';

/**
 * For Array formula in cell editing
 */
export class FormulaEditorShowController extends Disposable implements IRenderModule {
    private _previousShape: Nullable<SelectionControl>;
    private _skeleton: SpreadsheetSkeleton;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @ILogService private readonly _logService: ILogService
    ) {
        super();
        this._initSkeletonChangeListener();
        this._initInterceptorEditorStart();
        this._commandExecutedListener();

        // Do not intercept v:null and add t: CellValueType.NUMBER. When the cell =TODAY() is automatically filled, the number format will recognize the Number type and parse it as 1900-01-00 date format.
    }

    private _initSkeletonChangeListener(): void {
        this.disposeWithMe(
            this._sheetSkeletonManagerService.currentSkeleton$.subscribe((param) => {
                if (param == null) {
                    this._logService.debug('[FormulaEditorShowController]: should not receive currentSkeleton$ as null!');
                } else {
                    const { skeleton } = param;
                    const prevSheetId = this._skeleton?.worksheet?.getSheetId();
                    this._changeRuntime(skeleton);

                    // change to another sheet
                    if (prevSheetId !== skeleton.worksheet.getSheetId()) {
                        this._removeArrayFormulaRangeShape();
                    } else {
                        const { unitId, sheetId } = param;
                        this._updateArrayFormulaRangeShape(unitId, sheetId);
                    }
                }
            })
        );
    }

    protected _changeRuntime(skeleton: SpreadsheetSkeleton): void {
        this._skeleton = skeleton;
    }

    private _initInterceptorEditorStart(): void {
        this.disposeWithMe(
            toDisposable(
                this._sheetInterceptorService.writeCellInterceptor.intercept(BEFORE_CELL_EDIT, {
                    handler: (value, context, next) => {
                        const { row, col, unitId, subUnitId, worksheet } = context;
                        const arrayFormulaMatrixRange = this._formulaDataModel.getArrayFormulaRange();

                        const arrayFormulaMatrixCell = this._formulaDataModel.getArrayFormulaCellData();

                        this._removeArrayFormulaRangeShape();

                        if (value == null) {
                            return next(value);
                        }

                        let cellInfo: Nullable<ICellDataForSheetInterceptor> = null;

                        const formulaString = this._formulaDataModel.getFormulaStringByCell(row, col, subUnitId, unitId);

                        if (formulaString !== null) {
                            cellInfo = { f: formulaString };
                        }

                            /**
                             * If the display conditions for the array formula are not met, return the range directly.
                             */
                        if (
                            value.v != null &&
                                value.v !== '' &&
                                arrayFormulaMatrixCell[unitId]?.[subUnitId]?.[row]?.[col] == null
                        ) {
                            if (cellInfo) {
                                return { ...value, ...cellInfo };
                            }

                            return next(value);
                        }

                            /**
                             * Mark the array formula for special display in subsequent processing
                             */
                        const matrixRange = arrayFormulaMatrixRange?.[unitId]?.[subUnitId];
                        if (matrixRange != null) {
                                // For cells other than the upper left corner, the cellInfo information will be updated
                            cellInfo = this._displayArrayFormulaRangeShape(matrixRange, row, col, unitId, subUnitId, worksheet, cellInfo);
                        }

                        if (cellInfo) {
                            return { ...value, ...cellInfo };
                        }

                        return next(value);
                    },
                })
            )
        );
    }

    private _commandExecutedListener(): void {
        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo, options) => {
            if (command.id === SetFormulaCalculationResultMutation.id || (command.id === SetArrayFormulaDataMutation.id && options && options.remove)
            ) {
                this._removeArrayFormulaRangeShape();
            }
        }));

        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (SetWorksheetRowAutoHeightMutation.id === command.id) {
                    requestIdleCallback(() => {
                        const params = command.params as ISetWorksheetRowAutoHeightMutationParams;
                        const { unitId, subUnitId, rowsAutoHeightInfo } = params;
                        this._refreshArrayFormulaRangeShapeByRow(unitId, subUnitId, rowsAutoHeightInfo);
                    });
                }
            })
        );
    }

    private _displayArrayFormulaRangeShape(matrixRange: IObjectMatrixPrimitiveType<IRange>, row: number, col: number, unitId: string, subUnitId: string, worksheet: Worksheet, cellInfo: Nullable<ICellDataForSheetInterceptor>): Nullable<ICellDataForSheetInterceptor> {
        const sheetFormulaData = this._formulaDataModel.getSheetFormulaData(unitId, subUnitId);

        new ObjectMatrix(matrixRange).forValue((rowIndex, columnIndex, range) => {
            if (range == null) {
                return true;
            }
            const { startRow, startColumn, endRow, endColumn } = range;
            if (rowIndex === row && columnIndex === col) {
                this._createArrayFormulaRangeShape(range, unitId);
                return false;
            }
            if (row >= startRow && row <= endRow && col >= startColumn && col <= endColumn) {
                const mainCellValue = worksheet.getCell(startRow, startColumn);

                if (mainCellValue?.v === ErrorType.SPILL) {
                    return;
                }

                const formulaDataItem = sheetFormulaData?.[rowIndex]?.[columnIndex];

                if (formulaDataItem == null || formulaDataItem.f == null) {
                    return true;
                }

                if (cellInfo == null) {
                    cellInfo = {
                        f: formulaDataItem.f,
                        isInArrayFormulaRange: true,
                    };
                }

                this._createArrayFormulaRangeShape(range, unitId);
                return false;
            }
        });

        return cellInfo;
    }

    private _createArrayFormulaRangeShape(arrayRange: IRange, unitId: string): void {
        const renderUnit = this._renderManagerService.getRenderById(unitId);
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        if (!renderUnit || !skeleton) return;

        const { scene } = renderUnit;
        if (!scene) return;

        const selectionWithStyle: ISelectionWithStyle = {
            range: arrayRange,
            primary: null,
            style: {
                strokeWidth: 1,
                stroke: this._themeService.getColorFromTheme('primary.600'),
                fill: new ColorKit(this._themeService.getColorFromTheme('white')).setAlpha(0).toString(),
                widgets: {},
            },
        };
        const selectionWithCoord = attachSelectionWithCoord(selectionWithStyle, skeleton);
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        const control = new SelectionControl(scene, SELECTION_SHAPE_DEPTH.FORMULA_EDITOR_SHOW, this._themeService, {
            highlightHeader: false,
            rowHeaderWidth,
            columnHeaderHeight,
        });
        control.updateRangeBySelectionWithCoord(selectionWithCoord);
        control.setEvent(false);
        this._previousShape = control;
    }

    private _removeArrayFormulaRangeShape(): void {
        if (this._previousShape == null) {
            return;
        }
        this._previousShape.dispose();
        this._previousShape = null;
    }

    private _refreshArrayFormulaRangeShape(unitId: string, _range?: IRange): void {
        if (this._previousShape) {
            const { startRow, endRow, startColumn, endColumn } = this._previousShape.getRange();
            const range = { startRow, endRow, startColumn, endColumn };
            this._removeArrayFormulaRangeShape();
            this._createArrayFormulaRangeShape(range, unitId);
        }
    }

    private _checkCurrentSheet(unitId: string, subUnitId: string): boolean {
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        if (!skeleton) return false;

        const worksheet = skeleton.worksheet;
        if (!worksheet) return false;

        if (worksheet.unitId === unitId && worksheet.getSheetId() === subUnitId) {
            return true;
        }

        return false;
    }

    private _updateArrayFormulaRangeShape(unitId: string, subUnitId: string): void {
        if (!this._checkCurrentSheet(unitId, subUnitId)) return;
        if (!this._previousShape) return;
        this._refreshArrayFormulaRangeShape(unitId);
    }

    private _refreshArrayFormulaRangeShapeByRow(unitId: string, subUnitId: string, rowAutoHeightInfo: IRowAutoHeightInfo[]): void {
        if (!this._checkCurrentSheet(unitId, subUnitId)) return;

        if (!this._previousShape) return;

        const { startRow: shapeStartRow, endRow: shapeEndRow, startColumn: shapeStartColumn, endColumn: shapeEndColumn } = this._previousShape.getRange();

        for (let i = 0; i < rowAutoHeightInfo.length; i++) {
            const { row } = rowAutoHeightInfo[i];
            if (shapeStartRow >= row) {
                const shapeRange = {
                    startRow: shapeStartRow,
                    endRow: shapeEndRow,
                    startColumn: shapeStartColumn,
                    endColumn: shapeEndColumn,
                };
                this._refreshArrayFormulaRangeShape(unitId, shapeRange);
                break;
            }
        }
    }
}
