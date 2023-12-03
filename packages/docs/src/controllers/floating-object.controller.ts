import { Documents, DocumentSkeleton, IRender, IRenderManagerService, Liquid } from '@univerjs/engine-render';
import {
    DEFAULT_DOCUMENT_SUB_COMPONENT_ID,
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandInfo,
    ICommandService,
    IFloatingObjectManagerParam,
    IFloatingObjectManagerService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { IRichTextEditingMutationParams, RichTextEditingMutation } from '../commands/mutations/core-editing.mutation';
import { SetDocZoomRatioOperation } from '../commands/operations/set-doc-zoom-ratio.operation';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Steady, FloatingObjectController)
export class FloatingObjectController extends Disposable {
    private _liquid = new Liquid();

    private _pageMarginCache = new Map<string, { marginLeft: number; marginTop: number }>();

    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IFloatingObjectManagerService private readonly _floatingObjectManagerService: IFloatingObjectManagerService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    private _initialize() {
        this._initialRenderRefresh();

        this._updateOnPluginChange();
    }

    private _updateOnPluginChange() {
        this._floatingObjectManagerService.pluginUpdate$.subscribe((params) => {
            const docsSkeletonObject = this._docSkeletonManagerService.getCurrent();

            if (docsSkeletonObject == null) {
                return;
            }

            const { unitId, skeleton } = docsSkeletonObject;

            const currentRender = this._renderManagerService.getRenderById(unitId);

            if (currentRender == null) {
                return;
            }

            const { mainComponent, components, scene } = currentRender;

            const docsComponent = mainComponent as Documents;

            const { left: docsLeft, top: docsTop } = docsComponent;

            params.forEach((param) => {
                const { unitId, subComponentId, floatingObjectId, floatingObject } = param;

                const { left = 0, top = 0, width = 0, height = 0, angle, flipX, flipY, skewX, skewY } = floatingObject;

                const cache = this._pageMarginCache.get(floatingObjectId);

                const marginLeft = cache?.marginLeft || 0;
                const marginTop = cache?.marginTop || 0;

                skeleton
                    ?.getViewModel()
                    .getDataModel()
                    .updateDrawing(floatingObjectId, {
                        left: left - docsLeft - marginLeft,
                        top: top - docsTop - marginTop,
                        height,
                        width,
                    });
            });

            skeleton?.calculate();
            mainComponent?.makeDirty();
        });
    }

    private _initialRenderRefresh() {
        this._docSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const { skeleton: documentSkeleton, unitId } = param;

            const currentRender = this._renderManagerService.getRenderById(unitId);

            if (currentRender == null) {
                return;
            }

            const { mainComponent } = currentRender;

            const docsComponent = mainComponent as Documents;

            docsComponent.changeSkeleton(documentSkeleton);

            this._refreshFloatingObject(unitId, documentSkeleton, currentRender);
        });
    }

    private _commandExecutedListener() {
        const updateCommandList = [RichTextEditingMutation.id, SetDocZoomRatioOperation.id];

        const excludeUnitList = [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (updateCommandList.includes(command.id)) {
                    const params = command.params as IRichTextEditingMutationParams;
                    const { unitId: commandUnitId } = params;

                    const docsSkeletonObject = this._docSkeletonManagerService.getCurrent();

                    if (docsSkeletonObject == null) {
                        return;
                    }

                    const { unitId, skeleton } = docsSkeletonObject;

                    if (commandUnitId !== unitId) {
                        return;
                    }

                    const currentRender = this._renderManagerService.getRenderById(unitId);

                    if (currentRender == null) {
                        return;
                    }

                    if (excludeUnitList.includes(unitId)) {
                        currentRender.mainComponent?.makeDirty();
                        return;
                    }

                    this._refreshFloatingObject(unitId, skeleton, currentRender);

                    // this.calculatePagePosition(currentRender);
                }
            })
        );
    }

    private _refreshFloatingObject(unitId: string, skeleton: DocumentSkeleton, currentRender: IRender) {
        const skeletonData = skeleton?.getSkeletonData();

        const { mainComponent, scene } = currentRender;

        const documentComponent = mainComponent as Documents;

        if (!skeletonData) {
            return;
        }

        const { left: docsLeft, top: docsTop, pageLayoutType, pageMarginLeft, pageMarginTop } = documentComponent;

        const { pages } = skeletonData;

        const Objects: IFloatingObjectManagerParam[] = [];

        const { scaleX, scaleY } = scene.getAncestorScale();

        this._liquid.reset();

        this._pageMarginCache.clear();

        // const objectList: BaseObject[] = [];
        // const pageMarginCache = new Map<string, { marginLeft: number; marginTop: number }>();

        // const cumPageLeft = 0;
        // const cumPageTop = 0;
        /**
         * TODO: @DR-Univer We should not refresh all floating elements, but instead make a diff.
         */
        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            const { skeDrawings, marginLeft, marginTop } = page;

            // cumPageLeft + = pageWidth + documents.pageMarginLeft;

            this._liquid.translatePagePadding(page);

            skeDrawings.forEach((drawing) => {
                const { aLeft, aTop, height, width, objectId } = drawing;

                Objects.push({
                    unitId,
                    subComponentId: DEFAULT_DOCUMENT_SUB_COMPONENT_ID,
                    floatingObjectId: objectId,
                    floatingObject: {
                        left: aLeft + docsLeft + this._liquid.x,
                        top: aTop + docsTop + this._liquid.y,
                        width,
                        height,
                    },
                });

                this._pageMarginCache.set(objectId, {
                    marginLeft: this._liquid.x,
                    marginTop: this._liquid.y,
                });
            });

            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        this._floatingObjectManagerService.BatchAddOrUpdate(Objects);
    }
}
