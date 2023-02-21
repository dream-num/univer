import { SheetPlugin, SelectionControl } from '@univerjs/base-sheets';
import { CellInputExtensionManager } from '@univerjs/base-ui';
import { INamedRange, PLUGIN_NAMES } from '@univerjs/core';
import { SheetUIPlugin } from '..';
import { FormulaBar } from '../View/FormulaBar';

export class FormulaBarUIController {
    private _formulaBar: FormulaBar;

    private _plugin: SheetUIPlugin;

    private _sheetPlugin: SheetPlugin;

    private _cellInputExtensionManager: CellInputExtensionManager;

    private _namedRanges: INamedRange[];

    constructor(plugin: SheetUIPlugin) {
        this._plugin = plugin;
        this._sheetPlugin = plugin.getUniver().getCurrentUniverSheetInstance().context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)!;

        this._initialize();
    }

    // 获取Toolbar组件
    getComponent = (ref: FormulaBar) => {
        this._formulaBar = ref;

        this._initFormulaBar();
    };

    getFormulaBar() {
        return this._formulaBar;
    }

    private _initialize() {
        this._sheetPlugin.getObserver('onChangeSelectionObserver')?.add((selectionControl: SelectionControl) => {
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

                const cellData = this._sheetPlugin.getWorkbook().getActiveSheet().getRange(currentRangeData).getObjectValue({ isIncludeStyle: true });

                if (cellData) {
                    let cellValue = String(cellData.m || cellData.v || '');

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
                // empty cell
                else {
                    this._formulaBar.setFormulaContent('');
                }
            }
        });

        this._cellInputExtensionManager = new CellInputExtensionManager();

        // set NamedRange data
    }

    private _initFormulaBar() {
        // update named ranges data
        this._namedRanges = this._sheetPlugin.getContext().getWorkBook().getConfig().namedRanges;

        const list = this._namedRanges.map((namedRange) => ({
            value: namedRange.name,
            label: namedRange.name,
        }));

        this._formulaBar.setNamedRanges(list);
    }
}
