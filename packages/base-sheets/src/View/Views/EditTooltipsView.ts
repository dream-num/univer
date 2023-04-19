import { IRectProps, Rect } from '@univerjs/base-render';

export interface EditTooltipsProps extends IRectProps {
    text?: string;
    textSize?: number;
    borderColor?: string;
}

export class EditTooltips extends Rect<EditTooltipsProps> {
    textSize?: number;

    text?: string;

    translateTop: number;

    translateLeft: number;

    constructor(key?: string, props?: EditTooltipsProps) {
        props = {
            ...{
                stroke: '#000000',
                strokeWidth: 2,
            },
            ...props,
        };
        super(key, props);
        this.textSize = props?.textSize ?? 15;
        this.text = props?.text ?? 'User';
        this.translateTop = 0;
        this.translateLeft = 0;
    }

    static drawWith(ctx: CanvasRenderingContext2D, props: EditTooltips): void {
        if (props.text) {
            ctx.font = `${props.textSize}px Arial`;
            const metrics = ctx.measureText(props.text);
            const padding = 10;

            const textWidth = metrics.width;
            const textHeight = metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent;

            const rectTop = -textHeight - padding;
            const rectLeft = props.width - textWidth - padding;
            const rectRight = rectLeft + textWidth + padding;
            const rectBottom = rectTop + textHeight + padding;
            const rectWidth = rectRight - rectLeft;
            const rectHeight = rectBottom - rectTop;

            ctx.fillStyle = '#000000';
            ctx.fillRect(rectLeft, rectTop, rectWidth, rectHeight);
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'top';
            ctx.fillText(props.text, rectLeft + (rectWidth / 2 - textWidth / 2), rectTop + (rectHeight / 2 - textHeight / 2));
        }
    }

    setText(text: string): void {
        this.setProps({ text });
        this.makeDirty(true);
    }

    setTextSize(textSize: number): void {
        this.setProps({ textSize });
        this.makeDirty(true);
    }

    setBorderColor(color: string): void {
        this.makeDirty(true);
    }

    setWidth(width: number): void {
        this.width = width;
        this.makeDirty(true);
    }

    setLeft(left: number): void {
        this.translateLeft = left;
        this.translate(this.translateLeft, this.translateTop);
    }

    setTop(top: number): void {
        this.translateTop = top;
        this.translate(this.translateLeft, this.translateTop);
    }

    setHeight(height: number): void {
        this.height = height;
        this.makeDirty(true);
    }

    protected _draw(ctx: CanvasRenderingContext2D) {
        super._draw(ctx);
        EditTooltips.drawWith(ctx, this);
    }
}
