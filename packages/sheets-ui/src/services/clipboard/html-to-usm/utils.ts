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

import type { IParagraph, IParagraphStyle, ITextRun, Nullable } from '@univerjs/core';
import type { ICellDataWithSpanInfo } from '../type';
import { DataStreamTreeTokenType, Tools } from '@univerjs/core';
import { ptToPixel } from '@univerjs/engine-render';

export default function parseToDom(rawHtml: string) {
    const template = document.createElement('body');
    template.innerHTML = rawHtml;
    return template;
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
                paragraphStyle.spaceAbove = { v: /pt/.test(cssValue) ? ptToPixel(marginTopValue) : marginTopValue };
                break;
            }

            case 'margin-bottom': {
                const marginBottomValue = Number.parseInt(cssValue);
                paragraphStyle.spaceBelow = { v: /pt/.test(cssValue) ? ptToPixel(marginBottomValue) : marginBottomValue };

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

export function convertToCellStyle(cell: ICellDataWithSpanInfo, dataStream: string, textRuns: ITextRun[] | undefined) {
    const dataStreamLength = dataStream.length;
    const textRunsLength = textRuns?.length ?? 0;
    const canConvertToCellStyle = textRunsLength === 1 && textRuns![0].st === 0 && textRuns![0].ed === dataStreamLength;

    if (cell.p) {
        if (canConvertToCellStyle && cell.p.body?.textRuns?.length) {
            cell.p.body.textRuns = [];
            return {
                ...cell,
                s: textRuns![0].ts,
            };
        } else {
            return cell;
        }
    } else {
        if (canConvertToCellStyle) {
            return {
                ...cell,
                s: textRuns![0].ts,
            };
        } else {
            return cell;
        }
    }

    return cell;
}
