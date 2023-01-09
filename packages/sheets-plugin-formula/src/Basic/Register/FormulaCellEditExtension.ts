import { BaseCellEditExtension, BaseCellEditExtensionFactory, ICell, SheetPlugin } from '@univer/base-sheets';
import { IFormulaData } from '@univer/base-formula-engine';
import { IRangeData, Nullable, PLUGIN_NAMES } from '@univer/core';
import { FormulaPlugin } from '../../FormulaPlugin';

export class FormulaCellEditExtension extends BaseCellEditExtension {
    setValue(value: string) {
        this._cell.value = value;
    }

    execute() {
        this.setValue(this._value);
    }
}

export class FormulaCellEditExtensionFactory extends BaseCellEditExtensionFactory<FormulaPlugin> {
    get zIndex(): number {
        return 0;
    }

    create(cell: ICell, value: string): FormulaCellEditExtension {
        return new FormulaCellEditExtension(cell, value);
    }

    check(cell: ICell) {
        const unitId = this._plugin.getContext().getWorkBook().getUnitId();
        let formula = this.checkFormulaValue(cell) || this.checkArrayFormValue(cell, unitId);

        if (formula !== '' && !formula) {
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
                            // Get the content of the formula and convert it into a DOM structure
                            formula = this._plugin.getFormulaPromptController().cellInputHandler.functionHTMLGenerate(value.formula);
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
        const arrayFormulaData = this._plugin.getFormulaController().getDataModel().getArrayFormulaData();

        if (!arrayFormulaData) return null;

        Object.keys(arrayFormulaData).forEach((sheetId) => {
            const sheetData = arrayFormulaData[sheetId];

            sheetData.forValue((rowIndex: number, columnIndex: number, value: IRangeData) => {
                const { startRow, startColumn, endRow, endColumn } = value;
                if (row >= startRow && row < endRow && column >= startColumn && column < endColumn) {
                    formula = '';
                    this._plugin
                        .getContext()
                        .getPluginManager()
                        .getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)
                        .getFormulaBarController()
                        .getFormulaBar()
                        .setFormulaContent('');
                    return false;
                }
            });
        });

        return formula;
    }
}
