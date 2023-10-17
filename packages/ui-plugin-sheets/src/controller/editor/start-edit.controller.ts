import { DocSkeletonManagerService, TextSelectionManagerService } from '@univerjs/base-docs';
import {
    DeviceInputEventType,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentSkeleton,
    IEditorInputConfig,
    IRenderManagerService,
    ITextSelectionRenderManager,
} from '@univerjs/base-render';
import { IEditorBridgeService } from '@univerjs/base-sheets';
import {
    Disposable,
    ICommandService,
    ICurrentUniverService,
    ITextRotation,
    LifecycleStages,
    LocaleService,
    makeCellToSelection,
    Nullable,
    OnLifecycle,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subscription } from 'rxjs';

import { getEditorObject } from '../../Basics/editor/get-editor-object';
import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';

const HIDDEN_EDITOR_POSITION = -1000;

@OnLifecycle(LifecycleStages.Steady, StartEditController)
export class StartEditController extends Disposable {
    private _onInputSubscription: Nullable<Subscription>;

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
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
    }

    private _initialize() {
        this._initialEditFocusListener();
        this._initialStartEdit();
        this._initialKeyboardListener();
    }

    private _initialEditFocusListener() {
        this._editorBridgeService.state$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const { unitId, sheetId, primaryWithCoord, documentLayoutObject } = param;

            const editorObject = this._getEditorObject();

            if (editorObject == null) {
                return;
            }

            const { document, scene, engine } = editorObject;

            const actualRangeWithCoord = makeCellToSelection(primaryWithCoord);

            if (actualRangeWithCoord == null) {
                return;
            }

            const { startX, startY, endX, endY } = actualRangeWithCoord;

            const { textRotation, verticalAlign, wrapStrategy, documentModel } = documentLayoutObject;

            const { a: angle } = textRotation as ITextRotation;

            const documentSkeleton = DocumentSkeleton.create(documentModel!, this._localService);

            if (wrapStrategy === WrapStrategy.WRAP && angle === 0) {
                documentSkeleton.getModel().updateDocumentDataPageSize(endX - startX);
            }

            documentSkeleton.calculate();

            const { actualWidth, actualHeight } = documentSkeleton.getActualSize();

            let editorWidth = endX - startX;
            let editorHeight = endY - startY;

            if (editorWidth < actualWidth) {
                editorWidth = actualWidth;
            }

            if (editorHeight < actualHeight) {
                editorHeight = actualHeight;
            } else {
                let offsetTop = 0;
                if (verticalAlign === VerticalAlign.MIDDLE) {
                    offsetTop = (editorHeight - actualHeight) / 2;
                } else if (verticalAlign === VerticalAlign.BOTTOM) {
                    offsetTop = editorHeight - actualHeight;
                }
                documentSkeleton.getModel().updateDocumentDataMargin({
                    t: offsetTop,
                });
                documentSkeleton.calculate();
            }

            engine.resizeBySize(editorWidth, editorHeight);

            scene.transformByState({
                width: editorWidth,
                height: editorHeight,
            });

            document.changeSkeleton(documentSkeleton);

            document.resize(editorWidth, editorHeight);

            this._textSelectionRenderManager.changeRuntime(documentSkeleton, scene);

            this._textSelectionRenderManager.active(HIDDEN_EDITOR_POSITION, HIDDEN_EDITOR_POSITION);
        });
    }

    private _initialStartEdit() {
        this._editorBridgeService.visible$.subscribe((state) => {
            if (state.visible === false) {
                this._cellEditorManagerService.setState({
                    show: state.visible,
                });
                return;
            }
            const param = this._editorBridgeService.getState();
            if (param == null) {
                return;
            }

            const { primaryWithCoord } = param;

            if (primaryWithCoord == null) {
                return;
            }

            const actualRangeWithCoord = makeCellToSelection(primaryWithCoord);

            if (actualRangeWithCoord == null) {
                return;
            }

            const { startX, startY, endX, endY } = actualRangeWithCoord;

            this._cellEditorManagerService.setState({
                startX,
                startY,
                endX,
                endY,
                show: state.visible,
            });
        });
    }

    private _initialKeyboardListener() {
        this._textSelectionRenderManager.onInput$.subscribe(this._showEditorByKeyboard.bind(this));
        this._textSelectionRenderManager.onCompositionstart$.subscribe(this._showEditorByKeyboard.bind(this));
    }

    private _showEditorByKeyboard(config: Nullable<IEditorInputConfig>) {
        if (config == null) {
            return;
        }
        // const { event, content, activeRange, selectionList } = config;

        this._editorBridgeService.show(DeviceInputEventType.Keyboard);
    }

    private _commandExecutedListener() {}

    private _getEditorObject() {
        return getEditorObject(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, this._renderManagerService);
    }

    private _getFormulaBarEditorObject() {
        return getEditorObject(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, this._renderManagerService);
    }
}
