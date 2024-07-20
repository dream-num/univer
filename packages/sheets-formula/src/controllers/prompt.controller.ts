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

// FIXME: why so many calling to close the editor here?

import type {
    DocumentDataModel,
    ICommandInfo,
    IDisposable,
    IRange,
    IRangeWithCoord,
    ITextRun,
    Nullable,
    Workbook,
} from '@univerjs/core';
import {
    AbsoluteRefType,
    Direction,
    Disposable,
    DisposableCollection,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    FOCUSING_EDITOR_INPUT_FORMULA,
    FORMULA_EDITOR_ACTIVATED,
    getCellInfoInMergeData,
    ICommandService,
    IContextService,
    Inject,
    isFormulaString,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    RANGE_TYPE,
    Rectangle,
    ThemeService,
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
import type {
    ISelectionWithStyle,
} from '@univerjs/sheets';
import {
    convertSelectionDataToRange,

    DISABLE_NORMAL_SELECTIONS,
    getPrimaryForRange,
    IRefSelectionsService,
    setEndForRange,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import type { EditorBridgeService, SelectionShape } from '@univerjs/sheets-ui';
import {
    ExpandSelectionCommand,
    getEditorObject,
    IEditorBridgeService,
    JumpOver,
    MoveSelectionCommand,
    SheetSkeletonManagerService,
} from '@univerjs/sheets-ui';
import { IContextMenuService, IEditorService, KeyCode, MetaKeys, SetEditorResizeOperation, UNI_DISABLE_CHANGING_FOCUS_KEY } from '@univerjs/ui';

import type { ISelectEditorFormulaOperationParam } from '../commands/operations/editor-formula.operation';
import { SelectEditorFormulaOperation } from '../commands/operations/editor-formula.operation';
import { HelpFunctionOperation } from '../commands/operations/help-function.operation';
import { SearchFunctionOperation } from '../commands/operations/search-function.operation';
import { META_KEY_CTRL_AND_SHIFT } from '../common/prompt';
import { getFormulaRefSelectionStyle } from '../common/selection';
import { IDescriptionService } from '../services/description.service';
import { IFormulaPromptService } from '../services/prompt.service';
import { ReferenceAbsoluteOperation } from '../commands/operations/reference-absolute.operation';
import { RefSelectionsRenderService } from '../services/render-services/ref-selections.render-service';

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

@OnLifecycle(LifecycleStages.Steady, PromptController)
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

    // TODO@wzhudev: selection render service would be a render unit, we we cannot
    // easily access it here.
    private get _selectionRenderService(): RefSelectionsRenderService {
        return this._renderManagerService.getRenderById(
            this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SHEET)!.getUnitId()
        )!.with(RefSelectionsRenderService);
    }

    /**
     * If there are multiple sheet instances, we should enable or disable all of them.
     */
    private get _allSelectionRenderServices(): RefSelectionsRenderService[] {
        return this._renderManagerService.getAllRenderersOfType(UniverInstanceType.UNIVER_SHEET)
            .map((renderer) => renderer.with(RefSelectionsRenderService));
    }

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(IEditorBridgeService) private readonly _editorBridgeService: EditorBridgeService,
        @Inject(IFormulaPromptService) private readonly _formulaPromptService: IFormulaPromptService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(SheetsSelectionsService) private readonly _sheetsSelectionsService: SheetsSelectionsService,
        @IRefSelectionsService private readonly _refSelectionsService: SheetsSelectionsService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
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

        this._initSelectionsEndListener();

        this._initialExitEditor();

        this._initialEditorInputChange();

        this._commandExecutedListener();

        this._cursorStateListener();

        this._userMouseListener();

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
            this._textSelectionManagerService.textSelection$.subscribe((params) => {
                if (params?.unitId == null) {
                    return;
                }

                const editor = this._editorService.getEditor(params.unitId);
                if (!editor
                    || editor.onlyInputContent()
                    || (editor.isSheetEditor() && !this._isFormulaEditorActivated())
                ) {
                    return;
                }

                const onlyInputRange = editor.onlyInputRange();

                // @ts-ignore
                if (params?.options?.fromSelection) {
                    return;
                } else {
                    this._quitSelectingMode();
                }

                this._contextSwitch();
                this._checkShouldEnterSelectingMode(onlyInputRange);

                if (this._formulaPromptService.isLockedSelectionChange()) {
                    return;
                }

                this._highlightFormula();

                if (onlyInputRange) {
                    return;
                }

                // TODO@Dushusir: use real text info
                this._changeFunctionPanelState();
            })
        );
    }

    private _initialEditorInputChange() {
        const arrows = [KeyCode.ARROW_DOWN, KeyCode.ARROW_UP, KeyCode.ARROW_LEFT, KeyCode.ARROW_RIGHT, KeyCode.CTRL, KeyCode.SHIFT];

        this.disposeWithMe(
            this._textSelectionRenderManager.onInputBefore$.subscribe((param) => {
                this._previousSequenceNodes = null;
                this._previousInsertRefStringIndex = null;

                this._selectionRenderService.setSkipLastEnabled(true);

                const event = param?.event as KeyboardEvent;
                if (!event) return;

                if (!arrows.includes(event.which)) {
                    if (this._arrowMoveActionState !== ArrowMoveAction.moveCursor) {
                        this._arrowMoveActionState = ArrowMoveAction.moveRefReady;
                    }

                    this._inputPanelState = InputPanelState.keyNormal;
                } else {
                    this._inputPanelState = InputPanelState.keyArrow;
                }

                if (event.which !== KeyCode.F4) {
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
                }
            })
        );
    }

    private _closeRangePrompt(editorId: Nullable<string>) {
        this._insertSelections = [];
        this._refSelectionsService.clear();

        if (editorId && this._editorService.isSheetEditor(editorId)) {
            this._updateEditorModel('\r\n', []);
        }

        this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);
        this._contextService.setContextValue(DISABLE_NORMAL_SELECTIONS, false);
        this._contextService.setContextValue(UNI_DISABLE_CHANGING_FOCUS_KEY, false);

        this._quitSelectingMode();

        this._resetTemp();

        this._hideFunctionPanel();
    }

    private _initSelectionsEndListener() {
        const d = new DisposableCollection();

        this.disposeWithMe(this._refSelectionsService.selectionMoveEnd$.subscribe((selections) => {
            d.dispose();

            if (selections.length === 0) return;

            // Update rendering in each selection render service.
            this._allSelectionRenderServices.forEach((r) => this._updateRefSelectionStyle(r, this._isSelectionMovingRefSelections));

            const selectionControls = this._allSelectionRenderServices.map((s) => s.getSelectionControls()).flat();
            selectionControls.forEach((c) => {
                c.disableHelperSelection();
                d.add(c.selectionMoving$.subscribe((toRange) => this._onSelectionControlChange(toRange, c)));
                d.add(c.selectionScaling$.subscribe((toRange) => this._onSelectionControlChange(toRange, c)));
                d.add(c.selectionMoved$.subscribe(() => this._formulaPromptService.disableLockedSelectionChange()));
                d.add(c.selectionScaled$.subscribe(() => this._formulaPromptService.disableLockedSelectionChange()));
            });
        }));
    }

    // #region - Selecting Mode: user can use cursor to select a range on the canvas and move the selection
    // with keyboard shortcuts

    private _updateSelecting(selectionsWithStyles: ISelectionWithStyle[], performInsertion: boolean = false) {
        if (selectionsWithStyles.length === 0) return;
        if (this._editorService.selectionChangingState() && !this._formulaPromptService.isLockedSelectionInsert()) return;

        this._insertControlSelections(selectionsWithStyles);

        if (performInsertion) {
            const currentSelection = selectionsWithStyles[selectionsWithStyles.length - 1];
            this._insertControlSelectionReplace(currentSelection);
        }
    }

    private _currentlyWorkingRefRenderer: Nullable<RefSelectionsRenderService> = null;
    private _selectionsChangeDisposables: Nullable<IDisposable>;
    private _enableRefSelectionsRenderService() {
        const d = this._selectionsChangeDisposables = new DisposableCollection();
        this._allSelectionRenderServices.forEach((renderer) => {
            d.add(renderer.enableSelectionChanging());

            // When the current selections change, the ref string is updated without touch `IRefSelectionsService`.
            d.add(renderer.selectionMoving$.subscribe((selections) => {
                this._updateSelecting(selections.map((s) => convertSelectionDataToRange(s)));
            }));

            // When the selection change begins, if other render service has last selection,
            // it should be removed.
            d.add(renderer.selectionMoveStart$.subscribe((selections) => {
                const performInsertion = this._checkClearingLastSelection(renderer);
                this._currentlyWorkingRefRenderer = renderer;
                this._updateSelecting(selections.map((s) => convertSelectionDataToRange(s)), performInsertion);
            }));
        });
    }

    private _checkClearingLastSelection(renderer: RefSelectionsRenderService): boolean {
        if (this._currentlyWorkingRefRenderer && this._currentlyWorkingRefRenderer !== renderer) {
            this._currentlyWorkingRefRenderer.clearLastSelection();
            return false;
        }

        return true;
    }

    private _disposeSelectionsChangeListeners(): void {
        this._selectionsChangeDisposables?.dispose();
        this._selectionsChangeDisposables = null;
    }

    private _insertControlSelections(selections: ISelectionWithStyle[]) {
        const currentSelection = selections[selections.length - 1];

        this._resetSequenceNodes(selections.length);

        if (
            (selections.length === this._previousRangesCount || this._previousRangesCount === 0) &&
            this._previousSequenceNodes != null
        ) {
            this._insertControlSelectionReplace(currentSelection);
        } else {
            // Holding down ctrl causes an addition, requiring the ref string to be increased.
            let insertNodes = this._formulaPromptService.getSequenceNodes()!;
            const char = this._getCurrentChar()!;

            // To reset the cursor position when resetting the editor's content.
            if (insertNodes.length === 0 && this._currentInsertRefStringIndex > 0) {
                this._currentInsertRefStringIndex = -1;
            }

            this._previousInsertRefStringIndex = this._currentInsertRefStringIndex;

            if (!matchRefDrawToken(char) && this._focusIsOnlyRange(selections.length)) {
                this._formulaPromptService.insertSequenceString(this._currentInsertRefStringIndex, matchToken.COMMA);
                insertNodes = this._formulaPromptService.getSequenceNodes();
                this._previousInsertRefStringIndex += 1;
            }

            this._previousSequenceNodes = Tools.deepClone(insertNodes);
            this._formulaPromptService.setSequenceNodes(insertNodes);

            const refString = this._generateRefString(currentSelection);
            this._formulaPromptService.insertSequenceRef(this._previousInsertRefStringIndex, refString);

            this._selectionRenderService.setSkipLastEnabled(false);
        }

        this._arrowMoveActionState = ArrowMoveAction.moveRefReady;
        this._previousRangesCount = selections.length;
    }

    // #endregion

    private _initAcceptFormula() {
        this.disposeWithMe(
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

                    const newNode = { ...node };

                    newNode.startIndex += formulaStringCount;
                    newNode.endIndex += formulaStringCount;

                    lastSequenceNodes[i] = newNode;
                }

                let selectionIndex = newNode.endIndex + 1;
                if (mustAddBracket) {
                    selectionIndex += 1;
                }

                this._syncToEditor(lastSequenceNodes, selectionIndex, undefined, true, false);
            })
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

        const config = this._getCurrentBodyDataStreamAndOffset();

        const functionAndParameter = this._lexerTreeBuilder.getFunctionAndParameter(config?.dataStream || '', startOffset - 1 + (config?.offset || 0));

        if (!functionAndParameter) {
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

    private _checkShouldEnterSelectingMode(isOnlyInputRangeEditor = false): void {
        if (isOnlyInputRangeEditor) {
            this._enterSelectingMode();
            return;
        }

        const char = this._getCurrentChar();
        const dataStream = this._getCurrentDataStream();
        if (dataStream?.substring(0, 1) === '=' && char && matchRefDrawToken(char)) {
            this._enterSelectingMode();
        } else {
            this._quitSelectingMode();
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

    private _getCurrentDataStream() {
        const config = this._getCurrentBodyDataStreamAndOffset();
        return config?.dataStream;
    }

    private _isSelectingMode = false;
    private _enterSelectingMode() {
        if (this._isSelectingMode) {
            return;
        }

        this._editorBridgeService.enableForceKeepVisible();
        this._contextMenuService.disable();
        this._formulaPromptService.enableLockedSelectionInsert();
        this._selectionRenderService.setRemainLastEnabled(true);

        // Maybe `enterSelectingMode` should be merged with `_enableRefSelectionsRenderService`.
        this._enableRefSelectionsRenderService();
        this._currentlyWorkingRefRenderer = null;

        // TODO: remain last
        if (this._arrowMoveActionState !== ArrowMoveAction.moveCursor) {
            this._arrowMoveActionState = ArrowMoveAction.moveRefReady;
        }

        this._isSelectingMode = true;
    }

    /**
     * Disable the ref string generation mode. In the ref string generation mode,
     * users can select a certain area using the mouse and arrow keys, and convert the area into a ref string.
     */
    private _quitSelectingMode() {
        if (!this._isSelectingMode) {
            return;
        }

        this._editorBridgeService.disableForceKeepVisible();
        this._contextMenuService.enable();
        this._formulaPromptService.disableLockedSelectionInsert();
        this._currentInsertRefStringIndex = -1;

        this._disposeSelectionsChangeListeners();

        if (this._arrowMoveActionState === ArrowMoveAction.moveRefReady) {
            this._arrowMoveActionState = ArrowMoveAction.exitInput;
        }

        this._isSelectingMode = false;
    }

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
            this._contextService.setContextValue(DISABLE_NORMAL_SELECTIONS, true);
            this._contextService.setContextValue(UNI_DISABLE_CHANGING_FOCUS_KEY, true);

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
        this._contextService.setContextValue(DISABLE_NORMAL_SELECTIONS, false);
        this._contextService.setContextValue(UNI_DISABLE_CHANGING_FOCUS_KEY, false);

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
     * Highlight cell editor and formula bar editor.
     */
    private _highlightFormula() {
        if (this._getContextState() === false) {
            return;
        }

        const sequenceNodes = this._formulaPromptService.getSequenceNodes();

        const unitIds = this._editorModelUnitIds();

        const bodyList = this._getFormulaAndCellEditorBody(unitIds).filter((b) => !!b);

        this._refSelectionsService.clear();

        if (sequenceNodes == null || sequenceNodes.length === 0) {
            this._existsSequenceNode = false;
            bodyList.forEach((body) => (body!.textRuns = []));
        } else {
            // this._lastSequenceNodes = sequenceNodes;
            this._existsSequenceNode = true;
            const { textRuns, refSelections } = this._buildTextRuns(sequenceNodes);
            bodyList.forEach((body) => (body!.textRuns = textRuns));
            this._allSelectionRenderServices.forEach((r) => this._refreshSelectionForReference(r, refSelections));
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
    private _refreshSelectionForReference(refSelectionRenderService: RefSelectionsRenderService, refSelections: IRefSelection[]) {
        const [unitId, sheetId] = refSelectionRenderService.getLocation();
        const { unitId: selfUnitId, sheetId: selfSheetId } = this._getCurrentUnitIdAndSheetId();
        const isSelf = unitId === selfUnitId && sheetId === selfSheetId;

        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId)!;
        const worksheet = workbook.getSheetBySheetId(sheetId)!;

        let lastRange: Nullable<ISelectionWithStyle> = null;

        const selectionWithStyle: ISelectionWithStyle[] = [];
        for (let i = 0, len = refSelections.length; i < len; i++) {
            const refSelection = refSelections[i];
            const { themeColor, token, refIndex } = refSelection;

            const gridRange = deserializeRangeWithSheet(token);
            const { unitId: refUnitId, sheetName, range: rawRange } = gridRange;

            if (!isSelf && (!refUnitId || !sheetName)) {
                continue;
            }

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

        if (selectionWithStyle.length) {
            this._refSelectionsService.addSelections(unitId, sheetId, selectionWithStyle);
        }
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

    // FIXME@Jocs: this internal implementations should be exposed to callers.
    // This method should be moved to EditorService.
    private _getEditorOpenedForSheet() {
        const documentDataModel = this._univerInstanceService.getCurrentUniverDocInstance()!;
        const editorUnitId = documentDataModel.getUnitId();
        const editor = this._editorService.getEditor(editorUnitId);
        if (!editor) {
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
    private _generateRefString(currentSelection: ISelectionWithStyle) {
        let refUnitId = '';
        let refSheetName = '';

        const { unitId, sheetId } = currentSelection.range;
        const { openUnitId, openSheetId } = this._getEditorOpenedForSheet();

        if (unitId !== openUnitId && unitId) {
            refUnitId = unitId;
        }

        if (sheetId !== openSheetId && unitId && sheetId) {
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
    // eslint-disable-next-line max-lines-per-function
    private _syncToEditor(
        sequenceNodes: Array<string | ISequenceNode>,
        textSelectionOffset: number,
        editorUnitId?: string,
        canUndo: boolean = true,
        fromSelection = true
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

        // You need to set a mode for single selection area or multiple selection areas, adapting to a rangeSelector that only has a single selection area.
        if (editor?.isSingleChoice()) {
            dataStream = dataStream.split(',')[0];
            this._selectionRenderService.setSingleSelectionEnabled(true);
        } else {
            this._selectionRenderService.setSingleSelectionEnabled(false);
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
                options: { fromSelection },
            });
            // The ReplaceContentCommand has canceled the selection operation, so it needs to be triggered externally once.
            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: textSelectionOffset + 1 - offset,
                    endOffset: textSelectionOffset + 1 - offset,
                    style,
                },
            ], true, { fromSelection });
        } else {
            this._updateEditorModel(`${formulaString}\r\n`, textRuns);
            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: textSelectionOffset + 1 - offset,
                    endOffset: textSelectionOffset + 1 - offset,
                    style,
                },
            ], true, { fromSelection });
        }

        /**
         * After selecting the formula, allow the editor to continue entering content.
         */
        setTimeout(() => {
            this._textSelectionRenderManager.focus();
        }, 0);
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

    private _insertControlSelectionReplace(currentSelection: ISelectionWithStyle) {
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

        const refString = this._generateRefString(currentSelection);

        this._formulaPromptService.setSequenceNodes(insertNodes);

        this._formulaPromptService.insertSequenceRef(this._previousInsertRefStringIndex, refString);

        this._syncToEditor(insertNodes, this._previousInsertRefStringIndex + refString.length);

        const selectionDatas = this._selectionRenderService.getSelectionDataWithStyle();

        this._insertSelections = [];

        selectionDatas.forEach((currentSelection) => {
            const range = convertSelectionDataToRange(currentSelection);
            this._insertSelections.push(range);
        });
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

    // FIXME: @wzhudev: this method could be merged with `_refreshSelectionForReference`.

    private _updateRefSelectionStyle(refSelectionRenderService: RefSelectionsRenderService, refSelections: IRefSelection[]) {
        const controls = refSelectionRenderService.getSelectionControls();
        const [unitId, sheetId] = refSelectionRenderService.getLocation();

        const matchedControls = new Set<SelectionShape>();
        for (let i = 0, len = refSelections.length; i < len; i++) {
            const refSelection = refSelections[i];
            const { refIndex, themeColor, token } = refSelection;
            const rangeWithSheet = deserializeRangeWithSheet(token);
            const { unitId: refUnitId, sheetName, range } = rangeWithSheet;

            if (!refUnitId && refUnitId.length > 0 && unitId !== refUnitId) {
                continue;
            }

            const refSheetId = this._getSheetIdByName(unitId, sheetName.trim());
            if (refSheetId && refSheetId !== sheetId) {
                continue;
            }

            const control = controls.find((c) => {
                // 范围相等方法又写一遍！
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

            if (control) {
                const style = getFormulaRefSelectionStyle(this._themeService, themeColor, refIndex.toString());
                control.updateStyle(style);
                matchedControls.add(control);
            }
        }
    }

    private _onSelectionControlChange(toRange: IRangeWithCoord, selectionControl: SelectionShape) {
        // FIXME: change here
        const { skeleton } = this._getCurrentUnitIdAndSheetId();
        // const { unitId, sheetId } = toRange;
        this._formulaPromptService.enableLockedSelectionChange();

        const id = selectionControl.selectionStyle?.id;
        if (!id || !Tools.isStringNumber(id)) {
            return;
        }

        let { startRow, endRow, startColumn, endColumn } = toRange;
        const primary = getCellInfoInMergeData(startRow, startColumn, skeleton?.mergeData);

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

        const refString = this._generateRefString({
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
        selectionControl.update(toRange, undefined, undefined, undefined, this._selectionRenderService.attachPrimaryWithCoord(primary));
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
        if (documentComponent) {
            this.disposeWithMe(documentComponent.onPointerDown$.subscribeEvent(() => {
                this._arrowMoveActionState = ArrowMoveAction.moveCursor;
                this._inputPanelState = InputPanelState.mouse;
            }));
        }
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

        // FIXME: @Jocs: lots of code duplications here

        this._editorBridgeService.changeVisible({
            visible: false,
            eventType: DeviceInputEventType.Keyboard,
            keycode,
            unitId: '',
        });
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
            unitId: '',
        });
    }

    private _pressEsc(params: ISelectEditorFormulaOperationParam) {
        const { keycode } = params;
        const focusEditor = this._editorService.getFocusEditor();
        if (!focusEditor || focusEditor?.isSheetEditor() === true) {
            this._editorBridgeService.changeVisible({
                visible: false,
                eventType: DeviceInputEventType.Keyboard,
                keycode,
                unitId: '',
            });
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

    // eslint-disable-next-line max-lines-per-function
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
                            unitId: '',
                        });
                        return;
                    }

                    if (this._arrowMoveActionState === ArrowMoveAction.moveRefReady) {
                        this._arrowMoveActionState = ArrowMoveAction.movingRef;
                    }

                    // If there's no current selections in the ref selections service, we should copy for
                    // normal selection.
                    const previousRanges = this._refSelectionsService.getCurrentSelections();
                    if (previousRanges.length === 0) {
                        const selectionData = this._sheetsSelectionsService.getCurrentLastSelection();
                        if (selectionData != null) {
                            const selectionDataNew = Tools.deepClone(selectionData);
                            this._refSelectionsService.addSelections([selectionDataNew]);
                        }
                    }

                    this._pressArrowKey(params);

                    const selectionWithStyles = this._refSelectionsService.getCurrentSelections();
                    const currentSelection = selectionWithStyles[selectionWithStyles.length - 1];

                    this._insertControlSelectionReplace(currentSelection);
                    this._highlightFormula();
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
        if (documentComponent) {
            this.disposeWithMe(documentComponent?.onPointerDown$.subscribeEvent(() => {
                this._userCursorMove = true;
            }));
        }
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
    }

    private _isFormulaEditorActivated(): boolean {
        // TODO: Finally we will remove 'this._editorBridgeService.isVisible().visible === true' to
        // just the the context value.
        return this._editorBridgeService.isVisible().visible === true || this._contextService.getContextValue(FORMULA_EDITOR_ACTIVATED);
    }
}
