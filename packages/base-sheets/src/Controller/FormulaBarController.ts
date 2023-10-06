export class FormulaBarController {
    // private _initialize() {
    //     this._plugin.getObserver('onChangeSelectionObserver')?.add((selectionControl: SelectionControl) => {
    //         const currentCell = selectionControl.model.currentCell;
    //         if (currentCell) {
    //             let currentRangeData;
    //             if (currentCell.isMerged) {
    //                 const mergeInfo = currentCell.mergeInfo;
    //                 currentRangeData = {
    //                     startRow: mergeInfo.startRow,
    //                     endRow: mergeInfo.endRow,
    //                     startColumn: mergeInfo.startColumn,
    //                     endColumn: mergeInfo.endColumn,
    //                 };
    //             } else {
    //                 const { row, column } = currentCell;
    //                 currentRangeData = {
    //                     startRow: row,
    //                     endRow: row,
    //                     startColumn: column,
    //                     endColumn: column,
    //                 };
    //             }
    //             const cellData = this._plugin.getActiveSheet().getRange(currentRangeData).getObjectValue({ isIncludeStyle: true });
    //             if (cellData) {
    //                 let cellValue = String(cellData.m || cellData.v || '');
    //                 // If the cell has a formula, it needs to be intercepted
    //                 const cell = this._cellInputExtensionManager.handle({
    //                     row: currentRangeData.startRow,
    //                     column: currentRangeData.startColumn,
    //                     value: cellValue,
    //                 });
    //                 if (cell) {
    //                     cellValue = cell.value;
    //                 }
    //                 this._formulaBar.setFormulaContent(cellValue);
    //             }
    //             // empty cell
    //             else {
    //                 this._formulaBar.setFormulaContent('');
    //             }
    //         }
    //     });
    // }
}
