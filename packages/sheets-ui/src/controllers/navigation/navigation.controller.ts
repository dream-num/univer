import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import {
    IMoveSelectionCommandParams,
    MoveSelectionCommand,
    MoveSelectionEnterAndTabCommand,
} from '../../commands/commands/set-selection.command';
import { ScrollController } from '../scroll.controller';

const SHEET_NAVIGATION_COMMANDS = [MoveSelectionCommand.id, MoveSelectionEnterAndTabCommand.id];

@OnLifecycle(LifecycleStages.Rendered, SheetNavigationController)
export class SheetNavigationController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ScrollController) private readonly _scrollController: ScrollController
    ) {
        super();

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command) => {
                if (SHEET_NAVIGATION_COMMANDS.includes(command.id)) {
                    const params = command.params as IMoveSelectionCommandParams;
                    this._scrollController.scrollToVisible(params.direction);
                }
            })
        );
    }
}
