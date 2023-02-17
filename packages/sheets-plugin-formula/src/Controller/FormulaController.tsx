import { FormulaEnginePlugin, IInterpreterDatasetConfig, SheetDataType, UnitDataType, SheetNameMapType, ArrayFormulaDataType } from '@univerjs/base-formula-engine';
import { SheetPlugin } from '@univerjs/base-sheets';
import { PLUGIN_NAMES, SheetContext } from '@univerjs/core';
import { SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '@univerjs/ui-plugin-sheets';
import { FORMULA_PLUGIN_NAME } from '../Basic';
import { IFormulaConfig } from '../Basic/Interfaces/IFormula';
import { FormulaPlugin } from '../FormulaPlugin';
import { FormulaDataModel } from '../Model/FormulaDataModel';
import { FormulaLabel } from '../View/UI/FormulaLabel';
import { ArrayFormulaLineControl } from './ArrayFormulaLineController';

export class FormulaController {
    private _formulaDataModel: FormulaDataModel;

    private _formulaEngine: FormulaEnginePlugin;

    private _context: SheetContext;

    private _interpreterCalculatePropsCache: IInterpreterDatasetConfig;

    private _sheetPlugin: SheetPlugin;

    private _sheetUIPlugin: SheetUIPlugin;

    private _activeSheetId: string;

    private _arrayFormulaLineControls: ArrayFormulaLineControl[] = [];

    constructor(private _plugin: FormulaPlugin, config?: IFormulaConfig) {
        this._formulaDataModel = new FormulaDataModel(config);

        this._context = this._plugin.getContext();

        this._sheetPlugin = this._plugin.getContext().getPluginManager().getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        this._sheetUIPlugin = this._plugin.getUniver().getGlobalContext().getPluginManager().getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME);

        this._activeSheetId = this._sheetPlugin.getWorkbook().getActiveSheet().getSheetId();

        // this._initRegisterComponent();

        // this._sheetPlugin.addToolButton({
        //     name: FORMULA_PLUGIN_NAME,
        //     locale: FORMULA_PLUGIN_NAME,
        //     hideSelectedIcon: true,
        //     customLabel: {
        //         name: FORMULA_PLUGIN_NAME + FormulaLabel.name,
        //         props: {
        //             locale: 'formula.formula.sum',
        //         },
        //     },
        //     type: 5,
        //     show: CONFIG.show,
        //     tooltipLocale: 'formula.formulaLabel',
        //     children: [
        //         {
        //             locale: 'formula.formula.sum',
        //             suffix: 'SUM',
        //         },
        //         {
        //             locale: 'formula.formula.average',
        //             suffix: 'AVERAGE',
        //         },
        //         {
        //             locale: 'formula.formula.max',
        //             suffix: 'MAX',
        //         },
        //         {
        //             locale: 'formula.formula.min',
        //             suffix: 'MIN',
        //             border: true,
        //         },
        //         {
        //             locale: 'formula.formula.if',
        //             suffix: 'IF',
        //         },
        //         {
        //             locale: 'formula.formula.more',
        //             onClick: () => this._plugin.getSearchFormulaController().showFormulaModal('SearchFormula', true),
        //         },
        //     ],
        // });

        this._initialize();
    }

    private _initialize() {
        this._sheetPlugin
            .getContext()
            .getContextObserver('onAfterChangeActiveSheetObservable')
            .add(() => {
                this._activeSheetId = this._sheetPlugin.getWorkbook().getActiveSheet().getSheetId();
                this.clearArrayFormulaLineControl();
                this.renderArrayFormulaLineControl();
            });

        this._sheetPlugin.getObserver('onChangeSelectionObserver')?.add(() => {
            this.clearArrayFormulaLineControl();
            this.renderArrayFormulaLineControl();
        });
    }

    private _initRegisterComponent() {
        // this._sheetPlugin.registerComponent(FORMULA_PLUGIN_NAME + FormulaLabel.name, FormulaLabel);
        this._plugin
            .getContext()
            .getUniver()
            .getGlobalContext()
            .getPluginManager()
            .getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
            .getAppUIController()
            .getSheetContainerController()
            .getMainSlotController()
            .addSlot(FORMULA_PLUGIN_NAME + FormulaLabel.name, {
                component: FormulaLabel,
            });
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

    addArrayFormulaData(value: ArrayFormulaDataType) {
        this._formulaDataModel.setArrayFormulaData(value);

        this.clearArrayFormulaLineControl();
        this.renderArrayFormulaLineControl();
    }

    clearArrayFormulaLineControl() {
        const arrayFormulaLineControls = this._arrayFormulaLineControls;
        if (arrayFormulaLineControls.length > 0) {
            for (let control of arrayFormulaLineControls) {
                control.dispose();
            }
        }

        this._arrayFormulaLineControls = [];
    }

    renderArrayFormulaLineControl() {
        const arrayFormulaData = this._formulaDataModel.getArrayFormulaData();
        const arrayFormula = arrayFormulaData[this._activeSheetId];
        if (!arrayFormula) return;

        const currentCellData = this._sheetPlugin.getSelectionManager().getCurrentCellData();

        arrayFormula.forValue((r, c, v) => {
            const { startRow, startColumn, endRow, endColumn } = v;
            if (currentCellData) {
                const { startRow: row, startColumn: column } = currentCellData;
                if (row >= startRow && row < endRow && column >= startColumn && column < endColumn) {
                    this._arrayFormulaLineControls.push(new ArrayFormulaLineControl(this._plugin, this._activeSheetId, v));
                }
            }
        });
    }
}
