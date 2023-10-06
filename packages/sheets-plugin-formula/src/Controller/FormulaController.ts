import {
    ArrayFormulaDataType,
    FormulaEngineService,
    IInterpreterDatasetConfig,
    SheetDataType,
    SheetNameMapType,
    UnitDataType,
} from '@univerjs/base-formula-engine';
import { SelectionManagerService } from '@univerjs/base-sheets';
import { ICurrentUniverService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { IFormulaConfig } from '../Basics/Interfaces/IFormula';
import { FormulaDataModel } from '../Model/FormulaDataModel';
import { ArrayFormulaLineControl } from './ArrayFormulaLineController';

export class FormulaController {
    private _formulaDataModel: FormulaDataModel;

    private _formulaEngine?: FormulaEngineService;

    private _interpreterCalculatePropsCache?: IInterpreterDatasetConfig;

    private _activeSheetId: string;

    private _arrayFormulaLineControls: ArrayFormulaLineControl[] = [];

    constructor(
        config: IFormulaConfig,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(Injector) private readonly _sheetInjector: Injector
    ) {
        this._formulaDataModel = new FormulaDataModel(config);

        this._activeSheetId = this._currentUniverService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();

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

        // this._initialize();
    }

    getDataModel() {
        return this._formulaDataModel;
    }

    setFormulaEngine(formulaEngineService: FormulaEngineService) {
        this._formulaEngine = formulaEngineService;
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

    getWorkbook() {
        return this._currentUniverService.getCurrentUniverSheetInstance();
    }

    getUnitId() {
        return this.getUnitId();
    }

    addArrayFormulaData(value: ArrayFormulaDataType) {
        this._formulaDataModel.setArrayFormulaData(value);

        this.clearArrayFormulaLineControl();
        this.renderArrayFormulaLineControl();
    }

    clearArrayFormulaLineControl() {
        const arrayFormulaLineControls = this._arrayFormulaLineControls;
        if (arrayFormulaLineControls.length > 0) {
            for (const control of arrayFormulaLineControls) {
                control.dispose();
            }
        }

        this._arrayFormulaLineControls = [];
    }

    renderArrayFormulaLineControl() {
        const arrayFormulaData = this._formulaDataModel.getArrayFormulaData();
        const arrayFormula = arrayFormulaData[this._activeSheetId];
        if (!arrayFormula) return;

        const currentCellData = this._selectionManagerService.getLast()?.primary;

        arrayFormula.forValue((r, c, v) => {
            const { startRow, startColumn, endRow, endColumn } = v;
            if (currentCellData) {
                const { actualRow, actualColumn } = currentCellData;
                if (
                    actualRow >= startRow &&
                    actualRow < endRow &&
                    actualColumn >= startColumn &&
                    actualColumn < endColumn
                ) {
                    const arrayFormulaLineControl = this._sheetInjector.createInstance(
                        ArrayFormulaLineControl,
                        this._activeSheetId,
                        v
                    );
                    this._arrayFormulaLineControls.push(arrayFormulaLineControl);
                }
            }
        });
    }

    // private _initRegisterComponent() {
    //     // this._sheetPlugin.registerComponent(FORMULA_PLUGIN_NAME + FormulaLabel.name, FormulaLabel);
    //     this._plugin
    //         .getContext()
    //         .getUniver()
    //         .getGlobalContext()
    //         .getPluginManager()
    //         .getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
    //         .getAppUIController()
    //         .getSheetContainerController()
    //         .getMainSlotController()
    //         .addSlot(FORMULA_PLUGIN_NAME + FormulaLabel.name, {
    //             component: FormulaLabel,
    //         });
    // }

    private _toInterpreterCalculateProps(): IInterpreterDatasetConfig {
        const workbook = this;
        const sheets = workbook.getSheets();
        const sheetData: SheetDataType = {};
        const unitData: UnitDataType = {};
        const sheetNameMap: SheetNameMapType = {};

        const currentUnitId = workbook.getUnitId();

        for (const sheet of sheets) {
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
