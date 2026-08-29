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

import type { IDisposable } from '@univerjs/core';
import type { UniverRenderingContext } from '../../context';
import { toDisposable } from '@univerjs/core';

export interface IDocCustomGlyphRenderInput {
    content: string;
    context: UniverRenderingContext;
    fontSizePx: number;
    x: number;
    y: number;
}

export type DocCustomGlyphRenderer = (input: IDocCustomGlyphRenderInput) => boolean;

export interface IDocCustomGlyphRendererRegistration {
    fontFamily: string;
    renderer: DocCustomGlyphRenderer;
}

const CUSTOM_GLYPH_RENDERERS = new Map<string, DocCustomGlyphRenderer>();

export function registerDocCustomGlyphRenderer(registration: IDocCustomGlyphRendererRegistration): IDisposable {
    CUSTOM_GLYPH_RENDERERS.set(registration.fontFamily, registration.renderer);
    return toDisposable(() => {
        if (CUSTOM_GLYPH_RENDERERS.get(registration.fontFamily) === registration.renderer) {
            CUSTOM_GLYPH_RENDERERS.delete(registration.fontFamily);
        }
    });
}

export function getDocCustomGlyphRenderer(fontFamily: string | undefined): DocCustomGlyphRenderer | undefined {
    if (!fontFamily) {
        return undefined;
    }
    const firstFamily = fontFamily.split(',')[0]?.trim();
    if (!firstFamily) {
        return undefined;
    }
    const unquotedFamily = (
        (firstFamily.startsWith('"') && firstFamily.endsWith('"'))
        || (firstFamily.startsWith("'") && firstFamily.endsWith("'"))
    )
        ? firstFamily.slice(1, -1)
        : firstFamily;
    return CUSTOM_GLYPH_RENDERERS.get(unquotedFamily);
}
