import { FormulaEngineService, IFunctionInfo, ISequenceNode, sequenceNodeType } from '@univerjs/base-formula-engine';
import {
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    IRenderManagerService,
    ITextSelectionRenderManager,
} from '@univerjs/base-render';
import { ISelectionWithStyle, NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '@univerjs/base-sheets';
import {
    deserializeRangeWithSheet,
    Disposable,
    DisposableCollection,
    FOCUSING_EDITOR_INPUT_FORMULA,
    ICommandService,
    IContextService,
    IDocumentBody,
    isFormulaString,
    ITextRun,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    Nullable,
    OnLifecycle,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import {
    EditorBridgeService,
    getEditorObject,
    IEditorBridgeService,
    ISelectionRenderService,
    SheetSkeletonManagerService,
} from '@univerjs/ui-plugin-sheets';
import { Inject } from '@wendellhu/redi';

import { HelpFunctionOperation } from '../commands/operations/help-function.operation';
import { SearchFunctionOperation } from '../commands/operations/search-function.operation';
import { FORMULA_REF_SELECTION_PLUGIN_NAME, getFormulaRefSelectionStyle } from '../common/selection';
import { IDescriptionService, ISearchItem } from '../services/description.service';
import { IFormulaPromptService } from '../services/prompt.service';

interface IFunctionPanelParam {
    visibleSearch: boolean;
    visibleHelp: boolean;
    searchText: string;
    paramIndex: number;
    functionInfo?: IFunctionInfo;
    searchList?: ISearchItem[];
}

interface IRefSelection {
    refIndex: number;
    themeColor: string;
    token: string;
}

@OnLifecycle(LifecycleStages.Starting, PromptController)
export class PromptController extends Disposable {
    private _formulaRefColors: string[] = [];

    private _currentRefIndex: number = -1;

    private _stringColor = '';

    private _numberColor = '';

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IContextService private readonly _contextService: IContextService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(IEditorBridgeService) private readonly _editorBridgeService: EditorBridgeService,
        @Inject(IFormulaPromptService) private readonly _formulaPromptService: IFormulaPromptService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(ISelectionRenderService) private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(IDescriptionService) private readonly _descriptionService: IDescriptionService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        this._formulaRefColors = [];
    }

    private _initialize(): void {
        this._initialCursorSync();
        this._initAcceptFormula();

        this._initialFormulaTheme();

        this._initialRefSelectionEvent();

        this._initialExitEditor();
    }

    private _initialFormulaTheme() {
        const style = this._themeService.getCurrentTheme();

        this._formulaRefColors = [
            style.loopColor1,
            style.loopColor2,
            style.loopColor3,
            style.loopColor4,
            style.loopColor5,
            style.loopColor6,
            style.loopColor7,
            style.loopColor8,
            style.loopColor9,
            style.loopColor10,
            style.loopColor11,
            style.loopColor12,
        ];

        this._numberColor = style.hyacinth700;

        this._stringColor = style.verdancy800;
    }

    private _initialCursorSync() {
        this.disposeWithMe(
            toDisposable(
                this._textSelectionRenderManager.textSelection$.subscribe(() => {
                    if (this._editorBridgeService.isVisible().visible === false) {
                        return;
                    }

                    const currentBody = this._getCurrentBody();

                    const dataStream = currentBody?.dataStream || '';

                    this._contextSwitch(dataStream);

                    // TODO@Dushusir: use real text info
                    this._setFunctionPanel(dataStream);

                    this._highlightFormula(currentBody);
                })
            )
        );
    }

    private _initialExitEditor() {
        this.disposeWithMe(
            toDisposable(
                this._editorBridgeService.visible$.subscribe((visibleParam) => {
                    if (visibleParam.visible === true) {
                        return;
                    }

                    this._switchSelectionPlugin(NORMAL_SELECTION_PLUGIN_NAME);
                })
            )
        );
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
            const matchList = ['SUM', 'AVERAGE'];

            // help function
            if (matchList.includes(searchText)) {
                const paramIndex = Math.random() > 0.5 ? 0 : 1;

                const functionInfo = this._descriptionService.getFunctionInfo(searchText);
                param = {
                    visibleSearch: false,
                    visibleHelp: !!functionInfo,
                    searchText,
                    paramIndex,
                    functionInfo,
                };
            } else {
                const searchList = this._descriptionService.getSearchListByName(searchText);
                param = {
                    visibleSearch: searchList.length > 0,
                    visibleHelp: false,
                    searchText,
                    paramIndex: 0,
                    searchList,
                };
            }
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

        const sequenceNodes = this._formulaEngineService.buildSequenceNodes(
            dataStream.replace(/\r/g, '').replace(/\n/g, '')
        );

        this._switchSelectionPlugin(FORMULA_REF_SELECTION_PLUGIN_NAME);

        this._selectionManagerService.clear();

        if (sequenceNodes == null || sequenceNodes.length === 0) {
            body.textRuns = [];
        } else {
            const textRuns: ITextRun[] = this._buildTextRuns(sequenceNodes);
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
    private _buildTextRuns(sequenceNodes: Array<ISequenceNode | string>) {
        const textRuns: ITextRun[] = [];
        const refSelections: IRefSelection[] = [];
        let refIndex = 0;

        for (const node of sequenceNodes) {
            if (typeof node === 'string') {
                continue;
            }

            const { startIndex, endIndex, nodeType, token } = node;
            let themeColor = '';
            if (nodeType === sequenceNodeType.REFERENCE) {
                const colorIndex = refIndex % this._formulaRefColors.length;
                themeColor = this._formulaRefColors[colorIndex];

                refSelections.push({
                    refIndex,
                    themeColor,
                    token,
                });

                refIndex++;
            } else if (nodeType === sequenceNodeType.NUMBER) {
                themeColor = this._numberColor;
            } else if (nodeType === sequenceNodeType.STRING) {
                themeColor = this._stringColor;
            } else if (nodeType === sequenceNodeType.ARRAY) {
                themeColor = this._stringColor;
            }

            if (themeColor.length > 0) {
                textRuns.push({
                    st: startIndex + 1,
                    ed: endIndex + 2,
                    ts: {
                        cl: {
                            rgb: themeColor,
                        },
                    },
                });
            }
        }

        this._refreshSelectionForReference(refSelections);

        console.log('sequenceNodes', sequenceNodes, textRuns);

        return textRuns;
    }

    private _refreshSelectionForReference(refSelections: IRefSelection[]) {
        const current = this._sheetSkeletonManagerService.getCurrent();

        if (current == null) {
            return;
        }

        const { unitId, sheetId } = current;

        const selectionWithStyle: ISelectionWithStyle[] = [];

        for (const refSelection of refSelections) {
            const { themeColor, token } = refSelection;

            const gridRange = deserializeRangeWithSheet(token);

            const { unitId: refUnitId, sheetName, range } = gridRange;

            if (refUnitId != null && refUnitId.length > 0 && unitId !== refUnitId) {
                continue;
            }

            const refSheetId = this._getSheetIdByName(unitId, sheetName.trim());

            if (refSheetId != null && refSheetId !== sheetId) {
                continue;
            }

            selectionWithStyle.push({
                range,
                primary: null,
                style: getFormulaRefSelectionStyle(this._themeService, themeColor),
            });
        }

        if (selectionWithStyle.length === 0) {
            return;
        }

        this._selectionManagerService.add(selectionWithStyle);
    }

    private _switchSelectionPlugin(pluginName: string) {
        const current = this._sheetSkeletonManagerService.getCurrent();

        if (current == null) {
            return;
        }

        const { unitId, sheetId } = current;

        this._selectionManagerService.setCurrentSelectionNotRefresh({
            pluginName,
            unitId,
            sheetId,
        });
    }

    private _getSheetIdByName(unitId: string, sheetName: string) {
        const workbook = this._currentUniverService.getUniverSheetInstance(unitId);

        return workbook?.getSheetBySheetName(sheetName)?.getSheetId();
    }

    private _initialRefSelectionEvent() {
        const disposableCollection = new DisposableCollection();

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionInfo$.subscribe(() => {
                    // Each range change requires re-listening
                    disposableCollection.dispose();

                    const current = this._selectionManagerService.getCurrent();

                    if (current?.pluginName !== FORMULA_REF_SELECTION_PLUGIN_NAME) {
                        return;
                    }

                    const selectionControls = this._selectionRenderService.getCurrentControls();
                    selectionControls.forEach((controlSelection) => {
                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionMoving$.subscribe((toRange) => {
                                    if (!toRange) {
                                        return;
                                    }

                                    console.log('formulaRefSelections', toRange);
                                })
                            )
                        );

                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionScaling$.subscribe((toRange) => {
                                    if (!toRange) {
                                        return;
                                    }

                                    console.log('formulaRefSelections', toRange);
                                })
                            )
                        );
                    });
                })
            )
        );
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
