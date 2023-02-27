import { UIObserver } from '@univerjs/core';
import { SheetPlugin } from '../SheetPlugin';
import { SelectionControl } from './Selection/SelectionController';
import { SelectionModel } from '../Model/SelectionModel';

export class RightMenuController {
    private _plugin: SheetPlugin;

    constructor(plugin: SheetPlugin) {
        this._plugin = plugin;
    }

    listenEventManager() {
        this._plugin
            .getContext()
            .getUniver()
            .getGlobalContext()
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
                    case 'moveTop':
                        this.deleteCellTop();
                        break;
                    case 'moveLeft':
                        this.deleteCellLeft();
                        break;
                    case 'clearContent':
                        this.clearContent();
                        break;
                }
            });
    }

    insertRow = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet?.insertRowBefore(selections[0].startRow, selections[0].endRow - selections[0].startRow + 1);
        }
    };

    deleteRow = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet?.deleteRows(selections[0].startRow, selections[0].endRow - selections[0].startRow + 1);
        }
    };

    insertColumn = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.insertColumnBefore(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
        }
    };

    deleteColumn = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.deleteColumns(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
        }
    };

    clearContent = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).clear();
        }
    };

    deleteCellLeft = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).deleteCells(0);
        }
    };

    deleteCellTop = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).deleteCells(1);
        }
    };

    setColumnWidth(e: Event) {
        if ((e as KeyboardEvent).key !== 'Enter') {
            return;
        }
        const width = (e.target as HTMLInputElement).value;
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.setColumnWidth(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1, Number(width));
        }
    }

    setRowHeight(e: Event) {
        if ((e as KeyboardEvent).key !== 'Enter') {
            return;
        }
        const height = (e.target as HTMLInputElement).value;
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._plugin.getContext().getWorkBook().getActiveSheet();
            sheet.setRowHeights(selections[0].startRow, selections[0].endRow - selections[0].startRow + 1, Number(height));
        }
    }

    private _getSelections() {
        const controls = this._plugin?.getSelectionManager().getCurrentControls();
        const selections = controls?.map((control: SelectionControl) => {
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
