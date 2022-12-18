import { BaseCellEditExtension, BaseCellEditExtensionFactory, ICell } from '@univer/base-sheets';
import { IFormulaData } from '@univer/base-formula-engine';
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
        const { row, column } = cell;

        const formulaData = this._plugin.getFormulaController().getDataModel().getFormulaData();

        let formula;

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

        if (!formula) {
            return false;
        }

        return this.create(cell, formula);
    }
}
