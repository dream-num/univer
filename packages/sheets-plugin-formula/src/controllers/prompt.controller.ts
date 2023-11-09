import { TextSelectionManagerService } from '@univerjs/base-docs';
import {
    Disposable,
    FOCUSING_EDITOR_FORMULA,
    ICommandService,
    IContextService,
    isFormulaString,
    LifecycleStages,
    LocaleService,
    OnLifecycle,
} from '@univerjs/core';
import { EditorBridgeService, IEditorBridgeService } from '@univerjs/ui-plugin-sheets';
import { Inject } from '@wendellhu/redi';

import { HelpFunctionOperation } from '../commands/operations/help-function.operation';
import { SearchFunctionOperation } from '../commands/operations/search-function.operation';
import { FUNCTION_LIST } from '../services/function-list';
import { IFormulaPromptService, ISearchItem } from '../services/prompt.service';
import { getFunctionName } from './util';

@OnLifecycle(LifecycleStages.Starting, PromptController)
export class PromptController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IContextService private readonly _contextService: IContextService,
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
        this._textSelectionManagerService.textSelectionInfo$.subscribe(() => {
            const currentInputValue = this._getCurrentCellValue();

            // TODO@Dushusir: use real text info
            const input = this._getCellEditInput(currentInputValue || '');
            if (!input) return;

            const { visibleSearch, visibleHelp, searchText, paramIndex, searchList, functionInfo } = input;

            if (visibleSearch) {
                this._contextService.setContextValue(FOCUSING_EDITOR_FORMULA, true);
            } else if (visibleHelp) {
                this._contextService.setContextValue(FOCUSING_EDITOR_FORMULA, false);
            } else {
                this._contextService.setContextValue(FOCUSING_EDITOR_FORMULA, false);
            }

            this._commandService.executeCommand(SearchFunctionOperation.id, {
                visible: visibleSearch,
                searchText,
                searchList,
            });
            this._commandService.executeCommand(HelpFunctionOperation.id, {
                visible: visibleHelp,
                paramIndex,
                functionInfo,
            });
        });
    }

    private _getCurrentCellValue() {
        const state = this._editorBridgeService.getState();
        let currentInputValue = state?.documentLayoutObject?.documentModel?.snapshot?.body?.dataStream;

        if (currentInputValue) {
            currentInputValue = currentInputValue.split('\r\n')[0].toLocaleUpperCase();
        }

        return currentInputValue;
    }

    // TODO@Dushusir: remove after use real text info
    private _getCellEditInput(currentInputValue: string) {
        if (isFormulaString(currentInputValue)) {
            const searchText = currentInputValue.substring(1);

            // TODO@Dushusir: remove after use real text info
            const matchList = ['SUMIF', 'TAN', 'TANH'];

            // help function
            if (matchList.includes(searchText)) {
                const paramIndex = Math.random() > 0.5 ? 0 : 1;

                const functionInfo = this._getFunctionInfo(searchText);

                return {
                    visibleSearch: false,
                    visibleHelp: !!functionInfo,
                    searchText,
                    paramIndex,
                    functionInfo,
                };
            }

            const searchList = this._getSearchList(searchText);
            return {
                visibleSearch: searchList.length > 0,
                visibleHelp: false,
                searchText,
                paramIndex: 0,
                searchList,
            };
        }

        return {
            visibleSearch: false,
            visibleHelp: false,
            searchText: '',
            paramIndex: 0,
        };
    }

    private _initAcceptFormula() {
        this._formulaPromptService.acceptFormulaName$.subscribe((name: string) => {
            console.log(`TODO: set ${name} to cell editor`);
        });
    }

    private _getSearchList(searchText: string) {
        const searchList: ISearchItem[] = [];
        FUNCTION_LIST.forEach((item) => {
            const functionName = getFunctionName(item, this._localeService);
            if (functionName.indexOf(searchText) > -1) {
                searchList.push({ name: functionName, desc: this._localeService.t(item.abstract) as string });
            }
        });

        return searchList;
    }

    private _getFunctionInfo(searchText: string) {
        return FUNCTION_LIST.find((item) => getFunctionName(item, this._localeService) === searchText);
    }
}
