import { TextSelectionManagerService } from '@univerjs/base-docs';
import { Disposable, ICommandService, isFormulaString, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { EditorBridgeService, IEditorBridgeService } from '@univerjs/ui-plugin-sheets';
import { Inject } from '@wendellhu/redi';

import { HelpFunctionOperation } from '../commands/operations/help-function.operation';
import { SearchFunctionOperation } from '../commands/operations/search-function.operation';
import { IFormulaPromptService } from '../services/prompt.service';

@OnLifecycle(LifecycleStages.Starting, PromptController)
export class PromptController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @Inject(IEditorBridgeService) private readonly _editorBridgeService: EditorBridgeService,
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
            const input = this._testGetCellEditInput();
            if (!input) return;

            const { visibleSearch, visibleHelp, searchText, paramIndex } = input;

            this._commandService.executeCommand(SearchFunctionOperation.id, { visible: visibleSearch, searchText });
            this._commandService.executeCommand(HelpFunctionOperation.id, {
                visible: visibleHelp,
                functionName: searchText,
                paramIndex,
            });
        });
    }

    // TODO@Dushusir: remove after use real text info
    private _testGetCellEditInput() {
        const state = this._editorBridgeService.getState();
        let currentInputValue = state?.documentLayoutObject?.documentModel?.snapshot?.body?.dataStream;

        if (currentInputValue) {
            currentInputValue = currentInputValue.split('\r\n')[0];
            if (isFormulaString(currentInputValue)) {
                const searchText = currentInputValue.substring(1);

                const matchList = ['SUMIF', 'TAN', 'TANH'];

                // help function
                if (matchList.includes(searchText)) {
                    const paramIndex = Math.random() > 0.5 ? 0 : 1;
                    return {
                        visibleSearch: false,
                        visibleHelp: true,
                        searchText,
                        paramIndex,
                    };
                }
                return {
                    visibleSearch: true,
                    visibleHelp: false,
                    searchText,
                    paramIndex: 0,
                };
            }

            return {
                visibleSearch: false,
                visibleHelp: false,
                searchText: '',
                paramIndex: 0,
            };
        }
    }

    private _initAcceptFormula() {
        this._formulaPromptService.acceptFormulaName$.subscribe((name: string) => {
            console.log(`TODO: set ${name} to cell editor`);
        });
    }
}
