import { BaseCellEditExtension, BaseCellEditExtensionFactory, ICell } from '@univerjs/base-ui';
import { ICurrentUniverService, IDCurrentUniverService, IRangeData, Nullable } from '@univerjs/core';
import { SheetContainerUIController } from '@univerjs/ui-plugin-sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { FormulaPlugin } from '../../FormulaPlugin';
import { FormulaController } from '../../Controller/FormulaController';
import { FormulaPromptController } from '../../Controller/FormulaPromptController';

export class FormulaCellEditExtension extends BaseCellEditExtension {
    setValue(value: string) {
        this._cell.value = value;
    }

    override execute() {
        this.setValue(this._value);
    }
}

export class FormulaCellEditExtensionFactory extends BaseCellEditExtensionFactory<FormulaPlugin> {
    constructor(
        _plugin: FormulaPlugin,
        @Inject(Injector) private readonly _sheetInjector: Injector,
        @IDCurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(FormulaController) private readonly _formulaController: FormulaController,
        @Inject(FormulaPromptController) private readonly _formulaPromptController: FormulaPromptController,
        @Inject(SheetContainerUIController) private readonly _sheetContainerUIController: SheetContainerUIController
    ) {
        super(_plugin);
    }

    override get zIndex(): number {
        return 0;
    }

    override create(cell: ICell, value: string): FormulaCellEditExtension {
        return this._sheetInjector.createInstance(FormulaCellEditExtension, cell, value);
    }

    override check(cell: ICell) {
        const unitId = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getUnitId();
        const formula = this.checkFormulaValue(cell) || this.checkArrayFormValue(cell, unitId);

        if (formula !== '' && !formula) {
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
                            // Get the content of the formula and convert it into a DOM structure
                            formula = this._formulaPromptController.cellInputHandler.functionHTMLGenerate(value.formula);
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
        const arrayFormulaData = this._formulaController.getDataModel().getArrayFormulaData();

        if (!arrayFormulaData) return null;

        Object.keys(arrayFormulaData).forEach((sheetId) => {
            const sheetData = arrayFormulaData[sheetId];

            sheetData.forValue((rowIndex: number, columnIndex: number, value: IRangeData) => {
                const { startRow, startColumn, endRow, endColumn } = value;
                if (row >= startRow && row < endRow && column >= startColumn && column < endColumn) {
                    formula = '';
                    // .getFormulaBarUIController().getFormulaBar().setFormulaContent(str);
                    this._sheetContainerUIController.getFormulaBarUIController().getFormulaBar().setFormulaContent('');
                    return false;
                }
            });
        });

        return formula;
    }
}
