import { Documents, IPageRenderConfig, IRenderManagerService, Rect } from '@univerjs/base-render';
import { Disposable, ICommandService, ICurrentUniverService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { DocSkeletonManagerService } from '../services/doc-skeleton-manager.service';

const PAGE_STROKE_COLOR = 'rgba(198,198,198, 1)';

const PAGE_FILL_COLOR = 'rgba(255,255,255, 1)';

@OnLifecycle(LifecycleStages.Rendered, PageRenderController)
export class PageRenderController extends Disposable {
    constructor(
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
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
        this._docSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const { unitId } = param;

            const currentRender = this._renderManagerService.getRenderById(unitId);

            if (currentRender == null) {
                return;
            }

            const { mainComponent, components, scene } = currentRender;

            const docsComponent = mainComponent as Documents;

            const pageSize = docsComponent.getSkeleton()?.getPageSize();

            docsComponent.onPageRenderObservable.add((config: IPageRenderConfig) => {
                const { page, pageLeft, pageTop, ctx } = config;
                const { width, height, marginBottom, marginLeft, marginRight, marginTop } = page;
                ctx.save();
                ctx.translate(pageLeft - 0.5, pageTop - 0.5);
                Rect.drawWith(ctx, {
                    width: pageSize?.width || width,
                    height: pageSize?.height || height,
                    strokeWidth: 1,
                    stroke: PAGE_STROKE_COLOR,
                    fill: PAGE_FILL_COLOR,
                    zIndex: 3,
                });
                ctx.restore();
            });
        });
    }

    private _commandExecutedListener() {}
}
