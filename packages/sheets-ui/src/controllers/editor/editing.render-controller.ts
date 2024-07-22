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

/* eslint-disable max-lines-per-function */

import type { DocumentDataModel, ICellData, ICommandInfo, IDisposable, IDocumentBody, IDocumentData, IPosition, Nullable, Workbook } from '@univerjs/core';
import {
    CellValueType, DEFAULT_EMPTY_DOCUMENT_VALUE, Direction, Disposable, DisposableCollection, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, EDITOR_ACTIVATED,
    FOCUSING_EDITOR_BUT_HIDDEN,
    FOCUSING_EDITOR_INPUT_FORMULA,
    FOCUSING_EDITOR_STANDALONE,
    FOCUSING_FX_BAR_EDITOR,
    FOCUSING_SHEET,
    FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE,
    HorizontalAlign,
    ICommandService,
    IContextService,
    Inject,
    IResourceLoaderService,
    isFormulaString,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    toDisposable,
    Tools,
    UniverInstanceType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import {
    VIEWPORT_KEY as DOC_VIEWPORT_KEY,
    DOCS_COMPONENT_MAIN_LAYER_INDEX,
    DocSkeletonManagerService,
    MoveCursorOperation,
    MoveSelectionOperation,
    RichTextEditingMutation,
    TextSelectionManagerService,
} from '@univerjs/docs';
import type { DocumentSkeleton, IDocumentLayoutObject, IEditorInputConfig, IRenderContext, IRenderModule, Scene } from '@univerjs/engine-render';
import {
    convertTextRotation,
    DeviceInputEventType,
    FIX_ONE_PIXEL_BLUR_OFFSET,
    fixLineWidthByScale,
    IRenderManagerService,
    ITextSelectionRenderManager,
    Rect,
    ScrollBar,
} from '@univerjs/engine-render';
import { IEditorService, ILayoutService, KeyCode, SetEditorResizeOperation } from '@univerjs/ui';
import type { WorkbookSelections } from '@univerjs/sheets';
import { ClearSelectionFormatCommand, SetRangeValuesCommand, SetSelectionsOperation, SetWorksheetActivateCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { distinctUntilChanged, filter } from 'rxjs';
import { LexerTreeBuilder, matchToken } from '@univerjs/engine-formula';

import { getEditorObject } from '../../basics/editor/get-editor-object';
import { SetCellEditVisibleArrowOperation, SetCellEditVisibleOperation, SetCellEditVisibleWithF2Operation } from '../../commands/operations/cell-edit.operation';
import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';
import styles from '../../views/sheet-container/index.module.less';
import { MoveSelectionCommand, MoveSelectionEnterAndTabCommand } from '../../commands/commands/set-selection.command';
import { MOVE_SELECTION_KEYCODE_LIST } from '../shortcuts/editor.shortcut';
import { extractStringFromForceString, isForceString } from '../utils/cell-tools';

const HIDDEN_EDITOR_POSITION = -1000;

const EDITOR_INPUT_SELF_EXTEND_GAP = 5;

const EDITOR_BORDER_SIZE = 2;

interface ICanvasOffset {
    left: number;
    top: number;
}

enum CursorChange {
    InitialState,
    StartEditor,
    CursorChange,
}

export class EditingRenderController extends Disposable implements IRenderModule {
    /**
     * It is used to distinguish whether the user has actively moved the cursor in the editor, mainly through mouse clicks.
     */
    private _cursorChange: CursorChange = CursorChange.InitialState;

    /** If the corresponding unit is active and prepared for editing. */
    private _isUnitEditing = false;

    private _workbookSelections: WorkbookSelections;

    private _d: Nullable<IDisposable>;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @Inject(SheetsSelectionsService) selectionManagerService: SheetsSelectionsService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService,
        @IContextService private readonly _contextService: IContextService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @ICellEditorManagerService private readonly _cellEditorManagerService: ICellEditorManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) protected readonly _localService: LocaleService,
        @IEditorService private readonly _editorService: IEditorService,
        @IResourceLoaderService private readonly _resourceLoaderService: IResourceLoaderService
    ) {
        super();

        this._workbookSelections = selectionManagerService.getWorkbookSelections(this._context.unitId);

        // EditingRenderController is per unit. It should only handle keyboard events when the unit is
        // the current of its type.
        this.disposeWithMe(this._instanceSrv.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            if (workbook?.getUnitId() === this._context.unitId) {
                this._d = this._init();
            } else {
                this._disposeCurrent();

                // Force ending editor when he switch to another workbook.
                if (this._isUnitEditing) {
                    this._handleEditorInvisible({
                        visible: false,
                        eventType: DeviceInputEventType.Keyboard,
                        keycode: KeyCode.ESC,
                        unitId: this._context.unitId,
                    });

                    this._isUnitEditing = false;
                }
            }
        }));

        this._initEditorVisibilityListener();
    }

    override dispose(): void {
        super.dispose();

        this._disposeCurrent();
    }

    private _disposeCurrent(): void {
        this._d?.dispose();
        this._d = null;
    }

    private _init(): IDisposable {
        const d = new DisposableCollection();
        this._subscribeToCurrentCell(d);
        this._initialKeyboardListener(d);
        this._initialCursorSync(d);
        this._listenEditorFocus(d);
        this._commandExecutedListener(d);
        this._cursorStateListener(d);
        return d;
    }

    private _initEditorVisibilityListener(): void {
        this.disposeWithMe(this._editorBridgeService.visible$
            .pipe(distinctUntilChanged((prev, curr) => prev.visible === curr.visible))
            .subscribe((param) => {
                if (param.unitId === this._context.unitId && param.visible) {
                    this._isUnitEditing = true;
                    this._handleEditorVisible(param);
                } else if (this._isUnitEditing) {
                    this._handleEditorInvisible(param);
                    this._isUnitEditing = false;
                }
            }));
    }

    private _listenEditorFocus(d: DisposableCollection) {
        const renderConfig = this._getEditorObject();
        if (!renderConfig) return;

        d.add(renderConfig.document.onPointerDown$.subscribeEvent(() => {
            // fix https://github.com/dream-num/univer/issues/628, need to recalculate the cell editor size after
            // it acquire focus.
            if (this._isUnitEditing && this._editorBridgeService.isVisible()) {
                const param = this._editorBridgeService.getEditCellState();
                const editorId = this._editorBridgeService.getCurrentEditorId();

                if (!param || !editorId || !this._editorService.isSheetEditor(editorId)) {
                    return;
                }

                const skeleton = this._getEditorSkeleton(editorId);
                if (!skeleton) return;

                const { position, documentLayoutObject, canvasOffset, scaleX, scaleY } = param;
                this._fitTextSize(position, canvasOffset, skeleton, documentLayoutObject, scaleX, scaleY);
            }
        }));
    }

    private _getEditorSkeleton(editorId: string) {
        return this._renderManagerService.getRenderById(editorId)?.with(DocSkeletonManagerService).getSkeleton();
    }

    private _getEditorViewModel(editorId: string) {
        return this._renderManagerService.getRenderById(editorId)?.with(DocSkeletonManagerService).getViewModel();
    }

    private _initialCursorSync(d: DisposableCollection) {
        d.add(this._cellEditorManagerService.focus$.pipe(filter((f) => !!f)).subscribe(() => {
            this._textSelectionRenderManager.sync();
        }));
    }

    /**
     * Should update current editing cell info when selection is changed.
     * @param d DisposableCollection
     */
    private _subscribeToCurrentCell(d: DisposableCollection) {
        // TODO: After the sheet dispose, recreate the sheet, the first cell edit may be unsuccessful,
        // it should be the editor initialization late, and we need to pay attention to this problem in the future.
        d.add(this._editorBridgeService.currentEditCellState$.subscribe((editCellState) => {
            if (editCellState == null || this._editorBridgeService.isForceKeepVisible()) {
                return;
            }

            const { position, documentLayoutObject, scaleX, editorUnitId } = editCellState;
            if (
                this._contextService.getContextValue(FOCUSING_EDITOR_STANDALONE) ||
                this._contextService.getContextValue(FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE)
            ) {
                return;
            }

            const { startX, endX } = position;
            const { textRotation, wrapStrategy, documentModel } = documentLayoutObject;
            const { vertexAngle: angle } = convertTextRotation(textRotation);
            documentModel!.updateDocumentId(editorUnitId);

            if (wrapStrategy === WrapStrategy.WRAP && angle === 0) {
                documentModel!.updateDocumentDataPageSize((endX - startX) / scaleX);
            }

            this._instanceSrv.changeDoc(editorUnitId, documentModel!);
            this._contextService.setContextValue(FOCUSING_EDITOR_BUT_HIDDEN, true);
            this._textSelectionManagerService.replaceTextRanges([{
                startOffset: 0,
                endOffset: 0,
            }]);

            this._textSelectionRenderManager.activate(HIDDEN_EDITOR_POSITION, HIDDEN_EDITOR_POSITION);
        }));
    }

    private _fitTextSize(
        actualRangeWithCoord: IPosition,
        canvasOffset: ICanvasOffset,
        documentSkeleton: DocumentSkeleton,
        documentLayoutObject: IDocumentLayoutObject,
        scaleX: number = 1,
        scaleY: number = 1
    ) {
        const { startX, startY, endX, endY } = actualRangeWithCoord;
        const documentDataModel = documentLayoutObject.documentModel;

        if (documentDataModel == null) {
            return;
        }

        const { actualWidth, actualHeight } = this._predictingSize(
            actualRangeWithCoord,
            canvasOffset,
            documentSkeleton,
            documentLayoutObject,
            scaleX,
            scaleY
        );
        const { verticalAlign, paddingData, fill } = documentLayoutObject;

        let editorWidth = endX - startX;

        let editorHeight = endY - startY;

        if (editorWidth < actualWidth) {
            editorWidth = actualWidth;
        }

        if (editorHeight < actualHeight) {
            editorHeight = actualHeight;
            // To restore the page margins for the skeleton.
            documentDataModel.updateDocumentDataMargin(paddingData);
        } else {
            // Set the top margin under vertical alignment.
            let offsetTop = 0;

            if (verticalAlign === VerticalAlign.MIDDLE) {
                offsetTop = (editorHeight - actualHeight) / 2 / scaleY;
            } else if (verticalAlign === VerticalAlign.TOP) {
                offsetTop = paddingData.t || 0;
            } else { // VerticalAlign.UNSPECIFIED follow the same rule as HorizontalAlign.BOTTOM.
                offsetTop = (editorHeight - actualHeight) / scaleY - (paddingData.b || 0);
            }

            // offsetTop /= scaleY;
            offsetTop = offsetTop < (paddingData.t || 0) ? paddingData.t || 0 : offsetTop;

            documentDataModel.updateDocumentDataMargin({
                t: offsetTop,
            });
        }

        // re-calculate skeleton(viewModel for component)
        documentSkeleton.calculate();

        this._editAreaProcessing(editorWidth, editorHeight, actualRangeWithCoord, canvasOffset, fill, scaleX, scaleY);
    }

    /**
     * Mainly used to pre-calculate the width of the editor,
     * to determine whether it needs to be automatically widened.
     */
    private _predictingSize(
        actualRangeWithCoord: IPosition,
        canvasOffset: ICanvasOffset,
        documentSkeleton: DocumentSkeleton,
        documentLayoutObject: IDocumentLayoutObject,
        scaleX: number = 1,
        scaleY: number = 1
    ) {
        // startX and startY are the width and height after scaling.
        const { startX, endX } = actualRangeWithCoord;

        const { textRotation, wrapStrategy } = documentLayoutObject;

        const documentDataModel = documentLayoutObject.documentModel;

        const { vertexAngle: angle } = convertTextRotation(textRotation);

        const clientWidth = document.body.clientWidth;

        if (wrapStrategy === WrapStrategy.WRAP && angle === 0) {
            const { actualWidth, actualHeight } = documentSkeleton.getActualSize();
            // The skeleton obtains the original volume, which needs to be multiplied by the magnification factor.
            return {
                actualWidth: actualWidth * scaleX,
                actualHeight: actualHeight * scaleY,
            };
        }

        documentDataModel?.updateDocumentDataPageSize((clientWidth - startX - canvasOffset.left) / scaleX);
        documentSkeleton.calculate();

        const size = documentSkeleton.getActualSize();

        let editorWidth = endX - startX;

        if (editorWidth < size.actualWidth * scaleX + EDITOR_INPUT_SELF_EXTEND_GAP * scaleX) {
            editorWidth = size.actualWidth * scaleX + EDITOR_INPUT_SELF_EXTEND_GAP * scaleX;
        }

        // Scaling is handled by the renderer, so the skeleton only accepts the original width and height, which need to be divided by the magnification factor.
        documentDataModel?.updateDocumentDataPageSize(editorWidth / scaleX);

        /**
         * Do not rely on cell layout logic, depend on the document's internal alignment logic.
         */
        documentDataModel?.updateDocumentRenderConfig({
            horizontalAlign: HorizontalAlign.UNSPECIFIED,
            cellValueType: undefined,
        });

        return {
            actualWidth: editorWidth,
            actualHeight: size.actualHeight * scaleY,
        };
    }

    /**
     * Mainly used to calculate the volume of scenes and objects,
     * determine whether a scrollbar appears,
     * and calculate the editor's boundaries relative to the browser.
     */

    private _editAreaProcessing(
        editorWidth: number,
        editorHeight: number,
        actualRangeWithCoord: IPosition,
        canvasOffset: ICanvasOffset,
        fill: Nullable<string>,
        scaleX: number = 1,
        scaleY: number = 1
    ) {
        const editorObject = this._getEditorObject();

        if (editorObject == null) {
            return;
        }

        let { startX, startY } = actualRangeWithCoord;

        const { document: documentComponent, scene, engine: docEngine } = editorObject;

        const viewportMain = scene.getViewport(DOC_VIEWPORT_KEY.VIEW_MAIN);

        const clientHeight =
            document.body.clientHeight -
            startY -
            Number.parseFloat(styles.sheetFooterBarHeight) -
            canvasOffset.top -
            EDITOR_BORDER_SIZE * 2;

        const clientWidth = document.body.clientWidth - startX - canvasOffset.left;

        let physicHeight = editorHeight;

        let scrollBar = viewportMain?.getScrollBar() as Nullable<ScrollBar>;

        if (physicHeight > clientHeight) {
            physicHeight = clientHeight;

            if (scrollBar == null) {
                viewportMain && new ScrollBar(viewportMain, { enableHorizontal: false, barSize: 8 });
            } else {
                viewportMain?.resetCanvasSizeAndUpdateScroll();
            }
        } else {
            scrollBar = null;
            viewportMain?.getScrollBar()?.dispose();
        }

        editorWidth += scrollBar?.barSize || 0;

        if (editorWidth > clientWidth) {
            editorWidth = clientWidth;
        }

        startX -= FIX_ONE_PIXEL_BLUR_OFFSET;

        startY -= FIX_ONE_PIXEL_BLUR_OFFSET;

        // physicHeight = editorHeight;

        this._addBackground(scene, editorWidth / scaleX, editorHeight / scaleY, fill);

        const { scaleX: precisionScaleX, scaleY: precisionScaleY } = scene.getPrecisionScale();

        scene.transformByState({
            width: editorWidth / scaleX,
            height: editorHeight / scaleY,
            scaleX,
            scaleY,
        });

        documentComponent.resize(editorWidth / scaleX, editorHeight / scaleY);

        /**
         * resize canvas
         * When modifying the selection area for a formula, it is necessary to add a setTimeout to ensure successful updating.
         */
        requestIdleCallback(() => {
            docEngine.resizeBySize(
                fixLineWidthByScale(editorWidth, precisionScaleX),
                fixLineWidthByScale(physicHeight, precisionScaleY)
            );
        });

        const canvasElement = this._context.engine.getCanvasElement();
        const contentBoundingRect = this._layoutService.getContentElement().getBoundingClientRect();
        const canvasBoundingRect = canvasElement.getBoundingClientRect();
        startX += (canvasBoundingRect.left - contentBoundingRect.left);
        startY += (canvasBoundingRect.top - contentBoundingRect.top);

        // Update cell editor container position and size.
        this._cellEditorManagerService.setState({
            startX,
            startY,
            endX: editorWidth + startX,
            endY: physicHeight + startY,
            show: true,
        });
    }

    /**
     * Since the document does not support cell background color, an additional rect needs to be added.
     */
    private _addBackground(scene: Scene, editorWidth: number, editorHeight: number, fill?: Nullable<string>) {
        const fillRectKey = '_backgroundRectHelperColor_';
        const rect = scene.getObject(fillRectKey) as Rect;

        if (rect == null && fill == null) {
            return;
        }

        if (rect == null) {
            scene.addObjects(
                [
                    new Rect(fillRectKey, {
                        width: editorWidth,
                        height: editorHeight,
                        fill,
                        evented: false,
                    }),
                ],
                DOCS_COMPONENT_MAIN_LAYER_INDEX
            );
        } else if (fill == null) {
            rect.dispose();
        } else {
            rect.setProps({
                fill,
            });

            rect.transformByState({
                width: editorWidth,
                height: editorHeight,
            });
        }
    }

    // You can double-click on the cell or input content by keyboard to put the cell into the edit state.

    private _handleEditorVisible(param: IEditorBridgeServiceVisibleParam) {
        const { eventType, keycode } = param;

        // Change `CursorChange` to changed status, when formula bar clicked.
        this._cursorChange =
            eventType === DeviceInputEventType.PointerDown
                ? CursorChange.CursorChange
                : CursorChange.StartEditor;

        const editCellState = this._editorBridgeService.getEditCellState();
        if (editCellState == null) {
            return;
        }

        const {
            position,
            documentLayoutObject,
            canvasOffset,
            scaleX,
            scaleY,
            editorUnitId,
            unitId,
            sheetId,
            isInArrayFormulaRange = false,
        } = editCellState;

        const editorObject = this._getEditorObject();

        if (editorObject == null) {
            return;
        }

        this._setOpenForCurrent(unitId, sheetId);

        const { document, scene } = editorObject;

        this._contextService.setContextValue(EDITOR_ACTIVATED, true);

        const { documentModel: documentDataModel } = documentLayoutObject;
        const skeleton = this._getEditorSkeleton(editorUnitId);
        if (!skeleton || !documentDataModel) {
            return;
        }

        this._fitTextSize(position, canvasOffset, skeleton, documentLayoutObject, scaleX, scaleY);
        // move selection
        if (
            eventType === DeviceInputEventType.Keyboard ||
            (eventType === DeviceInputEventType.Dblclick && isInArrayFormulaRange)
        ) {
            const snapshot = Tools.deepClone(documentDataModel.getSnapshot());
            const documentViewModel = this._getEditorViewModel(editorUnitId);

            if (documentViewModel == null) {
                return;
            }

            this._resetBodyStyle(snapshot.body!, !!isInArrayFormulaRange);

            documentDataModel.reset(snapshot);
            documentViewModel.reset(documentDataModel);

            document.makeDirty();

            // @JOCS, Why calculate here?
            if (keycode === KeyCode.BACKSPACE || eventType === DeviceInputEventType.Dblclick) {
                skeleton.calculate();
                this._editorBridgeService.changeEditorDirty(true);
            }

            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: 0,
                    endOffset: 0,
                },
            ]);
        } else if (eventType === DeviceInputEventType.Dblclick) {
            // TODO: @JOCS, Get the position close to the cursor after clicking on the cell.
            const cursor = documentDataModel.getBody()!.dataStream.length - 2 || 0;

            scene.getViewport(DOC_VIEWPORT_KEY.VIEW_MAIN)?.scrollToViewportPos({
                viewportScrollX: Number.POSITIVE_INFINITY,
            });

            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: cursor,
                    endOffset: cursor,
                },
            ]);
        }

        this._renderManagerService.getRenderById(unitId)?.scene.resetCursor();
    }

    private _resetBodyStyle(body: IDocumentBody, removeStyle = false) {
        body.dataStream = DEFAULT_EMPTY_DOCUMENT_VALUE;

        if (body.textRuns != null) {
            if (body.textRuns.length === 1 && !removeStyle) {
                body.textRuns[0].st = 0;
                body.textRuns[0].ed = 1;
            } else {
                body.textRuns = undefined;
            }
        }

        if (body.paragraphs != null) {
            if (body.paragraphs.length === 1) {
                body.paragraphs[0].startIndex = 0;
            } else {
                body.paragraphs = [
                    {
                        startIndex: 0,
                    },
                ];
            }
        }

        if (body.sectionBreaks != null) {
            body.sectionBreaks = undefined;
        }

        if (body.tables != null) {
            body.tables = undefined;
        }

        if (body.customRanges != null) {
            body.customRanges = undefined;
        }

        if (body.customBlocks != null) {
            body.customBlocks = undefined;
        }
    }

    /**
     * Should activate the editor when the user inputs text.
     * @param d DisposableCollection
     */
    private _initialKeyboardListener(d: DisposableCollection) {
        d.add(this._textSelectionRenderManager.onInputBefore$.subscribe((config) => {
            if (!this._isCurrentSheetFocused()) {
                return;
            }

            const isFocusFormulaEditor = this._contextService.getContextValue(FOCUSING_FX_BAR_EDITOR);
            const isFocusSheets = this._contextService.getContextValue(FOCUSING_SHEET);
            // TODO@Jocs: should get editor instead of current doc
            const unitId = this._instanceSrv.getCurrentUniverDocInstance()?.getUnitId();
            if (unitId && isFocusSheets && !isFocusFormulaEditor && this._editorService.isSheetEditor(unitId)) {
                this._showEditorByKeyboard(config);
            }
        }));
    }

    private _showEditorByKeyboard(config: Nullable<IEditorInputConfig>) {
        if (config == null) {
            return;
        }

        const event = config.event as KeyboardEvent;

        this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
            visible: true,
            eventType: DeviceInputEventType.Keyboard,
            keycode: event.which,
            unitId: this._context.unitId,
        });
    }

    /**
     * Listen to document edits to refresh the size of the sheet editor, not for normal editor.
     */
    private _commandExecutedListener(d: DisposableCollection) {
        const updateCommandList = [RichTextEditingMutation.id, SetEditorResizeOperation.id];

        d.add(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (updateCommandList.includes(command.id)) {
                const params = command.params as IRichTextEditingMutationParams;
                const { unitId: commandUnitId } = params;

                // Only when the sheet it attached to is focused. Maybe we should change it to the render unit sys.
                if (
                    !this._isCurrentSheetFocused() ||
                    !this._editorService.isSheetEditor(commandUnitId)
                ) {
                    return;
                }

                const editorId = this._editorBridgeService.getCurrentEditorId();
                if (editorId == null) {
                    return;
                }

                const skeleton = this._getEditorSkeleton(editorId);
                if (skeleton == null) {
                    return;
                }

                this._editorBridgeService.changeEditorDirty(true);

                const param = this._editorBridgeService.getEditCellState();
                if (param == null) {
                    return;
                }

                const { position, documentLayoutObject, canvasOffset, scaleX, scaleY } = param;

                this._fitTextSize(position, canvasOffset, skeleton, documentLayoutObject, scaleX, scaleY);
            }
        }));

        // Use fix https://github.com/dream-num/univer/issues/1231.
        d.add(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id === ClearSelectionFormatCommand.id) {
                this._editorBridgeService.refreshEditCellState();
            }
        }));

        const closeEditorOperation = [SetCellEditVisibleArrowOperation.id];
        d.add(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (closeEditorOperation.includes(command.id)) {
                const params = command.params as IEditorBridgeServiceVisibleParam & { isShift: boolean };
                const { keycode, isShift } = params;

                /**
                 * After the user enters the editor and actively moves the editor selection area with the mouse,
                 * the up, down, left, and right keys can no longer switch editing cells,
                 * but move the cursor within the editor instead.
                 */
                if (keycode != null &&
                    (this._cursorChange === CursorChange.CursorChange || this._contextService.getContextValue(FOCUSING_FX_BAR_EDITOR))
                ) {
                    this._moveInEditor(keycode, isShift);
                    return;
                }

                // TODO@Jocs: After we merging editor related controllers, this seems verbose.
                // We can directly call SetRangeValues here.
                this._editorBridgeService.changeVisible(params);
            }

            if (command.id === SetCellEditVisibleWithF2Operation.id) {
                this._cursorChange = CursorChange.CursorChange;
            }
        }));
    }

    private _setOpenForCurrent(unitId: Nullable<string>, sheetId: Nullable<string>) {
        const sheetEditors = this._editorService.getAllEditor();
        for (const [_, sheetEditor] of sheetEditors) {
            if (!sheetEditor.isSheetEditor()) {
                continue;
            }

            sheetEditor.setOpenForSheetUnitId(unitId);
            sheetEditor.setOpenForSheetSubUnitId(sheetId);
        }
    }

    private _getEditorObject() {
        return getEditorObject(this._editorBridgeService.getCurrentEditorId(), this._renderManagerService);
    }

    private async _handleEditorInvisible(param: IEditorBridgeServiceVisibleParam) {
        const { keycode } = param;

        this._setOpenForCurrent(null, null);

        this._cursorChange = CursorChange.InitialState;

        this._exitInput(param);

        const editCellState = this._editorBridgeService.getEditCellState();
        if (editCellState == null) {
            return;
        }

        const { unitId, sheetId, row, column, documentLayoutObject } = editCellState;

        // If neither the formula bar editor nor the cell editor has been edited,
        // it is considered that the content has not changed and returns directly.
        const editorIsDirty = this._editorBridgeService.getEditorDirty();
        if (editorIsDirty === false) {
            this._moveCursor(keycode);
            return;
        }

        const workbook = this._context.unit;
        const worksheet = workbook.getActiveSheet();
        const workbookId = this._context.unitId;
        const worksheetId = worksheet.getSheetId();
        // Reselect the current selections, when exist cell editor by press ESC.I
        if (keycode === KeyCode.ESC) {
            const selections = this._workbookSelections.getCurrentSelections();
            if (selections) {
                this._commandService.syncExecuteCommand(SetSelectionsOperation.id, {
                    unitId: this._context.unit,
                    subUnitId: worksheetId,
                    selections,
                });
            }

            return;
        }

        const cellData: Nullable<ICellData> = getCellDataByInput(
            worksheet.getCellRaw(row, column) || {},
            documentLayoutObject,
            this._lexerTreeBuilder,
            (model) => this._resourceLoaderService.saveDoc(model)
        );

        if (!cellData) {
            this._moveCursor(keycode);
            return;
        }

        const context = {
            subUnitId: sheetId,
            unitId,
            workbook: workbook!,
            worksheet,
            row,
            col: column,
        };

        /**
         * When closing the editor, switch to the current tab of the editor.
         */
        if (workbookId === unitId && sheetId !== worksheetId && this._editorBridgeService.isForceKeepVisible()) {
            // SetWorksheetActivateCommand handler uses Promise
            await this._commandService.executeCommand(SetWorksheetActivateCommand.id, {
                subUnitId: sheetId,
                unitId,
            });
        }

        const cell = this._editorBridgeService.interceptor.fetchThroughInterceptors(
            this._editorBridgeService.interceptor.getInterceptPoints().AFTER_CELL_EDIT
        )(cellData, context);

        const finalCell = await this._editorBridgeService.interceptor.fetchThroughInterceptors(
            this._editorBridgeService.interceptor.getInterceptPoints().AFTER_CELL_EDIT_ASYNC
        )(Promise.resolve(cell), context);

        this._commandService.executeCommand(SetRangeValuesCommand.id, {
            subUnitId: sheetId,
            unitId,
            range: {
                startRow: row,
                startColumn: column,
                endRow: row,
                endColumn: column,
            },
            value: finalCell,
        });

        // moveCursor need to put behind of SetRangeValuesCommand, fix https://github.com/dream-num/univer/issues/1155
        this._moveCursor(keycode);
    }

    private _exitInput(param: IEditorBridgeServiceVisibleParam) {
        this._contextService.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);
        this._contextService.setContextValue(EDITOR_ACTIVATED, false);
        this._contextService.setContextValue(FOCUSING_EDITOR_BUT_HIDDEN, false);
        this._contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, false);

        this._cellEditorManagerService.setState({
            show: param.visible,
        });
        const editorUnitId = this._editorBridgeService.getCurrentEditorId();
        if (editorUnitId == null || !this._editorService.isSheetEditor(editorUnitId)) {
            return;
        }
        this._undoRedoService.clearUndoRedo(editorUnitId);
        this._undoRedoService.clearUndoRedo(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
    }

    private _moveCursor(keycode?: KeyCode) {
        if (keycode == null || !MOVE_SELECTION_KEYCODE_LIST.includes(keycode)) {
            return;
        }

        let direction = Direction.LEFT;

        switch (keycode) {
            case KeyCode.ENTER:
                direction = Direction.DOWN;
                break;
            case KeyCode.TAB:
                direction = Direction.RIGHT;
                break;
            case KeyCode.ARROW_DOWN:
                direction = Direction.DOWN;
                break;
            case KeyCode.ARROW_UP:
                direction = Direction.UP;
                break;
            case KeyCode.ARROW_LEFT:
                direction = Direction.LEFT;
                break;
            case KeyCode.ARROW_RIGHT:
                direction = Direction.RIGHT;
                break;
        }

        if (keycode === KeyCode.ENTER || keycode === KeyCode.TAB) {
            this._commandService.executeCommand(MoveSelectionEnterAndTabCommand.id, {
                keycode,
                direction,
            });
        } else {
            this._commandService.executeCommand(MoveSelectionCommand.id, {
                direction,
            });
        }
    }

    /**
     * The user's operations follow the sequence of opening the editor and then moving the cursor.
     * The logic here predicts the user's first cursor movement behavior based on this rule
     */
    private _cursorStateListener(d: DisposableCollection) {
        const editorObject = this._getEditorObject()!;
        const { document: documentComponent } = editorObject;

        d.add(toDisposable(documentComponent.onPointerDown$.subscribeEvent(() => {
            if (this._cursorChange === CursorChange.StartEditor) {
                this._cursorChange = CursorChange.CursorChange;
            }
        })));
    }

    // TODO: @JOCS, is it necessary to move these commands MoveSelectionOperation\MoveCursorOperation to shortcut? and use multi-commands?
    private _moveInEditor(keycode: KeyCode, isShift: boolean) {
        let direction = Direction.LEFT;
        if (keycode === KeyCode.ARROW_DOWN) {
            direction = Direction.DOWN;
        } else if (keycode === KeyCode.ARROW_UP) {
            direction = Direction.UP;
        } else if (keycode === KeyCode.ARROW_RIGHT) {
            direction = Direction.RIGHT;
        }

        if (isShift) {
            this._commandService.executeCommand(MoveSelectionOperation.id, {
                direction,
            });
        } else {
            this._commandService.executeCommand(MoveCursorOperation.id, {
                direction,
            });
        }
    }

    // WTF: this is should not exist at all. It is because all editor instances reuse the singleton
    // "TextSelectionManagerService" and other modules. Which will be refactored soon in August, 2024.
    private _isCurrentSheetFocused(): boolean {
        return this._instanceSrv.getFocusedUnit()?.getUnitId() === this._context.unitId;
    }
}

export function getCellDataByInput(
    cellData: ICellData,
    documentLayoutObject: IDocumentLayoutObject,
    lexerTreeBuilder: LexerTreeBuilder,
    getSnapshot: (data: DocumentDataModel) => IDocumentData
) {
    cellData = Tools.deepClone(cellData);

    const { documentModel } = documentLayoutObject;
    if (documentModel == null) {
        return null;
    }

    const snapshot = getSnapshot(documentModel);

    const { body } = snapshot;
    if (body == null) {
        return null;
    }

    cellData.t = undefined;

    const data = body.dataStream;
    const lastString = data.substring(data.length - 2, data.length);
    let newDataStream = lastString === DEFAULT_EMPTY_DOCUMENT_VALUE ? data.substring(0, data.length - 2) : data;

    if (isFormulaString(newDataStream)) {
        if (cellData.f === newDataStream) {
            return null;
        }
        const bracketCount = lexerTreeBuilder.checkIfAddBracket(newDataStream);
        for (let i = 0; i < bracketCount; i++) {
            newDataStream += matchToken.CLOSE_BRACKET;
        }

        cellData.f = newDataStream;
        cellData.v = null;
        cellData.p = null;
    } else if (isForceString(newDataStream)) {
        const v = extractStringFromForceString(newDataStream);
        cellData.v = v;
        cellData.f = null;
        cellData.si = null;
        cellData.p = null;
        cellData.t = CellValueType.FORCE_STRING;
    } else if (isRichText(body)) {
        if (body.dataStream === '\r\n') {
            cellData.v = '';
            cellData.f = null;
            cellData.si = null;
            cellData.p = null;
        } else {
            cellData.p = snapshot;
            cellData.v = null;
            cellData.f = null;
            cellData.si = null;
        }
    } else {
        // If the data is empty, the data is set to null.
        if ((newDataStream === cellData.v || (newDataStream === '' && cellData.v == null)) && cellData.p == null) {
            return null;
        }
        cellData.v = newDataStream;
        cellData.f = null;
        cellData.si = null;
        cellData.p = null;
    }

    return cellData;
}

function isRichText(body: IDocumentBody) {
    const { textRuns = [], paragraphs = [], customRanges, customBlocks = [] } = body;

    return (
        textRuns.some((textRun) => textRun.ts && !Tools.isEmptyObject(textRun.ts)) ||
        paragraphs.some((paragraph) => paragraph.bullet) ||
        paragraphs.length >= 2 ||
        Boolean(customRanges?.length) ||
        customBlocks.length > 0
    );
}

