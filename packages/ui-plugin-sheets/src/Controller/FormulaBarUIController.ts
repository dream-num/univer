import { CellInputExtensionManager } from '@univerjs/base-ui';
import { ICurrentUniverService, INamedRange, ISelection, ObserverManager } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { FormulaBar } from '../View/FormulaBar';

export class FormulaBarUIController {
    private _formulaBar: FormulaBar;

    private _cellInputExtensionManager: CellInputExtensionManager;

    private _namedRanges: INamedRange[];

    constructor(@Inject(ObserverManager) private readonly _observerManager: ObserverManager, @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService) {
        this._initialize();
    }

    // 获取Toolbar组件
    getComponent = (ref: FormulaBar) => {
        this._formulaBar = ref;

        this.setFormulaBar();
    };

    getFormulaBar() {
        return this._formulaBar;
    }

    private _initialize() {
        this._observerManager.getObserver<ISelection>('onChangeSelectionObserver')?.add((selectionRange: ISelection) => {
            const currentCell = selectionRange.cellRange;

            if (currentCell) {
                let currentRangeData;

                if (currentCell.isMerged) {
                    currentRangeData = {
                        startRow: currentCell.startRow,
                        endRow: currentCell.endRow,
                        startColumn: currentCell.startColumn,
                        endColumn: currentCell.endColumn,
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

                const cellData = this._currentUniverService
                    .getCurrentUniverSheetInstance()
                    .getWorkBook()
                    .getActiveSheet()
                    .getRange(currentRangeData)
                    .getObjectValue({ isIncludeStyle: true });

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
                    this._formulaBar?.setFormulaContent(cellValue);
                }
                // empty cell
                else {
                    this._formulaBar?.setFormulaContent('');
                }
            }
        });

        this._cellInputExtensionManager = new CellInputExtensionManager();

        // set NamedRange data
    }

    private setFormulaBar() {
        // update named ranges data
        this._namedRanges = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getConfig().namedRanges;

        const list = this._namedRanges.map((namedRange) => ({
            value: namedRange.name,
            label: namedRange.name,
        }));

        this._formulaBar.setNamedRanges(list);
    }
}
