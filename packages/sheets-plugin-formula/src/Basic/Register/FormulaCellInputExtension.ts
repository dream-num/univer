import { IFormulaData } from '@univerjs/base-formula-engine';
import { BaseCellInputExtension, BaseCellInputExtensionFactory, ICell } from '@univerjs/base-ui';
import { IRangeData, Nullable } from '@univerjs/core';
import { FormulaPlugin } from '../../FormulaPlugin';

export class FormulaCellInputExtension extends BaseCellInputExtension {
    setValue(value: string) {
        this._cell.value = value;
    }

    execute() {
        this.setValue(this._value);
    }
}

export class FormulaCellInputExtensionFactory extends BaseCellInputExtensionFactory<FormulaPlugin> {
    get zIndex(): number {
        return 0;
    }

    create(cell: ICell, value: string): FormulaCellInputExtension {
        return new FormulaCellInputExtension(cell, value);
    }

    check(cell: ICell) {
        const unitId = this._plugin.getContext().getWorkBook().getUnitId();
        let formula = this.checkFormulaValue(cell) || this.checkArrayFormValue(cell, unitId);

        if (!formula) {
            return false;
        }

        return this.create(cell, formula);
    }

    checkFormulaValue(cell: ICell): Nullable<string> {
        const { row, column } = cell;
        let formula;
        const formulaData = this._plugin.getFormulaController().getDataModel().getFormulaData();

        Object.keys(formulaData).forEach((unitId) => {
            const sheetData = formulaData[unitId];

            const sheetIds = Object.keys(sheetData);

            for (let i = 0, len = sheetIds.length; i < len; i++) {
                const sheetId = sheetIds[i];
                const cellData = sheetData[sheetId];
                Object.keys(cellData).forEach((cellRow) => {
                    const rowArray = cellData[cellRow];
                    rowArray.forEach((cellColumn: number, value: IFormulaData) => {
                        if (Number(cellRow) === row && cellColumn === column) {
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
        let formula;
        const formulaData = this._plugin.getFormulaController().getDataModel().getFormulaData();
        const arrayFormulaData = this._plugin.getFormulaController().getDataModel().getArrayFormulaData();

        if (!arrayFormulaData) return null;

        Object.keys(arrayFormulaData).forEach((sheetId) => {
            const sheetData = arrayFormulaData[sheetId];

            sheetData.forValue((rowIndex: number, columnIndex: number, value: IRangeData) => {
                const { startRow, startColumn, endRow, endColumn } = value;
                if (row >= startRow && row < endRow && column >= startColumn && column < endColumn) {
                    const cellData = formulaData[unitId][sheetId];
                    // TODO: cellData[startRow] is ObjectArray?
                    formula = cellData[startRow].get(startColumn).formula;
                    return false;
                }
            });
        });

        return formula;
    }
}
