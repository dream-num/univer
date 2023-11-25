import {
    CURSOR_TYPE,
    IMouseEvent,
    IPointerEvent,
    IRenderManagerService,
    ITextSelectionRenderManager,
} from '@univerjs/base-render';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    Observer,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { getDocObjectById } from '../basics/component-tools';
import { NORMAL_TEXT_SELECTION_PLUGIN_NAME, VIEWPORT_KEY } from '../basics/docs-view-key';
import {
    ISetDocZoomRatioOperationParams,
    SetDocZoomRatioOperation,
} from '../commands/operations/set-doc-zoom-ratio.operation';
import { SetTextSelectionsOperation } from '../commands/operations/text-selection.operation';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

@OnLifecycle(LifecycleStages.Rendered, TextSelectionController)
export class TextSelectionController extends Disposable {
    private _moveInObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _moveOutObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _downObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _dblClickObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _tripleClickObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _loadedMap = new Set();

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ITextSelectionRenderManager
        private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService
    ) {
        super();

        this._renderManagerService.currentRender$.subscribe((unitId) => {
            if (unitId == null) {
                return;
            }

            if (this._currentUniverService.getUniverDocInstance(unitId) == null) {
                return;
            }

            if (!this._loadedMap.has(unitId)) {
                this._initialMain(unitId);
                this._loadedMap.add(unitId);
            }
        });

        this._initialize();
    }

    override dispose(): void {
        this._renderManagerService.getRenderAll().forEach((docObject) => {
            const { mainComponent } = docObject;
            if (mainComponent == null) {
                return;
            }

            mainComponent.onPointerEnterObserver.remove(this._moveInObserver);
            mainComponent.onPointerLeaveObserver.remove(this._moveOutObserver);
            mainComponent.onPointerDownObserver.remove(this._downObserver);
            mainComponent.onDblclickObserver.remove(this._dblClickObserver);
            mainComponent.onTripleClickObserver.remove(this._tripleClickObserver);
        });
    }

    private _initialize() {
        this._onChangeListener();

        this._skeletonListener();

        this._userActionSyncListener();

        this._commandExecutedListener();

        // this._textSelectionManagerService.setCurrentSelection({
        //     pluginName: NORMAL_TEXT_SELECTION_PLUGIN_NAME,
        //     unitId,
        // });
    }

    private _initialMain(unitId: string) {
        const docObject = this._getDocObjectById(unitId);
        if (docObject == null) {
            return;
        }

        const { document, scene } = docObject;
        const viewportMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

        this._moveInObserver = document.onPointerEnterObserver.add(() => {
            document.cursor = CURSOR_TYPE.TEXT;
        });

        this._moveOutObserver = document.onPointerLeaveObserver.add(() => {
            document.cursor = CURSOR_TYPE.DEFAULT;
            scene.resetCursor();
        });

        this._downObserver = document?.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            this._textSelectionRenderManager.eventTrigger(evt, document.getOffsetConfig(), viewportMain);

            if (evt.button !== 2) {
                state.stopPropagation();
            }
        });

        this._dblClickObserver = document?.onDblclickObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this._textSelectionRenderManager.handleDblClick(evt, document.getOffsetConfig(), viewportMain);
        });

        this._tripleClickObserver = document?.onTripleClickObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this._textSelectionRenderManager.handleTripleClick(evt, document.getOffsetConfig(), viewportMain);
        });
    }

    private _onChangeListener() {
        this._textSelectionManagerService.textSelectionInfo$.subscribe((param) => {
            const unitId = this._textSelectionManagerService.getCurrentSelection()?.unitId;
            // Remove all textRanges.
            this._textSelectionRenderManager.removeAllTextRanges();

            if (param == null || unitId == null) {
                return;
            }

            const docSkeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

            const currentRender = this._getDocObjectById(unitId);

            if (currentRender == null || docSkeleton == null) {
                return;
            }

            const { scene, document } = currentRender;

            this._textSelectionRenderManager.addTextRanges(param, {
                scene,
                skeleton: docSkeleton,
                documentOffsetConfig: document.getOffsetConfig(),
            });
        });
    }

    private _userActionSyncListener() {
        this._textSelectionRenderManager.textSelection$.subscribe((textRanges) => {
            const docsObject = this._docSkeletonManagerService.getCurrent();

            if (docsObject == null) {
                return;
            }

            const { unitId } = docsObject;

            this._commandService.executeCommand(SetTextSelectionsOperation.id, {
                unitId,
                pluginName: NORMAL_TEXT_SELECTION_PLUGIN_NAME,
                ranges: textRanges,
            });
        });
    }

    private _getDocObjectById(unitId: string) {
        return getDocObjectById(unitId, this._renderManagerService);
    }

    private _commandExecutedListener() {
        const updateCommandList = [SetDocZoomRatioOperation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as ISetDocZoomRatioOperationParams;
                    const { unitId: documentId } = params;

                    const unitId = this._textSelectionManagerService.getCurrentSelection()?.unitId;

                    if (documentId !== unitId) {
                        return;
                    }

                    this._textSelectionManagerService.refreshSelection();
                }
            })
        );
    }

    private _skeletonListener() {
        this._docSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                return;
            }
            const { unitId, skeleton } = param;

            const currentRender = this._renderManagerService.getRenderById(unitId);

            if (currentRender == null) {
                return;
            }

            const { scene } = currentRender;

            this._textSelectionRenderManager.changeRuntime(skeleton, scene);

            this._textSelectionManagerService.setCurrentSelectionNotRefresh({
                pluginName: NORMAL_TEXT_SELECTION_PLUGIN_NAME,
                unitId,
            });
        });
    }
}
