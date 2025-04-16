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

import type { ITextStyle } from '@univerjs/core';
import { BaselineOffset, BooleanNumber, ColorKit } from '@univerjs/core';
import { DEFAULT_BACKGROUND_COLOR_RGB, DEFAULT_BACKGROUND_COLOR_RGBA } from '@univerjs/ui';

export function extractNodeStyle(node: HTMLElement, predefinedStyles?: Record<string, string>): ITextStyle {
    const styles = predefinedStyles ?? node.style;
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

    parseStyleByProperty(styles, docStyles);
    return docStyles;
}

function parseStyleByProperty(styles: CSSStyleDeclaration | Record<string, string>, docStyles: ITextStyle) {
    if (styles instanceof CSSStyleDeclaration) {
        for (let i = 0; i < styles.length; i++) {
            const cssRule = styles[i];
            const cssValue = styles.getPropertyValue(cssRule);
            handleStyle(cssRule, cssValue, docStyles);
        }
    } else {
        for (const cssRule in styles) {
            const cssValue = styles[cssRule];
            handleStyle(cssRule, cssValue, docStyles);
        }
    }
}

// eslint-disable-next-line complexity
function handleStyle(cssRule: string, cssValue: string, docStyles: ITextStyle) {
    switch (cssRule) {
        case 'font-family':
            docStyles.ff = cssValue;
            break;
        case 'font-size': {
            const fontSize = Number.parseInt(cssValue);
            if (!Number.isNaN(fontSize)) {
                if (cssValue.endsWith('pt')) {
                    docStyles.fs = fontSize;
                } else if (cssValue.endsWith('px')) {
                    docStyles.fs = fontSize * 0.75;
                }
            }
            break;
        }
        case 'font-style':
            if (cssValue === 'italic') {
                docStyles.it = BooleanNumber.TRUE;
            }
            break;
        case 'font-weight': {
            const MIDDLE_FONT_WEIGHT = 400;
            if (Number(cssValue) > MIDDLE_FONT_WEIGHT || cssValue === 'bold') {
                docStyles.bl = BooleanNumber.TRUE;
            }
            break;
        }
        case 'text-decoration': {
            if (/underline/.test(cssValue)) {
                docStyles.ul = { s: BooleanNumber.TRUE };
            } else if (/overline/.test(cssValue)) {
                docStyles.ol = { s: BooleanNumber.TRUE };
            } else if (/line-through/.test(cssValue)) {
                docStyles.st = { s: BooleanNumber.TRUE };
            }
            break;
        }
        case 'color': {
            try {
                const color = new ColorKit(cssValue);

                if (color.isValid) {
                    docStyles.cl = {
                        rgb: color.toRgbString(),
                    };
                }
            // eslint-disable-next-line unused-imports/no-unused-vars
            } catch (_e) {
                // ignore
            }
            break;
        }
        case 'background-color': {
            const color = new ColorKit(cssValue);
            const bgColor = color.isValid ? color.toRgbString() : '';
            if (bgColor !== DEFAULT_BACKGROUND_COLOR_RGB && bgColor !== DEFAULT_BACKGROUND_COLOR_RGBA) {
                docStyles.bg = { rgb: bgColor };
            }
            break;
        }
        default:
            break;
    }
};
