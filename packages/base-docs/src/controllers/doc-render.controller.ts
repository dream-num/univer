import { Documents, DocumentSkeleton, IRender, IRenderManagerService, PageLayoutType } from '@univerjs/base-render';
import {
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandInfo,
    ICommandService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { IRichTextEditingMutationParams, RichTextEditingMutation } from '../commands/mutations/core-editing.mutation';
import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Rendered, DocRenderController)
export class DocRenderController extends Disposable {
    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initialRenderRefresh();

        this._commandExecutedListener();
    }

    private _initialRenderRefresh() {
        this._docSkeletonManagerService.currentSkeletonBefore$.subscribe((param) => {
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

            this.recalculateSizeBySkeleton(currentRender, documentSkeleton);
        });
    }

    // calculatePagePosition(currentRender: IRender) {
    //     const { mainComponent, scene } = currentRender;

    //     const docsComponent = mainComponent as Documents;

    //     const parent = scene?.getParent();

    //     const { width: docsWidth, height: docsHeight, pageMarginLeft, pageMarginTop } = docsComponent;
    //     if (parent == null || docsWidth === Infinity || docsHeight === Infinity) {
    //         return;
    //     }
    //     const { width: engineWidth, height: engineHeight } = parent;
    //     let docsLeft = 0;
    //     let docsTop = 0;

    //     let sceneWidth = 0;

    //     let sceneHeight = 0;

    //     if (engineWidth > docsWidth) {
    //         docsLeft = engineWidth / 2 - docsWidth / 2;
    //         sceneWidth = engineWidth - 34;
    //     } else {
    //         docsLeft = pageMarginLeft;
    //         sceneWidth = docsWidth + pageMarginLeft * 2;
    //     }

    //     if (engineHeight > docsHeight) {
    //         docsTop = engineHeight / 2 - docsHeight / 2;
    //         sceneHeight = engineHeight - 34;
    //     } else {
    //         docsTop = pageMarginTop;
    //         sceneHeight = docsHeight + pageMarginTop * 2;
    //     }

    //     // this.docsLeft = docsLeft;

    //     // this.docsTop = docsTop;

    //     scene.resize(sceneWidth, sceneHeight + 200);

    //     docsComponent.translate(docsLeft, docsTop);

    //     return this;
    // }

    recalculateSizeBySkeleton(currentRender: IRender, skeleton: DocumentSkeleton) {
        const { mainComponent } = currentRender;

        const docsComponent = mainComponent as Documents;

        const data = skeleton.getSkeletonData();

        if (data == null) {
            return;
        }

        const pages = data.pages;
        let width = 0;
        let height = 0;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            const { pageWidth, pageHeight } = page;
            if (docsComponent.pageLayoutType === PageLayoutType.VERTICAL) {
                height += pageHeight;
                if (i !== len - 1) {
                    height += docsComponent.pageMarginTop;
                }
                width = Math.max(width, pageWidth);
            } else if (docsComponent.pageLayoutType === PageLayoutType.HORIZONTAL) {
                width += pageWidth;
                if (i !== len - 1) {
                    width += docsComponent.pageMarginLeft;
                }
                height = Math.max(height, pageHeight);
            }
        }

        docsComponent.resize(width, height);
    }

    private _commandExecutedListener() {
        const updateCommandList = [RichTextEditingMutation.id];

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

                    skeleton.calculate();

                    if (excludeUnitList.includes(unitId)) {
                        currentRender.mainComponent?.makeDirty();
                        return;
                    }

                    this.recalculateSizeBySkeleton(currentRender, skeleton);
                }
            })
        );
    }
}
