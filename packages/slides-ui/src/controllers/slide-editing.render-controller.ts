/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
    ICommandInfo,
    IDisposable,
    IDocumentBody,
    IPosition,
    Nullable,
    SlideDataModel,
    UnitModel,
} from '@univerjs/core';
import type { IDocObjectParam, IEditorInputConfig } from '@univerjs/docs-ui';
import type {
    DocBackground,
    Documents,
    DocumentSkeleton,
    IDocumentLayoutObject,
    IRenderContext,
    IRenderModule,
    Scene,
} from '@univerjs/engine-render';
import type { IEditorBridgeServiceVisibleParam } from '../services/slide-editor-bridge.service';
import {
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    Direction,
    Disposable,
    DisposableCollection,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_BUT_HIDDEN,
    FOCUSING_EDITOR_STANDALONE,
    FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE,
    HorizontalAlign,
    ICommandService,
    IContextService,
    Inject,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    toDisposable,
    UniverInstanceType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    DocSkeletonManagerService,
    RichTextEditingMutation,
} from '@univerjs/docs';
import { VIEWPORT_KEY as DOC_VIEWPORT_KEY, DOCS_COMPONENT_MAIN_LAYER_INDEX, DOCS_VIEW_KEY, DocSelectionRenderService, IEditorService, MoveCursorOperation, MoveSelectionOperation } from '@univerjs/docs-ui';
import {
    convertTextRotation,
    DeviceInputEventType,
    FIX_ONE_PIXEL_BLUR_OFFSET,
    fixLineWidthByScale,
    getCurrentTypeOfRenderer,
    IRenderManagerService,
    Rect,
    ScrollBar,
} from '@univerjs/engine-render';
import { ILayoutService, KeyCode } from '@univerjs/ui';
import { filter } from 'rxjs';
import { SetTextEditArrowOperation } from '../commands/operations/text-edit.operation';
import { SLIDE_EDITOR_ID } from '../const';
import { ISlideEditorBridgeService } from '../services/slide-editor-bridge.service';
import { ISlideEditorManagerService } from '../services/slide-editor-manager.service';
import { CursorChange } from '../type';

const HIDDEN_EDITOR_POSITION = -1000;

const EDITOR_INPUT_SELF_EXTEND_GAP = 5;

const EDITOR_BORDER_SIZE = 2;

interface ICanvasOffset {
    left: number;
    top: number;
}

export class SlideEditingRenderController extends Disposable implements IRenderModule {
    /**
     * It is used to distinguish whether the user has actively moved the cursor in the editor, mainly through mouse clicks.
     */
    private _cursorChange: CursorChange = CursorChange.InitialState;

    /** If the corresponding unit is active and prepared for editing. */
    private _isUnitEditing = false;

    private _d: Nullable<IDisposable>;

    constructor(
        private readonly _renderContext: IRenderContext<UnitModel>,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @IUndoRedoService private readonly _undoRedoService: IUndoRedoService,
        @IContextService private readonly _contextService: IContextService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISlideEditorBridgeService private readonly _editorBridgeService: ISlideEditorBridgeService,
        @ISlideEditorManagerService private readonly _cellEditorManagerService: ISlideEditorManagerService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) protected readonly _localService: LocaleService,
        @IEditorService private readonly _editorService: IEditorService
    ) {
        super();

        // EditingRenderController is per unit. It should only handle keyboard events when the unit is
        // the current of its type.
        this.disposeWithMe(this._instanceSrv.getCurrentTypeOfUnit$<SlideDataModel>(UniverInstanceType.UNIVER_SLIDE).subscribe((slideDataModel) => {
            if (slideDataModel && slideDataModel.getUnitId() === this._renderContext.unitId) {
                this._d = this._init();
            } else {
                this._disposeCurrent();

                // Force ending editor when he switch to another workbook.
                if (this._isUnitEditing) {
                    this._handleEditorInvisible({
                        visible: false,
                        eventType: DeviceInputEventType.Keyboard,
                        keycode: KeyCode.ESC,
                        unitId: this._renderContext.unitId,
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

        // FIXME: we should not use React component to create editor render, it would make the control
        // flow not controllable.
        setTimeout(() => {
            this._cursorStateListener(d);
        }, 1000);

        return d;
    }

    private _initEditorVisibilityListener(): void {
        this.disposeWithMe(this._editorBridgeService.visible$
            // .pipe(distinctUntilChanged((prev, curr) => prev.visible === curr.visible))
            .subscribe((param) => {
                if (param.visible) {
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
            // ...
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
            getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_DOC, this._instanceSrv, this._renderManagerService)
                ?.with(DocSelectionRenderService)
                .sync();
        }));
    }

    /**
     * Set editorUnitId to curr doc.
     * @param d DisposableCollection
     */
    private _subscribeToCurrentCell(d: DisposableCollection) {
        // first part of editing.
        // startEditing --> _updateEditor --> slide-editor-bridge.service.ts@setEditorRect---> currentEditRectState$.next(editCellState)
        // 2nd part is startEditing --> changeVisible
        d.add(this._editorBridgeService.currentEditRectState$.subscribe((editCellState) => {
            if (editCellState == null) {
                return;
            }

            if (
                this._contextService.getContextValue(FOCUSING_EDITOR_STANDALONE) ||
                this._contextService.getContextValue(FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE)
            ) {
                return;
            }

            const {
                position: { startX, endX },
                documentLayoutObject: { textRotation, wrapStrategy, documentModel },
                scaleX,
                editorUnitId,
            } = editCellState;
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

            // the valid pos of activate:
            // EditorContainer.tsx cellEditorManagerService.setFocus(true) -->
            // ---> _focus$.next --> editingRenderController
            // _textSelectionRenderManager.sync() --> _updateInputPosition --> activate(left, top)

            getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_DOC, this._instanceSrv, this._renderManagerService)
                ?.with(DocSelectionRenderService)
                .activate(HIDDEN_EDITOR_POSITION, HIDDEN_EDITOR_POSITION);
        }));
    }

    /**
     * Set size and pos of editing area.
     * @param positionFromEditRectState
     * @param canvasOffset
     * @param documentSkeleton
     * @param documentLayoutObject
     * @param scaleX
     * @param scaleY
     */
    private _fitTextSize(
        positionFromEditRectState: IPosition,
        canvasOffset: ICanvasOffset,
        documentSkeleton: DocumentSkeleton,
        documentLayoutObject: IDocumentLayoutObject,
        scaleX: number = 1,
        scaleY: number = 1
    ) {
        //size & pos derives from slide-editor-bridge.service.ts@getEditRectState.position
        const { startX, startY, endX, endY } = positionFromEditRectState;
        const documentDataModel = documentLayoutObject.documentModel;

        if (documentDataModel == null) {
            return;
        }

        const { actualWidth, actualHeight } = this._predictingSize(
            positionFromEditRectState,
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

        this._editAreaProcessing(editorWidth, editorHeight, positionFromEditRectState, canvasOffset, fill, scaleX, scaleY);
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
     * control the size of editing area
     */
    // eslint-disable-next-line max-lines-per-function
    private _editAreaProcessing(
        editorWidth: number,
        editorHeight: number,
        positionFromEditRectState: IPosition,
        canvasOffset: ICanvasOffset,
        fill: Nullable<string>,
        scaleX: number = 1,
        scaleY: number = 1
    ) {
        const editorObject = this._getEditorObject();

        if (editorObject == null) {
            return;
        }

        function pxToNum(width: string): number {
            return Number.parseInt(width.replace('px', ''));
        }

        const engine = this._renderContext.engine;
        const canvasElement = engine.getCanvasElement();
        const canvasClientRect = canvasElement.getBoundingClientRect();

        // We should take the scale into account when canvas is scaled by CSS.
        const widthOfCanvas = pxToNum(canvasElement.style.width); // declared width
        const { top, left, width } = canvasClientRect; // real width affected by scale
        const scaleAdjust = width / widthOfCanvas;

        let { startX, startY } = positionFromEditRectState;

        startX += canvasOffset.left;
        startY += canvasOffset.top;

        const { document: documentComponent, scene: editorScene, engine: docEngine } = editorObject;

        const viewportMain = editorScene.getViewport(DOC_VIEWPORT_KEY.VIEW_MAIN);

        const clientHeight =
            document.body.clientHeight -
            startY -
            canvasOffset.top -
            EDITOR_BORDER_SIZE * 2;

        const clientWidth = document.body.clientWidth - startX - canvasOffset.left;

        let physicHeight = editorHeight;

        let scrollBar = viewportMain?.getScrollBar() as Nullable<ScrollBar>;

        if (physicHeight > clientHeight) {
            physicHeight = clientHeight;

            if (scrollBar == null) {
                if (viewportMain) {
                    const sb = new ScrollBar(viewportMain, { enableHorizontal: false, barSize: 8 });
                }
            } else {
                viewportMain?.resetCanvasSizeAndUpdateScroll();
            }
        } else {
            scrollBar = null;
            viewportMain?.getScrollBar()?.dispose();
        }

        editorWidth += scrollBar?.barSize || 0;

        editorWidth = Math.min(editorWidth, clientWidth);

        startX -= FIX_ONE_PIXEL_BLUR_OFFSET;

        startY -= FIX_ONE_PIXEL_BLUR_OFFSET;

        // physicHeight = editorHeight;

        this._addBackground(editorScene, editorWidth / scaleX, editorHeight / scaleY, fill);

        const { scaleX: precisionScaleX, scaleY: precisionScaleY } = editorScene.getPrecisionScale();

        editorScene.transformByState({
            width: editorWidth * scaleAdjust / scaleX,
            height: editorHeight * scaleAdjust / scaleY,
            scaleX: scaleX * scaleAdjust,
            scaleY: scaleY * scaleAdjust,
        });

        documentComponent.resize(editorWidth / scaleX, editorHeight / scaleY);

        /**
         * sometimes requestIdleCallback is invalid, so use setTimeout to ensure the successful execution of the resizeBySize method.
         * resize canvas
         * When modifying the selection area for a formula, it is necessary to add a setTimeout to ensure successful updating.
         */
        setTimeout(() => {
            docEngine.resizeBySize(
                fixLineWidthByScale(editorWidth, precisionScaleX),
                fixLineWidthByScale(physicHeight, precisionScaleY)
            );
        }, 0);

        const contentBoundingRect = this._layoutService.getContentElement().getBoundingClientRect();
        const canvasBoundingRect = canvasElement.getBoundingClientRect();
        startX = startX * scaleAdjust + (canvasBoundingRect.left - contentBoundingRect.left);
        startY = startY * scaleAdjust + (canvasBoundingRect.top - contentBoundingRect.top);

        // Update cell editor container position and size.
        this._cellEditorManagerService.setState({
            startX,
            startY,
            endX: editorWidth * scaleAdjust + startX,
            endY: physicHeight * scaleAdjust + startY,
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

    /**
     * Show input area, resize input area and then place input to right place.
     * @TODO why do resize in show input area?
     * @param param
     */
    // handleVisible is the 2nd part of editing.
    // first part: startEditing --> _updateEditor
    // 2nd part: startEditing --> changeVisible --> slide-editor-bridge.render-controller.ts@changeVisible --> _editorBridgeService.changeVisible
    private _handleEditorVisible(param: IEditorBridgeServiceVisibleParam) {
        const { eventType } = param;

        // Change `CursorChange` to changed status, when formula bar clicked.
        this._cursorChange =
            [DeviceInputEventType.PointerDown, DeviceInputEventType.Dblclick].includes(eventType)
                ? CursorChange.CursorChange
                : CursorChange.StartEditor;

        const editCellState = this._editorBridgeService.getEditRectState();
        if (editCellState == null) {
            return;
        }

        const {
            position,
            documentLayoutObject,
            slideCardOffset: canvasOffset,
            scaleX,
            scaleY,
            editorUnitId,
            unitId,
        } = editCellState;

        const editorObject = this._getEditorObject();

        if (editorObject == null) {
            return;
        }

        const { scene } = editorObject;

        this._contextService.setContextValue(EDITOR_ACTIVATED, true);

        const { documentModel: documentDataModel } = documentLayoutObject;
        const skeleton = this._getEditorSkeleton(editorUnitId);
        if (!skeleton || !documentDataModel) {
            return;
        }

        // core function! set editing area size and pos
        this._fitTextSize(position, canvasOffset, skeleton, documentLayoutObject, scaleX, scaleY);

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
        // d.add(this._textSelectionRenderManager.onInputBefore$.subscribe((config) => {
        //     // const isFocusFormulaEditor = this._contextService.getContextValue(FORMULA_EDITOR_ACTIVATED);
        //     // const isFocusSheets = this._contextService.getContextValue(FOCUSING_SHEET);

        //     // // TODO@Jocs: should get editor instead of current doc
        //     // const unitId = this._instanceSrv.getCurrentUniverDocInstance()?.getUnitId();
        //     // if (unitId && isFocusSheets && !isFocusFormulaEditor && this._editorService.isSheetEditor(unitId)) {
        //     //     this._showEditorByKeyboard(config);
        //     // }
        // }));
    }

    private _showEditorByKeyboard(config: Nullable<IEditorInputConfig>) {
        if (config == null) {
            //..
        }

        // const event = config.event as KeyboardEvent;

        // this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
        //     visible: true,
        //     eventType: DeviceInputEventType.Keyboard,
        //     keycode: event.which,
        //     unitId: this._context.unitId,
        // });
    }

    private _commandExecutedListener(d: DisposableCollection) {
        const moveCursorOP = [SetTextEditArrowOperation.id];
        const editedMutations = [RichTextEditingMutation.id];

        d.add(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            // Only should do something when it is the current editor.
            // FIXME: listen to command execution is pretty expensive. We should
            // have multi editor instances and only handle event from a single editor.
            if (this._editorService.getFocusId() !== SLIDE_EDITOR_ID) {
            // if (this._editorService.getFocusId() !== this._renderContext.unitId) {
                return;
            }

            if (moveCursorOP.includes(command.id)) {
                this._moveCursorCmdHandler(command);
            }

            if (editedMutations.includes(command.id)) {
                if (this._editorBridgeService.isVisible()) {
                    this._editingChangedHandler();
                }
            }
        }));
    }

    private _moveCursorCmdHandler(command: ICommandInfo) {
        const params = command.params as IEditorBridgeServiceVisibleParam & { isShift: boolean };
        const { keycode, isShift } = params;

        /**
         * After the user enters the editor and actively moves the editor selection area with the mouse,
         * the up, down, left, and right keys can no longer switch editing cells,
         * but move the cursor within the editor instead.
         */
        if (keycode != null && this._cursorChange === CursorChange.CursorChange
        ) {
            this._moveInEditor(keycode, isShift);
        } else {
            // TODO @Jocs: After we merging editor related controllers, this seems verbose.
            this._editorBridgeService.changeVisible(params);
        }
    }

    private _editingChangedHandler() {
        const editRect = this._editorBridgeService.getEditorRect();
        if (!editRect) {
            return;
        }
        const editingRichText = editRect.richTextObj;
        editingRichText.refreshDocumentByDocData();
        editingRichText.resizeToContentSize();

        const { unitId } = this._renderContext;
        this._handleEditorVisible({ visible: true, eventType: 3, unitId });
    }

    private _getEditorObject() {
        return getEditorObject(this._editorBridgeService.getCurrentEditorId(), this._renderManagerService);
    }

    private async _handleEditorInvisible(param: IEditorBridgeServiceVisibleParam) {
        const { keycode } = param;

        this._cursorChange = CursorChange.InitialState;

        this._exitInput(param);

        const editCellState = this._editorBridgeService.getEditRectState();
        if (editCellState == null) {
            return;
        }

        // const { unitId, documentLayoutObject } = editCellState;

        // If neither the formula bar editor nor the cell editor has been edited,
        // it is considered that the content has not changed and returns directly.
        const editorIsDirty = this._editorBridgeService.getEditorDirty();
        if (editorIsDirty === false) {
            this._moveCursor(keycode);
            return;
        }

        // moveCursor need to put behind of SetRangeValuesCommand, fix https://github.com/dream-num/univer/issues/1155
        this._moveCursor(keycode);
    }

    private _exitInput(param: IEditorBridgeServiceVisibleParam) {
        this._contextService.setContextValue(EDITOR_ACTIVATED, false);

        this._cellEditorManagerService.setState({
            show: param.visible,
        });
        const editorUnitId = this._editorBridgeService.getCurrentEditorId();
        if (editorUnitId == null) {
            return;
        }
        this._undoRedoService.clearUndoRedo(editorUnitId);
    }

    private _moveCursor(keycode?: KeyCode) {
        if (keycode == null) {
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
    }

    /**
     * The user's operations follow the sequence of opening the editor and then moving the cursor.
     * The logic here predicts the user's first cursor movement behavior based on this rule
     */
    private _cursorStateListener(d: DisposableCollection) {
        const editorObject = this._getEditorObject();
        if (!editorObject) {
            return;
        }
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
}

export function getEditorObject(
    unitId: Nullable<string>,
    renderManagerService: IRenderManagerService
): Nullable<IDocObjectParam> {
    if (unitId == null) {
        return;
    }

    const currentRender = renderManagerService.getRenderById(unitId);

    if (currentRender == null) {
        return;
    }

    const { mainComponent, scene, engine, components } = currentRender;

    const document = mainComponent as Documents;
    const docBackground = components.get(DOCS_VIEW_KEY.BACKGROUND) as DocBackground;

    return {
        document,
        docBackground,
        scene,
        engine,
    };
}
