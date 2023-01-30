import { getColorStyle, IScale } from '@univerjs/core';
import { DocumentsSpanAndLineExtensionRegistry } from '../../Extension';
import { docExtension } from '../DocExtension';
import { IDocumentSkeletonSpan } from '../../../Basics/IDocumentSkeletonCached';
import { Vector2 } from '../../../Basics/Vector2';

const UNIQUE_KEY = 'DefaultDocsBackgroundExtension';

export class Background extends docExtension {
    uKey = UNIQUE_KEY;

    zIndex = 10;

    private _preBackgroundColor = '';

    draw(ctx: CanvasRenderingContext2D, parentScale: IScale, span: IDocumentSkeletonSpan) {
        const line = span.parent?.parent;
        if (!line) {
            return;
        }

        const { lineHeight = 0 } = line;
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
            ctx.fillRect(spanStartPoint.x - 0.5, spanStartPoint.y, width + 1, lineHeight);
        }
    }

    clearCache() {
        this._preBackgroundColor = '';
    }
}

DocumentsSpanAndLineExtensionRegistry.add(new Background());
