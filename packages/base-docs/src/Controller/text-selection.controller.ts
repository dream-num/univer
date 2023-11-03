import {
    CURSOR_TYPE,
    cursorConvertToTextSelection,
    Documents,
    getOneTextSelectionRange,
    IMouseEvent,
    IPointerEvent,
    IRenderManagerService,
    ITextSelectionRangeWithStyle,
    ITextSelectionRenderManager,
    NodePositionConvertToCursor,
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

import { getDocObjectById } from '../Basics/component-tools';
import { NORMAL_TEXT_SELECTION_PLUGIN_NAME, VIEWPORT_KEY } from '../Basics/docs-view-key';
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
            const document = mainComponent as Documents;
            document.onPointerEnterObserver.remove(this._moveInObserver);
            document.onPointerLeaveObserver.remove(this._moveOutObserver);
            document.onPointerLeaveObserver.remove(this._downObserver);
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
    }

    private _onChangeListener() {
        this._textSelectionManagerService.textSelectionInfo$.subscribe((param) => {
            const unitId = this._textSelectionManagerService.getCurrentSelection()?.unitId;
            this._textSelectionRenderManager.reset();
            if (param == null || unitId == null) {
                return;
            }

            const docSkeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

            const currentRender = this._getDocObjectById(unitId);

            if (currentRender == null || docSkeleton == null) {
                return;
            }

            const { scene, document } = currentRender;

            for (const selectionWithStyle of param) {
                const textSelection = cursorConvertToTextSelection(
                    scene,
                    selectionWithStyle,
                    docSkeleton,
                    document.getOffsetConfig()
                );
                this._textSelectionRenderManager.add(textSelection);
            }

            this._textSelectionRenderManager.sync();

            this._textSelectionRenderManager.scroll();
        });
    }

    private _userActionSyncListener() {
        this._textSelectionRenderManager.textSelection$.subscribe((textSelections) => {
            const docsObject = this._docSkeletonManagerService.getCurrent();

            if (docsObject == null) {
                return;
            }

            const { skeleton: docSkeleton, unitId } = docsObject;

            const document = this._getDocObjectById(unitId)?.document;

            if (document == null) {
                return;
            }

            const convert = new NodePositionConvertToCursor(document.getOffsetConfig(), docSkeleton);

            this._commandService.executeCommand(SetTextSelectionsOperation.id, {
                unitId,
                pluginName: NORMAL_TEXT_SELECTION_PLUGIN_NAME,
                ranges: textSelections
                    .map((textSelection) => {
                        let { endNodePosition } = textSelection;
                        const { startNodePosition } = textSelection;
                        if (endNodePosition == null) {
                            endNodePosition = startNodePosition;
                        }
                        const rangeList = convert.getRangePointData(startNodePosition, endNodePosition).cursorList;
                        return getOneTextSelectionRange(rangeList);
                    })
                    .filter((x) => x !== null) as ITextSelectionRangeWithStyle[],
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

            this._textSelectionManagerService.setCurrentSelection({
                pluginName: NORMAL_TEXT_SELECTION_PLUGIN_NAME,
                unitId,
            });
        });
    }
}
