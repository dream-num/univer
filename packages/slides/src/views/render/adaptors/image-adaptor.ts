import { Picture } from '@univerjs/engine-render';
import { IPageElement, PageElementType } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';

import { CanvasObjectProviderRegistry, ObjectAdaptor } from '../adaptor';

export class ImageAdaptor extends ObjectAdaptor {
    override zIndex = 1;

    override viewKey = PageElementType.IMAGE;

    override check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

    override convert(pageElement: IPageElement) {
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
            image = {},
        } = pageElement;
        const { imageProperties, placeholder, link } = image;

        const contentUrl = imageProperties?.contentUrl || '';

        return new Picture(id, {
            url: contentUrl,
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
            forceRender: true,
        });
    }
}

export class ImageAdaptorFactory {
    readonly zIndex = 4;

    create(injector: Injector): ImageAdaptor {
        const imageAdaptor = injector.createInstance(ImageAdaptor);
        return imageAdaptor;
    }
}

CanvasObjectProviderRegistry.add(new ImageAdaptorFactory());
