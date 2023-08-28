import { IDisposable } from '@wendellhu/redi';
import { Disposable, ICommandService } from '@univerjs/core';

import { ClearSelectionContentCommand } from '../Commands/Commands/clear-selection-content.command';
import { SetRangeValuesMutation } from '../Commands/Mutations/set-range-values.mutation';
import { SetWorksheetNameCommand } from '../Commands/Commands/set-worksheet-name.command';
import { SetWorksheetNameMutation } from '../Commands/Mutations/set-worksheet-name.mutation';

/**
 * The controller to provide the most basic sheet CRUD methods to other modules of sheet modules.
 */
export class BasicWorksheetController extends Disposable implements IDisposable {
    constructor(@ICommandService private readonly _commandService: ICommandService) {
        super();

        this.disposeWithMe(_commandService.registerCommand(ClearSelectionContentCommand));
        this.disposeWithMe(_commandService.registerCommand(SetRangeValuesMutation));
        this.disposeWithMe(_commandService.registerCommand(SetWorksheetNameCommand));
        this.disposeWithMe(_commandService.registerCommand(SetWorksheetNameMutation));
    }

    onInitialize() {}

    // TODO: @Dushusir: add other basic mutation methods here.

    /**
     * Clear contents in the current selected ranges.
     */
    async clearSelectionContent(): Promise<boolean> {
        return this._commandService.executeCommand(ClearSelectionContentCommand.id);
    }
}
