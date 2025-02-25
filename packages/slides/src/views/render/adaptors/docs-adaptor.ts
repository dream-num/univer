/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DocumentDataModel, Inject, LocaleService, PageElementType } from '@univerjs/core';
import {
    Documents,
    DocumentSkeleton,
    DocumentViewModel,
    Image,
    Liquid,
    PageLayoutType,
    // Rect,
    Scene,
    SceneViewer,
    ScrollBar,
    Viewport,
} from '@univerjs/engine-render';
import type { EventState, Injector, IPageElement } from '@univerjs/core';
import type { BaseObject, IDocumentSkeletonDrawing, IPageRenderConfig, IWheelEvent } from '@univerjs/engine-render';

import { CanvasObjectProviderRegistry, ObjectAdaptor } from '../adaptor';

export enum DOCS_VIEW_KEY {
    MAIN = '__DocsRender__',
    SCENE_VIEWER = '__DocsViewer__',
    SCENE = '__DocsScene__',
    VIEWPORT = '__DocsViewPort_',
}

export class DocsAdaptor extends ObjectAdaptor {
    override zIndex = 5;

    override viewKey = PageElementType.DOCUMENT;

    private _liquid = new Liquid();

    constructor(@Inject(LocaleService) private readonly _localeService: LocaleService) {
        super();
    }

    override check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

    // eslint-disable-next-line max-lines-per-function
    override convert(pageElement: IPageElement, mainScene: Scene) {
        const {
            id,
            zIndex,
            left = 0,
            top = 0,
            width,
            height,
            angle,
            scaleX,
            scaleY,
            skewX,
            skewY,
            flipX,
            flipY,
            title,
            description,
            document: documentData,
        } = pageElement;
        if (documentData == null) {
            return;
        }

        const docDataModel = new DocumentDataModel(documentData);
        const docViewModel = new DocumentViewModel(docDataModel);
        const documentSkeleton = DocumentSkeleton.create(docViewModel, this._localeService);

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
        });
        const scene = new Scene(DOCS_VIEW_KEY.SCENE + id, sv);

        const viewMain = new Viewport(DOCS_VIEW_KEY.VIEWPORT + id, scene, {
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            explicitViewportWidthSet: false,
            explicitViewportHeightSet: false,
            isWheelPreventDefaultX: true,
        });

        scene.attachControl();

        scene.onMouseWheel$.subscribeEvent((evt: unknown, state: EventState) => {
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

        // documents.calculatePagePosition();

        // documents.enableEditor();

        const size = documentSkeleton.getActualSize();

        documents.resize(size.actualWidth, size.actualHeight);

        scene.resize(size.actualWidth, size.actualHeight + 200);

        const pageSize = documents.getSkeleton()?.getPageSize();

        documents.pageRender$.subscribe((config: IPageRenderConfig) => {
            const { page, pageLeft, pageTop, ctx } = config;
            const { width, height, marginBottom, marginLeft, marginRight, marginTop } = page;
            ctx.save();
            ctx.translate(pageLeft - 0.5, pageTop - 0.5);
            // Rect.drawWith(ctx, {
            //     width: pageSize?.width || width,
            //     height: pageSize?.height || height,
            //     strokeWidth: 1,
            //     stroke: 'rgba(198,198,198, 1)',
            //     fill: 'rgba(255,255,255, 1)',
            //     zIndex: 3,
            // });
            ctx.restore();
        });

        const { left: docsLeft, top: docsTop } = documents;

        const skeletonData = documentSkeleton.getSkeletonData();

        if (skeletonData == null) {
            return;
        }

        const { pages } = skeletonData;
        const objectList: BaseObject[] = [];
        const pageMarginCache = new Map<string, { marginLeft: number; marginTop: number }>();

        this._recalculateSizeBySkeleton(documents, scene, documentSkeleton);

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            const { skeDrawings, marginLeft, marginTop, pageWidth, pageHeight } = page;

            // cumPageLeft + = pageWidth + documents.pageMarginLeft;

            this._liquid.translatePagePadding(page);

            skeDrawings.forEach((drawing: IDocumentSkeletonDrawing) => {
                const { aLeft, aTop, height, width, drawingOrigin } = drawing;

                const { docTransform } = drawingOrigin;

                const rect = new Image(drawing.drawingId, {
                    // url: docTransform.imageProperties?.contentUrl || '',
                    left: aLeft + docsLeft + this._liquid.x,
                    top: aTop + docsTop + this._liquid.y,
                    width,
                    height,
                    zIndex: 11,
                });

                pageMarginCache.set(drawing.drawingId, {
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

        scene.addObjects(objectList);
        objectList.forEach((object) => {
            scene.attachTransformerTo(object);
        });

        scene.getTransformer()?.changing$.subscribe((state) => {
            const { objects } = state;

            objects.forEach((object) => {
                const { oKey, left, top, height, width } = object;
                const cache = pageMarginCache.get(oKey);
                const marginLeft = cache?.marginLeft || 0;
                const marginTop = cache?.marginTop || 0;

                // console.log('onChangingObservable', top, docsTop, marginTop, top - docsTop - marginTop);

                documentSkeleton
                    ?.getViewModel()
                    .getDataModel()
                    .updateDrawing(oKey, {
                        left: left - docsLeft - marginLeft,
                        top: top - docsTop - marginTop,
                        height,
                        width,
                    });
            });

            documentSkeleton?.calculate();
        });
        this._calculatePagePosition(documents, scene, viewMain);

        return sv;
    }

    private _recalculateSizeBySkeleton(docsComponent: Documents, scene: Scene, skeleton: DocumentSkeleton) {
        const pages = skeleton.getSkeletonData()?.pages;

        if (pages == null) {
            return;
        }

        let width = 0;
        let height = 0;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            const { pageWidth, pageHeight } = page;

            if (docsComponent.pageLayoutType === PageLayoutType.VERTICAL) {
                height += pageHeight;

                height += docsComponent.pageMarginTop;

                if (i === len - 1) {
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

        scene.resize(width, height);
    }

    private _calculatePagePosition(docsComponent: Documents, scene: Scene, viewport: Viewport, zoomRatio: number = 1) {
        const parent = scene?.getParent();

        const { width: docsWidth, height: docsHeight, pageMarginLeft, pageMarginTop } = docsComponent;
        if (parent == null || docsWidth === Number.POSITIVE_INFINITY || docsHeight === Number.POSITIVE_INFINITY) {
            return;
        }
        const { width: engineWidth, height: engineHeight } = parent;
        let docsLeft = 0;
        let docsTop = 0;

        let sceneWidth = 0;

        let sceneHeight = 0;

        let scrollToX = Number.POSITIVE_INFINITY;

        if (engineWidth > (docsWidth + pageMarginLeft * 2) * zoomRatio) {
            docsLeft = engineWidth / 2 - (docsWidth * zoomRatio) / 2;
            docsLeft /= zoomRatio;
            sceneWidth = (engineWidth - pageMarginLeft * 2) / zoomRatio;

            scrollToX = 0;
        } else {
            docsLeft = pageMarginLeft;
            sceneWidth = docsWidth + pageMarginLeft * 2;

            scrollToX = (sceneWidth - engineWidth / zoomRatio) / 2;
        }

        if (engineHeight > docsHeight) {
            docsTop = engineHeight / 2 - docsHeight / 2;
            sceneHeight = (engineHeight - pageMarginTop * 2) / zoomRatio;
        } else {
            docsTop = pageMarginTop;
            sceneHeight = docsHeight + pageMarginTop * 2;
        }

        // this.docsLeft = docsLeft;

        // this.docsTop = docsTop;

        scene.resize(sceneWidth, sceneHeight + 200);

        docsComponent.translate(docsLeft, docsTop);

        if (scrollToX !== Number.POSITIVE_INFINITY && viewport != null) {
            const actualX = viewport.transScroll2ViewportScrollValue(scrollToX, 0).x;
            viewport.scrollToBarPos({
                x: actualX,
            });
        }

        return this;
    }
}

export class DocsAdaptorFactory {
    readonly zIndex = 5;

    create(injector: Injector): DocsAdaptor {
        const docsAdaptor = injector.createInstance(DocsAdaptor);
        return docsAdaptor;
    }
}

CanvasObjectProviderRegistry.add(new DocsAdaptorFactory());
