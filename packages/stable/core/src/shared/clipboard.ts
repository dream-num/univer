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

import type { IDocumentBody, ITextRun } from '../types/interfaces';
import { BaselineOffset, BooleanNumber } from '../types/enum';
import { Tools } from './tools';

export function getBodySliceHtml(body: IDocumentBody, startIndex: number, endIndex: number) {
    const { dataStream, textRuns = [] } = body;
    let cursorIndex = startIndex;
    const spanList: string[] = [];

    for (const textRun of textRuns) {
        const { st, ed } = textRun;
        if (Tools.hasIntersectionBetweenTwoRanges(startIndex, endIndex, st, ed)) {
            if (st > cursorIndex) {
                spanList.push(dataStream.slice(cursorIndex, st));

                spanList.push(covertTextRunToHtml(dataStream, {
                    ...textRun,
                    ed: Math.min(ed, endIndex),
                }));
            } else {
                spanList.push(covertTextRunToHtml(dataStream, {
                    ...textRun,
                    st: cursorIndex,
                    ed: Math.min(ed, endIndex),
                }));
            }
        }

        cursorIndex = Math.max(startIndex, Math.min(ed, endIndex));
    }

    if (cursorIndex !== endIndex) {
        spanList.push(dataStream.slice(cursorIndex, endIndex));
    }

    return spanList.join('');
}

export function convertBodyToHtml(body: IDocumentBody, withParagraphInfo: boolean = true): string {
    if (withParagraphInfo && body.paragraphs?.length) {
        const { dataStream, paragraphs = [] } = body;
        let result = '';
        let cursorIndex = -1;
        for (const paragraph of paragraphs) {
            const { startIndex, paragraphStyle = {} } = paragraph;
            const { spaceAbove, spaceBelow, lineSpacing } = paragraphStyle;
            const style = [];

            if (spaceAbove != null) {
                if (typeof spaceAbove === 'number') {
                    style.push(`margin-top: ${spaceAbove}px`);
                } else {
                    style.push(`margin-top: ${spaceAbove.v}px`);
                }
            }

            if (spaceBelow != null) {
                if (typeof spaceBelow === 'number') {
                    style.push(`margin-bottom: ${spaceBelow}px`);
                } else {
                    style.push(`margin-bottom: ${spaceBelow.v}px`);
                }
            }

            if (lineSpacing != null) {
                style.push(`line-height: ${lineSpacing}`);
            }

            if (startIndex > cursorIndex + 1) {
                result += `<p class="UniverNormal" ${style.length ? `style="${style.join('; ')};"` : ''
                }>${getBodySliceHtml(body, cursorIndex + 1, startIndex)}</p>`;
            } else {
                result += `<p class="UniverNormal" ${style.length ? `style="${style.join('; ')};"` : ''
                }></p>`;
            }

            cursorIndex = startIndex;
        }

        if (cursorIndex !== dataStream.length) {
            result += getBodySliceHtml(body, cursorIndex, dataStream.length);
        }

        return result;
    } else {
        return getBodySliceHtml(body, 0, body.dataStream.length);
    }
}

export function covertTextRunToHtml(dataStream: string, textRun: ITextRun): string {
    const { st: start, ed, ts = {} } = textRun;
    const { ff, fs, it, bl, ul, st, ol, bg, cl, va } = ts;

    let html = dataStream.slice(start, ed);
    const style: string[] = [];

    // italic
    if (it === BooleanNumber.TRUE) {
        html = `<i>${html}</i>`;
    }

    // subscript and superscript
    if (va === BaselineOffset.SUPERSCRIPT) {
        html = `<sup>${html}</sup>`;
    } else if (va === BaselineOffset.SUBSCRIPT) {
        html = `<sub>${html}</sub>`;
    }

    // underline
    if (ul?.s === BooleanNumber.TRUE) {
        html = `<u>${html}</u>`;
    }

    // strick-through
    if (st?.s === BooleanNumber.TRUE) {
        html = `<s>${html}</s>`;
    }

    // bold
    if (bl === BooleanNumber.TRUE) {
        html = `<strong>${html}</strong>`;
    }

    // font family
    if (ff) {
        style.push(`font-family: ${ff}`);
    }

    // font color
    if (cl) {
        style.push(`color: ${cl.rgb}`);
    }

    // font size
    if (fs) {
        style.push(`font-size: ${fs}pt`);
    }

    // overline
    if (ol) {
        style.push('text-decoration: overline');
    }

    // background color
    if (bg) {
        style.push(`background: ${bg.rgb}`);
    }

    return style.length ? `<span style="${style.join('; ')};">${html}</span>` : html;
}
