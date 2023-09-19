import { Engine, Rect, Scene, Slide, Viewport } from '@univerjs/base-render';
import { getColorStyle, IColorStyle, IPageElement, ISlidePage, PageElementType, SlideModel } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { CanvasObjectProviderRegistry, ObjectAdaptor } from '../Adaptor';
import { ObjectProvider } from '../ObjectProvider';
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

    private _ObjectProvider: ObjectProvider;

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

        const model = new SlideModel(slideData);

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
            isTransformer: false,
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
            slideComponent.addPage(this._createScene(id, slideComponent, page, mainScene, model));
        }

        slideComponent.activeFirstPage();

        return slideComponent;
    }

    private _createScene(
        pageId: string,
        parent: Engine | Slide,
        page: ISlidePage,
        mainScene: Scene,
        model: SlideModel
    ) {
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
        });

        viewMain.closeClip();

        scene.addViewport(viewMain);

        const { pageElements, pageBackgroundFill } = page;

        const objects = this._ObjectProvider.convertToRenderObjects(pageElements, mainScene);

        scene.openTransformer();

        this._addBackgroundRect(scene, pageBackgroundFill, model);

        scene.addObjects(objects);

        return scene;
    }

    private _addBackgroundRect(scene: Scene, fill: IColorStyle, model: SlideModel) {
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
