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

import type { IParagraphStyle, Nullable } from '@univerjs/core';
import { ptToPixel } from '@univerjs/engine-render';

// TODO: @JOCS, Complete other missing attributes that exist in IParagraphStyle
export function getParagraphStyle(el: HTMLElement): Nullable<IParagraphStyle> {
    const styles = el.style;

    const paragraphStyle: IParagraphStyle = {};

    for (let i = 0; i < styles.length; i++) {
        const cssRule = styles[i];
        const cssValue = styles.getPropertyValue(cssRule);

        switch (cssRule) {
            case 'margin-top': {
                const marginTopValue = Number.parseInt(cssValue);
                paragraphStyle.spaceAbove = { v: /pt/.test(cssValue) ? ptToPixel(marginTopValue) : marginTopValue };
                break;
            }

            case 'margin-bottom': {
                const marginBottomValue = Number.parseInt(cssValue);
                paragraphStyle.spaceBelow = { v: /pt/.test(cssValue) ? ptToPixel(marginBottomValue) : marginBottomValue };

                break;
            }

            case 'line-height': {
                let lineHeightValue = Number.parseFloat(cssValue);
                if (cssValue.endsWith('%')) {
                    lineHeightValue /= 100;
                }
                paragraphStyle.lineSpacing = lineHeightValue;

                break;
            }

            default: {
                break;
            }
        }
    }

    return Object.getOwnPropertyNames(paragraphStyle).length ? paragraphStyle : null;
}
