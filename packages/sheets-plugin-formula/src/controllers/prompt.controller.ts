import { TextSelectionManagerService } from '@univerjs/base-docs';
import { IDesktopUIController, IMenuService, IUIController } from '@univerjs/base-ui';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { HelpFunctionOperation } from '../commands/operations/help-function.operation';
import { SearchFunctionOperation } from '../commands/operations/search-function.operation';
import { IFormulaPromptService } from '../services/prompt.service';

@OnLifecycle(LifecycleStages.Starting, PromptController)
export class PromptController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUIController private readonly _uiController: IDesktopUIController,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @Inject(IFormulaPromptService) private readonly _formulaPromptService: IFormulaPromptService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._initialCursorSync();
        this._initAcceptFormula();
    }

    private _initialCursorSync() {
        this._textSelectionManagerService.textSelectionInfo$.subscribe((text) => {
            // TODO@Dushusir: use real text info
            return;
            const visible = Math.random() > 0.5;
            // const searchText = Math.random() > 0.5 ? 'SUMIF' : 'TAN';
            const searchText = 'SUMIF';
            const paramIndex = Math.random() > 0.5 ? 0 : 1;

            this._commandService.executeCommand(SearchFunctionOperation.id, { visible, searchText });
            this._commandService.executeCommand(HelpFunctionOperation.id, {
                visible: !visible,
                functionName: searchText,
                paramIndex,
            });
        });
    }

    private _initAcceptFormula() {
        this._formulaPromptService.acceptFormulaName$.subscribe((name: string) => {
            console.log(`TODO: set ${name} to cell editor`);
        });
    }
}
