import { Rect } from '@univerjs/base-render';
import { getColorStyle, IPageElement, PageElementType, ShapeType } from '@univerjs/core';
import { ObjectAdaptor, CanvasObjectProviderRegistry } from '../Adaptor';

export class ShapeAdaptor extends ObjectAdaptor {
    zIndex = 2;

    viewKey = PageElementType.SHAPE;

    check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

    convert(pageElement: IPageElement) {
        const { id, zIndex, left = 0, top = 0, width, height, angle, scaleX, scaleY, skewX, skewY, flipX, flipY, title, description } = pageElement;
        const { shapeType, text, shapeProperties, placeholder, link } = pageElement.shape || {};

        const fill = shapeProperties == null ? '' : getColorStyle(shapeProperties.shapeBackgroundFill) || 'rgba(255,255,255,1)';

        const outline = shapeProperties?.outline;
        const strokeStyle: { [key: string]: string | number } = {};
        if (outline) {
            const { outlineFill, weight } = outline;

            strokeStyle.strokeWidth = weight;
            strokeStyle.stroke = getColorStyle(outlineFill) || 'rgba(0,0,0,1)';
        }

        if (shapeType === ShapeType.RECTANGLE) {
            return new Rect(id, {
                fill,
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
                ...strokeStyle,
            });
        }
        if (shapeType === ShapeType.ROUND_RECTANGLE) {
            const radius = shapeProperties?.radius || 0;
            return new Rect(id, {
                fill,
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
                radius,
                ...strokeStyle,
            });
        }
        // if (shapeType === ShapeType.ELLIPSE) {
        // }
    }
}

CanvasObjectProviderRegistry.add(new ShapeAdaptor());
