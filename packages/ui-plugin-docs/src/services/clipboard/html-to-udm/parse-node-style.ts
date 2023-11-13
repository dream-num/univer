import { ptToPx } from '@univerjs/base-render';
import { BooleanNumber, ITextStyle } from '@univerjs/core';

export default function extractNodeStyle(node: HTMLElement): ITextStyle {
    const styles = node.style;
    const docStyles: ITextStyle = {};
    const tagName = node.tagName;

    switch (tagName.toLocaleLowerCase()) {
        case 'b':
        case 'em':
        case 'strong': {
            docStyles.bl = BooleanNumber.TRUE;
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
                docStyles.fs = /pt$/.test(cssValue) ? ptToPx(fontSize) : fontSize;

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
