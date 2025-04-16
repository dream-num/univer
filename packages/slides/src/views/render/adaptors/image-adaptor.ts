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
import { PageElementType } from '@univerjs/core';
import { Image } from '@univerjs/engine-render';

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

        return new Image(id, {
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
