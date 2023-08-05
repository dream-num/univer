import { Inject } from '@wendellhu/redi';
import { Context, SheetContext, UIObserver, IGlobalContext } from '@univerjs/core';
import { SelectionController } from './Selection/SelectionController';
import { SelectionModel } from '../Model/SelectionModel';
import { ISelectionManager, ISheetContext } from '../Services/tokens';
import { SelectionManager } from './Selection';
import { HideColumnController } from './HideColumnController';

export class RightMenuController {
    constructor(
        @ISelectionManager private readonly _selectionManager: SelectionManager,
        @ISheetContext private readonly _sheetContext: SheetContext,
        @IGlobalContext private readonly _globalContext: Context,
        @Inject(HideColumnController) private readonly _hideColumnController: HideColumnController
    ) {}

    listenEventManager() {
        this._globalContext
            .getObserverManager()
            .requiredObserver<UIObserver<string>>('onUIChangeObservable', 'core')
            .add((msg) => {
                switch (msg.name) {
                    case 'insertRow':
                        this.insertRow();
                        break;
                    case 'insertColumn':
                        this.insertColumn();
                        break;
                    case 'deleteRow':
                        this.deleteRow();
                        break;
                    case 'deleteColumn':
                        this.deleteColumn();
                        break;
                    case 'hideColumn':
                        this.hideColumn();
                        break;
                    case 'moveTop':
                        this.deleteCellTop();
                        break;
                    case 'moveLeft':
                        this.deleteCellLeft();
                        break;
                    case 'clearContent':
                        this.clearContent();
                        break;
                    case 'setRowHeight':
                        this.setRowHeight(msg.value!);
                        break;
                    case 'setColumnWidth':
                        this.setColumnWidth(msg.value!);
                        break;
                }
            });
    }

    insertRow = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._sheetContext.getWorkBook().getActiveSheet();
            sheet?.insertRowBefore(selections[0].startRow, selections[0].endRow - selections[0].startRow + 1);
        }
    };

    deleteRow = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._sheetContext.getWorkBook().getActiveSheet();
            sheet?.deleteRows(selections[0].startRow, selections[0].endRow - selections[0].startRow + 1);
        }
    };

    insertColumn = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._sheetContext.getWorkBook().getActiveSheet();
            sheet.insertColumnBefore(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
        }
    };

    deleteColumn = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._sheetContext.getWorkBook().getActiveSheet();
            sheet.deleteColumns(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
        }
    };

    hideColumn = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._sheetContext.getWorkBook().getActiveSheet();
            this._hideColumnController.hideColumns(sheet.getSheetId(), selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
        }
    };

    clearContent = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._sheetContext.getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).clear();
        }
    };

    deleteCellLeft = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._sheetContext.getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).deleteCells(0);
        }
    };

    deleteCellTop = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._sheetContext.getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).deleteCells(1);
        }
    };

    setColumnWidth(width: string) {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._sheetContext.getWorkBook().getActiveSheet();
            sheet.setColumnWidth(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1, Number(width));
        }
    }

    setRowHeight(height: string) {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._sheetContext.getWorkBook().getActiveSheet();
            sheet.setRowHeights(selections[0].startRow, selections[0].endRow - selections[0].startRow + 1, Number(height));
        }
    }

    private _getSelections() {
        const controls = this._selectionManager.getCurrentControls();
        const selections = controls?.map((control: SelectionController) => {
            const model: SelectionModel = control.model;
            return {
                startRow: model.startRow,
                startColumn: model.startColumn,
                endRow: model.endRow,
                endColumn: model.endColumn,
            };
        });
        return selections;
    }
}
