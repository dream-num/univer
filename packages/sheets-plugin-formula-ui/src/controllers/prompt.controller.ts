import { MoveCursorOperation, TextSelectionManagerService } from '@univerjs/base-docs';
import {
    deserializeRangeWithSheet,
    FormulaEngineService,
    IFunctionInfo,
    includeFormulaLexerToken,
    ISequenceNode,
    isFormulaLexerToken,
    matchToken,
    normalizeSheetName,
    sequenceNodeType,
    serializeRangeToRefString,
} from '@univerjs/base-formula-engine';
import {
    DeviceInputEventType,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    IRenderManagerService,
    ITextSelectionRenderManager,
} from '@univerjs/base-render';
import {
    convertSelectionDataToRange,
    getNormalSelectionStyle,
    ISelectionWithStyle,
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
} from '@univerjs/base-sheets';
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
    IRange,
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
    SelectEditorFormulaOperation,
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

enum ArrowMoveAction {
    InitialState,
    moveCursor,
    moveRefReady,
    movingRef,
    exitInput,
}

@OnLifecycle(LifecycleStages.Steady, PromptController)
export class PromptController extends Disposable {
    private _formulaRefColors: string[] = [];

    private _lastSequenceNodes: Array<string | ISequenceNode> = [];

    private _previousSequenceNodes: Nullable<Array<string | ISequenceNode>>;

    private _isLockedOnSelectionChangeRefString: boolean = false;

    private _isLockedOnSelectionInsertRefString: boolean = false;

    private _previousRangesCount: number = 0;

    private _previousInsertRefStringIndex: Nullable<number>;

    private _currentInsertRefStringIndex: number = -1;

    private _currentUnitId: Nullable<string>;

    private _currentSheetId: Nullable<string>;

    private _isSelectionMoving: boolean = false;

    private _arrowMoveActionState: ArrowMoveAction = ArrowMoveAction.InitialState;

    private _isSelectionMovingRefSelections: IRefSelection[] = [];

    private _stringColor = '';

    private _numberColor = '';

    private _insertSelections: ISelectionWithStyle[] = [];

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
        @Inject(IDescriptionService) private readonly _descriptionService: IDescriptionService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        this._formulaRefColors = [];
        this._resetTemp();
    }

    private _resetTemp() {
        this._lastSequenceNodes = [];

        this._previousSequenceNodes = null;

        this._previousInsertRefStringIndex = null;

        this._currentUnitId = null;

        this._currentSheetId = null;

        this._isSelectionMovingRefSelections = [];

        this._isLockedOnSelectionChangeRefString = false;

        this._previousRangesCount = 0;

        this._currentInsertRefStringIndex = -1;

        this._isSelectionMoving = false;
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
                    if (this._editorBridgeService.isVisible().visible === false || this._isSelectionMoving === true) {
                        return;
                    }

                    const currentBody = this._getCurrentBody();

                    const dataStream = currentBody?.dataStream || '';

                    this._contextSwitch(dataStream);

                    this._changeKeepVisibleHideState();

                    this._switchSelectionPlugin();

                    if (this._isLockedOnSelectionChangeRefString) {
                        return;
                    }

                    this._highlightFormula(currentBody);

                    if (this._isLockedOnSelectionInsertRefString) {
                        return;
                    }
                    // TODO@Dushusir: use real text info
                    this._setFunctionPanel(dataStream);
                })
            )
        );
    }

    private _initialEditorInputChange() {
        this.disposeWithMe(
            toDisposable(
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
                        ) &&
                        this._arrowMoveActionState !== ArrowMoveAction.moveCursor
                    ) {
                        this._arrowMoveActionState = ArrowMoveAction.moveRefReady;
                    }
                })
            )
        );
    }

    private _initialExitEditor() {
        this.disposeWithMe(
            toDisposable(
                this._editorBridgeService.afterVisible$.subscribe((visibleParam) => {
                    if (visibleParam.visible === true) {
                        const { unitId, sheetId } = this._getCurrentUnitIdAndSheetId();

                        if (this._currentUnitId == null) {
                            this._currentUnitId = unitId;
                        }

                        if (this._currentSheetId == null) {
                            this._currentSheetId = sheetId;
                        }

                        return;
                    }

                    /**
                     * Switching the selection of PluginName causes a refresh.
                     * Here, a delay is added to prevent the loss of content when pressing enter.
                     */

                    const current = this._selectionManagerService.getCurrent();

                    if (current?.pluginName === NORMAL_SELECTION_PLUGIN_NAME) {
                        this._disableForceKeepVisible();
                        return;
                    }

                    this._selectionManagerService.clear();
                    this._selectionManagerService.changePlugin(NORMAL_SELECTION_PLUGIN_NAME);

                    this._updateEditorModel('\r\n', []);

                    this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);

                    this._disableForceKeepVisible();

                    this._selectionRenderService.resetStyle();

                    this._resetTemp();
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

                    this._isSelectionMoving = false;

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

    private _initialRefSelectionInsertEvent() {
        this.disposeWithMe(
            toDisposable(
                this._selectionRenderService.selectionMoving$.subscribe((ranges) => {
                    if (ranges == null) {
                        return;
                    }

                    if (!this._isLockedOnSelectionInsertRefString) {
                        return;
                    }

                    this._isSelectionMoving = true;

                    this._inertControlSelection(ranges);
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                this._selectionRenderService.selectionMoveStart$.subscribe((ranges) => {
                    if (ranges == null) {
                        return;
                    }

                    if (!this._isLockedOnSelectionInsertRefString) {
                        return;
                    }

                    this._isSelectionMoving = true;

                    this._inertControlSelection(ranges);
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

        const char = this._getCurrentChar();

        if (char == null) {
            this._disableForceKeepVisible();
            return;
        }

        if (this._matchRefDrawToken(char)) {
            this._editorBridgeService.enableForceKeepVisible();

            this._isLockedOnSelectionInsertRefString = true;

            this._selectionRenderService.enableRemainLast();

            if (this._arrowMoveActionState !== ArrowMoveAction.moveCursor) {
                this._arrowMoveActionState = ArrowMoveAction.moveRefReady;
            }
        } else {
            this._disableForceKeepVisible();
        }
    }

    private _matchRefDrawToken(char: string) {
        return (
            (isFormulaLexerToken(char) &&
                char !== matchToken.CLOSE_BRACES &&
                char !== matchToken.CLOSE_BRACKET &&
                char !== matchToken.SINGLE_QUOTATION &&
                char !== matchToken.DOUBLE_QUOTATION) ||
            char === ' '
        );
    }

    private _getCurrentChar() {
        const activeRange = this._textSelectionRenderManager.getActiveRange();

        if (activeRange == null) {
            return;
        }

        const { startOffset } = activeRange;

        const body = this._getCurrentBody();

        if (body == null || startOffset == null) {
            return;
        }

        const dataStream = body.dataStream;

        return dataStream[startOffset - 1];
    }

    private _disableForceKeepVisible() {
        this._editorBridgeService.disableForceKeepVisible();

        this._isLockedOnSelectionInsertRefString = false;

        this._currentInsertRefStringIndex = -1;
        this._selectionRenderService.disableRemainLast();

        if (this._arrowMoveActionState === ArrowMoveAction.moveRefReady) {
            this._arrowMoveActionState = ArrowMoveAction.exitInput;
        }
    }

    private _getCurrentBody() {
        const documentModel = this._currentUniverService.getUniverDocInstance(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        return documentModel?.snapshot?.body;
    }

    private _contextSwitch(currentInputValue: string) {
        if (isFormulaString(currentInputValue)) {
            this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, true);

            this._lastSequenceNodes =
                this._formulaEngineService.buildSequenceNodes(
                    currentInputValue.replace(/\r/g, '').replace(/\n/g, '')
                ) || [];

            const activeRange = this._textSelectionRenderManager.getActiveRange();

            if (activeRange == null) {
                return;
            }

            const { startOffset } = activeRange;

            this._currentInsertRefStringIndex = startOffset - 1;
        } else {
            this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);
            this._isLockedOnSelectionChangeRefString = false;
            this._isLockedOnSelectionInsertRefString = false;

            this._lastSequenceNodes = [];
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
     *
     * @param body the body object of the current input box
     * @returns
     */
    private _highlightFormula(body: Nullable<IDocumentBody>) {
        if (body == null || this._getContextState() === false) {
            return;
        }

        // const dataStream = body.dataStream;

        // const sequenceNodes = this._formulaEngineService.buildSequenceNodes(
        //     dataStream.replace(/\r/g, '').replace(/\n/g, '')
        // );

        const sequenceNodes = this._lastSequenceNodes;

        this._selectionManagerService.clear();

        if (sequenceNodes == null || sequenceNodes.length === 0) {
            body.textRuns = [];
        } else {
            // this._lastSequenceNodes = sequenceNodes;
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
        const { unitId, sheetId } = this._getCurrentUnitIdAndSheetId();

        const selectionWithStyle: ISelectionWithStyle[] = [];

        const workbook = this._currentUniverService.getUniverSheetInstance(unitId);
        const worksheet = workbook?.getSheetBySheetId(sheetId);

        if (worksheet == null) {
            return;
        }

        let lastRange: Nullable<ISelectionWithStyle> = null;

        for (let i = 0, len = refSelections.length; i < len; i++) {
            const refSelection = refSelections[i];
            const { themeColor, token, refIndex } = refSelection;

            const gridRange = deserializeRangeWithSheet(token);

            const { unitId: refUnitId, sheetName, range } = gridRange;

            if (refUnitId != null && refUnitId.length > 0 && unitId !== refUnitId) {
                continue;
            }

            const refSheetId = this._getSheetIdByName(unitId, sheetName.trim());

            if (refSheetId != null && refSheetId !== sheetId) {
                continue;
            }

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

                return false;
            })?.primary;

            if (primary != null) {
                lastRange = {
                    range,
                    primary,
                    style: getFormulaRefSelectionStyle(this._themeService, themeColor, refIndex.toString()),
                };

                continue;
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

    private _getSheetIdByName(unitId: string, sheetName: string) {
        const workbook = this._currentUniverService.getUniverSheetInstance(unitId);

        return workbook?.getSheetBySheetName(normalizeSheetName(sheetName))?.getSheetId();
    }

    private _getSheetNameById(unitId: string, sheetId: string) {
        const workbook = this._currentUniverService.getUniverSheetInstance(unitId);

        let sheetName = workbook?.getSheetBySheetId(sheetId)?.getName() || '';

        if (sheetName.length > 0 && includeFormulaLexerToken(sheetName)) {
            sheetName = `'${sheetName}'`;
        }

        return sheetName;
    }

    private _getCurrentUnitIdAndSheetId() {
        const current = this._sheetSkeletonManagerService.getCurrent();

        if (current == null) {
            const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
            const worksheet = workbook.getActiveSheet();
            return {
                unitId: workbook.getUnitId(),
                sheetId: worksheet.getSheetId(),
            };
        }

        const { unitId, sheetId } = current;

        return {
            unitId,
            sheetId,
        };
    }

    private _getRefString(range: IRange) {
        const { unitId, sheetId } = this._getCurrentUnitIdAndSheetId();

        let refUnitId = '';
        let refSheetName = '';

        if (unitId === this._currentUnitId) {
            refUnitId = '';
        } else {
            refUnitId = unitId;
        }

        if (sheetId === this._currentSheetId) {
            refSheetName = '';
        } else {
            refSheetName = this._getSheetNameById(unitId, sheetId);
        }

        const { startRow, endRow, startColumn, endColumn } = range;
        return serializeRangeToRefString({
            sheetName: refSheetName,
            unitId: refUnitId,
            range: {
                startRow,
                endRow,
                startColumn,
                endColumn,
            },
        });
    }

    /**
     * Synchronize the reference text based on the changes of the selection.
     * @param refIndex
     * @param rangeWithCoord
     * @returns
     */
    private _updateSequenceRef(
        sequenceNodes: Array<string | ISequenceNode>,
        refIndex: number,
        rangeWithCoord: Nullable<IRangeWithCoord>
    ) {
        if (rangeWithCoord == null) {
            return;
        }
        const { startRow, endRow, startColumn, endColumn } = rangeWithCoord;
        const refString = this._getRefString({
            startRow,
            endRow,
            startColumn,
            endColumn,
        });

        const node = sequenceNodes[refIndex];

        if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
            return;
        }

        const difference = refString.length - node.token.length;

        node.token = refString;

        node.endIndex += difference;

        for (let i = refIndex + 1, len = sequenceNodes.length; i < len; i++) {
            const node = sequenceNodes[i];
            if (typeof node === 'string') {
                continue;
            }

            node.startIndex += difference;
            node.endIndex += difference;
        }

        this._sycToEditor(sequenceNodes, node.endIndex + 1);
    }

    /**
     * When the cursor is on the right side of a formula token,
     * you can add reference text to the formula by drawing a selection.
     * @param index
     * @param range
     */
    private _insertSequenceRef(sequenceNodes: Array<string | ISequenceNode>, index: number, range: Nullable<IRange>) {
        if (range == null) {
            return;
        }

        // const { unitId, sheetId } = this._getCurrentUnitIdAndSheetId();

        // let refUnitId = '';
        // let refSheetName = '';

        // if (unitId === this._currentUnitId) {
        //     refUnitId = '';
        // } else {
        //     refUnitId = unitId;
        // }

        // if (sheetId === this._currentSheetId) {
        //     refSheetName = '';
        // } else {
        //     refSheetName = this._getSheetNameById(unitId, sheetId);
        // }

        // const { startRow, endRow, startColumn, endColumn } = range;
        // const refString = serializeRangeToRefString({
        //     sheetName: refSheetName,
        //     unitId: refUnitId,
        //     range: {
        //         startRow,
        //         endRow,
        //         startColumn,
        //         endColumn,
        //     },
        // });

        const refString = this._getRefString(range);

        const refStringCount = refString.length;

        const nodeIndex = this._searchSequenceIndex(sequenceNodes, index);

        sequenceNodes.splice(nodeIndex, 0, {
            token: refString,
            startIndex: index,
            endIndex: index + refStringCount - 1,
            nodeType: sequenceNodeType.REFERENCE,
        });

        for (let i = nodeIndex + 1, len = sequenceNodes.length; i < len; i++) {
            const node = sequenceNodes[i];
            if (typeof node === 'string') {
                continue;
            }

            node.startIndex += refStringCount;
            node.endIndex += refStringCount;
        }

        this._sycToEditor(sequenceNodes, index + refStringCount);
    }

    private _insertSequenceString(sequenceNodes: Array<string | ISequenceNode>, index: number, content: string) {
        const nodeIndex = this._searchSequenceIndex(sequenceNodes, index);
        const str = content.split('');
        sequenceNodes.splice(nodeIndex, 0, ...str);

        const contentCount = str.length;

        for (let i = nodeIndex + contentCount, len = sequenceNodes.length; i < len; i++) {
            const node = sequenceNodes[i];
            if (typeof node === 'string') {
                continue;
            }

            node.startIndex += contentCount;
            node.endIndex += contentCount;
        }
    }

    private _searchSequenceIndex(sequenceNodes: Array<string | ISequenceNode>, strIndex: number) {
        let nodeIndex = 0;
        for (let i = 0, len = sequenceNodes.length; i < len; i++) {
            const node = sequenceNodes[i];

            if (typeof node === 'string') {
                nodeIndex++;
            } else {
                const { endIndex } = node;

                nodeIndex = endIndex;
            }

            if (strIndex <= nodeIndex) {
                return i;
            }
        }

        return sequenceNodes.length;
    }

    private async _sycToEditor(sequenceNodes: Array<string | ISequenceNode>, textSelectionOffset: number) {
        const dataStream = this._generateStringWithSequence(sequenceNodes);

        const { textRuns, refSelections } = this._buildTextRuns(sequenceNodes);

        this._isSelectionMovingRefSelections = refSelections;

        this._updateEditorModel(`=${dataStream}\r\n`, textRuns);

        const activeRange = this._textSelectionManagerService.getLast();

        if (activeRange == null) {
            return;
        }

        const { collapsed, style } = activeRange;

        this._currentInsertRefStringIndex = textSelectionOffset;

        await this._commandService.syncExecuteCommand(SetEditorResizeOperation.id, {
            unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        });

        this._textSelectionManagerService.replaceTextRanges([
            {
                startOffset: textSelectionOffset + 1,
                endOffset: textSelectionOffset + 1,
                collapsed,
                style,
            },
        ]);
    }

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

    private _inertControlSelectionReplace(currentRange: IRange) {
        if (this._previousSequenceNodes == null) {
            this._previousSequenceNodes = this._lastSequenceNodes;
        }

        if (this._previousInsertRefStringIndex == null) {
            this._previousInsertRefStringIndex = this._currentInsertRefStringIndex;
        }

        // No new control is added, the current ref string is still modified.
        const insertNodes = Tools.deepClone(this._previousSequenceNodes);
        if (insertNodes == null) {
            return;
        }

        this._insertSequenceRef(insertNodes, this._previousInsertRefStringIndex, currentRange);

        this._lastSequenceNodes = insertNodes;

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

    private _inertControlSelection(ranges: IRange[]) {
        const currentRange = ranges[ranges.length - 1];

        if (
            (ranges.length === this._previousRangesCount || this._previousRangesCount === 0) &&
            this._previousSequenceNodes != null
        ) {
            this._inertControlSelectionReplace(currentRange);
        } else {
            // Holding down ctrl causes an addition, requiring the ref string to be increased.
            const insertNodes = this._lastSequenceNodes;

            if (insertNodes == null) {
                return;
            }

            const char = this._getCurrentChar();

            if (char == null) {
                return;
            }

            this._previousInsertRefStringIndex = this._currentInsertRefStringIndex;

            if (!this._matchRefDrawToken(char)) {
                this._insertSequenceString(insertNodes, this._currentInsertRefStringIndex, matchToken.COMMA);

                this._previousInsertRefStringIndex += 1;
            }

            this._previousSequenceNodes = Tools.deepClone(insertNodes);

            this._insertSequenceRef(insertNodes, this._previousInsertRefStringIndex, currentRange);

            this._lastSequenceNodes = insertNodes;

            this._selectionRenderService.disableSkipRemainLast();
        }

        this._arrowMoveActionState = ArrowMoveAction.moveRefReady;

        this._previousRangesCount = ranges.length;
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
                const { startRow, startColumn, endRow, endColumn } = c.getRange();
                if (
                    startRow === range.startRow &&
                    startColumn === range.startColumn &&
                    endRow === range.endRow &&
                    endColumn === range.endColumn
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

        this._isLockedOnSelectionChangeRefString = true;

        const id = controlSelection.selectionStyle?.id;

        if (id == null || !Tools.isStringNumber(id)) {
            return;
        }

        this._updateSequenceRef(this._lastSequenceNodes, Number(id), toRange);

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

    private _cursorStateListener() {
        /**
         * The user's operations follow the sequence of opening the editor and then moving the cursor.
         * The logic here predicts the user's first cursor movement behavior based on this rule
         */

        const editorObject = this._getEditorObject();

        if (editorObject == null) {
            return;
        }

        const { document: documentComponent } = editorObject;
        this.disposeWithMe(
            toDisposable(
                documentComponent.onPointerDownObserver.add(() => {
                    this._arrowMoveActionState = ArrowMoveAction.moveCursor;
                })
            )
        );
    }

    private _commandExecutedListener() {
        // Listen to document edits to refresh the size of the editor.
        const updateCommandList = [SelectEditorFormulaOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as ISelectEditorFormulaOperationParam;
                    const { keycode, metaKey } = params;

                    if (keycode === KeyCode.ENTER) {
                        this._editorBridgeService.changeVisible({
                            visible: false,
                            eventType: DeviceInputEventType.Keyboard,
                            keycode,
                        });
                        this._commandService.executeCommand(MoveSelectionCommand.id, {
                            direction: Direction.DOWN,
                        });
                        return;
                    }
                    if (keycode === KeyCode.TAB) {
                        this._editorBridgeService.changeVisible({
                            visible: false,
                            eventType: DeviceInputEventType.Keyboard,
                            keycode,
                        });
                        this._commandService.executeCommand(MoveSelectionCommand.id, {
                            direction: Direction.RIGHT,
                        });
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

                    const ranges = this._selectionManagerService.getSelectionRanges() || [];

                    const currentRange = ranges[ranges.length - 1];

                    this._inertControlSelectionReplace(currentRange);
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

    private _getEditorObject() {
        return getEditorObject(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, this._renderManagerService);
    }

    private _getFormulaBarEditorObject() {
        return getEditorObject(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, this._renderManagerService);
    }
}
