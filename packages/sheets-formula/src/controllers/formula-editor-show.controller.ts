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

import type { ICellDataForSheetInterceptor, ICommandInfo, IObjectMatrixPrimitiveType, IRange, IRowAutoHeightInfo, Nullable, Workbook, Worksheet } from '@univerjs/core';
import {
    ColorKit, Disposable,
    ICommandService,
    ILogService,
    Inject,
    ObjectMatrix,
    Rectangle,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import {
    ErrorType,
    FormulaDataModel,
    SetArrayFormulaDataMutation,
    SetFormulaCalculationResultMutation,
} from '@univerjs/engine-formula';
import type { IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISetColHiddenMutationParams, ISetColVisibleMutationParams, ISetRowHiddenMutationParams, ISetRowVisibleMutationParams, ISetWorksheetColWidthMutationParams, ISetWorksheetRowAutoHeightMutationParams, ISetWorksheetRowHeightMutationParams } from '@univerjs/sheets';
import { SetColHiddenMutation, SetColVisibleMutation, SetRowHiddenMutation, SetRowVisibleMutation, SetWorksheetColWidthMutation, SetWorksheetRowAutoHeightMutation, SetWorksheetRowHeightMutation } from '@univerjs/sheets';
import {
    IEditorBridgeService,
    ISheetSelectionRenderService,
    SELECTION_SHAPE_DEPTH,
    SelectionShape,
    SheetSkeletonManagerService } from '@univerjs/sheets-ui';

const REFRESH_ARRAY_SHAPE_MUTATIONS = [
    SetWorksheetRowHeightMutation.id,
    SetWorksheetColWidthMutation.id,
    SetColHiddenMutation.id,
    SetColVisibleMutation.id,
    SetRowHiddenMutation.id,
    SetRowVisibleMutation.id,
];

export class FormulaEditorShowController extends Disposable implements IRenderModule {
    private _previousShape: Nullable<SelectionShape>;
    private _skeleton: SpreadsheetSkeleton;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(IEditorBridgeService) private _editorBridgeService: IEditorBridgeService,
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
                this._editorBridgeService.interceptor.intercept(
                    this._editorBridgeService.interceptor.getInterceptPoints().BEFORE_CELL_EDIT,
                    {
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
                    }
                )
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

                if (REFRESH_ARRAY_SHAPE_MUTATIONS.includes(command.id)) {
                    requestIdleCallback(() => {
                        const params = command.params as ISetRowVisibleMutationParams | ISetColHiddenMutationParams | ISetWorksheetRowHeightMutationParams | ISetWorksheetColWidthMutationParams | ISetRowHiddenMutationParams | ISetColVisibleMutationParams;
                        const { unitId, subUnitId, ranges } = params;
                        this._refreshArrayFormulaRangeShapeByRanges(unitId, subUnitId, ranges);
                    });
                }
            })
        );
    }

    private _displayArrayFormulaRangeShape(matrixRange: IObjectMatrixPrimitiveType<IRange>, row: number, col: number, unitId: string, subUnitId: string, worksheet: Worksheet, cellInfo: Nullable<ICellDataForSheetInterceptor>): Nullable<ICellDataForSheetInterceptor> {
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

                const formulaDataItem = this._formulaDataModel.getFormulaDataItem(
                    rowIndex,
                    columnIndex,
                    subUnitId,
                    unitId
                );

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
        const styleSheet = this._themeService.getCurrentTheme();
        const fill = new ColorKit(styleSheet.colorWhite).setAlpha(0).toString();
        const style = {
            strokeWidth: 1,
            stroke: styleSheet.hyacinth700,
            fill,
            widgets: {},

            hasAutoFill: false,

            hasRowHeader: false,

            hasColumnHeader: false,
        };

        const renderUnit = this._renderManagerService.getRenderById(unitId);
        if (!renderUnit) return;

        const { scene } = renderUnit;
        const { rangeWithCoord, primaryWithCoord } = renderUnit.with(ISheetSelectionRenderService).attachSelectionWithCoord({
            range: arrayRange,
            primary: null,
            style,
        });
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        if (!scene || !skeleton) return;
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        const control = new SelectionShape(scene, SELECTION_SHAPE_DEPTH.FORMULA_EDITOR_SHOW, this._themeService, false);
        control.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, style, primaryWithCoord);
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

    private _refreshArrayFormulaRangeShape(unitId: string, range: IRange): void {
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

    private _refreshArrayFormulaRangeShapeByRanges(unitId: string, subUnitId: string, ranges: IRange[]): void {
        if (!this._checkCurrentSheet(unitId, subUnitId)) return;

        if (!this._previousShape) return;

        const { startRow: shapeStartRow, endRow: shapeEndRow, startColumn: shapeStartColumn, endColumn: shapeEndColumn } = this._previousShape.getRange();

        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            const { startRow, endRow, startColumn, endColumn } = range;
            if (Rectangle.intersects(
                {
                    startRow, endRow, startColumn, endColumn,
                },
                {
                    startRow: shapeStartRow, endRow: shapeEndRow, startColumn: shapeStartColumn, endColumn: shapeEndColumn,
                }
            ) || shapeStartRow >= endRow || startColumn >= endColumn) {
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
