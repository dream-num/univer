import { IDisposable } from '@wendellhu/redi';
import { ICommandService } from '@univerjs/core';

import { ClearSelectionContentCommand } from '../Commands/Commands/clear-selection-content.command';
import { SetRangeValuesMutation } from '../Commands/Mutations/set-range-values.mutation';

/**
 * The controller to provide the most basic sheet CRUD methods to other modules of sheet modules.
 */
export class BasicWorksheetController implements IDisposable {
    constructor(@ICommandService private readonly _commandService: ICommandService) {
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
}