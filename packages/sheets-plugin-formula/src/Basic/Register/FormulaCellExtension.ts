import { BaseCellExtension, BaseCellExtensionFactory, ICell } from '@univer/base-sheets';
import { IFormulaData } from '@univer/base-formula-engine';
import { FormulaPlugin } from '../../FormulaPlugin';

export class FormulaCellExtension extends BaseCellExtension {
    setValue(value: string) {
        this._cell.value = value;
    }

    execute() {
        this.setValue(this._value);
    }
}

export class FormulaCellExtensionFactory extends BaseCellExtensionFactory<FormulaPlugin> {
    get zIndex(): number {
        return 0;
    }

    create(cell: ICell, value: string): FormulaCellExtension {
        return new FormulaCellExtension(cell, value);
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
                console.info('cellData', cellData);
                // cellData.forEach((row, rowArray) => {
                //     rowArray.forEach((column, mainCell) => {
                //         console.log('main----', row, column, mainCell);
                //     });
                // });

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

        if (!formula) {
            return false;
        }

        return this.create(cell, formula);
    }
}
