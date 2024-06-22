/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {
    DocumentDataModel,
    ICommandInfo,
    IRange,
    IRangeWithCoord,
    ITextRun,
    Nullable,
    Workbook } from '@univerjs/core';
import {
    AbsoluteRefType,
    Direction,
    Disposable,
    DisposableCollection,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    FOCUSING_EDITOR_INPUT_FORMULA,
    getCellInfoInMergeData,
    ICommandService,
    IContextService,
    isFormulaString,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    RANGE_TYPE,
    Rectangle,
    ThemeService,
    toDisposable,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocSkeletonManagerService,
    MoveCursorOperation,
    ReplaceContentCommand,
    TextSelectionManagerService,
} from '@univerjs/docs';
import type { IAbsoluteRefTypeForRange, ISequenceNode } from '@univerjs/engine-formula';
import {
    compareToken,
    deserializeRangeWithSheet,
    generateStringWithSequence,
    getAbsoluteRefTypeWitString,
    LexerTreeBuilder,
    matchRefDrawToken,
    matchToken,
    normalizeSheetName,
    sequenceNodeType,
    serializeRange,
    serializeRangeToRefString,
} from '@univerjs/engine-formula';
import {
    DeviceInputEventType,
    IRenderManagerService,
    ITextSelectionRenderManager,
} from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import {
    convertSelectionDataToRange,
    getNormalSelectionStyle,
    getPrimaryForRange,
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
    setEndForRange,
} from '@univerjs/sheets';
import type { EditorBridgeService, SelectionShape } from '@univerjs/sheets-ui';
import {
    ExpandSelectionCommand,
    getEditorObject,
    IEditorBridgeService,
    ISelectionRenderService,
    JumpOver,
    MoveSelectionCommand,
    SheetSkeletonManagerService,
} from '@univerjs/sheets-ui';
import { IContextMenuService, IEditorService, KeyCode, MetaKeys, SetEditorResizeOperation } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';

import type { ISelectEditorFormulaOperationParam } from '../commands/operations/editor-formula.operation';
import { SelectEditorFormulaOperation } from '../commands/operations/editor-formula.operation';
import { HelpFunctionOperation } from '../commands/operations/help-function.operation';
import { SearchFunctionOperation } from '../commands/operations/search-function.operation';
import { META_KEY_CTRL_AND_SHIFT } from '../common/prompt';
import { FORMULA_REF_SELECTION_PLUGIN_NAME, getFormulaRefSelectionStyle } from '../common/selection';
import { IDescriptionService } from '../services/description.service';
import { IFormulaPromptService } from '../services/prompt.service';
import { ReferenceAbsoluteOperation } from '../commands/operations/reference-absolute.operation';

interface IRefSelection {
    refIndex: number;
    themeColor: string;
    token: string;
}

enum ArrowMoveAction {
    InitialState,
    moveCursor,
    moveRefReady,
    movingRef,
    exitInput,
}

enum InputPanelState {
    InitialState,
    keyNormal,
    keyArrow,
    mouse,
}

const sheetEditorUnitIds = [DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY];

@OnLifecycle(LifecycleStages.Rendered, PromptController)
export class PromptController extends Disposable {
    private _formulaRefColors: string[] = [];

    private _previousSequenceNodes: Nullable<Array<string | ISequenceNode>>;

    private _previousRangesCount: number = 0;

    private _previousInsertRefStringIndex: Nullable<number>;

    private _currentInsertRefStringIndex: number = -1;

    private _arrowMoveActionState: ArrowMoveAction = ArrowMoveAction.InitialState;

    private _isSelectionMovingRefSelections: IRefSelection[] = [];

    private _stringColor = '';

    private _numberColor = '';

    private _insertSelections: ISelectionWithStyle[] = [];

    private _inputPanelState: InputPanelState = InputPanelState.InitialState;

    private _userCursorMove: boolean = false;

    private _previousEditorUnitId: Nullable<string>;

    private _existsSequenceNode = false;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(IEditorBridgeService) private readonly _editorBridgeService: EditorBridgeService,
        @Inject(IFormulaPromptService) private readonly _formulaPromptService: IFormulaPromptService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ISelectionRenderService) private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(IDescriptionService) private readonly _descriptionService: IDescriptionService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @IEditorService private readonly _editorService: IEditorService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        this._formulaRefColors = [];
        this._resetTemp();
    }

    private _resetTemp() {
        this._previousSequenceNodes = null;

        this._previousInsertRefStringIndex = null;

        this._isSelectionMovingRefSelections = [];

        this._previousRangesCount = 0;

        this._currentInsertRefStringIndex = -1;
    }

    private _initialize(): void {
        this._initialCursorSync();

        this._initAcceptFormula();

        this._initialFormulaTheme();

        this._initialRefSelectionUpdateEvent();

        this._initialRefSelectionInsertEvent();

        this._initialExitEditor();

        this._initialEditorInputChange();

        this._commandExecutedListener();

        this._cursorStateListener();

        this._userMouseListener();

        this._inputFormulaListener();

        this._initialChangeEditor();
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
                this._textSelectionManagerService.textSelection$.subscribe((params) => {
                    if (params?.unitId == null) {
                        return;
                    }

                    const editor = this._editorService.getEditor(params.unitId);

                    if (!editor || editor.onlyInputContent()) {
                        return;
                    }

                    if (
                        (editor.isSheetEditor() && this._editorBridgeService.isVisible().visible === false) ||
                        this._formulaPromptService.isSelectionMoving()
                    ) {
                        return;
                    }

                    this._contextSwitch();

                    this._changeKeepVisibleHideState();

                    this._switchSelectionPlugin();

                    if (this._formulaPromptService.isLockedSelectionChange()) {
                        return;
                    }

                    this._highlightFormula();

                    // if (this._isLockedOnSelectionInsertRefString) {
                    //     return;
                    // }

                    if (editor.onlyInputRange()) {
                        return;
                    }

                    // TODO@Dushusir: use real text info
                    this._changeFunctionPanelState();
                })
            )
        );
    }

    private _initialEditorInputChange() {
        this.disposeWithMe(
            this._textSelectionRenderManager.onInputBefore$.subscribe((param) => {
                this._previousSequenceNodes = null;
                this._previousInsertRefStringIndex = null;

                this._selectionRenderService.enableSkipRemainLast();

                const e = param?.event as KeyboardEvent;

                if (e == null) {
                    return;
                }

                if (
                    ![KeyCode.ARROW_DOWN, KeyCode.ARROW_UP, KeyCode.ARROW_LEFT, KeyCode.ARROW_RIGHT].includes(
                        e.which
                    )
                ) {
                    if (this._arrowMoveActionState !== ArrowMoveAction.moveCursor) {
                        this._arrowMoveActionState = ArrowMoveAction.moveRefReady;
                    }

                    this._inputPanelState = InputPanelState.keyNormal;
                } else {
                    this._inputPanelState = InputPanelState.keyArrow;
                }

                if (e.which !== KeyCode.F4) {
                    this._userCursorMove = false;
                }
            })
        );
    }

    private _initialExitEditor() {
        this.disposeWithMe(
            this._editorBridgeService.afterVisible$.subscribe((visibleParam) => {
                if (visibleParam.visible === true) {
                    return;
                }

                this._closeRangePrompt();
            })
        );
    }

    private _initialChangeEditor() {
        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC).subscribe((documentDataModel) => {
                if (documentDataModel == null) {
                    return;
                }

                const editorId = documentDataModel.getUnitId();

                if (!this._editorService.isEditor(editorId) || this._previousEditorUnitId === editorId) {
                    return;
                }

                if (!this._editorService.isSheetEditor(editorId)) {
                    this._closeRangePrompt(editorId);
                    this._previousEditorUnitId = editorId;
                }
            })
        );

        this.disposeWithMe(
            this._editorService.closeRangePrompt$.subscribe(() => {
                if (!this._editorService.getSpreadsheetFocusState() || !this._formulaPromptService.isLockedSelectionInsert()) {
                    this._closeRangePrompt();
                    this._selectionManagerService.changePlugin(NORMAL_SELECTION_PLUGIN_NAME);
                }
            })
        );
    }

    private _closeRangePrompt(editorId: Nullable<string>) {
        /**
         * Switching the selection of PluginName causes a refresh.
         * Here, a delay is added to prevent the loss of content when pressing enter.
         */
        const current = this._selectionManagerService.getCurrent();

        this._insertSelections = [];

        if (current?.pluginName === NORMAL_SELECTION_PLUGIN_NAME) {
            this._disableForceKeepVisible();
            return;
        }

        this._selectionManagerService.clear();

        if (editorId && this._editorService.isSheetEditor(editorId)) {
            this._selectionManagerService.changePlugin(NORMAL_SELECTION_PLUGIN_NAME);
            this._updateEditorModel('\r\n', []);
        } else {
            this._selectionManagerService.changePluginNoRefresh(NORMAL_SELECTION_PLUGIN_NAME);
        }

        this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);

        this._disableForceKeepVisible();

        this._selectionRenderService.resetStyle();

        this._resetTemp();

        this._hideFunctionPanel();
    }

    private _initialRefSelectionUpdateEvent() {
        const disposableCollection = new DisposableCollection();

        this.disposeWithMe(
            toDisposable(
                this._selectionManagerService.selectionMoveEnd$.subscribe(() => {
                    // Each range change requires re-listening
                    disposableCollection.dispose();

                    const current = this._selectionManagerService.getCurrent();

                    this._formulaPromptService.disableSelectionMoving();

                    if (current?.pluginName !== FORMULA_REF_SELECTION_PLUGIN_NAME) {
                        return;
                    }

                    this._updateRefSelectionStyle(this._isSelectionMovingRefSelections);

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
                                    this._formulaPromptService.disableLockedSelectionChange();
                                })
                            )
                        );

                        disposableCollection.add(
                            toDisposable(
                                controlSelection.selectionScaled$.subscribe(() => {
                                    this._formulaPromptService.disableLockedSelectionChange();
                                })
                            )
                        );
                    });
                })
            )
        );
    }

    private _selectionChanging(selectionWithStyles: ISelectionWithStyle[], isSync: boolean = false) {
        if (selectionWithStyles.length === 0) {
            return;
        }

        /**
         * selectionChangingState
         * If the selection range in the editor is not restricted by being locked,
         * it is considered a user experience optimization.
         */
        if (this._editorService.selectionChangingState() && !this._formulaPromptService.isLockedSelectionInsert()) {
            return;
        }

        this._formulaPromptService.enableSelectionMoving();

        this._inertControlSelection(selectionWithStyles);

        if (isSync === false) {
            return;
        }
        const currentSelection = selectionWithStyles[selectionWithStyles.length - 1];
        this._inertControlSelectionReplace(currentSelection);
    }

    private _initialRefSelectionInsertEvent() {
        this.disposeWithMe(
            toDisposable(
                this._selectionRenderService.selectionMoving$.subscribe((selectionWithCoordAndStyles) => {
                    this._selectionChanging(
                        selectionWithCoordAndStyles.map((selectionDataWithStyle) =>
                            convertSelectionDataToRange(selectionDataWithStyle)
                        )
                    );
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this._selectionRenderService.selectionMoveStart$.subscribe((selectionWithCoordAndStyles) => {
                    this._selectionChanging(
                        selectionWithCoordAndStyles.map((selectionDataWithStyle) =>
                            convertSelectionDataToRange(selectionDataWithStyle)
                        ),
                        true
                    );
                })
            )
        );
    }

    private _initAcceptFormula() {
        this.disposeWithMe(
            toDisposable(
                this._formulaPromptService.acceptFormulaName$.subscribe((formulaString: string) => {
                    const activeRange = this._textSelectionManagerService.getActiveRange();

                    if (activeRange == null) {
                        this._hideFunctionPanel();
                        return;
                    }

                    const { startOffset } = activeRange;

                    const lastSequenceNodes = this._formulaPromptService.getSequenceNodes();

                    const nodeIndex = this._formulaPromptService.getCurrentSequenceNodeIndex(startOffset - 2);

                    const node = lastSequenceNodes[nodeIndex];

                    if (node == null || typeof node === 'string') {
                        this._hideFunctionPanel();
                        return;
                    }

                    const difference = formulaString.length - node.token.length;

                    // node.token = formulaString;

                    // node.endIndex += difference;

                    const newNode = { ...node };

                    newNode.token = formulaString;

                    newNode.endIndex += difference;

                    lastSequenceNodes[nodeIndex] = newNode;

                    const isDefinedName = this._descriptionService.hasDefinedNameDescription(formulaString);

                    const isFormulaDefinedName = this._descriptionService.isFormulaDefinedName(formulaString);

                    const formulaStringCount = formulaString.length + 1;

                    const mustAddBracket = !isDefinedName || isFormulaDefinedName;

                    if (mustAddBracket) {
                        lastSequenceNodes.splice(nodeIndex + 1, 0, matchToken.OPEN_BRACKET);
                    }

                    for (let i = nodeIndex + 2, len = lastSequenceNodes.length; i < len; i++) {
                        const node = lastSequenceNodes[i];
                        if (typeof node === 'string') {
                            continue;
                        }

                        // node.startIndex += formulaStringCount;
                        // node.endIndex += formulaStringCount;

                        const newNode = { ...node };

                        newNode.startIndex += formulaStringCount;
                        newNode.endIndex += formulaStringCount;

                        lastSequenceNodes[i] = newNode;
                    }

                    let selectionIndex = newNode.endIndex + 1;
                    if (mustAddBracket) {
                        selectionIndex += 1;
                    }

                    this._syncToEditor(lastSequenceNodes, selectionIndex);
                })
            )
        );
    }

    private _changeFunctionPanelState() {
        const activeRange = this._textSelectionManagerService.getActiveRange();

        if (activeRange == null) {
            this._hideFunctionPanel();
            return;
        }

        const { startOffset } = activeRange;

        const currentSequenceNode = this._formulaPromptService.getCurrentSequenceNode(startOffset - 2);

        if (currentSequenceNode == null) {
            this._hideFunctionPanel();
            return;
        }

        if (typeof currentSequenceNode !== 'string' && currentSequenceNode.nodeType === sequenceNodeType.FUNCTION && !this._descriptionService.hasDefinedNameDescription(currentSequenceNode.token.trim())) {
            const token = currentSequenceNode.token.toUpperCase();

            if (this._inputPanelState === InputPanelState.keyNormal) {
                // show search function panel
                const searchList = this._descriptionService.getSearchListByNameFirstLetter(token);
                this._hideFunctionPanel();
                if (searchList == null || searchList.length === 0) {
                    return;
                }
                this._commandService.executeCommand(SearchFunctionOperation.id, {
                    visible: true,
                    searchText: token,
                    searchList,
                });
            } else {
                // show help function panel
                this._changeHelpFunctionPanelState(token, -1);
            }

            return;
        }

        // const currentBody = this._getCurrentBody();

        // const dataStream = currentBody?.dataStream || '';

        const config = this._getCurrentBodyDataStreamAndOffset();

        const functionAndParameter = this._lexerTreeBuilder.getFunctionAndParameter(config?.dataStream || '', startOffset - 1 + (config?.offset || 0));

        if (functionAndParameter == null) {
            this._hideFunctionPanel();
            return;
        }

        const { functionName, paramIndex } = functionAndParameter;

        this._changeHelpFunctionPanelState(functionName.toUpperCase(), paramIndex);
    }

    private _changeHelpFunctionPanelState(token: string, paramIndex: number) {
        const functionInfo = this._descriptionService.getFunctionInfo(token);
        this._hideFunctionPanel();
        if (functionInfo == null) {
            return;
        }

        // show help function panel
        this._commandService.executeCommand(HelpFunctionOperation.id, {
            visible: true,
            paramIndex,
            functionInfo,
        });
    }

    private _hideFunctionPanel() {
        this._commandService.executeCommand(SearchFunctionOperation.id, {
            visible: false,
            searchText: '',
        });
        this._commandService.executeCommand(HelpFunctionOperation.id, {
            visible: false,
            paramIndex: -1,
        });
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

        const char = this._getCurrentChar();

        if (char == null) {
            this._disableForceKeepVisible();
            return;
        }

        if (matchRefDrawToken(char)) {
            this._editorBridgeService.enableForceKeepVisible();

            this._contextMenuService.disable();

            this._formulaPromptService.enableLockedSelectionInsert();

            this._selectionRenderService.enableRemainLast();

            if (this._arrowMoveActionState !== ArrowMoveAction.moveCursor) {
                this._arrowMoveActionState = ArrowMoveAction.moveRefReady;
            }
        } else {
            this._disableForceKeepVisible();
        }
    }

    /**
     *
     * @returns Return the character under the current cursor in the editor.
     */
    private _getCurrentChar() {
        const activeRange = this._textSelectionManagerService.getActiveRange();

        if (activeRange == null) {
            return;
        }

        const { startOffset } = activeRange;

        const config = this._getCurrentBodyDataStreamAndOffset();

        if (config == null || startOffset == null) {
            return;
        }

        const dataStream = config.dataStream;

        return dataStream[startOffset - 1 + config.offset];
    }

    /**
     * Disable the ref string generation mode. In the ref string generation mode,
     * users can select a certain area using the mouse and arrow keys, and convert the area into a ref string.
     */
    private _disableForceKeepVisible() {
        this._editorBridgeService.disableForceKeepVisible();

        this._contextMenuService.enable();

        this._formulaPromptService.disableLockedSelectionInsert();

        this._currentInsertRefStringIndex = -1;
        this._selectionRenderService.disableRemainLast();

        if (this._arrowMoveActionState === ArrowMoveAction.moveRefReady) {
            this._arrowMoveActionState = ArrowMoveAction.exitInput;
        }
    }

    // private _getCurrentBody() {
    //     const documentModel = this._univerInstanceService.getCurrentUniverDocInstance();
    //     return documentModel?.snapshot?.body;
    // }

    private _getCurrentBodyDataStreamAndOffset() {
        const documentModel = this._univerInstanceService.getCurrentUniverDocInstance();

        if (!documentModel?.getBody()) {
            return;
        }

        const unitId = documentModel.getUnitId();

        const editor = this._editorService.getEditor(unitId);

        const dataStream = documentModel.getBody()?.dataStream ?? '';

        if (!editor || !editor.onlyInputRange()) {
            return { dataStream, offset: 0 };
        }

        return { dataStream: compareToken.EQUALS + dataStream, offset: 1 };
    }

    private _getFormulaAndCellEditorBody(unitIds: string[]) {
        return unitIds.map((unitId) => {
            const dataModel = this._univerInstanceService.getUniverDocInstance(unitId);

            return dataModel?.getBody();
        });
    }

    private _editorModelUnitIds() {
        const currentDocumentDataModel = this._univerInstanceService.getCurrentUniverDocInstance()!;
        const unitId = currentDocumentDataModel.getUnitId();

        if (this._editorService.isEditor(unitId) && !this._editorService.isSheetEditor(unitId)) {
            return [unitId];
        }

        return sheetEditorUnitIds;
    }

    /**
     * Detect whether the user's input content is a formula. If it is a formula,
     * serialize the current input content into a sequenceNode;
     * otherwise, close the formula panel.
     * @param currentInputValue The text content entered by the user in the editor.
     */
    private _contextSwitch() {
        const config = this._getCurrentBodyDataStreamAndOffset();

        if (config && isFormulaString(config.dataStream)) {
            this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, true);

            const lastSequenceNodes =
                this._lexerTreeBuilder.sequenceNodesBuilder(config.dataStream.replace(/\r/g, '').replace(/\n/g, '')) ||
                [];

            this._formulaPromptService.setSequenceNodes(lastSequenceNodes);

            const activeRange = this._textSelectionManagerService.getActiveRange();

            if (activeRange == null) {
                return;
            }

            const { startOffset } = activeRange;

            this._currentInsertRefStringIndex = startOffset - 1 + config.offset;

            return;
        }

        this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);

        this._formulaPromptService.disableLockedSelectionChange();

        this._formulaPromptService.disableLockedSelectionInsert();

            // this._lastSequenceNodes = [];

        this._formulaPromptService.clearSequenceNodes();

        this._hideFunctionPanel();
    }

    private _getContextState() {
        return this._contextService.getContextValue(FOCUSING_EDITOR_INPUT_FORMULA);
    }

    /**
     * Switch from formula selection state to regular selection state.
     */
    private _switchSelectionPlugin() {
        if (this._getContextState() === true) {
            this._selectionManagerService.changePluginNoRefresh(FORMULA_REF_SELECTION_PLUGIN_NAME);
            // const selections = this._selectionManagerService.getSelections();
            // if (selections == null || selections.length === 0) {
            //     const selectionData = this._selectionManagerService.getLastByPlugin(NORMAL_SELECTION_PLUGIN_NAME);
            //     if (selectionData != null) {
            //         this._selectionManagerService.add([Tools.deepClone(selectionData)]);
            //     }
            // }

            const style = getNormalSelectionStyle(this._themeService);
            style.strokeDash = 8;
            style.hasAutoFill = false;
            style.hasRowHeader = false;
            style.hasColumnHeader = false;
            this._selectionRenderService.setStyle(style);
        } else {
            this._selectionManagerService.changePluginNoRefresh(NORMAL_SELECTION_PLUGIN_NAME);
            this._selectionRenderService.resetStyle();
        }
    }

    /**
     * Highlight cell editor and formula bar editor.
     */
    private _highlightFormula() {
        if (this._getContextState() === false) {
            return;
        }

        // const dataStream = body.dataStream;

        // const sequenceNodes = this._lexerTreeBuilder.buildSequenceNodes(
        //     dataStream.replace(/\r/g, '').replace(/\n/g, '')
        // );

        const sequenceNodes = this._formulaPromptService.getSequenceNodes();

        const unitIds = this._editorModelUnitIds();

        const bodyList = this._getFormulaAndCellEditorBody(unitIds).filter((b) => !!b);

        this._selectionManagerService.clear();

        if (sequenceNodes == null || sequenceNodes.length === 0) {
            this._existsSequenceNode = false;
            bodyList.forEach((body) => (body!.textRuns = []));
        } else {
            // this._lastSequenceNodes = sequenceNodes;
            this._existsSequenceNode = true;
            const { textRuns, refSelections } = this._buildTextRuns(sequenceNodes);
            bodyList.forEach((body) => (body!.textRuns = textRuns));

            this._refreshSelectionForReference(refSelections);
        }

        this._refreshFormulaAndCellEditor(unitIds);
    }

    /**
     * :
     * #
     * Generate styles for formula text, highlighting references, text, numbers, and arrays.
     */
    private _buildTextRuns(sequenceNodes: Array<ISequenceNode | string>) {
        const textRuns: ITextRun[] = [];
        const refSelections: IRefSelection[] = [];
        const themeColorMap = new Map<string, string>();
        let refColorIndex = 0;

        const offset = this._getCurrentBodyDataStreamAndOffset()?.offset || 0;

        for (let i = 0, len = sequenceNodes.length; i < len; i++) {
            const node = sequenceNodes[i];
            if (typeof node === 'string' || this._descriptionService.hasDefinedNameDescription(node.token.trim())) {
                continue;
            }

            const { startIndex, endIndex, nodeType, token } = node;
            let themeColor = '';
            if (nodeType === sequenceNodeType.REFERENCE) {
                if (themeColorMap.has(token)) {
                    themeColor = themeColorMap.get(token)!;
                } else {
                    const colorIndex = refColorIndex % this._formulaRefColors.length;
                    themeColor = this._formulaRefColors[colorIndex];
                    themeColorMap.set(token, themeColor);
                    refColorIndex++;
                }

                refSelections.push({
                    refIndex: i,
                    themeColor,
                    token,
                });
            } else if (nodeType === sequenceNodeType.NUMBER) {
                themeColor = this._numberColor;
            } else if (nodeType === sequenceNodeType.STRING) {
                themeColor = this._stringColor;
            } else if (nodeType === sequenceNodeType.ARRAY) {
                themeColor = this._stringColor;
            }

            if (themeColor && themeColor.length > 0) {
                textRuns.push({
                    st: startIndex + 1 - offset,
                    ed: endIndex + 2 - offset,
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

    private _exceedCurrentRange(range: IRange, rowCount: number, columnCount: number) {
        const { endRow, endColumn } = range;
        if (endRow > rowCount) {
            return true;
        }

        if (endColumn > columnCount) {
            return true;
        }

        return false;
    }

    /**
     * Draw the referenced selection text based on the style and token.
     * @param refSelections
     */
    private _refreshSelectionForReference(refSelections: IRefSelection[]) {
        const { unitId, sheetId } = this._getCurrentUnitIdAndSheetId();

        const selectionWithStyle: ISelectionWithStyle[] = [];

        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);
        const worksheet = workbook?.getSheetBySheetId(sheetId);

        if (worksheet == null) {
            return;
        }

        let lastRange: Nullable<ISelectionWithStyle> = null;

        for (let i = 0, len = refSelections.length; i < len; i++) {
            const refSelection = refSelections[i];
            const { themeColor, token, refIndex } = refSelection;

            const gridRange = deserializeRangeWithSheet(token);

            const { unitId: refUnitId, sheetName, range: rawRange } = gridRange;

            /**
             * pro/issues/436
             * When the range is an entire row or column, NaN values need to be corrected.
             */
            const range = setEndForRange(rawRange, worksheet.getRowCount(), worksheet.getColumnCount());

            if (refUnitId != null && refUnitId.length > 0 && unitId !== refUnitId) {
                continue;
            }

            const refSheetId = this._getSheetIdByName(unitId, sheetName.trim());

            if (sheetName.length !== 0 && refSheetId !== sheetId) {
                continue;
            }

            if (this._exceedCurrentRange(range, worksheet.getRowCount(), worksheet.getColumnCount())) {
                continue;
            }

            const lastRangeCopy = this._getPrimary(range, themeColor, refIndex);
            if (lastRangeCopy) {
                lastRange = lastRangeCopy;
                continue;
            }

            const primary = getPrimaryForRange(range, worksheet);

            if (
                !Rectangle.equals(primary, range) &&
                range.startRow === range.endRow &&
                range.startColumn === range.endColumn
            ) {
                range.startRow = primary.startRow;
                range.endRow = primary.endRow;
                range.startColumn = primary.startColumn;
                range.endColumn = primary.endColumn;
            }

            selectionWithStyle.push({
                range,
                primary,
                style: getFormulaRefSelectionStyle(this._themeService, themeColor, refIndex.toString()),
            });
        }

        if (lastRange) {
            selectionWithStyle.push(lastRange);
        }

        if (selectionWithStyle.length === 0) {
            return;
        }

        this._selectionManagerService.add(selectionWithStyle);
    }

    private _getPrimary(range: IRange, themeColor: string, refIndex: number) {
        const primary = this._insertSelections.find((selection) => {
            const { startRow, startColumn, endRow, endColumn } = selection.range;
            if (
                startRow === range.startRow &&
                startColumn === range.startColumn &&
                endRow === range.endRow &&
                endColumn === range.endColumn
            ) {
                return true;
            }
            if (
                startRow === range.startRow &&
                startColumn === range.startColumn &&
                range.startRow === range.endRow &&
                range.startColumn === range.endColumn
            ) {
                return true;
            }

            return false;
        })?.primary;

        if (primary == null) {
            return;
        }

        const {
            isMerged,
            isMergedMainCell,
            startRow: mergeStartRow,
            endRow: mergeEndRow,
            startColumn: mergeStartColumn,
            endColumn: mergeEndColumn,
        } = primary;

        if (
            (isMerged || isMergedMainCell) &&
            mergeStartRow === range.startRow &&
            mergeStartColumn === range.startColumn &&
            range.startRow === range.endRow &&
            range.startColumn === range.endColumn
        ) {
            range.endRow = mergeEndRow;
            range.endColumn = mergeEndColumn;
        }

        return {
            range,
            primary,
            style: getFormulaRefSelectionStyle(this._themeService, themeColor, refIndex.toString()),
        };
    }

    private _getSheetIdByName(unitId: string, sheetName: string) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);

        return workbook?.getSheetBySheetName(normalizeSheetName(sheetName))?.getSheetId();
    }

    private _getSheetNameById(unitId: string, sheetId: string) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);

        const sheetName = workbook?.getSheetBySheetId(sheetId)?.getName() || '';

        return sheetName;
    }

    private _getCurrentUnitIdAndSheetId() {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        const skeleton = this._renderManagerService.getRenderById(workbook.getUnitId())?.with(SheetSkeletonManagerService)?.getCurrentSkeleton();

        return {
            unitId: workbook.getUnitId(),
            sheetId: worksheet?.getSheetId() || '',
            skeleton,
        };
    }

    private _getOpenForCurrentSheet() {
        const documentDataModel = this._univerInstanceService.getCurrentUniverDocInstance()!;
        const editorUnitId = documentDataModel.getUnitId();
        const editor = this._editorService.getEditor(editorUnitId);
        if (editor == null) {
            return {
                openUnitId: null,
                openSheetId: null,
            };
        }

        return {
            openUnitId: editor.getOpenForSheetUnitId(),
            openSheetId: editor.getOpenForSheetSubUnitId(),
        };
    }

    /**
     * Convert the selection range to a ref string for the formula engine, such as A1:B1
     * @param currentSelection
     */
    private _getRefString(currentSelection: ISelectionWithStyle) {
        const { unitId, sheetId } = this._getCurrentUnitIdAndSheetId();

        let refUnitId = '';
        let refSheetName = '';

        const { openUnitId, openSheetId } = this._getOpenForCurrentSheet();

        if (unitId === openUnitId) {
            refUnitId = '';
        } else {
            refUnitId = unitId;
        }

        if (sheetId === openSheetId) {
            refSheetName = '';
        } else {
            refSheetName = this._getSheetNameById(unitId, sheetId);
        }

        const { range, primary } = currentSelection;

        let { startRow, endRow, startColumn, endColumn } = range;

        const { startAbsoluteRefType, endAbsoluteRefType, rangeType } = range;

        if (primary) {
            const {
                isMerged,
                isMergedMainCell,
                startRow: mergeStartRow,
                endRow: mergeEndRow,
                startColumn: mergeStartColumn,
                endColumn: mergeEndColumn,
            } = primary;

            if (
                (isMerged || isMergedMainCell) &&
                mergeStartRow === startRow &&
                mergeStartColumn === startColumn &&
                mergeEndRow === endRow &&
                mergeEndColumn === endColumn
            ) {
                startRow = mergeStartRow;
                startColumn = mergeStartColumn;
                endRow = mergeStartRow;
                endColumn = mergeStartColumn;
            }
        }

        return serializeRangeToRefString({
            sheetName: refSheetName,
            unitId: refUnitId,
            range: {
                startRow,
                endRow,
                startColumn,
                endColumn,
                rangeType,
                startAbsoluteRefType,
                endAbsoluteRefType,
            },
        });
    }

    /**
     * Restore the sequenceNode generated by the lexer to the text in the editor, and set the cursor position.
     * @param sequenceNodes
     * @param textSelectionOffset
     */
    private _syncToEditor(
        sequenceNodes: Array<string | ISequenceNode>,
        textSelectionOffset: number,
        editorUnitId?: string,
        canUndo: boolean = true
    ) {
        let dataStream = generateStringWithSequence(sequenceNodes);

        const { textRuns, refSelections } = this._buildTextRuns(sequenceNodes);

        this._isSelectionMovingRefSelections = refSelections;

        const activeRange = this._textSelectionManagerService.getActiveRange();

        if (activeRange == null) {
            return;
        }

        const { collapsed, style } = activeRange;

        this._currentInsertRefStringIndex = textSelectionOffset;

        if (editorUnitId == null) {
            editorUnitId = this._univerInstanceService.getCurrentUniverDocInstance()!.getUnitId();
        }

        this._fitEditorSize();

        const editor = this._editorService.getEditor(editorUnitId);

        if (editor?.isSingleChoice()) {
            dataStream = dataStream.split(',')[0];
        }

        let formulaString = dataStream;
        let offset = 1;

        if (!editor || !editor.onlyInputRange()) {
            formulaString = `${compareToken.EQUALS}${dataStream}`;
            offset = 0;
        }

        if (canUndo) {
            this._commandService.executeCommand(ReplaceContentCommand.id, {
                unitId: editorUnitId,
                body: {
                    dataStream: formulaString,
                    textRuns,
                },
                textRanges: [
                    {
                        startOffset: textSelectionOffset + 1 - offset,
                        endOffset: textSelectionOffset + 1 - offset,
                        collapsed,
                        style,
                    },
                ],
                segmentId: null,
            });
        } else {
            this._updateEditorModel(`${formulaString}\r\n`, textRuns);
            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: textSelectionOffset + 1 - offset,
                    endOffset: textSelectionOffset + 1 - offset,
                    style,
                },
            ]);
        }

        /**
         * After selecting the formula, allow the editor to continue entering content.
         */
        setTimeout(() => {
            this._textSelectionRenderManager.focus();
            this._setRemainCapture();
        }, 0);

        this._setRemainCapture();
    }

    private _fitEditorSize() {
        const currentDocumentDataModel = this._univerInstanceService.getCurrentUniverDocInstance();
        const editorUnitId = currentDocumentDataModel!.getUnitId();
        if (this._editorService.isEditor(editorUnitId) && !this._editorService.isSheetEditor(editorUnitId)) {
            return;
        }

        this._commandService.executeCommand(SetEditorResizeOperation.id, {
            unitId: editorUnitId,
        });
    }

    /**
     * Update the editor's model value to facilitate formula updates.
     * @param dataStream
     * @param textRuns
     */
    private _updateEditorModel(dataStream: string, textRuns: ITextRun[]) {
        const documentDataModel = this._univerInstanceService.getCurrentUniverDocInstance();

        const editorUnitId = documentDataModel!.getUnitId();
        if (!this._editorService.isEditor(editorUnitId)) {
            return;
        }

        const docViewModel = this._renderManagerService.getRenderById(editorUnitId)?.with(DocSkeletonManagerService).getViewModel();
        if (docViewModel == null || documentDataModel == null) {
            return;
        }

        const snapshot = documentDataModel?.getSnapshot();

        if (snapshot == null) {
            return;
        }

        const newBody = {
            dataStream,
            textRuns,
        };

        snapshot.body = newBody;

        docViewModel.reset(documentDataModel);
    }

    private _inertControlSelectionReplace(currentSelection: ISelectionWithStyle) {
        if (this._previousSequenceNodes == null) {
            this._previousSequenceNodes = this._formulaPromptService.getSequenceNodes();
        }

        if (this._previousInsertRefStringIndex == null) {
            this._previousInsertRefStringIndex = this._currentInsertRefStringIndex;
        }

        // No new control is added, the current ref string is still modified.
        const insertNodes = Tools.deepClone(this._previousSequenceNodes);
        if (insertNodes == null) {
            return;
        }

        const refString = this._getRefString(currentSelection);

        this._formulaPromptService.setSequenceNodes(insertNodes);

        this._formulaPromptService.insertSequenceRef(this._previousInsertRefStringIndex, refString);

        this._syncToEditor(insertNodes, this._previousInsertRefStringIndex + refString.length);

        const selectionDatas = this._selectionRenderService.getSelectionDataWithStyle();

        this._insertSelections = [];

        selectionDatas.forEach((currentSelection) => {
            const range = convertSelectionDataToRange(currentSelection);
            this._insertSelections.push(range);
        });

        // const currentSelection = selectionDatas[selectionDatas.length - 1];

        // if (currentSelection.primaryWithCoord != null) {
        //     this._lastPrimaryCell = ;
        // }
    }

    /**
     * pro/issues/450
     * In range selection mode, certain measures are implemented to ensure that the selection behavior is processed correctly.
     */
    private _focusIsOnlyRange(selectionCount: number) {
        const currentEditor = this._editorService.getFocusEditor();
        if (!currentEditor) {
            return true;
        }

        if (!currentEditor.onlyInputRange()) {
            return true;
        }

        if (this._existsSequenceNode) {
            return true;
        }

        if (selectionCount > 1 || (this._previousSequenceNodes != null && this._previousSequenceNodes.length > 0)) {
            return true;
        }

        if (this._previousInsertRefStringIndex != null) {
            this._previousInsertRefStringIndex += 1;
        }

        return false;
    }

    /**
     * pro/issues/450
     * In range selection mode, certain measures are implemented to ensure that the selection behavior is processed correctly.
     */
    private _resetSequenceNodes(selectionCount: number) {
        const currentEditor = this._editorService.getFocusEditor();
        if (!currentEditor) {
            return;
        }

        if (!currentEditor.onlyInputRange()) {
            return;
        }

        if (selectionCount > 1) {
            return;
        }

        if (this._existsSequenceNode) {
            this._formulaPromptService.clearSequenceNodes();
            this._previousRangesCount = 0;
            this._existsSequenceNode = false;
        }
    }

    private _inertControlSelection(selectionWithStyles: ISelectionWithStyle[]) {
        const currentSelection = selectionWithStyles[selectionWithStyles.length - 1];

        this._resetSequenceNodes(selectionWithStyles.length);

        if (
            (selectionWithStyles.length === this._previousRangesCount || this._previousRangesCount === 0) &&
            this._previousSequenceNodes != null
        ) {
            this._inertControlSelectionReplace(currentSelection);
        } else {
            // Holding down ctrl causes an addition, requiring the ref string to be increased.
            let insertNodes = this._formulaPromptService.getSequenceNodes();

            if (insertNodes == null) {
                return;
            }

            const char = this._getCurrentChar();

            if (char == null) {
                return;
            }

            this._previousInsertRefStringIndex = this._currentInsertRefStringIndex;

            if (!matchRefDrawToken(char) && this._focusIsOnlyRange(selectionWithStyles.length)) {
                this._formulaPromptService.insertSequenceString(this._currentInsertRefStringIndex, matchToken.COMMA);

                insertNodes = this._formulaPromptService.getSequenceNodes();

                this._previousInsertRefStringIndex += 1;
            }

            this._previousSequenceNodes = Tools.deepClone(insertNodes);

            const refString = this._getRefString(currentSelection);

            this._formulaPromptService.setSequenceNodes(insertNodes);

            this._formulaPromptService.insertSequenceRef(this._previousInsertRefStringIndex, refString);

            // this._lastSequenceNodes = insertNodes;

            this._selectionRenderService.disableSkipRemainLast();
        }

        this._arrowMoveActionState = ArrowMoveAction.moveRefReady;

        this._previousRangesCount = selectionWithStyles.length;
    }

    private _updateRefSelectionStyle(refSelections: IRefSelection[]) {
        const controls = this._selectionRenderService.getCurrentControls();

        const { unitId, sheetId } = this._getCurrentUnitIdAndSheetId();

        for (let i = 0, len = refSelections.length; i < len; i++) {
            const refSelection = refSelections[i];

            const { refIndex, themeColor, token } = refSelection;

            const rangeWithSheet = deserializeRangeWithSheet(token);

            const { unitId: refUnitId, sheetName, range } = rangeWithSheet;

            if (refUnitId != null && refUnitId.length > 0 && unitId !== refUnitId) {
                continue;
            }

            const refSheetId = this._getSheetIdByName(unitId, sheetName.trim());

            if (refSheetId != null && refSheetId !== sheetId) {
                continue;
            }

            const control = controls.find((c) => {
                const { startRow, startColumn, endRow, endColumn, rangeType } = c.getRange();
                if (
                    rangeType === RANGE_TYPE.COLUMN &&
                    startColumn === range.startColumn &&
                    endColumn === range.endColumn
                ) {
                    return true;
                }

                if (rangeType === RANGE_TYPE.ROW && startRow === range.startRow && endRow === range.endRow) {
                    return true;
                }

                if (
                    startRow === range.startRow &&
                    startColumn === range.startColumn &&
                    endRow === range.endRow &&
                    endColumn === range.endColumn
                ) {
                    return true;
                }
                if (
                    startRow === range.startRow &&
                    startColumn === range.startColumn &&
                    range.startRow === range.endRow &&
                    range.startColumn === range.endColumn
                ) {
                    return true;
                }

                return false;
            });

            if (control == null) {
                continue;
            }

            const style = getFormulaRefSelectionStyle(this._themeService, themeColor, refIndex.toString());

            control.updateStyle(style);
        }
    }

    private _changeControlSelection(toRange: Nullable<IRangeWithCoord>, controlSelection: SelectionShape) {
        if (!toRange) {
            return;
        }

        const { skeleton } = this._getCurrentUnitIdAndSheetId();
        this._formulaPromptService.enableLockedSelectionChange();
        const id = controlSelection.selectionStyle?.id;
        if (id == null || !Tools.isStringNumber(id)) {
            return;
        }

        let { startRow, endRow, startColumn, endColumn } = toRange;
        const primary = getCellInfoInMergeData(startRow, startColumn, skeleton?.mergeData);

        if (primary) {
            const { isMerged, isMergedMainCell, startRow: mergeStartRow,
                    endRow: mergeEndRow, startColumn: mergeStartColumn,
                    endColumn: mergeEndColumn,
            } = primary;

            if (
                (isMerged || isMergedMainCell) && mergeStartRow === startRow && mergeStartColumn === startColumn &&
                mergeEndRow === endRow && mergeEndColumn === endColumn
            ) {
                startRow = mergeStartRow;
                startColumn = mergeStartColumn;
                endRow = mergeStartRow;
                endColumn = mergeStartColumn;
            }
        }

        const nodeIndex = Number(id);

        const currentNode = this._formulaPromptService.getCurrentSequenceNodeByIndex(nodeIndex);

        let refType: IAbsoluteRefTypeForRange = { startAbsoluteRefType: AbsoluteRefType.NONE };
        if (typeof currentNode !== 'string') {
            const token = (currentNode as ISequenceNode).token;

            refType = getAbsoluteRefTypeWitString(token) as IAbsoluteRefTypeForRange;

            if (refType.endAbsoluteRefType == null) {
                refType.endAbsoluteRefType = refType.startAbsoluteRefType;
            }
        }

        const refString = this._getRefString({
            range: {
                startRow: Math.min(startRow, endRow),
                endRow: Math.max(startRow, endRow),
                startColumn: Math.min(startColumn, endColumn),
                endColumn: Math.max(startColumn, endColumn),
                ...refType,
            },
            primary,
            style: null,
        });

        this._formulaPromptService.updateSequenceRef(nodeIndex, refString);
        const sequenceNodes = this._formulaPromptService.getSequenceNodes();
        const node = sequenceNodes[nodeIndex];

        if (typeof node === 'string') {
            return;
        }

        this._syncToEditor(sequenceNodes, node.endIndex + 1);

        controlSelection.update(toRange, undefined, undefined, undefined, this._selectionRenderService.attachPrimaryWithCoord(primary));
    }

    private _refreshFormulaAndCellEditor(unitIds: string[]) {
        for (const unitId of unitIds) {
            const editorObject = getEditorObject(unitId, this._renderManagerService);

            const documentComponent = editorObject?.document;

            if (documentComponent == null) {
                continue;
            }

            documentComponent.getSkeleton()?.calculate();

            documentComponent.makeDirty();
        }
    }

    private _setRemainCapture() {
        const { unitId } = this._getCurrentUnitIdAndSheetId();

        const editorObject = getEditorObject(unitId, this._renderManagerService);

        const engine = editorObject?.engine;

        engine?.setRemainCapture();
    }

    private _cursorStateListener() {
        /**
         * The user's operations follow the sequence of opening the editor and then moving the cursor.
         * The logic here predicts the user's first cursor movement behavior based on this rule
         */

        const editorObject = this._getEditorObject();

        if (editorObject == null) {
            return;
        }

        const { mainComponent: documentComponent } = editorObject;
        this.disposeWithMe(
            toDisposable(
                documentComponent?.pointerDown$.subscribeEvent(() => {
                    this._arrowMoveActionState = ArrowMoveAction.moveCursor;

                    this._inputPanelState = InputPanelState.mouse;
                })
            )
        );
    }

    private _pressEnter(params: ISelectEditorFormulaOperationParam) {
        const { keycode, isSingleEditor = false } = params;

        if (this._formulaPromptService.isSearching()) {
            this._formulaPromptService.accept(true);
            return;
        }

        if (isSingleEditor === true) {
            return;
        }

        this._editorBridgeService.changeVisible({
            visible: false,
            eventType: DeviceInputEventType.Keyboard,
            keycode,
        });
        // Don't move the selection here, because changeVisible will update the selection.
    }

    private _pressTab(params: ISelectEditorFormulaOperationParam) {
        const { keycode, isSingleEditor = false } = params;
        if (this._formulaPromptService.isSearching()) {
            this._formulaPromptService.accept(true);
            return;
        }

        if (isSingleEditor === true) {
            return;
        }

        this._editorBridgeService.changeVisible({
            visible: false,
            eventType: DeviceInputEventType.Keyboard,
            keycode,
        });
        // Don't move the selection here, because changeVisible will update the selection.
    }

    private _pressEsc(params: ISelectEditorFormulaOperationParam) {
        const { keycode } = params;
        const focusEditor = this._editorService.getFocusEditor();
        if (!focusEditor || focusEditor?.isSheetEditor() === true) {
            this._editorBridgeService.changeVisible({
                visible: false,
                eventType: DeviceInputEventType.Keyboard,
                keycode,
            });
            this._selectionManagerService.refreshSelection();
        }
    }

    private _pressArrowKey(params: ISelectEditorFormulaOperationParam) {
        const { keycode, metaKey } = params;
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

    private _commandExecutedListener() {
        // Listen to document edits to refresh the size of the editor.
        const updateCommandList = [SelectEditorFormulaOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === ReferenceAbsoluteOperation.id) {
                    this._changeRefString();
                } else if (updateCommandList.includes(command.id)) {
                    const params = command.params as ISelectEditorFormulaOperationParam;
                    const { keycode, isSingleEditor = false } = params;

                    if (keycode === KeyCode.ENTER) {
                        this._pressEnter(params);
                        return;
                    }
                    if (keycode === KeyCode.TAB) {
                        this._pressTab(params);
                        return;
                    }

                    if (keycode === KeyCode.ESC) {
                        this._pressEsc(params);
                        return;
                    }

                    if (this._formulaPromptService.isSearching()) {
                        if (keycode === KeyCode.ARROW_DOWN) {
                            this._formulaPromptService.navigate({ direction: Direction.DOWN });
                            return;
                        }
                        if (keycode === KeyCode.ARROW_UP) {
                            this._formulaPromptService.navigate({ direction: Direction.UP });
                            return;
                        }
                    }

                    if (isSingleEditor === true) {
                        return;
                    }

                    if (this._arrowMoveActionState === ArrowMoveAction.moveCursor) {
                        this._moveInEditor(keycode);
                        return;
                    }
                    if (this._arrowMoveActionState === ArrowMoveAction.exitInput) {
                        this._editorBridgeService.changeVisible({
                            visible: false,
                            eventType: DeviceInputEventType.Keyboard,
                            keycode,
                        });
                        return;
                    }

                    if (this._arrowMoveActionState === ArrowMoveAction.moveRefReady) {
                        this._arrowMoveActionState = ArrowMoveAction.movingRef;
                    }

                    const previousRanges = this._selectionManagerService.getSelectionRanges() || [];

                    if (previousRanges.length === 0) {
                        const selectionData =
                            this._selectionManagerService.getLastByPlugin(NORMAL_SELECTION_PLUGIN_NAME);
                        if (selectionData != null) {
                            const selectionDataNew = Tools.deepClone(selectionData);
                            this._selectionManagerService.add([selectionDataNew]);
                        }
                    }

                    this._pressArrowKey(params);

                    const selectionWithStyles = this._selectionManagerService.getSelections() || [];

                    const currentSelection = selectionWithStyles[selectionWithStyles.length - 1];

                    this._inertControlSelectionReplace(currentSelection);
                }
            })
        );
    }

    private _moveInEditor(keycode: Nullable<KeyCode>) {
        if (keycode == null) {
            return;
        }
        let direction = Direction.LEFT;
        if (keycode === KeyCode.ARROW_DOWN) {
            direction = Direction.DOWN;
        } else if (keycode === KeyCode.ARROW_UP) {
            direction = Direction.UP;
        } else if (keycode === KeyCode.ARROW_RIGHT) {
            direction = Direction.RIGHT;
        }

        this._commandService.executeCommand(MoveCursorOperation.id, {
            direction,
        });
    }

    private _userMouseListener() {
        const editorObject = this._getEditorObject();

        if (editorObject == null) {
            return;
        }

        const { mainComponent: documentComponent } = editorObject;
        this.disposeWithMe(
            toDisposable(
                documentComponent?.pointerDown$.subscribeEvent(() => {
                    this._userCursorMove = true;
                })
            )
        );
    }

    private _inputFormulaListener() {
        this.disposeWithMe(
            toDisposable(
                this._editorService.inputFormula$.subscribe((param) => {
                    const { formulaString, editorUnitId } = param;

                    if (formulaString.substring(0, 1) !== compareToken.EQUALS) {
                        return;
                    }

                    const visibleState = this._editorBridgeService.isVisible();
                    if (visibleState.visible === false) {
                        this._editorBridgeService.changeVisible({
                            visible: true,
                            eventType: DeviceInputEventType.Dblclick,
                        });
                    }

                    const lastSequenceNodes = this._lexerTreeBuilder.sequenceNodesBuilder(formulaString) || [];

                    this._formulaPromptService.setSequenceNodes(lastSequenceNodes);

                    this._syncToEditor(lastSequenceNodes, formulaString.length - 1, editorUnitId);
                })
            )
        );

        this.disposeWithMe(
            this._editorService.singleSelection$.subscribe((state) => {
                if (state === true) {
                    this._selectionRenderService.enableSingleSelection();
                } else {
                    this._selectionRenderService.disableSingleSelection();
                }
            })
        );
    }

    private _changeRefString() {
        const activeRange = this._textSelectionManagerService.getActiveRange();

        if (activeRange == null) {
            return;
        }

        const { startOffset } = activeRange;

        const strIndex = startOffset - 2;

        const nodeIndex = this._formulaPromptService.getCurrentSequenceNodeIndex(strIndex);

        const node = this._formulaPromptService.getCurrentSequenceNodeByIndex(nodeIndex);

        if (node == null || typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
            return;
        }

        const tokenArray = node.token.split('!');

        let token = node.token;

        if (tokenArray.length > 1) {
            token = tokenArray[tokenArray.length - 1];
        }

        let unitIDAndSheetName = '';

        for (let i = 0, len = tokenArray.length; i < len - 1; i++) {
            unitIDAndSheetName += tokenArray[i];
        }

        let finalToken = token;
        if (token.indexOf(matchToken.COLON) > -1) {
            if (!this._userCursorMove) {
                finalToken = this._changeRangeRef(token);
            } else {
                const refStringSplit = token.split(matchToken.COLON);
                const prefix = refStringSplit[0];
                const suffix = refStringSplit[1];
                const relativeIndex = strIndex - node.startIndex;

                if (relativeIndex <= prefix.length) {
                    finalToken = this._changeSingleRef(prefix) + matchToken.COLON + suffix;
                } else {
                    finalToken = prefix + matchToken.COLON + this._changeSingleRef(suffix);
                }
            }
        } else {
            finalToken = this._changeSingleRef(token);
        }

        finalToken = unitIDAndSheetName + finalToken;

        const difference = finalToken.length - node.token.length;

        this._formulaPromptService.updateSequenceRef(nodeIndex, finalToken);

        this._syncToEditor(this._formulaPromptService.getSequenceNodes(), strIndex + difference + 1);
    }

    private _changeRangeRef(token: string) {
        const range = deserializeRangeWithSheet(token).range;
        let resultToken = '';
        if (range.startAbsoluteRefType === AbsoluteRefType.NONE || range.startAbsoluteRefType == null) {
            range.startAbsoluteRefType = AbsoluteRefType.ALL;
            range.endAbsoluteRefType = AbsoluteRefType.ALL;
        } else {
            range.startAbsoluteRefType = AbsoluteRefType.NONE;
            range.endAbsoluteRefType = AbsoluteRefType.NONE;
        }
        resultToken = serializeRange(range);
        return resultToken;
    }

    private _changeSingleRef(token: string) {
        const range = deserializeRangeWithSheet(token).range;
        const type = range.startAbsoluteRefType;
        let resultToken = '';
        if (type === AbsoluteRefType.NONE || type == null) {
            range.startAbsoluteRefType = AbsoluteRefType.ALL;
            range.endAbsoluteRefType = AbsoluteRefType.ALL;
        } else if (type === AbsoluteRefType.ALL) {
            range.startAbsoluteRefType = AbsoluteRefType.ROW;
            range.endAbsoluteRefType = AbsoluteRefType.ROW;
        } else if (type === AbsoluteRefType.ROW) {
            range.startAbsoluteRefType = AbsoluteRefType.COLUMN;
            range.endAbsoluteRefType = AbsoluteRefType.COLUMN;
        } else {
            range.startAbsoluteRefType = AbsoluteRefType.NONE;
            range.endAbsoluteRefType = AbsoluteRefType.NONE;
        }

        resultToken = serializeRange(range);
        return resultToken;
    }

    private _getEditorObject() {
        const editorUnitId = this._univerInstanceService.getCurrentUniverDocInstance()!.getUnitId();
        const editor = this._editorService.getEditor(editorUnitId);
        return editor?.render;
        // return getEditorObject(this._editorBridgeService.getCurrentEditorId(), this._renderManagerService);
    }
}
