import { IRichTextProps, RichText, Scene } from '@univer/base-render';
import { ContextBase, IPageElement, PageElementType } from '@univer/core';

import { ObjectAdaptor, CanvasObjectProviderRegistry } from '../Adaptor';

export class RichTextAdaptor extends ObjectAdaptor {
    zIndex = 2;
    viewKey = PageElementType.TEXT;

    check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

    convert(pageElement: IPageElement, mainScene: Scene, context?: ContextBase) {
        if (context == null) {
            return;
        }
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
        return new RichText(context, id, config);
    }
}

CanvasObjectProviderRegistry.add(new RichTextAdaptor());
