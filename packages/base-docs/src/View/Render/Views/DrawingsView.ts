import { getColor, Rect, Documents, DocumentSkeleton, CustomObject, IPageRenderConfig, Transform, ptToPx, BaseObject } from '@univer/base-render';
import { BaseView, CanvasViewRegistry } from '../BaseView';
import { DOCS_VIEW_KEY } from './DocsView';

const DRAWINGS_VIEW_BACKGROUND = 'drawings_view_background';

export class DrawingsView extends BaseView {
    zIndex = 3;

    viewKey = DRAWINGS_VIEW_BACKGROUND;

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
        for (let page of pages) {
            const { skeDrawings, marginLeft, marginTop } = page;

            skeDrawings.forEach((drawing) => {
                const { aLeft, aTop, height, width } = drawing;

                const rect = new Rect(drawing.objectId, {
                    left: aLeft + docsLeft + marginLeft,
                    top: aTop + docsTop + marginTop,
                    width: width,
                    height: height,
                    fill: 'rgba(102,111,99, 0.8)',
                    zIndex: 11,
                    isTransformer: true,
                });

                pageMarginCache.set(drawing.objectId, {
                    marginLeft,
                    marginTop,
                });

                objectList.push(rect);
            });
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

                docsSkeleton?.updateDrawing(oKey, {
                    left: left - docsLeft - marginLeft,
                    top: top - docsTop - marginTop,
                    height,
                    width,
                });
            });

            docsSkeleton?.calculate();
        });

        // scene.addObjects([pageBackground], 0);
    }
}

CanvasViewRegistry.add(new DrawingsView());
