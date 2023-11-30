import type { IRichTextEditingMutationParams } from '@univerjs/base-docs';
import {
    DocSkeletonManagerService,
    DocViewModelManagerService,
    getDocObject,
    RichTextEditingMutation,
    VIEWPORT_KEY,
} from '@univerjs/base-docs';
import type { IMouseEvent, IPointerEvent, RenderComponentType } from '@univerjs/base-render';
import { DeviceInputEventType, IRenderManagerService } from '@univerjs/base-render';
import type { ICommandInfo, Nullable, Observer } from '@univerjs/core';
import {
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    FOCUSING_FORMULA_EDITOR,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { type Subscription } from 'rxjs';

import { getEditorObject } from '../../basics/editor/get-editor-object';
import { IFormulaEditorManagerService } from '../../services/editor/formula-editor-manager.service';
import { IEditorBridgeService } from '../../services/editor-bridge.service';

@OnLifecycle(LifecycleStages.Steady, FormulaEditorController)
export class FormulaEditorController extends Disposable {
    private _onSheetSelectionSubscription: Nullable<Subscription>;

    private _documentComponent: Nullable<RenderComponentType> = null;

    private _downObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _loadedMap: Set<string> = new Set();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IEditorBridgeService private readonly _editorBridgeService: IEditorBridgeService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocViewModelManagerService) private readonly _docViewModelManagerService: DocViewModelManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @IFormulaEditorManagerService private readonly _formulaEditorManagerService: IFormulaEditorManagerService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        this._onSheetSelectionSubscription?.unsubscribe();

        if (this._documentComponent) {
            this._documentComponent.onPointerDownObserver.remove(this._downObserver);
        }
    }

    private _initialize() {
        this._syncFormulaEditorContent();
        this._commandExecutedListener();
        this._syncEditorSize();

        this._renderManagerService.currentRender$.subscribe((unitId) => {
            if (unitId !== DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY) {
                return;
            }

            if (!this._loadedMap.has(unitId)) {
                this._initialMain(unitId);
                this._loadedMap.add(unitId);
            }
        });
    }

    private _initialMain(unitId: string) {
        const formulaEditorDocObject = this._renderManagerService.getRenderById(unitId);
        if (formulaEditorDocObject == null) {
            return;
        }

        const { mainComponent: documentComponent } = formulaEditorDocObject;

        if (documentComponent == null) {
            return;
        }

        this._documentComponent = documentComponent;

        this._downObserver = documentComponent.onPointerDownObserver.add((params) => {
            this._contextService.setContextValue(FOCUSING_FORMULA_EDITOR, true);

            const visibleState = this._editorBridgeService.isVisible();
            if (visibleState.visible === false) {
                this._editorBridgeService.changeVisible({
                    visible: true,
                    eventType: DeviceInputEventType.PointerDown,
                });
            }
        });
    }

    // Listen to changes in the size of the formula editor container to set the size of the editor.
    private _syncEditorSize() {
        this._formulaEditorManagerService.position$.subscribe((position) => {
            if (position == null) {
                return;
            }
            const editorObject = getEditorObject(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, this._renderManagerService);

            if (editorObject == null) {
                return;
            }

            const { width, height } = position;

            const { document: documentComponent, scene, engine } = editorObject;

            const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

            viewportMain?.getScrollBar()?.dispose();

            scene.transformByState({
                width,
                height,
            });

            documentComponent.resize(width, height);

            // resize canvas
            requestIdleCallback(() => {
                engine.resizeBySize(width, height);
            });
        });
    }

    // Sync cell content to formula editor bar when sheet selection changed.
    private _syncFormulaEditorContent() {
        this._onSheetSelectionSubscription = this._editorBridgeService.state$.subscribe((param) => {
            if (param == null || this._editorBridgeService.isForceKeepVisible()) {
                return;
            }

            const content = param.documentLayoutObject.documentModel?.getBody()?.dataStream;

            if (content == null) {
                return;
            }

            this._syncContentAndRender(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, content);
        });
    }

    private _commandExecutedListener() {
        // sync cell content to formula editor bar when edit cell editor.
        const updateCommandList = [RichTextEditingMutation.id];

        const INCLUDE_LIST = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IRichTextEditingMutationParams;
                    const { unitId } = params;

                    if (INCLUDE_LIST.includes(unitId)) {
                        const editorDocDataModel = this._univerInstanceService.getUniverDocInstance(unitId);
                        const content = editorDocDataModel?.getBody()!.dataStream;
                        const syncId =
                            unitId === DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY
                                ? DOCS_NORMAL_EDITOR_UNIT_ID_KEY
                                : DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY;

                        if (content == null) {
                            return;
                        }

                        this._syncContentAndRender(syncId, content);
                    }
                }
            })
        );
    }

    private _syncContentAndRender(unitId: string, content: string) {
        const INCLUDE_LIST = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];

        const docsSkeletonObject = this._docSkeletonManagerService.getSkeletonByUnitId(unitId);
        const docDataModel = this._univerInstanceService.getUniverDocInstance(unitId);
        const docViewModel = this._docViewModelManagerService.getViewModel(unitId);

        if (docDataModel == null || docViewModel == null) {
            return;
        }

        docDataModel.getBody()!.dataStream = content;

        docViewModel.reset(docDataModel);

        if (docsSkeletonObject == null) {
            return;
        }

        const { skeleton } = docsSkeletonObject;

        const currentRender = this._renderManagerService.getRenderById(unitId);

        if (currentRender == null) {
            return;
        }

        skeleton.calculate();

        if (INCLUDE_LIST.includes(unitId)) {
            currentRender.mainComponent?.makeDirty();
        }
    }

    private _getDocObject() {
        return getDocObject(this._univerInstanceService, this._renderManagerService);
    }
}
