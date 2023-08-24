import { IDisposable } from '@wendellhu/redi';
import { ICommandService, ICurrentUniverService } from '@univerjs/core';

import { ISelectionManager } from '../Services/tokens';
import { SelectionController } from './Selection/SelectionController';
import { SelectionManager } from './Selection';
import { ClearSelectionContentCommand } from '../Commands/Commands/clear-selection-content.command';
import { SetRangeValuesMutation } from '@Commands/Mutations/set-range-values.mutation';

/**
 * The controller to provide the most basic sheet CRUD methods to other modules of sheet modules.
 */
export class BasicWorksheetController implements IDisposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @ISelectionManager private readonly _selectionManager: SelectionManager,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService
    ) {
        _commandService.registerCommand(ClearSelectionContentCommand);
        _commandService.registerCommand(SetRangeValuesMutation);
    }

    dispose(): void {}

    onInitialize() {}

    // TODO: @Dushusir: add other basic mutation methods here.

    /**
     * Clear contents in the current selected ranges.
     */
    async clearSelectionContent(): Promise<boolean> {
        return this._commandService.executeCommand(ClearSelectionContentCommand.id);
    }

    //#region row col actions

    // All API should be support current selection concept. Universal API implicit bebavior.

    insertRow(count?: number = 1, index?: number): Promise<boolean> {
        index = index ?? 0;

        const selections = this._getCurrentSelection();
        if (selections.length === 1) {
            const sheet = this._currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook().getActiveSheet();
        }
        // trigger a command to add row at given index with a given count.
    }

    insertColumn(count?: number = 1, index?: number): Promise<boolean> {}

    //#endregion

    // NOTE: @wzhudev: this methods should be exposed from ISelectionManager instead
    private _getCurrentSelection() {
        const controls = this._selectionManager.getCurrentControls();
        const selections = controls?.map((control: SelectionController) => {
            const model = control.model;
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