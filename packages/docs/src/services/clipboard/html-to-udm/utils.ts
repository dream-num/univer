import type { IParagraphStyle, Nullable } from '@univerjs/core';

// TODO: @JOCS, Complete other missing attributes that exist in IParagraphStyle
export function getParagraphStyle(el: HTMLElement): Nullable<IParagraphStyle> {
    const styles = el.style;

    const paragraphStyle: IParagraphStyle = {};

    for (let i = 0; i < styles.length; i++) {
        const cssRule = styles[i];
        const cssValue = styles.getPropertyValue(cssRule);

        switch (cssRule) {
            case 'margin-top': {
                const marginTopValue = parseInt(cssValue);
                paragraphStyle.spaceAbove = /pt/.test(cssValue) ? ptToPixel(marginTopValue) : marginTopValue;
                break;
            }

            case 'margin-bottom': {
                const marginBottomValue = parseInt(cssValue);
                paragraphStyle.spaceBelow = /pt/.test(cssValue) ? ptToPixel(marginBottomValue) : marginBottomValue;

                break;
            }

            default: {
                break;
            }
        }
    }

    return Object.getOwnPropertyNames(paragraphStyle).length ? paragraphStyle : null;
}

export function ptToPixel(pt: number) {
    // 1 pixel * 0.75 = 1 pt
    const PX_TO_PT_RATIO = 0.75;

    return pt / PX_TO_PT_RATIO;
}
