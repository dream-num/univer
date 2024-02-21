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

import type { IDocumentBody, ITextRun } from '@univerjs/core';
import { BaselineOffset, BooleanNumber } from '@univerjs/core';

function covertTextRunToHtml(dataStream: string, textRun: ITextRun): string {
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
        style.push(`font-size: ${fs}px`);
    }

    // overline
    if (ol) {
        style.push('text-decoration: overline');
    }

    // background color
    if (bg) {
        style.push(`background: ${bg.rgb}`);
    }

    return style.length ? `<span style="${style.join(';')}">${html}</span>` : html;
}

function translateDataStreamToHtml(body: IDocumentBody, withParagraphInfo: boolean = true): string {
    const { dataStream, textRuns = [], paragraphs = [] } = body;
    let cursorIndex = 0;
    const spanList: string[] = [];
    const paragraphList: string[] = [];

    for (const textRun of textRuns) {
        const { st, ed } = textRun;
        if (st !== cursorIndex) {
            spanList.push(dataStream.slice(cursorIndex, st));
        }

        spanList.push(covertTextRunToHtml(dataStream, textRun));

        cursorIndex = ed;

        if (withParagraphInfo) {
            for (const paragraph of paragraphs) {
                const { startIndex, paragraphStyle = {} } = paragraph;

                if (startIndex >= st && startIndex <= ed) {
                    const { spaceAbove, spaceBelow } = paragraphStyle;
                    const style: string[] = [];

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

                    paragraphList.push(
                        `<p className="UniverNormal" ${
                            style.length ? `style="${style.join(';')}"` : ''
                        }>${spanList.join('')}</p>`
                    );
                    spanList.length = 0;
                }
            }
        }
    }

    if (cursorIndex < dataStream.length) {
        spanList.push(dataStream.slice(cursorIndex, dataStream.length));
    }

    return paragraphList.join('') + spanList.join('');
}

export class UDMToHtmlService {
    convert(bodyList: IDocumentBody[]): string {
        if (bodyList.length === 0) {
            throw new Error('The bodyList length at least to be 1');
        }

        // If only one selection range of content is copied, the paragraph information will be used,
        // otherwise, the paragraph information will be discarded and a paragraph
        // will be generated for each body
        if (bodyList.length === 1) {
            return translateDataStreamToHtml(bodyList[0]);
        }

        let html = '';

        for (const body of bodyList) {
            html += '<p className="UniverNormal">';
            html += translateDataStreamToHtml(body, false);
            html += '</p>';
        }

        return html;
    }
}
