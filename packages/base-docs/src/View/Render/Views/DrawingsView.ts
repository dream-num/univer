import { BaseObject, Documents, Liquid, Picture, Scene } from '@univerjs/base-render';
import { Injector } from '@wendellhu/redi';

import { BaseView, CanvasViewRegistry } from '../BaseView';
import { DOCS_VIEW_KEY } from './DocsView';

const DRAWINGS_VIEW_BACKGROUND = 'drawings_view_background';

export class DrawingsView extends BaseView {
    override viewKey = DRAWINGS_VIEW_BACKGROUND;

    private _liquid = new Liquid();

    // eslint-disable-next-line max-lines-per-function
    protected override _initialize() {
        const scene = this.getScene();

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

        const cumPageLeft = 0;
        const cumPageTop = 0;

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
                    width,
                    height,
                    liY: this._liquid.y,
                    liX: this._liquid.x,
                    zIndex: 11,
                    isTransformer: true,
                });

                pageMarginCache.set(drawing.objectId, {
                    marginLeft: this._liquid.x,
                    marginTop: this._liquid.y,
                });

                objectList.push(rect);
            });

            this._liquid.translatePage(
                page,
                documents.pageLayoutType,
                documents.pageMarginLeft,
                documents.pageMarginTop
            );
        }
        scene.openTransformer();
        scene.addObjects(objectList);
        scene.getTransformer()?.onChangingObservable.add((state) => {
            const { objects } = state;

            const { docsLeft, docsTop } = documents;

            objects.forEach((object) => {
                const { oKey, left, top, height, width } = object;
                const cache = pageMarginCache.get(oKey);
                const marginLeft = cache?.marginLeft || 0;
                const marginTop = cache?.marginTop || 0;

                // console.log('onChangingObservable', top, docsTop, marginTop, top - docsTop - marginTop);

                docsSkeleton?.getModel().updateDrawing(oKey, {
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

class DrawingsViewFactory {
    readonly zIndex = 2;

    create(scene: Scene, injector: Injector) {
        const drawingsView = injector.createInstance(DrawingsView) as DrawingsView;
        drawingsView.initialize(scene);
        return drawingsView;
    }
}

CanvasViewRegistry.add(new DrawingsViewFactory());
