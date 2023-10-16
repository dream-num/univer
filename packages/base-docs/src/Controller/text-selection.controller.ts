import {
    CURSOR_TYPE,
    cursorConvertToTextSelection,
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

import { getDocObject, IDocObjectParam } from '../Basics/component-tools';
import { VIEWPORT_KEY } from '../Basics/docs-view-key';
import { ISetZoomRatioMutationParams, SetZoomRatioMutation } from '../commands/mutations/set-zoom-ratio.mutation';
import { SetTextSelectionsOperation } from '../commands/operations/text-selection.operation';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';
import {
    NORMAL_TEXT_SELECTION_PLUGIN_NAME,
    TextSelectionManagerService,
} from '../services/text-selection-manager.service';

@OnLifecycle(LifecycleStages.Rendered, TextSelectionController)
export class TextSelectionController extends Disposable {
    private _moveInObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _moveOutObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _downObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

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

        this._initialize();
    }

    override dispose(): void {
        const docObject = this._getDocObject();
        if (docObject == null) {
            return;
        }
        const { document, scene } = docObject;
        document.onPointerEnterObserver.remove(this._moveInObserver);
        document.onPointerLeaveObserver.remove(this._moveOutObserver);
        document.onPointerLeaveObserver.remove(this._downObserver);
    }

    private _initialize() {
        const documentModel = this._currentUniverService.getCurrentUniverDocInstance();

        const docObject = this._getDocObject();
        if (docObject == null) {
            return;
        }

        this._onChangeListener();

        this._initialMain(docObject);

        this._skeletonListener();

        this._commandExecutedListener();

        this._userActionSyncListener();

        const unitId = documentModel.getUnitId();

        this._textSelectionManagerService.setCurrentSelection({
            pluginName: NORMAL_TEXT_SELECTION_PLUGIN_NAME,
            unitId,
        });
    }

    private _initialMain(docObject: IDocObjectParam) {
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
            this._textSelectionRenderManager.eventTrigger(evt, document.getOffsetConfig());
            if (evt.button !== 2) {
                state.stopPropagation();
            }
        });
    }

    private _onChangeListener() {
        this._textSelectionManagerService.textSelectionInfo$.subscribe((param) => {
            this._textSelectionRenderManager.reset();
            if (param == null) {
                return;
            }

            const docSkeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

            const currentRender = this._getDocObject();

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
        });
    }

    private _userActionSyncListener() {
        this._textSelectionRenderManager.textSelection$.subscribe((textSelections) => {
            const documentModel = this._currentUniverService.getCurrentUniverDocInstance();
            const unitId = documentModel.getUnitId();

            const docSkeleton = this._docSkeletonManagerService.getCurrent()?.skeleton;

            const document = this._getDocObject()?.document;

            if (docSkeleton == null || document == null) {
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

    private _getDocObject() {
        return getDocObject(this._currentUniverService, this._renderManagerService);
    }

    private _commandExecutedListener() {
        const updateCommandList = [SetZoomRatioMutation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const documentModel = this._currentUniverService.getCurrentUniverDocInstance();

                    const params = command.params as ISetZoomRatioMutationParams;
                    const { documentId } = params;
                    if (documentId !== documentModel.getUnitId()) {
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
