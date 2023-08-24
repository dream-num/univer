import { Inject, SkipSelf } from '@wendellhu/redi';
import { ICommandService, ICurrentUniverService, ObserverManager, UIObserver } from '@univerjs/core';
import { SelectionController } from './Selection/SelectionController';
import { SelectionModel } from '../Model/SelectionModel';
import { ISelectionManager } from '../Services/tokens';
import { SelectionManager } from './Selection';
import { HideColumnController } from './HideColumnController';
import { ClearSelectionContentCommand } from '../Commands/Commands/clear-selection-content.command';

export class RightMenuController {
    constructor(
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager,
        @ISelectionManager private readonly _selectionManager: SelectionManager,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(HideColumnController) private readonly _hideColumnController: HideColumnController,
        @ICommandService private readonly _commandService: ICommandService
    ) {}

    listenEventManager() {
        this._globalObserverManager.requiredObserver<UIObserver<string>>('onUIChangeObservable', 'core').add((msg: UIObserver<string>) => {
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
            const sheet = this._currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook().getActiveSheet();
            sheet?.insertRowBefore(selections[0].startRow, selections[0].endRow - selections[0].startRow + 1);
        }
    };

    deleteRow = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook().getActiveSheet();
            sheet?.deleteRows(selections[0].startRow, selections[0].endRow - selections[0].startRow + 1);
        }
    };

    insertColumn = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook().getActiveSheet();
            sheet.insertColumnBefore(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
        }
    };

    deleteColumn = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook().getActiveSheet();
            sheet.deleteColumns(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
        }
    };

    hideColumn = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook().getActiveSheet();
            this._hideColumnController.hideColumns(sheet.getSheetId(), selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1);
        }
    };

    clearContent = () => {
        // TODO: @wzhudev: should not call a command directly. Instead, it should invoke a method on XXXController and the controller would trigger a command.
        // Only command should be resonsible for triggering commands.
        this._commandService.executeCommand(ClearSelectionContentCommand.id);
    };

    deleteCellLeft = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).deleteCells(0);
        }
    };

    deleteCellTop = () => {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook().getActiveSheet();
            sheet.getRange(selections[0]).deleteCells(1);
        }
    };

    setColumnWidth(width: string) {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook().getActiveSheet();
            sheet.setColumnWidth(selections[0].startColumn, selections[0].endColumn - selections[0].startColumn + 1, Number(width));
        }
    }

    setRowHeight(height: string) {
        const selections = this._getSelections();
        if (selections?.length === 1) {
            const sheet = this._currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook().getActiveSheet();
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