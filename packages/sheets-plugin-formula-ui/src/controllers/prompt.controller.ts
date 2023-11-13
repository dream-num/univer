import { DocSkeletonManagerService, TextSelectionManagerService } from '@univerjs/base-docs';
import { FormulaEngineService, IFunctionInfo, LexerNode } from '@univerjs/base-formula-engine';
import {
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    IRenderManagerService,
} from '@univerjs/base-render';
import {
    Disposable,
    FOCUSING_EDITOR_INPUT_FORMULA,
    ICommandService,
    IContextService,
    IDocumentBody,
    isFormulaString,
    ITextRun,
    LifecycleStages,
    LocaleService,
    Nullable,
    OnLifecycle,
} from '@univerjs/core';
import { EditorBridgeService, getEditorObject, IEditorBridgeService } from '@univerjs/ui-plugin-sheets';
import { Inject } from '@wendellhu/redi';

import { HelpFunctionOperation } from '../commands/operations/help-function.operation';
import { SearchFunctionOperation } from '../commands/operations/search-function.operation';
import { FUNCTION_LIST } from '../services/function-list';
import { IFormulaPromptService, ISearchItem } from '../services/prompt.service';
import { getFunctionName } from './util';

interface IFunctionPanelParam {
    visibleSearch: boolean;
    visibleHelp: boolean;
    searchText: string;
    paramIndex: number;
    functionInfo?: IFunctionInfo;
    searchList?: ISearchItem[];
}

@OnLifecycle(LifecycleStages.Starting, PromptController)
export class PromptController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IContextService private readonly _contextService: IContextService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @Inject(IEditorBridgeService) private readonly _editorBridgeService: EditorBridgeService,
        @Inject(IFormulaPromptService) private readonly _formulaPromptService: IFormulaPromptService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService
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
            const currentBody = this._getCurrentBody();

            const dataStream = currentBody?.dataStream || '';

            this._contextSwitch(dataStream);

            // TODO@Dushusir: use real text info
            this._setFunctionPanel(dataStream);

            this._highlightFormula(currentBody);
        });
    }

    private _getCurrentBody() {
        const state = this._editorBridgeService.getState();
        return state?.documentLayoutObject?.documentModel?.snapshot?.body;
    }

    private _contextSwitch(currentInputValue: string) {
        if (isFormulaString(currentInputValue)) {
            this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, true);
        } else {
            this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);
        }
    }

    private _getContextState() {
        return this._contextService.getContextValue(FOCUSING_EDITOR_INPUT_FORMULA);
    }

    // TODO@Dushusir: remove after use real text info
    private _setFunctionPanel(currentInputValue: string) {
        let param: IFunctionPanelParam = {
            visibleSearch: false,
            visibleHelp: false,
            searchText: '',
            paramIndex: 0,
            functionInfo: {} as IFunctionInfo,
            searchList: [],
        };

        if (this._getContextState()) {
            currentInputValue = currentInputValue.split('\r\n')[0].toLocaleUpperCase();

            const searchText = currentInputValue.substring(1);

            // TODO@Dushusir: remove after use real text info
            const matchList = ['SUMIF', 'TAN', 'TANH'];

            // help function
            if (matchList.includes(searchText)) {
                const paramIndex = Math.random() > 0.5 ? 0 : 1;

                const functionInfo = this._getFunctionInfo(searchText);

                param = {
                    visibleSearch: false,
                    visibleHelp: !!functionInfo,
                    searchText,
                    paramIndex,
                    functionInfo,
                };
            }

            const searchList = this._getSearchList(searchText);
            param = {
                visibleSearch: searchList.length > 0,
                visibleHelp: false,
                searchText,
                paramIndex: 0,
                searchList,
            };
        }

        this._commandService.executeCommand(SearchFunctionOperation.id, {
            visible: param.visibleSearch,
            searchText: param.searchText,
            searchList: param.searchList,
        });
        this._commandService.executeCommand(HelpFunctionOperation.id, {
            visible: param.visibleHelp,
            paramIndex: param.paramIndex,
            functionInfo: param.functionInfo,
        });
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

    /**
     *
     * @param body the body object of the current input box
     * @returns
     */
    private _highlightFormula(body: Nullable<IDocumentBody>) {
        if (body == null || this._getContextState() === false) {
            return;
        }

        const dataStream = body.dataStream;

        const lexerNode = this._formulaEngineService.builderLexerTree(dataStream);

        if (lexerNode == null) {
            body.textRuns = [];
        } else {
            const textRuns: ITextRun[] = [];
            this._buildTextRuns(lexerNode, textRuns);
            body.textRuns = textRuns;
        }

        this._refreshEditorObject();
    }

    /**
     * :
     * #
     *
     * @returns
     */
    private _buildTextRuns(lexerNode: LexerNode, textRuns: ITextRun[] = [], index = 0) {
        const sum = [];
        // function treeWalker(tree, sum) {
        //     if (typeof tree === 'string') {
        //         sum.push(tree);
        //         return;
        //     }
        //     if (!['R_1', 'P_1', 'L_1'].includes(tree.token)) {
        //         sum.push(tree.token);
        //     }
        //     const children = tree.children;
        //     for (child of children) {
        //         treeWalker(child, sum);
        //     }
        // }

        // function staticSum(sum) {
        //     let count = 0;
        //     for (const item of sum) {
        //         console.log(item, item.length);
        //         count += item.length;
        //     }
        //     return count;
        // }

        // function coSum(sum) {
        //     let co = '';
        //     for (const item of sum) {
        //         co += item;
        //     }
        //     return co;
        // }

        // treeWalker(temp1, sum);

        // staticSum(sum);

        // coSum(sum);
        return [];
    }

    private _refreshEditorObject() {
        const editorObject = this._getEditorObject();

        const documentComponent = editorObject?.document;

        documentComponent?.getSkeleton()?.calculate();

        documentComponent?.makeDirty();
    }

    private _refreshFormulaBarEditorObject() {
        const editorObject = this._getEditorObject();

        const documentComponent = editorObject?.document;

        documentComponent?.getSkeleton()?.calculate();

        documentComponent?.makeDirty();
    }

    private _getEditorObject() {
        return getEditorObject(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, this._renderManagerService);
    }

    private _getFormulaBarEditorObject() {
        return getEditorObject(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, this._renderManagerService);
    }
}
