import {
    deserializeRangeWithSheet,
    FormulaEngineService,
    IFunctionInfo,
    ISequenceNode,
    isFormulaLexerToken,
    sequenceNodeType,
    serializeRangeToRefString,
} from '@univerjs/base-formula-engine';
import { matchToken } from '@univerjs/base-formula-engine/basics/token.js';
import {
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    IRenderManagerService,
    ITextSelectionRenderManager,
} from '@univerjs/base-render';
import { ISelectionWithStyle, NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '@univerjs/base-sheets';
import { KeyCode, MetaKeys } from '@univerjs/base-ui';
import {
    Direction,
    Disposable,
    DisposableCollection,
    FOCUSING_EDITOR_INPUT_FORMULA,
    ICommandInfo,
    ICommandService,
    IContextService,
    IDocumentBody,
    IRangeWithCoord,
    isFormulaString,
    ITextRun,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    Nullable,
    OnLifecycle,
    ThemeService,
    toDisposable,
    Tools,
} from '@univerjs/core';
import {
    EditorBridgeService,
    ExpandSelectionCommand,
    getEditorObject,
    IEditorBridgeService,
    ISelectionRenderService,
    JumpOver,
    MoveSelectionCommand,
    SelectionShape,
    SetEditorResizeOperation,
    SheetSkeletonManagerService,
} from '@univerjs/ui-plugin-sheets';
import { Inject } from '@wendellhu/redi';

import {
    ISelectEditorFormulaOperationParam,
    SelectEditorFormluaOperation,
} from '../commands/operations/editor-formula.operation';
import { HelpFunctionOperation } from '../commands/operations/help-function.operation';
import { SearchFunctionOperation } from '../commands/operations/search-function.operation';
import { META_KEY_CTRL_AND_SHIFT } from '../common/prompt';
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

    private _lastSequenceNodes: Array<string | ISequenceNode> = [];

    private _isLockedOnSelectionChangeRefString: boolean = false;

    private _previousControl: Nullable<SelectionShape>;

    private _currentInsertRefStringIndex: number = -1;

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

        this._initialRefSelectionUpdateEvent();

        this._initialRefSelectionInsertEvent();

        this._initialExitEditor();

        this._commandExecutedListener();
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
                this._textSelectionManagerService.textSelectionInfo$.subscribe(() => {
                    if (this._editorBridgeService.isVisible().visible === false) {
                        return;
                    }

                    const currentBody = this._getCurrentBody();

                    const dataStream = currentBody?.dataStream || '';

                    this._contextSwitch(dataStream);

                    this._changeKeepVisibleHideState();

                    this._switchSelectionPlugin();

                    if (this._isLockedOnSelectionChangeRefString || this._formulaPromptService.isInsertRefString()) {
                        return;
                    }
                    // TODO@Dushusir: use real text info
                    this._setFunctionPanel(dataStream);

                    this._highlightFormula(currentBody);
                })
            )
        );
    }

    /**
     * If the cursor is located at a formula token,
     * it is necessary to prohibit the behavior of closing the editor by clicking on the canvas,
     * in order to generate reference text for the formula.
     */
    private _changeKeepVisibleHideState() {
        if (this._getContextState() === false) {
            this._disableForceKeepVisible();
            return;
        }

        const activeRange = this._textSelectionManagerService.getLast();

        if (activeRange == null) {
            this._disableForceKeepVisible();
            return;
        }

        const { startOffset } = activeRange;

        const body = this._getCurrentBody();

        if (body == null) {
            this._disableForceKeepVisible();
            return;
        }

        const dataStream = body.dataStream;

        const char = dataStream[startOffset - 1];

        if (
            isFormulaLexerToken(char) &&
            char !== matchToken.CLOSE_BRACES &&
            char !== matchToken.CLOSE_BRACKET &&
            char !== matchToken.SINGLE_QUOTATION &&
            char !== matchToken.DOUBLE_QUOTATION
        ) {
            this._editorBridgeService.enableForceKeepVisible();

            this._formulaPromptService.enableInsertRefString();
            this._currentInsertRefStringIndex = startOffset;

            this._selectionRenderService.enableRemainLast();
        } else {
            this._disableForceKeepVisible();
        }
    }

    private _disableForceKeepVisible() {
        this._editorBridgeService.disableForceKeepVisible();
        this._formulaPromptService.disableInsertRefString();
        this._currentInsertRefStringIndex = -1;
        this._selectionRenderService.disableRemainLast();
    }

    private _initialExitEditor() {
        this.disposeWithMe(
            toDisposable(
                this._editorBridgeService.visible$.subscribe((visibleParam) => {
                    if (visibleParam.visible === true) {
                        return;
                    }

                    /**
                     * Switching the selection of PluginName causes a refresh.
                     * Here, a delay is added to prevent the loss of content when pressing enter.
                     */
                    if (this._getContextState() === true) {
                        setTimeout(() => {
                            this._selectionManagerService.clear();
                            this._selectionManagerService.changePlugin(NORMAL_SELECTION_PLUGIN_NAME);
                        }, 0);
                    }

                    this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);

                    this._changeKeepVisibleHideState();
                })
            )
        );
    }

    private _getCurrentBody() {
        const documentModel = this._currentUniverService.getUniverDocInstance(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        return documentModel?.snapshot?.body;
    }

    private _contextSwitch(currentInputValue: string) {
        if (isFormulaString(currentInputValue)) {
            this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, true);
        } else {
            this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);
            this._isLockedOnSelectionChangeRefString = false;
            this._formulaPromptService.disableInsertRefString();
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
     * Switch from formula selection state to regular selection state.
     */
    private _switchSelectionPlugin() {
        if (this._getContextState() === true) {
            this._selectionManagerService.changePluginNoRefresh(FORMULA_REF_SELECTION_PLUGIN_NAME);
            const selections = this._selectionManagerService.getSelections();
            if (selections == null || selections.length === 0) {
                const selectionData = this._selectionManagerService.getLastByPlugin(NORMAL_SELECTION_PLUGIN_NAME);
                if (selectionData != null) {
                    this._selectionManagerService.addNoRefresh([Tools.deepClone(selectionData)]);
                }
            }
        } else {
            this._selectionManagerService.changePluginNoRefresh(NORMAL_SELECTION_PLUGIN_NAME);
        }
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

        this._selectionManagerService.clear();

        if (sequenceNodes == null || sequenceNodes.length === 0) {
            body.textRuns = [];
        } else {
            this._lastSequenceNodes = sequenceNodes;
            const { textRuns, refSelections } = this._buildTextRuns(sequenceNodes);
            body.textRuns = textRuns;

            this._refreshSelectionForReference(refSelections);
        }

        this._refreshEditorObject();
    }

    /**
     * :
     * #
     * Generate styles for formula text, highlighting references, text, numbers, and arrays.
     * @returns
     */
    private _buildTextRuns(sequenceNodes: Array<ISequenceNode | string>) {
        const textRuns: ITextRun[] = [];
        const refSelections: IRefSelection[] = [];
        let refColorIndex = 0;

        for (let i = 0, len = sequenceNodes.length; i < len; i++) {
            const node = sequenceNodes[i];
            if (typeof node === 'string') {
                continue;
            }

            const { startIndex, endIndex, nodeType, token } = node;
            let themeColor = '';
            if (nodeType === sequenceNodeType.REFERENCE) {
                const colorIndex = refColorIndex % this._formulaRefColors.length;
                themeColor = this._formulaRefColors[colorIndex];

                refSelections.push({
                    refIndex: i,
                    themeColor,
                    token,
                });

                refColorIndex++;
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

        // console.log('sequenceNodes', sequenceNodes, textRuns);

        return { textRuns, refSelections };
    }

    /**
     * Draw the referenced selection text based on the style and token.
     * @param refSelections
     * @returns
     */
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
                style: getFormulaRefSelectionStyle(this._themeService, themeColor, refIndex.toString()),
            });
        }

        if (selectionWithStyle.length === 0) {
            return;
        }

        this._selectionManagerService.add(selectionWithStyle);
    }

    private _getSheetIdByName(unitId: string, sheetName: string) {
        const workbook = this._currentUniverService.getUniverSheetInstance(unitId);

        return workbook?.getSheetBySheetName(sheetName)?.getSheetId();
    }

    /**
     * Synchronize the reference text based on the changes of the selection.
     * @param refIndex
     * @param rangeWithCoord
     * @returns
     */
    private _updateSequenceRef(refIndex: number, rangeWithCoord: Nullable<IRangeWithCoord>) {
        if (rangeWithCoord == null) {
            return;
        }
        const { startRow, endRow, startColumn, endColumn } = rangeWithCoord;
        const refString = serializeRangeToRefString({
            sheetName: '',
            unitId: '',
            range: {
                startRow,
                endRow,
                startColumn,
                endColumn,
            },
        });

        const node = this._lastSequenceNodes[refIndex];

        if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
            return;
        }

        const difference = refString.length - node.token.length;

        node.token = refString;

        node.endIndex += difference;

        for (let i = refIndex + 1, len = this._lastSequenceNodes.length; i < len; i++) {
            const node = this._lastSequenceNodes[i];
            if (typeof node === 'string') {
                continue;
            }

            node.startIndex += difference;
            node.endIndex += difference;
        }

        const dataStream = this._generateStringWithSequence(this._lastSequenceNodes);

        const { textRuns } = this._buildTextRuns(this._lastSequenceNodes);

        this._updateEditorModel(`=${dataStream}\r\n`, textRuns);

        const activeRange = this._textSelectionManagerService.getLast();

        if (activeRange == null) {
            return;
        }

        const { collapsed, style } = activeRange;

        this._textSelectionManagerService.replace([
            {
                startOffset: node.endIndex + 2,
                endOffset: node.endIndex + 2,
                collapsed,
                style,
            },
        ]);

        this._commandService.executeCommand(SetEditorResizeOperation.id, {
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        });
    }

    /**
     * When the cursor is on the right side of a formula token, you can add reference text to the formula by drawing a selection.
     * @param index
     * @param range
     */
    private _insertSequenceRef(index: number, range: Nullable<IRangeWithCoord>) {}

    /**
     * Deserialize Sequence to text.
     * @param newSequenceNodes
     * @returns
     */
    private _generateStringWithSequence(newSequenceNodes: Array<string | ISequenceNode>) {
        let sequenceString = '';
        for (const node of newSequenceNodes) {
            if (typeof node === 'string') {
                sequenceString += node;
            } else {
                sequenceString += node.token;
            }
        }
        return sequenceString;
    }

    /**
     * Update the editor's model value to facilitate formula updates.
     * @param dataStream
     * @param textRuns
     * @returns
     */
    private _updateEditorModel(dataStream: string, textRuns: ITextRun[]) {
        const documentModel = this._currentUniverService.getUniverDocInstance(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        const bodyModel = documentModel?.getBodyModel();
        if (bodyModel == null) {
            return;
        }

        const snapshot = documentModel?.snapshot;

        if (snapshot == null) {
            return;
        }

        const newBody = {
            dataStream,
            textRuns,
        };

        bodyModel.reset(newBody);

        snapshot.body = newBody;
    }

    private _initialRefSelectionInsertEvent() {
        this.disposeWithMe(
            toDisposable(
                this._selectionRenderService.selectionMoving$.subscribe((control) => {
                    if (!this._formulaPromptService.isInsertRefString()) {
                        return;
                    }

                    if (control === this._previousControl) {
                        // No new control is added, the current ref string is still modified.
                    } else {
                        // Holding down ctrl causes an addition, requiring the ref string to be increased.

                        this._previousControl = control;
                    }

                    // const style = getFormulaRefSelectionStyle(this._themeService, themeColor, refIndex.toString());
                    // control.updateStyle(style);
                })
            )
        );
    }

    private _initialRefSelectionUpdateEvent() {
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
                        controlSelection.disableHelperSelection();

                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionMoving$.subscribe((toRange) => {
                                    this._changeControlSelection(toRange, controlSelection);
                                })
                            )
                        );

                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionScaling$.subscribe((toRange) => {
                                    this._changeControlSelection(toRange, controlSelection);
                                })
                            )
                        );

                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionMoved$.subscribe(() => {
                                    this._isLockedOnSelectionChangeRefString = false;
                                })
                            )
                        );

                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionScaled$.subscribe(() => {
                                    this._isLockedOnSelectionChangeRefString = false;
                                })
                            )
                        );
                    });
                })
            )
        );
    }

    private _changeControlSelection(toRange: Nullable<IRangeWithCoord>, controlSelection: SelectionShape) {
        if (!toRange) {
            return;
        }

        this._isLockedOnSelectionChangeRefString = true;

        const id = controlSelection.selectionStyle?.id;

        if (id == null || !Tools.isStringNumber(id)) {
            return;
        }

        this._updateSequenceRef(Number(id), toRange);

        controlSelection.update(toRange);
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

    private _commandExecutedListener() {
        // Listen to document edits to refresh the size of the editor.
        const updateCommandList = [SelectEditorFormluaOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as ISelectEditorFormulaOperationParam;
                    const { keycode, metaKey } = params;

                    if (keycode === KeyCode.ENTER) {
                        console.log('ENTER');
                        return;
                    }
                    if (keycode === KeyCode.TAB) {
                        console.log('TAB');
                        return;
                    }

                    let direction = Direction.DOWN;
                    if (keycode === KeyCode.ARROW_DOWN) {
                        direction = Direction.DOWN;
                    } else if (keycode === KeyCode.ARROW_UP) {
                        direction = Direction.UP;
                    } else if (keycode === KeyCode.ARROW_LEFT) {
                        direction = Direction.LEFT;
                    } else if (keycode === KeyCode.ARROW_RIGHT) {
                        direction = Direction.RIGHT;
                    }

                    if (metaKey === MetaKeys.CTRL_COMMAND) {
                        this._commandService.executeCommand(MoveSelectionCommand.id, {
                            direction,
                            jumpOver: JumpOver.moveGap,
                        });
                    } else if (metaKey === MetaKeys.SHIFT) {
                        this._commandService.executeCommand(ExpandSelectionCommand.id, {
                            direction,
                        });
                    } else if (metaKey === META_KEY_CTRL_AND_SHIFT) {
                        this._commandService.executeCommand(ExpandSelectionCommand.id, {
                            direction,
                            jumpOver: JumpOver.moveGap,
                        });
                    } else {
                        this._commandService.executeCommand(MoveSelectionCommand.id, {
                            direction,
                        });
                    }
                }
            })
        );
    }

    private _getEditorObject() {
        return getEditorObject(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, this._renderManagerService);
    }

    private _getFormulaBarEditorObject() {
        return getEditorObject(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, this._renderManagerService);
    }
}
