import { TinyColor } from '@ctrl/tinycolor';
import type { ICellDataForSheetInterceptor, ICommandInfo, IRange, Nullable } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import { FormulaDataModel, LexerTreeBuilder, SetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    IEditorBridgeService,
    ISelectionRenderService,
    SelectionShape,
    SheetSkeletonManagerService,
} from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Rendered, FormulaEditorShowController)
export class FormulaEditorShowController extends Disposable {
    private _previousShape: Nullable<SelectionShape>;

    constructor(
        @Inject(IEditorBridgeService) private _editorBridgeService: IEditorBridgeService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._initInterceptorEditorStart();

        this._commandExecutedListener();
    }

    private _initInterceptorEditorStart() {
        this.disposeWithMe(
            toDisposable(
                this._editorBridgeService.interceptor.intercept(
                    this._editorBridgeService.interceptor.getInterceptPoints().BEFORE_CELL_EDIT,
                    {
                        handler: (value, context, next) => {
                            const { row, col, workbookId, worksheetId } = context;
                            const arrayFormulaMatrixRange = this._formulaDataModel.getArrayFormulaRange();

                            const arrayFormulaMatrixCell = this._formulaDataModel.getArrayFormulaCellData();

                            this._removeArrayFormulaRangeShape();

                            if (value == null) {
                                return next(value);
                            }

                            let cellInfo: Nullable<ICellDataForSheetInterceptor> = null;

                            const formulaDataItem = this._formulaDataModel.getFormulaDataItem(
                                row,
                                col,
                                worksheetId,
                                workbookId
                            );

                            if (formulaDataItem != null) {
                                const { f, si, x = 0, y = 0 } = formulaDataItem;

                                if (si != null && (x > 0 || y > 0)) {
                                    let formulaString = '';
                                    if (f.length > 0) {
                                        formulaString = f;
                                    } else {
                                        const originItem = this._formulaDataModel.getFormulaItemBySId(
                                            si,
                                            worksheetId,
                                            workbookId
                                        );

                                        if (originItem == null || originItem.f.length === 0) {
                                            return next(value);
                                        }

                                        formulaString = originItem.f;
                                    }

                                    const newFormulaString = this._lexerTreeBuilder.moveFormulaRefOffset(
                                        formulaString,
                                        x,
                                        y
                                    );

                                    cellInfo = { f: newFormulaString };
                                }
                            }

                            /**
                             * If the display conditions for the array formula are not met, return the range directly.
                             */
                            if (
                                value.v != null &&
                                value.v !== '' &&
                                arrayFormulaMatrixCell[workbookId]?.[worksheetId]?.[row]?.[col] == null
                            ) {
                                if (cellInfo) {
                                    return cellInfo;
                                }

                                return next(value);
                            }

                            /**
                             * Mark the array formula for special display in subsequent processing
                             */
                            const matrixRange = arrayFormulaMatrixRange?.[workbookId]?.[worksheetId];
                            if (matrixRange != null) {
                                new ObjectMatrix(matrixRange).forValue((rowIndex, columnIndex, range) => {
                                    if (range == null) {
                                        return true;
                                    }
                                    const { startRow, startColumn, endRow, endColumn } = range;
                                    if (rowIndex === row && columnIndex === col) {
                                        this._createArrayFormulaRangeShape(range, workbookId);
                                        return false;
                                    }
                                    if (row >= startRow && row <= endRow && col >= startColumn && col <= endColumn) {
                                        const formulaDataItem = this._formulaDataModel.getFormulaDataItem(
                                            rowIndex,
                                            columnIndex,
                                            worksheetId,
                                            workbookId
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

                                        this._createArrayFormulaRangeShape(range, workbookId);
                                        return false;
                                    }
                                });
                            }

                            if (cellInfo) {
                                return cellInfo;
                            }

                            return next(value);
                        },
                    }
                )
            )
        );
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetFormulaCalculationResultMutation.id) {
                    this._removeArrayFormulaRangeShape();
                }
            })
        );
    }

    private _createArrayFormulaRangeShape(arrayRange: IRange, unitId: string) {
        const styleSheet = this._themeService.getCurrentTheme();
        const fill = new TinyColor(styleSheet.colorWhite).setAlpha(0).toString();
        const style = {
            strokeWidth: 1,
            stroke: styleSheet.hyacinth700,
            fill,
            widgets: {},

            hasAutoFill: false,

            hasRowHeader: false,

            hasColumnHeader: false,
        };

        const { scene } = this._renderManagerService.getRenderById(unitId) || {};
        const { rangeWithCoord, primaryWithCoord } = this._selectionRenderService.convertSelectionRangeToData({
            range: arrayRange,
            primary: null,
            style,
        });
        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (!scene || !skeleton) return;
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        const control = new SelectionShape(scene, 100, false, this._themeService);
        control.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, style, primaryWithCoord);

        this._previousShape = control;
    }

    private _removeArrayFormulaRangeShape() {
        if (this._previousShape == null) {
            return;
        }
        this._previousShape.dispose();
        this._previousShape = null;
    }
}
