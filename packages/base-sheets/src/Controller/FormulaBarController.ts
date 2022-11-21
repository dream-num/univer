import { PLUGIN_NAMES } from '@univer/core';
import { CellInputExtensionManager } from '../Basics/Register/CellInputRegister';
import { SheetPlugin } from '../SheetPlugin';
import { FormulaBar } from '../View/UI/FormulaBar';
import { SelectionControl } from './Selection';

export class FormulaBarController {
    private _formulaBar: FormulaBar;

    private _plugin: SheetPlugin;

    private _cellInputExtensionManager: CellInputExtensionManager;

    constructor(plugin: SheetPlugin) {
        this._plugin = plugin;

        this._initialize();
    }

    private _initialize() {
        const context = this._plugin.context;
        const manager = context.getObserverManager();

        manager.requiredObserver<FormulaBar>('onFormulaBarDidMountObservable', PLUGIN_NAMES.SPREADSHEET).add((component) => {
            this._formulaBar = component;
        });
        
        this._plugin.getObserver('onChangeSelectionObserver')?.add((selectionControl: SelectionControl) => {
            
            const currentCell = selectionControl.model.currentCell;

            if (currentCell) {
                let currentRangeData;

                if (currentCell.isMerged) {
                    const mergeInfo = currentCell.mergeInfo;

                    currentRangeData = {
                        startRow: mergeInfo.startRow,
                        endRow: mergeInfo.endRow,
                        startColumn: mergeInfo.startColumn,
                        endColumn: mergeInfo.endColumn,
                    };
                } else {
                    const { row, column } = currentCell;
                    currentRangeData = {
                        startRow: row,
                        endRow: row,
                        startColumn: column,
                        endColumn: column,
                    };
                }

                const cellData = this._plugin.getWorkbook().getActiveSheet().getRange(currentRangeData).getObjectValue({ isIncludeStyle: true });

                if (cellData) {
                    let cellValue = cellData.m || `${cellData.v}` || '';

                    debugger
                    // If the cell has a formula, it needs to be intercepted
                    const cell = this._cellInputExtensionManager.handle({
                        row: currentRangeData.startRow,
                        column: currentRangeData.startColumn,
                        value: cellValue,
                    });

                    if (cell) {
                        cellValue = cell.value;
                    }
                    this._formulaBar.setFormulaContent(cellValue);
                }
            }
        });

        this._cellInputExtensionManager = new CellInputExtensionManager();
    }
}
