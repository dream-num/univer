import { Rect, Documents, IPageRenderConfig, Scene } from '@univerjs/base-render';
import { Injector } from '@wendellhu/redi';
import { BaseView, CanvasViewRegistry } from '../BaseView';
import { DOCS_VIEW_KEY } from './DocsView';

const PAGE_VIEW_BACKGROUND = 'page_view_background';

export class PageView extends BaseView {
    override zIndex = 2;

    override viewKey = PAGE_VIEW_BACKGROUND;

    protected override _initialize() {
        const scene = this.getScene();

        const documents = scene.getObject(DOCS_VIEW_KEY.MAIN) as Documents;

        const pageSize = documents.getSkeleton()?.getPageSize();

        documents.onPageRenderObservable.add((config: IPageRenderConfig) => {
            const { page, pageLeft, pageTop, ctx } = config;
            const { width, height, marginBottom, marginLeft, marginRight, marginTop } = page;
            ctx.save();
            ctx.translate(pageLeft - 0.5, pageTop - 0.5);
            Rect.drawWith(ctx, {
                width: pageSize?.width || width,
                height: pageSize?.height || height,
                strokeWidth: 1,
                stroke: 'rgba(198,198,198, 1)',
                fill: 'rgba(255,255,255, 1)',
                zIndex: 3,
            });
            ctx.restore();
        });

        // scene.addObjects([pageBackground], 0);
    }
}

class PageViewFactory {
    readonly zIndex = 1;

    create(scene: Scene, injector: Injector) {
        const pageView = injector.createInstance(PageView) as PageView;
        pageView.initialize(scene);
        return pageView;
    }
}

CanvasViewRegistry.add(new PageViewFactory());
