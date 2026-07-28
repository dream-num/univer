import type { UniverRenderingContext } from '@univerjs/engine-render';
import { ColorKit, ThemeService } from '@univerjs/core';

export const DOC_CUSTOM_RANGE_CHROME_RADIUS = 1;
export const DOC_CUSTOM_RANGE_CHROME_BACKGROUND_ALPHA = 0.07;

export interface IDocCustomRangeChromeRect {
    bottom: number;
    left: number;
    right: number;
    top: number;
}

export interface IDocCustomRangeChromeTheme {
    background: string;
    border: string;
}

export function resolveDocCustomRangeChromeTheme(
    themeService: ThemeService
): IDocCustomRangeChromeTheme {
    const primary = themeService.getColorFromTheme('primary.600');

    return {
        background: new ColorKit(primary)
            .setAlpha(DOC_CUSTOM_RANGE_CHROME_BACKGROUND_ALPHA)
            .toRgbString(),
        border: primary,
    };
}

export function drawDocCustomRangeChrome(
    ctx: Pick<
        UniverRenderingContext,
        | 'beginPath'
        | 'fill'
        | 'fillStyle'
        | 'lineWidth'
        | 'restore'
        | 'roundRect'
        | 'save'
        | 'stroke'
        | 'strokeStyle'
    >,
    rect: IDocCustomRangeChromeRect,
    theme: IDocCustomRangeChromeTheme
): void {
    ctx.save();
    ctx.fillStyle = theme.background;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(
        rect.left,
        rect.top,
        rect.right - rect.left,
        rect.bottom - rect.top,
        DOC_CUSTOM_RANGE_CHROME_RADIUS
    );
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
