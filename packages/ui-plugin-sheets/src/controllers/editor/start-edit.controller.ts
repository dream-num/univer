import type { IRichTextEditingMutationParams } from '@univerjs/base-docs';
import {
    DOCS_COMPONENT_MAIN_LAYER_INDEX,
    DocSkeletonManagerService,
    DocViewModelManagerService,
    RichTextEditingMutation,
    TextSelectionManagerService,
    VIEWPORT_KEY,
} from '@univerjs/base-docs';
import type { DocumentSkeleton, IDocumentLayoutObject, IEditorInputConfig, Scene } from '@univerjs/base-render';
import {
    DeviceInputEventType,
    IRenderManagerService,
    ITextSelectionRenderManager,
    Rect,
    ScrollBar,
} from '@univerjs/base-render';
import { KeyCode } from '@univerjs/base-ui';
import type { ICommandInfo, IDocumentBody, IDocumentData, IPosition, ITextRotation, Nullable } from '@univerjs/core';
import {
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    FOCUSING_EDITOR,
    FOCUSING_EDITOR_BUT_HIDDEN,
    FOCUSING_FORMULA_EDITOR,
    HorizontalAlign,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    LifecycleStages,
    LocaleService,
    OnLifecycle,
    Tools,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import type { Subscription } from 'rxjs';

import { getEditorObject } from '../../basics/editor/get-editor-object';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { SetEditorResizeOperation } from '../../commands/operations/set-editor-resize.operation';
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

@OnLifecycle(LifecycleStages.Steady, StartEditController)
export class StartEditController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    private _onInputActivateSubscription: Nullable<Subscription>;

    private _editorVisiblePrevious = false;

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocViewModelManagerService) private readonly _docViewModelManagerService: DocViewModelManagerService,
        @IContextService private readonly _contextService: IContextService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @ICellEditorManagerService private readonly _cellEditorManagerService: ICellEditorManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) protected readonly _localService: LocaleService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    override dispose(): void {
        this._onInputSubscription?.unsubscribe();

        this._onInputActivateSubscription?.unsubscribe();
    }

    private _initialize() {
        this._initialEditFocusListener();
        this._initialStartEdit();
        this._initialKeyboardListener();
        this._initialCursorSync();
    }

    private _initialCursorSync() {
        this._cellEditorManagerService.focus$.subscribe(() => {
            this._textSelectionRenderManager.sync();
        });
    }

    private _initialEditFocusListener() {
        this._onInputSubscription = this._editorBridgeService.state$.subscribe((param) => {
            if (param == null || this._editorBridgeService.isForceKeepVisible()) {
                return;
            }

            const { position, documentLayoutObject, scaleX, editorUnitId } = param;

            const editorObject = this._getEditorObject();

            if (editorObject == null) {
                return;
            }

            const { document: documentComponent, scene } = editorObject;

            const { startX, endX } = position;

            const { textRotation, wrapStrategy, documentModel } = documentLayoutObject;

            const { a: angle } = textRotation as ITextRotation;

            documentModel!.updateDocumentId(editorUnitId);

            // documentModel!.updateDocumentDataMargin(paddingData);

            if (wrapStrategy === WrapStrategy.WRAP && angle === 0) {
                documentModel!.updateDocumentDataPageSize((endX - startX) / scaleX);
            }

            this._currentUniverService.changeDoc(editorUnitId, documentModel!);

            const docParam = this._docSkeletonManagerService.getCurrent();

            if (docParam == null) {
                return;
            }

            const documentSkeleton = docParam.skeleton;

            documentComponent.changeSkeleton(documentSkeleton);

            this._contextService.setContextValue(FOCUSING_EDITOR_BUT_HIDDEN, true);

            this._textSelectionManagerService.replaceTextRanges([
                {
                    startOffset: 0,
                    endOffset: 0,
                    collapsed: true,
                },
            ]);

            this._textSelectionRenderManager.activate(HIDDEN_EDITOR_POSITION, HIDDEN_EDITOR_POSITION);
        });
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
            let offsetTop = paddingData.t || 0;

            if (verticalAlign === VerticalAlign.MIDDLE) {
                offsetTop = (editorHeight - actualHeight) / 2;
            } else if (verticalAlign === VerticalAlign.BOTTOM) {
                offsetTop = editorHeight - actualHeight;
            }

            offsetTop /= scaleY;

            offsetTop = offsetTop < (paddingData.t || 0) ? paddingData.t || 0 : offsetTop;

            documentDataModel.updateDocumentDataMargin({
                t: offsetTop,
            });
        }

        // re-calculate skeleton(viewModel for component)
        documentSkeleton.calculate();

        this._editAreaProcessing(editorWidth, editorHeight, actualRangeWithCoord, canvasOffset, fill);
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

        const { a: angle } = textRotation as ITextRotation;

        const clientWidth = document.body.clientWidth;

        if (wrapStrategy === WrapStrategy.WRAP && angle === 0) {
            const { actualWidth, actualHeight } = documentSkeleton.getActualSize();
            // The skeleton obtains the original volume, which needs to be multiplied by the magnification factor.
            return {
                actualWidth: actualWidth * scaleX,
                actualHeight: actualHeight * scaleY,
            };
        }

        documentDataModel?.updateDocumentDataPageSize(clientWidth - startX - canvasOffset.left);
        documentSkeleton.calculate();

        const size = documentSkeleton.getActualSize();

        let editorWidth = endX - startX;

        if (editorWidth < size.actualWidth * scaleX + EDITOR_INPUT_SELF_EXTEND_GAP) {
            editorWidth = size.actualWidth * scaleX + EDITOR_INPUT_SELF_EXTEND_GAP;
        }

        // Scaling is handled by the renderer, so the skeleton only accepts the original width and height, which need to be divided by the magnification factor.
        documentDataModel?.updateDocumentDataPageSize(editorWidth / scaleX);

        documentDataModel?.updateDocumentRenderConfig({
            horizontalAlign: HorizontalAlign.UNSPECIFIED,
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

        const { startX, startY } = actualRangeWithCoord;

        const { document: documentComponent, scene, engine } = editorObject;

        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

        const clientHeight =
            document.body.clientHeight -
            startY -
            parseFloat(styles.sheetFooterBarHeight) -
            canvasOffset.top -
            EDITOR_BORDER_SIZE * 2;

        const clientWidth = document.body.clientWidth - startX - canvasOffset.left;

        let physicHeight = editorHeight;

        let scrollBar = viewportMain?.getScrollBar() as Nullable<ScrollBar>;

        if (physicHeight > clientHeight) {
            physicHeight = clientHeight;

            if (scrollBar == null) {
                viewportMain && new ScrollBar(viewportMain, { enableHorizontal: false });
            } else {
                viewportMain?.resetSizeAndScrollBar();
            }
        } else {
            scrollBar = null;
            viewportMain?.getScrollBar()?.dispose();
        }

        editorWidth += scrollBar?.barSize || 0;

        if (editorWidth > clientWidth) {
            editorWidth = clientWidth;
        }

        scene.transformByState({
            width: editorWidth,
            height: editorHeight,
        });

        documentComponent.resize(editorWidth, editorHeight);

        this._addBackground(scene, editorWidth, editorHeight, fill);

        // resize canvas
        requestIdleCallback(() => {
            engine.resizeBySize(editorWidth, physicHeight);
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

    private _initialStartEdit() {
        this._onInputActivateSubscription = this._editorBridgeService.visible$.subscribe((param) => {
            const { visible, eventType, keycode } = param;

            if (visible === this._editorVisiblePrevious) {
                return;
            }

            this._editorVisiblePrevious = visible;

            if (visible === false) {
                return;
            }

            const state = this._editorBridgeService.getState();

            if (state == null) {
                return;
            }

            const { position, documentLayoutObject, canvasOffset, scaleX, scaleY, editorUnitId } = state;

            const editorObject = this._getEditorObject();

            if (editorObject == null) {
                return;
            }

            const { document, scene } = editorObject;

            this._contextService.setContextValue(FOCUSING_EDITOR, true);

            const { documentModel: documentDataModel } = documentLayoutObject;

            const docParam = this._docSkeletonManagerService.getSkeletonByUnitId(editorUnitId);

            if (docParam == null || documentDataModel == null) {
                return;
            }

            const { skeleton } = docParam;

            this._fitTextSize(position, canvasOffset, skeleton, documentLayoutObject, scaleX, scaleY);

            // move selection
            if (eventType === DeviceInputEventType.Keyboard) {
                const snapshot = Tools.deepClone(documentDataModel.snapshot) as IDocumentData;
                const documentViewModel = this._docViewModelManagerService.getCurrent()?.docViewModel!;
                this._resetBodyStyle(snapshot.body!);

                documentDataModel.reset(snapshot);
                documentViewModel.reset(documentDataModel);

                document.makeDirty();

                // @JOCS, Why calculate here?
                if (keycode === KeyCode.BACKSPACE) {
                    skeleton.calculate();
                }

                this._textSelectionManagerService.replaceTextRanges([
                    {
                        startOffset: 0,
                        endOffset: 0,
                        collapsed: true,
                    },
                ]);
            } else if (eventType === DeviceInputEventType.Dblclick) {
                // TODO: @JOCS, Get the position close to the cursor after clicking on the cell.
                const cursor = documentDataModel.getBody()!.dataStream.length - 2 || 0;

                scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)?.scrollTo({
                    y: Infinity,
                });

                this._textSelectionManagerService.replaceTextRanges([
                    {
                        startOffset: cursor,
                        endOffset: cursor,
                        collapsed: true,
                    },
                ]);
            }
        });
    }

    private _resetBodyStyle(body: IDocumentBody) {
        body.dataStream = DEFAULT_EMPTY_DOCUMENT_VALUE;

        if (body.textRuns != null) {
            if (body.textRuns.length === 1) {
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
        this._textSelectionRenderManager.onInputBefore$.subscribe((config) => {
            const isFocusFormulaEditor = this._contextService.getContextValue(FOCUSING_FORMULA_EDITOR);

            if (!isFocusFormulaEditor) {
                this._showEditorByKeyboard(config);
            }
        });
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

    // Listen to document edits to refresh the size of the editor.
    private _commandExecutedListener() {
        const updateCommandList = [RichTextEditingMutation.id, SetEditorResizeOperation.id];

        const excludeUnitList = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IRichTextEditingMutationParams;
                    const { unitId: commandUnitId } = params;
                    const unitId = this._editorBridgeService.getCurrentEditorId();

                    if (unitId == null) {
                        return;
                    }

                    const skeleton = this._docSkeletonManagerService.getSkeletonByUnitId(unitId)?.skeleton;

                    if (skeleton == null) {
                        return;
                    }

                    if (!excludeUnitList.includes(commandUnitId)) {
                        return;
                    }

                    const param = this._editorBridgeService.getState();
                    if (param == null) {
                        return;
                    }

                    const { position, documentLayoutObject, canvasOffset, scaleX, scaleY } = param;

                    this._fitTextSize(position, canvasOffset, skeleton, documentLayoutObject, scaleX, scaleY);
                }
            })
        );
    }

    private _getEditorObject() {
        return getEditorObject(this._editorBridgeService.getCurrentEditorId(), this._renderManagerService);
    }
}
