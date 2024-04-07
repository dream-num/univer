/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IParagraph, IParagraphStyle, Nullable } from '@univerjs/core';
import { DataStreamTreeTokenType, Tools } from '@univerjs/core';
import { ptToPixel } from '@univerjs/engine-render';

export default function parseToDom(rawHtml: string) {
    const parser = new DOMParser();
    const html = `<x-univer id="univer-root">${rawHtml}</x-univer>`;
    const doc = parser.parseFromString(html, 'text/html');

    return doc.querySelector('#univer-root');
}

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
                paragraphStyle.spaceAbove = /pt/.test(cssValue) ? ptToPixel(marginTopValue) : marginTopValue;
                break;
            }

            case 'margin-bottom': {
                const marginBottomValue = Number.parseInt(cssValue);
                paragraphStyle.spaceBelow = /pt/.test(cssValue) ? ptToPixel(marginBottomValue) : marginBottomValue;

                break;
            }

            case 'line-height': {
                const lineHeightValue = Number.parseFloat(cssValue);
                paragraphStyle.lineSpacing = lineHeightValue;

                break;
            }

            default: {
                // console.log(`Unhandled css rule ${cssRule} in getParagraphStyle`);
                break;
            }
        }
    }

    return Object.getOwnPropertyNames(paragraphStyle).length ? paragraphStyle : null;
}

export function generateParagraphs(dataStream: string, prevParagraph?: IParagraph): IParagraph[] {
    const paragraphs: IParagraph[] = [];

    for (let i = 0, len = dataStream.length; i < len; i++) {
        const char = dataStream[i];

        if (char !== DataStreamTreeTokenType.PARAGRAPH) {
            continue;
        }

        paragraphs.push({
            startIndex: i,
        });
    }

    if (prevParagraph) {
        for (const paragraph of paragraphs) {
            if (prevParagraph.bullet) {
                paragraph.bullet = Tools.deepClone(prevParagraph.bullet);
            }

            if (prevParagraph.paragraphStyle) {
                paragraph.paragraphStyle = Tools.deepClone(prevParagraph.paragraphStyle);
            }
        }
    }

    return paragraphs;
}
