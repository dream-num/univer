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

import type { ICommandInfo, IDocumentBody, IPosition, Nullable } from '@univerjs/core';
import {
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    Disposable,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_BUT_HIDDEN,
    FOCUSING_EDITOR_STANDALONE,
    FOCUSING_FORMULA_EDITOR,
    FOCUSING_SHEET,
    FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE,
    HorizontalAlign,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    OnLifecycle,
    toDisposable,
    Tools,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import {
    DOCS_COMPONENT_MAIN_LAYER_INDEX,
    DocSkeletonManagerService,
    DocViewModelManagerService,
    RichTextEditingMutation,
    TextSelectionManagerService,
    VIEWPORT_KEY,
} from '@univerjs/docs';
import type { DocumentSkeleton, IDocumentLayoutObject, IEditorInputConfig, Scene } from '@univerjs/engine-render';
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
import { IEditorService, KeyCode, SetEditorResizeOperation } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';

import { filter } from 'rxjs';
import { ClearSelectionFormatCommand } from '@univerjs/sheets';
import { getEditorObject } from '../../basics/editor/get-editor-object';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import styles from '../../views/sheet-container/index.module.less';

const HIDDEN_EDITOR_POSITION = -1000;

const EDITOR_INPUT_SELF_EXTEND_GAP = 5;

const EDITOR_BORDER_SIZE = 2;

interface ICanvasOffset {
    left: number;
    top: number;
}

@OnLifecycle(LifecycleStages.Rendered, StartEditController)
export class StartEditController extends Disposable {
    private _editorVisiblePrevious = false;

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocViewModelManagerService) private readonly _docViewModelManagerService: DocViewModelManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @ICellEditorManagerService private readonly _cellEditorManagerService: ICellEditorManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) protected readonly _localService: LocaleService,
        @IEditorService private readonly _editorService: IEditorService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {
        super.dispose();
    }

    private _initialize() {
        this._initialEditFocusListener();
        this._initialStartEdit();
        this._initialKeyboardListener();
        this._initialCursorSync();
        this._listenEditorFocus();
    }

    private _listenEditorFocus() {
        const renderConfig = this._getEditorObject();

        if (renderConfig == null) {
            return;
        }

        this.disposeWithMe(
            toDisposable(
                renderConfig.document.onPointerDownObserver.add(() => {
                    // fix https://github.com/dream-num/univer/issues/628, need to recalculate the cell editor size after it acquire focus.
                    if (this._editorBridgeService.isVisible()) {
                        const param = this._editorBridgeService.getEditCellState();
                        const unitId = this._editorBridgeService.getCurrentEditorId();

                        if (param == null || unitId == null || !this._editorService.isSheetEditor(unitId)) {
                            return;
                        }

                        const skeleton = this._docSkeletonManagerService.getSkeletonByUnitId(unitId)?.skeleton;

                        if (skeleton == null) {
                            return;
                        }

                        const { position, documentLayoutObject, canvasOffset, scaleX, scaleY } = param;

                        this._fitTextSize(position, canvasOffset, skeleton, documentLayoutObject, scaleX, scaleY);
                    }
                })
            )
        );
    }

    private _initialCursorSync() {
        this.disposeWithMe(
            this._cellEditorManagerService.focus$.pipe(filter((f) => !!f)).subscribe(() => {
                this._textSelectionRenderManager.sync();
            })
        );
    }

    private _initialEditFocusListener() {
        this.disposeWithMe(
            // TODO: After the sheet dispose, recreate the sheet, the first cell edit may be unsuccessful,
            // it should be the editor initialization late, and we need to pay attention to this problem in the future.
            this._editorBridgeService.currentEditCellState$.subscribe((editCellState) => {
                if (editCellState == null || this._editorBridgeService.isForceKeepVisible()) {
                    return;
                }

                const { position, documentLayoutObject, scaleX, editorUnitId } = editCellState;
                const editorObject = this._getEditorObject();
                if (editorObject == null || this._contextService.getContextValue(FOCUSING_EDITOR_STANDALONE) === true || this._contextService.getContextValue(FOCUSING_UNIVER_EDITOR_STANDALONE_SINGLE_MODE) === true) {
                    return;
                }

                const { startX, endX } = position;
                const { textRotation, wrapStrategy, documentModel } = documentLayoutObject;
                const { vertexAngle: angle } = convertTextRotation(textRotation);
                documentModel!.updateDocumentId(editorUnitId);

                if (wrapStrategy === WrapStrategy.WRAP && angle === 0) {
                    documentModel!.updateDocumentDataPageSize((endX - startX) / scaleX);
                }

                this._univerInstanceService.changeDoc(editorUnitId, documentModel!);

                this._contextService.setContextValue(FOCUSING_EDITOR_BUT_HIDDEN, true);

                this._textSelectionManagerService.replaceTextRanges([
                    {
                        startOffset: 0,
                        endOffset: 0,
                    },
                ]);

                this._textSelectionRenderManager.activate(HIDDEN_EDITOR_POSITION, HIDDEN_EDITOR_POSITION);
            })
        );
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
    // eslint-disable-next-line max-lines-per-function
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

        const { document: documentComponent, scene, engine } = editorObject;

        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

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
                viewportMain?.resetCanvasSizeAndUpdateScrollBar();
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
            engine.resizeBySize(
                fixLineWidthByScale(editorWidth, precisionScaleX),
                fixLineWidthByScale(physicHeight, precisionScaleY)
            );
        });

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
    // eslint-disable-next-line max-lines-per-function
    private _initialStartEdit() {
        // eslint-disable-next-line max-lines-per-function
        this.disposeWithMe(this._editorBridgeService.visible$.subscribe((param) => {
            const { visible, eventType, keycode } = param;

            if (visible === this._editorVisiblePrevious) {
                return;
            }

            this._editorVisiblePrevious = visible;

            if (visible === false) {
                this._setOpenForCurrent(null, null);
                return;
            }

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

            const docParam = this._docSkeletonManagerService.getSkeletonByUnitId(editorUnitId);

            if (docParam == null || documentDataModel == null) {
                return;
            }

            const { skeleton } = docParam;

            this._fitTextSize(position, canvasOffset, skeleton, documentLayoutObject, scaleX, scaleY);
            // move selection
            if (
                eventType === DeviceInputEventType.Keyboard ||
                (eventType === DeviceInputEventType.Dblclick && isInArrayFormulaRange)
            ) {
                const snapshot = Tools.deepClone(documentDataModel.getSnapshot());
                const documentViewModel = this._docViewModelManagerService.getViewModel(editorUnitId);

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

                scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)?.scrollTo({
                    y: Number.POSITIVE_INFINITY,
                });

                this._textSelectionManagerService.replaceTextRanges([
                    {
                        startOffset: cursor,
                        endOffset: cursor,
                    },
                ]);
            }

            this._renderManagerService.getRenderById(unitId)?.scene.resetCursor();
        })
        );
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

    private _initialKeyboardListener() {
        this.disposeWithMe(
            this._textSelectionRenderManager.onInputBefore$.subscribe((config) => {
                const isFocusFormulaEditor = this._contextService.getContextValue(FOCUSING_FORMULA_EDITOR);
                const isFocusSheets = this._contextService.getContextValue(FOCUSING_SHEET);
                const unitId = this._univerInstanceService.getCurrentUniverDocInstance()!.getUnitId();

                if (isFocusSheets && !isFocusFormulaEditor && this._editorService.isSheetEditor(unitId)) {
                    this._showEditorByKeyboard(config);
                }
            })
        );
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
        });
    }

    /**
     * Listen to document edits to refresh the size of the sheet editor, not for normal editor.
     */
    private _commandExecutedListener() {
        const updateCommandList = [RichTextEditingMutation.id, SetEditorResizeOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IRichTextEditingMutationParams;
                    const { unitId: commandUnitId } = params;

                    if (!this._editorService.isSheetEditor(commandUnitId)) {
                        return;
                    }

                    const unitId = this._editorBridgeService.getCurrentEditorId();

                    if (unitId == null) {
                        return;
                    }

                    this._editorBridgeService.changeEditorDirty(true);

                    const skeleton = this._docSkeletonManagerService.getSkeletonByUnitId(unitId)?.skeleton;

                    if (skeleton == null) {
                        return;
                    }

                    const param = this._editorBridgeService.getEditCellState();
                    if (param == null) {
                        return;
                    }

                    const { position, documentLayoutObject, canvasOffset, scaleX, scaleY } = param;

                    this._fitTextSize(position, canvasOffset, skeleton, documentLayoutObject, scaleX, scaleY);
                }
            })
        );

        this.disposeWithMe(
            // Use fix https://github.com/dream-num/univer/issues/1231.
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === ClearSelectionFormatCommand.id) {
                    this._editorBridgeService.refreshEditCellState();
                }
            })
        );
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
}
