import { DocSkeletonManagerService, TextSelectionManagerService } from '@univerjs/base-docs';
import {
    DeviceInputEventType,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    IEditorInputConfig,
    IRenderManagerService,
    ITextSelectionRenderManager,
} from '@univerjs/base-render';
import { IEditorBridgeService } from '@univerjs/base-sheets';
import {
    Disposable,
    ICommandService,
    ICurrentUniverService,
    LifecycleStages,
    makeCellToSelection,
    Nullable,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { Subscription } from 'rxjs';

import { getEditorObject } from '../../Basics/editor/get-editor-object';
import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';

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
        @ICommandService private readonly _commandService: ICommandService
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

            const { unitId, sheetId, primaryWithCoord, docSkeleton } = param;

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

            const { actualWidth, actualHeight } = docSkeleton.getActualSize();

            let editorWidth = endX - startX;
            let editorHeight = endY - startY;

            if (editorWidth < actualWidth) {
                editorWidth = actualWidth;
            }

            if (editorHeight < actualHeight) {
                editorHeight = actualHeight;
            }

            engine.resizeBySize(editorWidth, editorHeight);

            scene.transformByState({
                width: editorWidth,
                height: editorHeight,
            });

            document.changeSkeleton(docSkeleton);

            document.resize(editorWidth, editorHeight);

            this._textSelectionRenderManager.changeRuntime(docSkeleton, scene);

            this._textSelectionRenderManager.active(-1000, -1000);
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

            const { unitId, sheetId, primaryWithCoord, docSkeleton } = param;

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
        const { event, content, activeRange, selectionList } = config;

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
