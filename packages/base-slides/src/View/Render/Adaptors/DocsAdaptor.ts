import {
    BaseObject,
    Documents,
    DocumentSkeleton,
    EVENT_TYPE,
    IPageRenderConfig,
    IWheelEvent,
    Liquid,
    Picture,
    Rect,
    Scene,
    SceneViewer,
    ScrollBar,
    Viewport,
} from '@univerjs/base-render';
import { ContextBase, DocContext, EventState, IPageElement, PageElementType } from '@univerjs/core';
import { ObjectAdaptor, CanvasObjectProviderRegistry } from '../Adaptor';

export enum DOCS_VIEW_KEY {
    MAIN = '__DocsRender__',
    SCENE_VIEWER = '__DocsViewer__',
    SCENE = '__DocsScene__',
    VIEWPORT = '__DocsViewPort_',
}

export class DocsAdaptor extends ObjectAdaptor {
    zIndex = 5;
    viewKey = PageElementType.DOCUMENT;

    private _liquid = new Liquid();

    check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

    convert(pageElement: IPageElement, mainScene: Scene, context?: ContextBase) {
        const { id, zIndex, left = 0, top = 0, width, height, angle, scaleX, scaleY, skewX, skewY, flipX, flipY, title, description, document: documentData } = pageElement;
        if (documentData == null) {
            return;
        }

        const documentSkeleton = DocumentSkeleton.create(documentData, context as DocContext);

        const documents = new Documents(DOCS_VIEW_KEY.MAIN, documentSkeleton);

        documentSkeleton.calculate();

        const sv = new SceneViewer(DOCS_VIEW_KEY.SCENE_VIEWER + id, {
            top,
            left,
            width,
            height,
            zIndex,
            angle,
            scaleX,
            scaleY,
            skewX,
            skewY,
            flipX,
            flipY,
            isTransformer: true,
        });
        const scene = new Scene(DOCS_VIEW_KEY.SCENE + id, sv);

        const viewMain = new Viewport(DOCS_VIEW_KEY.VIEWPORT + id, scene, {
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            isWheelPreventDefaultX: true,
        });

        scene.addViewport(viewMain).attachControl();

        scene.on(EVENT_TYPE.wheel, (evt: unknown, state: EventState) => {
            const e = evt as IWheelEvent;
            if (e.ctrlKey) {
                const deltaFactor = Math.abs(e.deltaX);
                let scrollNum = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
                scrollNum *= e.deltaY > 0 ? -1 : 1;
                if (scene.scaleX < 1) {
                    scrollNum /= 2;
                }

                if (scene.scaleX + scrollNum > 4) {
                    scene.scale(4, 4);
                } else if (scene.scaleX + scrollNum < 0.1) {
                    scene.scale(0.1, 0.1);
                } else {
                    const value = e.deltaY > 0 ? 0.1 : -0.1;
                    // scene.scaleBy(scrollNum, scrollNum);
                    e.preventDefault();
                }
            } else {
                viewMain.onMouseWheel(e, state);
            }
        });

        const scrollbar = new ScrollBar(viewMain, {
            mainScene,
        });

        scene.addObject(documents);

        documents.calculatePagePosition();

        // documents.enableEditor();

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

        const { left: docsLeft, top: docsTop } = documents;

        const { pages } = documentSkeleton.getSkeletonData();
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

                documentSkeleton?.updateDrawing(oKey, {
                    left: left - docsLeft - marginLeft,
                    top: top - docsTop - marginTop,
                    height,
                    width,
                });
            });

            documentSkeleton?.calculate();
        });
        scene.closeTransformer();

        return sv;
    }
}

CanvasObjectProviderRegistry.add(new DocsAdaptor());
