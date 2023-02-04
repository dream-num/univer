import { getColor, Rect, Documents, DocumentSkeleton, CustomObject, IPageRenderConfig, Transform, ptToPx, BaseObject, Picture, Liquid } from '@univerjs/base-render';
import { BaseView, CanvasViewRegistry } from '../BaseView';
import { DOCS_VIEW_KEY } from './DocsView';

const DRAWINGS_VIEW_BACKGROUND = 'drawings_view_background';

export class DrawingsView extends BaseView {
    zIndex = 3;

    viewKey = DRAWINGS_VIEW_BACKGROUND;

    private _liquid = new Liquid();

    protected _initialize() {
        const scene = this.getScene();
        const context = this.getContext();

        const documents = scene.getObject(DOCS_VIEW_KEY.MAIN) as Documents;

        const docsSkeleton = documents.getSkeleton();

        const skeletonData = docsSkeleton?.getSkeletonData();

        if (!skeletonData) {
            return;
        }

        const { left: docsLeft, top: docsTop } = documents;

        const { pages } = skeletonData;
        const objectList: BaseObject[] = [];
        const pageMarginCache = new Map<string, { marginLeft: number; marginTop: number }>();

        let cumPageLeft = 0;
        let cumPageTop = 0;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            const { skeDrawings, marginLeft, marginTop, pageWidth, pageHeight } = page;

            // cumPageLeft + = pageWidth + documents.pageMarginLeft;

            this._liquid.translatePagePadding(page);

            skeDrawings.forEach((drawing) => {
                const { aLeft, aTop, height, width, drawingOrigin } = drawing;

                const { objectProperties } = drawingOrigin;

                const rect = new Picture(drawing.objectId, {
                    url: objectProperties.imageProperties?.contentUrl || '',
                    left: aLeft + docsLeft + this._liquid.x,
                    top: aTop + docsTop + this._liquid.y,
                    width: width,
                    height: height,
                    zIndex: 11,
                    isTransformer: true,
                });

                pageMarginCache.set(drawing.objectId, {
                    marginLeft: this._liquid.x,
                    marginTop: this._liquid.y,
                });

                objectList.push(rect);
            });

            this._liquid.translatePage(page, documents.pageLayoutType, documents.pageMarginLeft, documents.pageMarginTop);
        }
        scene.openTransformer();
        scene.addObjects(objectList);
        scene.getTransformer()?.onChangingObservable.add((state) => {
            const { objects } = state;

            objects.forEach((object) => {
                const { oKey, left, top, height, width } = object;
                const cache = pageMarginCache.get(oKey);
                const marginLeft = cache?.marginLeft || 0;
                const marginTop = cache?.marginTop || 0;

                // console.log('onChangingObservable', top, docsTop, marginTop, top - docsTop - marginTop);

                docsSkeleton?.updateDrawing(oKey, {
                    left: left - docsLeft - marginLeft,
                    top: top - docsTop - marginTop,
                    height,
                    width,
                });
            });

            docsSkeleton?.calculate();
        });
        scene.closeTransformer();

        // scene.addObjects([pageBackground], 0);
    }
}

CanvasViewRegistry.add(new DrawingsView());
