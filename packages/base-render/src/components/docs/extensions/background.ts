import type { IScale } from '@univerjs/core';
import { getColorStyle } from '@univerjs/core';

import type { IDocumentSkeletonSpan } from '../../../basics/i-document-skeleton-cached';
import { Vector2 } from '../../../basics/vector2';
import { DocumentsSpanAndLineExtensionRegistry } from '../../extension';
import { docExtension } from '../doc-extension';

const UNIQUE_KEY = 'DefaultDocsBackgroundExtension';

export class Background extends docExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 10;

    private _preBackgroundColor = '';

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, span: IDocumentSkeletonSpan) {
        const line = span.parent?.parent;
        if (!line) {
            return;
        }

        const { contentHeight = 0 } = line;
        const { ts: textStyle, width, content } = span;
        if (!textStyle) {
            return;
        }

        const { bg } = textStyle;

        if (!bg) {
            return;
        }

        const background = getColorStyle(bg);

        // console.log('background', content, background, textStyle);

        const { spanStartPoint = Vector2.create(0, 0) } = this.extensionOffset;

        if (background) {
            ctx.fillStyle = background;
            ctx.fillRect(spanStartPoint.x - 0.5, spanStartPoint.y, width + 1, contentHeight + 1);
        }
    }

    override clearCache() {
        this._preBackgroundColor = '';
    }
}

DocumentsSpanAndLineExtensionRegistry.add(new Background());
