import { IFormulaData } from '@univerjs/base-formula-engine';
import { BaseCellInputExtension, BaseCellInputExtensionFactory, ICell } from '@univerjs/base-ui';
import { ICurrentUniverService, IRangeData, Nullable, ObjectArray } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import { FormulaController } from '../../Controller/FormulaController';

export class FormulaCellInputExtension extends BaseCellInputExtension {
    override setValue(value: string) {
        this._cell.value = value;
    }

    override execute() {
        this.setValue(this._value);
    }
}

export class FormulaCellInputExtensionFactory extends BaseCellInputExtensionFactory {
    constructor(
        @Inject(Injector) private readonly _sheetInjector: Injector,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(FormulaController) private readonly _formulaController: FormulaController
    ) {
        super();
    }

    override get zIndex(): number {
        return 0;
    }

    override create(cell: ICell, value: string): FormulaCellInputExtension {
        return this._sheetInjector.createInstance(FormulaCellInputExtension, cell, value);
    }

    override check(cell: ICell) {
        const unitId = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getUnitId();
        const formula = this.checkFormulaValue(cell) || this.checkArrayFormValue(cell, unitId);

        if (!formula) {
            return false;
        }

        return this.create(cell, formula);
    }

    checkFormulaValue(cell: ICell): Nullable<string> {
        const { row, column } = cell;
        let formula: Nullable<string>;
        const formulaData = this._formulaController.getDataModel().getFormulaData();

        Object.keys(formulaData).forEach((unitId) => {
            const sheetData = formulaData[unitId];

            const sheetIds = Object.keys(sheetData);

            for (let i = 0, len = sheetIds.length; i < len; i++) {
                const sheetId = sheetIds[i];
                const cellData = sheetData[sheetId];
                Object.keys(cellData).forEach((cellRow) => {
                    const rowArray = cellData[Number(cellRow)];
                    Object.keys(rowArray).forEach((cellColumn) => {
                        const value = rowArray[Number(cellColumn)];
                        if (Number(cellRow) === row && Number(cellColumn) === column) {
                            formula = value.formula;
                            return false;
                        }
                    });
                });
            }
        });

        return formula;
    }

    checkArrayFormValue(cell: ICell, unitId: string): Nullable<string> {
        const { row, column } = cell;
        let formula: Nullable<string>;
        const formulaData = this._formulaController.getDataModel().getFormulaData();
        const arrayFormulaData = this._formulaController.getDataModel().getArrayFormulaData();

        if (!arrayFormulaData) return null;

        Object.keys(arrayFormulaData).forEach((sheetId) => {
            const sheetData = arrayFormulaData[sheetId];

            sheetData.forValue((rowIndex: number, columnIndex: number, value: IRangeData) => {
                const { startRow, startColumn, endRow, endColumn } = value;
                if (row >= startRow && row < endRow && column >= startColumn && column < endColumn) {
                    const cellData = formulaData[unitId][sheetId];
                    const array = cellData[startRow] as unknown as ObjectArray<IFormulaData>;
                    formula = array.get(startColumn)?.formula;
                    return false;
                }
            });
        });

        return formula;
    }
}
