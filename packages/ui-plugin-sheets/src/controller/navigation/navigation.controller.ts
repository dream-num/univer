import { IMoveSelectionCommandParams, MoveSelectionCommand, ScrollController } from '@univerjs/base-sheets';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

const SHEET_NAVIGATION_COMMANDS = [MoveSelectionCommand.id];

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
