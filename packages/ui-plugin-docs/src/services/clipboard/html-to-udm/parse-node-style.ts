import { BaselineOffset, BooleanNumber, ITextStyle } from '@univerjs/core';

export default function extractNodeStyle(node: HTMLElement): ITextStyle {
    const styles = node.style;
    const docStyles: ITextStyle = {};
    const tagName = node.tagName.toLowerCase();

    switch (tagName) {
        case 'b':
        case 'em':
        case 'strong': {
            docStyles.bl = BooleanNumber.TRUE;
            break;
        }

        case 's': {
            docStyles.st = {
                s: BooleanNumber.TRUE,
            };
            break;
        }

        case 'u': {
            docStyles.ul = {
                s: BooleanNumber.TRUE,
            };
            break;
        }

        case 'i': {
            docStyles.it = BooleanNumber.TRUE;
            break;
        }

        case 'sub':
        case 'sup': {
            docStyles.va = tagName === 'sup' ? BaselineOffset.SUPERSCRIPT : BaselineOffset.SUBSCRIPT;
            break;
        }
    }

    for (let i = 0; i < styles.length; i++) {
        const cssRule = styles[i];
        const cssValue = styles.getPropertyValue(cssRule);

        switch (cssRule) {
            case 'font-family': {
                docStyles.ff = cssValue;

                break;
            }

            case 'font-size': {
                const fontSize = parseInt(cssValue);
                // TODO: @JOCS, hand other CSS value unit, rem, em, pt, %
                // 1 pixel * 0.75 = 1 pt
                const PX_TO_PT_RATIO = 0.75;
                docStyles.fs = /pt$/.test(cssValue) ? fontSize / PX_TO_PT_RATIO : fontSize;

                break;
            }

            case 'font-style': {
                if (cssValue === 'italic') {
                    docStyles.it = BooleanNumber.TRUE;
                }

                break;
            }

            case 'font-weight': {
                const MIDDLE_FONT_WEIGHT = 400;

                if (Number(cssValue) > MIDDLE_FONT_WEIGHT) {
                    docStyles.bl = BooleanNumber.TRUE;
                }

                break;
            }

            case 'text-decoration': {
                // TODO: @JOCS， Parse CSS values like: underline dotted;
                if (/underline/.test(cssValue)) {
                    docStyles.ul = {
                        s: BooleanNumber.TRUE,
                    };
                } else if (/overline/.test(cssValue)) {
                    docStyles.ol = {
                        s: BooleanNumber.TRUE,
                    };
                } else if (/line-through/.test(cssValue)) {
                    docStyles.st = {
                        s: BooleanNumber.TRUE,
                    };
                }

                break;
            }

            case 'color': {
                docStyles.cl = {
                    rgb: cssValue,
                };

                break;
            }

            case 'background-color': {
                docStyles.bg = {
                    rgb: cssValue,
                };

                break;
            }

            default: {
                // console.log(`Unhandled css rule ${cssRule}`);
                break;
            }
        }
    }

    return docStyles;
}
