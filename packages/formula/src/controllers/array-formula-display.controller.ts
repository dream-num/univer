import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import type { ISetArrayFormulaDataMutationParams } from '../commands/mutations/set-array-formula-data.mutation';
import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import { FormulaDataModel } from '../models/formula-data.model';

@OnLifecycle(LifecycleStages.Ready, ArrayFormulaDisplayController)
export class ArrayFormulaDisplayController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
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
            })
        );
    }

    private _initInterceptorCellContent() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                priority: 100,
                handler: (cell, location, next) => {
                    const { workbookId, worksheetId, row, col } = location;
                    const arrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData();
                    const arrayFormulaRange = this._formulaDataModel.getArrayFormulaRange();
                    const cellData = arrayFormulaCellData?.[workbookId]?.[worksheetId]?.[row]?.[col];
                    const cellRange = arrayFormulaRange?.[workbookId]?.[worksheetId]?.[row]?.[col];
                    if (cellData == null) {
                        return next(cell);
                    }

                    if (cellRange != null && cellRange.startRow === row && cellRange.startColumn === col) {
                        return next(cell);
                    }

                    return next({ ...cell, ...cellData });
                },
            })
        );
    }
}
