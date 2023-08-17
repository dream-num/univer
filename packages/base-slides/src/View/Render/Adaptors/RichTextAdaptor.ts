import { IRichTextProps, RichText, Scene } from '@univerjs/base-render';
import { IPageElement, LocaleService, PageElementType } from '@univerjs/core';

import { Inject, Injector } from '@wendellhu/redi';
import { ObjectAdaptor, CanvasObjectProviderRegistry } from '../Adaptor';

export class RichTextAdaptor extends ObjectAdaptor {
    override zIndex = 2;

    override viewKey = PageElementType.TEXT;

    constructor(@Inject(LocaleService) private readonly _localeService: LocaleService) {
        super();
    }

    override check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

    override convert(pageElement: IPageElement, mainScene: Scene) {
        const { id, zIndex, left = 0, top = 0, width, height, angle, scaleX, scaleY, skewX, skewY, flipX, flipY, title, description, richText = {} } = pageElement;
        const { text, ff, fs, it, bl, ul, st, ol, bg, bd, cl, rich } = richText;
        let config: IRichTextProps = {
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
        };
        let isNotNull = false;
        if (text != null) {
            config = { ...config, text, ff, fs, it, bl, ul, st, ol, bg, bd, cl };
            isNotNull = true;
        } else if (rich != null) {
            config = { ...config, richText: rich };
            isNotNull = true;
        }

        if (isNotNull === false) {
            return;
        }
        return new RichText(this._localeService, id, config);
    }
}

export class RichTextAdaptorFactory {
    readonly zIndex = 0;

    create(injector: Injector): RichTextAdaptor {
        const richTextAdaptor = injector.createInstance(RichTextAdaptor);
        return richTextAdaptor;
    }
}

CanvasObjectProviderRegistry.add(new RichTextAdaptorFactory());
