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
import { Inject, LocaleService, PageElementType } from '@univerjs/core';
import type { IRichTextProps, Scene } from '@univerjs/engine-render';
import { RichText } from '@univerjs/engine-render';

import { CanvasObjectProviderRegistry, ObjectAdaptor } from '../adaptor';

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

    override convert(pageElement: IPageElement, _mainScene: Scene) {
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
            richText = {},
        } = pageElement;
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
