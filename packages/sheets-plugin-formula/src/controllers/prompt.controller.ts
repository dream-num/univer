import { TextSelectionManagerService } from '@univerjs/base-docs';
import { IDesktopUIController, IMenuService, IUIController } from '@univerjs/base-ui';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { HelpFunctionOperation } from '../commands/operations/help-function.operation';
import { SearchFunctionOperation } from '../commands/operations/search-function.operation';
import { FUNCTION_LIST } from '../services/function-list';

@OnLifecycle(LifecycleStages.Starting, PromptController)
export class PromptController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUIController private readonly _uiController: IDesktopUIController,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._initialCursorSync();
    }

    private _initialCursorSync() {
        this._textSelectionManagerService.textSelectionInfo$.subscribe((text) => {
            // TODO@Dushusir: use real text info
            const show = Math.random() > 0.5;
            const searchText = Math.random() > 0.5 ? 'SU' : 'TA';
            const searchList = this._getSearchList(searchText);

            this._commandService.executeCommand(SearchFunctionOperation.id, { show, searchList });
            this._commandService.executeCommand(HelpFunctionOperation.id, { show: !show });
        });
    }

    private _getSearchList(searchText: string) {
        const result: string[] = [];
        FUNCTION_LIST.forEach((item) => {
            if (item.n.indexOf(searchText) > -1) {
                result.push(item.n);
            }
        });

        return result;
    }
}
