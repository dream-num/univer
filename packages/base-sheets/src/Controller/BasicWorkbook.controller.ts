import {
    Disposable,
    ICommandService,
    IWorksheetConfig,
    LifecycleStages,
    ObserverManager,
    OnLifecycle,
} from '@univerjs/core';
import { IDisposable, Inject, SkipSelf } from '@wendellhu/redi';

import { InsertSheetCommand } from '../commands/commands/insert-sheet.command';
import { RemoveSheetCommand } from '../commands/commands/remove-sheet.command';

/**
 * The controller to provide the most basic sheet CRUD methods to other modules of sheet modules.
 */
@OnLifecycle(LifecycleStages.Rendered, BasicWorkbookController)
export class BasicWorkbookController extends Disposable implements IDisposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @SkipSelf() @Inject(ObserverManager) private readonly _globalObserverManager: ObserverManager
    ) {
        super();
    }

    onInitialize() {}

    /**
     * Insert new worksheet
     */
    async insertSheet(index: number, sheet: Partial<IWorksheetConfig>, workbookId: string): Promise<boolean> {
        const options = {
            index,
            sheet,
            workbookId,
        };
        return this._commandService.executeCommand(InsertSheetCommand.id, options);
    }

    /**
     * remove worksheet
     */
    async removeSheet(sheetId: string, workbookId: string): Promise<boolean> {
        const options = {
            sheetId,
            workbookId,
        };
        return this._commandService.executeCommand(RemoveSheetCommand.id, options);
    }

    // TODO@Dushusir setDefaultActiveSheet(use worksheet set status)  activateSheetByIndex(use worksheet activate)
}
