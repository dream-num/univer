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

import type { IScale } from '@univerjs/core';
import type { IDocumentSkeletonGlyph } from '../../../basics/i-document-skeleton-cached';

import type { UniverRenderingContext } from '../../../context';
import { getColorStyle } from '@univerjs/core';
import { Vector2 } from '../../../basics/vector2';
import { DocumentsSpanAndLineExtensionRegistry } from '../../extension';
import { docExtension } from '../doc-extension';

const UNIQUE_KEY = 'DefaultDocsBackgroundExtension';

const DOC_EXTENSION_Z_INDEX = 10;

export class Background extends docExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = DOC_EXTENSION_Z_INDEX;

    private _preBackgroundColor = '';

    override draw(ctx: UniverRenderingContext, parentScale: IScale, span: IDocumentSkeletonGlyph) {
        const line = span.parent?.parent;
        if (line == null) {
            return;
        }

        const { contentHeight = 0 } = line;
        const { ts: textStyle, width, content } = span;
        if (textStyle?.bg == null) {
            return;
        }

        const { bg } = textStyle;

        const background = getColorStyle(bg);

        const { spanStartPoint = Vector2.create(0, 0) } = this.extensionOffset;

        const DELTA = 1;

        if (background && content !== '\r') {
            ctx.fillStyle = background;
            ctx.fillRect(spanStartPoint.x - 0.5, spanStartPoint.y + 1, width + 1, contentHeight + 2 * DELTA);
        }
    }

    override clearCache() {
        this._preBackgroundColor = '';
    }
}

DocumentsSpanAndLineExtensionRegistry.add(new Background());
