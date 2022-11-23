import { FormulaEnginePlugin, IInterpreterDatasetConfig, SheetDataType, UnitDataType, SheetNameMapType } from '@univer/base-formula-engine';
import { SheetPlugin } from '@univer/base-sheets';
import { PLUGIN_NAMES, SheetContext } from '@univer/core';
import { FORMULA_PLUGIN_NAME, CONFIG } from '../Basic';
import { IFormulaConfig } from '../Basic/Interfaces/IFormula';
import { FormulaPlugin } from '../FormulaPlugin';
import { FormulaDataModel } from '../Model/FormulaDataModel';
import { FormulaLabel } from '../View/UI/FormulaLabel';

export class FormulaController {
    private _formulaDataModel: FormulaDataModel;

    private _formulaEngine: FormulaEnginePlugin;

    private _context: SheetContext;

    private _interpreterCalculatePropsCache: IInterpreterDatasetConfig;

    private _sheetPlugin: SheetPlugin;

    constructor(private _plugin: FormulaPlugin, config?: IFormulaConfig) {
        this._formulaDataModel = new FormulaDataModel(config);

        this._context = this._plugin.getContext();

        this._sheetPlugin = this._plugin.getContext().getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this.initRegisterComponent();

        this._sheetPlugin.addToolButton({
            name: FORMULA_PLUGIN_NAME,
            locale: FORMULA_PLUGIN_NAME,
            hideSelectedIcon: true,
            customLabel: {
                name: FORMULA_PLUGIN_NAME + FormulaLabel.name,
                props: {
                    locale: 'formula.formula.sum',
                },
            },
            type: 5,
            show: CONFIG.show,
            tooltipLocale: 'formula.formulaLabel',
            children: [
                {
                    locale: 'formula.formula.sum',
                    suffix: 'SUM',
                },
                {
                    locale: 'formula.formula.average',
                    suffix: 'AVERAGE',
                },
                {
                    locale: 'formula.formula.max',
                    suffix: 'MAX',
                },
                {
                    locale: 'formula.formula.min',
                    suffix: 'MIN',
                    border: true,
                },
                {
                    locale: 'formula.formula.if',
                    suffix: 'IF',
                },
                {
                    locale: 'formula.formula.more',
                    onClick: () => this._plugin.getSearchFormulaController().showFormulaModal('SearchFormula', true),
                },
            ],
        });
    }

    initRegisterComponent() {
        this._sheetPlugin.registerComponent(FORMULA_PLUGIN_NAME + FormulaLabel.name, FormulaLabel);
    }

    getDataModel() {
        return this._formulaDataModel;
    }

    setFormulaEngine(formulaEngine: FormulaEnginePlugin) {
        this._formulaEngine = formulaEngine;
    }

    getFormulaEngine() {
        return this._formulaEngine;
    }

    toInterpreterCalculateProps(isRefresh = true) {
        if (isRefresh || !this._interpreterCalculatePropsCache) {
            this._interpreterCalculatePropsCache = this._toInterpreterCalculateProps();
        }

        return this._interpreterCalculatePropsCache;
    }

    getCommandManager() {
        return this._context.getCommandManager();
    }

    getWorkbook() {
        return this._context.getWorkBook();
    }

    getUnitId() {
        return this.getWorkbook().getUnitId();
    }

    private _toInterpreterCalculateProps(): IInterpreterDatasetConfig {
        const workbook = this._context.getWorkBook();
        const sheets = workbook.getSheets();
        const sheetData: SheetDataType = {};
        const unitData: UnitDataType = {};
        const sheetNameMap: SheetNameMapType = {};

        const currentUnitId = workbook.getUnitId();

        for (let sheet of sheets) {
            sheetData[sheet.getSheetId()] = sheet.getCellMatrix();
            sheetNameMap[sheet.getName()] = sheet.getSheetId();
        }

        unitData[currentUnitId] = sheetData;

        const formulaData = this._formulaDataModel.getFormulaData();

        const activeSheet = workbook.getActiveSheet();

        const rowCount = activeSheet.getRowCount();
        const columnCount = activeSheet.getColumnCount();

        return {
            unitData,
            formulaData,
            sheetNameMap,
            currentRow: -1,
            currentColumn: -1,
            currentSheetId: '',
            currentUnitId,
            rowCount,
            columnCount,
        };
    }
}
