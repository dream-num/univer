import { getColor, Rect, Documents, DocumentSkeleton, CustomObject, IPageRenderConfig, Transform, ptToPx } from '@univerjs/base-render';
import { BaseView, CanvasViewRegistry } from '../BaseView';
import { DOCS_VIEW_KEY } from './DocsView';

const PAGE_VIEW_BACKGROUND = 'page_view_background';

export class PageView extends BaseView {
    zIndex = 2;

    viewKey = PAGE_VIEW_BACKGROUND;

    protected _initialize() {
        const scene = this.getScene();
        const context = this.getContext();

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

CanvasViewRegistry.add(new PageView());
