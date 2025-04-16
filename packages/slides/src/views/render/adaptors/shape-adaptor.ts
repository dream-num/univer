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

import type { Injector, IPageElement } from '@univerjs/core';
import { BasicShapes, getColorStyle, PageElementType } from '@univerjs/core';
import { Rect } from '@univerjs/engine-render';

import { CanvasObjectProviderRegistry, ObjectAdaptor } from '../adaptor';

export class ShapeAdaptor extends ObjectAdaptor {
    override zIndex = 2;

    override viewKey = PageElementType.SHAPE;

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
        } = pageElement;
        const { shapeType, text, shapeProperties, placeholder, link } = pageElement.shape || {};

        const fill =
            shapeProperties == null ? '' : getColorStyle(shapeProperties.shapeBackgroundFill) || 'rgba(255,255,255,1)';

        const outline = shapeProperties?.outline;
        const strokeStyle: { [key: string]: string | number } = {};
        if (outline) {
            const { outlineFill, weight } = outline;

            strokeStyle.strokeWidth = weight;
            strokeStyle.stroke = getColorStyle(outlineFill) || 'rgba(0,0,0,1)';
        }

        if (shapeType === BasicShapes.Rect) {
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
                forceRender: true,
                ...strokeStyle,
            });
        }
        if (shapeType === BasicShapes.RoundRect) {
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
                forceRender: true,
                radius,
                ...strokeStyle,
            });
        }
        // if (shapeType === ShapeType.ELLIPSE) {
        // }
    }
}

export class ShapeAdaptorFactory {
    readonly zIndex = 2;

    create(injector: Injector): ShapeAdaptor {
        const shapeAdaptor = injector.createInstance(ShapeAdaptor);
        return shapeAdaptor;
    }
}

CanvasObjectProviderRegistry.add(new ShapeAdaptorFactory());
