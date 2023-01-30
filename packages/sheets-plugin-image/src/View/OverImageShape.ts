import { Picture } from '@univerjs/base-render';
import { OverGridImageBorderType, OverGridImageProperty } from '../OverGridImagePlugin';

export class OverImageShape extends Picture {
    static drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, tl: number, tr: number, bl: number, br: number) {
        ctx.beginPath();
        ctx.moveTo(x + tl, y);
        ctx.lineTo(x + width - tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
        ctx.lineTo(x + width, y + height - br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
        ctx.lineTo(x + bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
        ctx.lineTo(x, y + tl);
        ctx.quadraticCurveTo(x, y, x + tl, y);
        ctx.closePath();
    }

    static drawDashedBorder(ctx: CanvasRenderingContext2D, shape: OverImageShape) {
        const { radius = 60, borderWidth = 10, borderColor = 'red' } = shape.getProperty();
        const x = -borderWidth / 2;
        const y = -borderWidth / 2;
        const w = shape.width + borderWidth;
        const h = shape.height + borderWidth;
        OverImageShape.drawRoundRect(ctx, x, y, w, h, radius, radius, radius, radius);
        ctx.setLineDash([10, 10, 10]);
        ctx.lineWidth = borderWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    }

    static drawSolidBorder(ctx: CanvasRenderingContext2D, shape: OverImageShape) {
        const { radius = 60, borderWidth = 10, borderColor = 'red' } = shape.getProperty();
        const x = -borderWidth / 2;
        const y = -borderWidth / 2;
        const w = shape.width + borderWidth;
        const h = shape.height + borderWidth;
        OverImageShape.drawRoundRect(ctx, x, y, w, h, radius, radius, radius, radius);
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    }

    static drawDoubleBorder(ctx: CanvasRenderingContext2D, shape: OverImageShape) {
        const { radius = 60, borderWidth = 10, borderColor = 'red' } = shape.getProperty();
        const x1 = -borderWidth / 2;
        const y1 = -borderWidth / 2;
        const w1 = shape.width + borderWidth;
        const h1 = shape.height + borderWidth;
        OverImageShape.drawRoundRect(ctx, x1, y1, w1, h1, radius, radius, radius, radius);
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
        const x2 = x1 - 5;
        const y2 = y1 - 5;
        const w2 = w1 + 5;
        const h2 = h1 + 5;
        OverImageShape.drawRoundRect(ctx, x2, y2, w2, h2, radius, radius, radius, radius);
        ctx.lineWidth = borderWidth;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    }

    static drawWith(ctx: CanvasRenderingContext2D, shape: OverImageShape): void {
        const { borderType } = shape.getProperty();
        switch (borderType) {
            case OverGridImageBorderType.SOLID: {
                OverImageShape.drawSolidBorder(ctx, shape);
                break;
            }
            case OverGridImageBorderType.DASHED: {
                OverImageShape.drawDashedBorder(ctx, shape);
                break;
            }
            case OverGridImageBorderType.DOUBLE: {
                OverImageShape.drawDoubleBorder(ctx, shape);
                break;
            }
        }
    }

    protected _property: OverGridImageProperty;

    protected _draw(ctx: CanvasRenderingContext2D) {
        OverImageShape.drawWith(ctx, this);
        super._draw(ctx);
    }

    constructor(property: OverGridImageProperty) {
        super(property);
        this._property = property;
    }

    getProperty(): OverGridImageProperty {
        return this._property;
    }
}
