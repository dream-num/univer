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

import { getColorStyle, Inject, Injector, PageElementType, SlideDataModel } from '@univerjs/core';
import { Rect, Scene, Slide, Viewport } from '@univerjs/engine-render';
import type { IColorStyle, IPageElement, ISlidePage } from '@univerjs/core';
import type { Engine } from '@univerjs/engine-render';

import { CanvasObjectProviderRegistry, ObjectAdaptor } from '../adaptor';
import { ObjectProvider } from '../object-provider';

// import { DocsAdaptor, ImageAdaptor, RichTextAdaptor, ShapeAdaptor  } from './';

export enum SLIDE_VIEW_KEY {
    MAIN = '__SLIDERender__',
    SCENE_VIEWER = '__SLIDEViewer__',
    SCENE = '__SLIDEScene__',
    VIEWPORT = '__SLIDEViewPort_',
}

export class SlideAdaptor extends ObjectAdaptor {
    override zIndex = 6;

    override viewKey = PageElementType.SLIDE;

    private _ObjectProvider: ObjectProvider | null = null;

    constructor(@Inject(Injector) private _injector: Injector) {
        super();
    }

    override check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

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
            slide: slideData,
        } = pageElement;
        if (slideData == null) {
            return;
        }

        const model = new SlideDataModel(slideData);

        const slideComponent = new Slide(SLIDE_VIEW_KEY.MAIN + id, {
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
            forceRender: true,
        });

        slideComponent.enableNav();

        slideComponent.enableSelectedClipElement();

        const pageOrder = model.getPageOrder();

        const pages = model.getPages();

        if (!pageOrder || !pages) {
            return slideComponent;
        }

        this._ObjectProvider = new ObjectProvider(this._injector);

        for (let i = 0, len = pageOrder.length; i < len; i++) {
            const page = pages[pageOrder[i]];
            const { id } = page;
            slideComponent.addPageScene(this._createScene(id, slideComponent, page, mainScene, model));
        }

        slideComponent.activeFirstPage();

        return slideComponent;
    }

    private _createScene(pageId: string, parent: Engine | Slide, page: ISlidePage, mainScene: Scene, model: SlideDataModel) {
        const { width, height } = parent;

        const scene = new Scene(pageId, parent, {
            width,
            height,
        });

        const viewMain = new Viewport(`PageViewer_${pageId}`, scene, {
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            explicitViewportWidthSet: false,
            explicitViewportHeightSet: false,
        });

        viewMain.closeClip();

        const { pageElements, pageBackgroundFill } = page;

        const objects = this._ObjectProvider?.convertToRenderObjects(pageElements, mainScene);

        this._addBackgroundRect(scene, pageBackgroundFill, model);

        scene.addObjects(objects!);

        objects?.forEach((object) => {
            scene.attachTransformerTo(object);
        });

        return scene;
    }

    private _addBackgroundRect(scene: Scene, fill: IColorStyle, model: SlideDataModel) {
        const pageSize = model.getPageSize();

        const { width: pageWidth = 0, height: pageHeight = 0 } = pageSize;

        const page = new Rect('canvas', {
            left: 0,
            top: 0,
            width: pageWidth,
            height: pageHeight,
            strokeWidth: 1,
            stroke: 'rgba(198,198,198, 1)',
            fill: getColorStyle(fill) || 'rgba(255,255,255, 1)',
            zIndex: 0,
            evented: false,
        });
        scene.addObject(page, 0);
    }
}

export class SlideAdaptorFactory {
    readonly zIndex = 6;

    create(injector: Injector): SlideAdaptor {
        const slideAdaptor = injector.createInstance(SlideAdaptor);
        return slideAdaptor;
    }
}

CanvasObjectProviderRegistry.add(new SlideAdaptorFactory());
