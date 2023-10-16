import { Documents, IRenderManagerService } from '@univerjs/base-render';
import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';

@OnLifecycle(LifecycleStages.Rendered, DocRenderController)
export class DocRenderController extends Disposable {
    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initialize();

        this._commandExecutedListener();
    }

    private _initialize() {
        this._initialRenderRefresh();
    }

    private _initialRenderRefresh() {
        this._docSkeletonManagerService.currentSkeletonBefore$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const { skeleton: documentSkeleton, unitId } = param;

            const documentModel = this._currentUniverService.getUniverDocInstance(unitId);

            if (documentModel == null) {
                return;
            }

            const currentRender = this._renderManagerService.getRenderById(unitId);

            if (currentRender == null) {
                return;
            }

            const { mainComponent, components, scene } = currentRender;

            const docsComponent = mainComponent as Documents;

            docsComponent.changeSkeleton(documentSkeleton);

            documentSkeleton.calculate();
        });
    }

    private _commandExecutedListener() {}
}
