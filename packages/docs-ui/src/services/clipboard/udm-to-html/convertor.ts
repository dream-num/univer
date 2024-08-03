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

import type { IDocumentBody, IParagraph, ITextRun } from '@univerjs/core';
import { BaselineOffset, BooleanNumber, DataStreamTreeNodeType, Tools } from '@univerjs/core';
import type { DataStreamTreeNode } from '@univerjs/engine-render';
import { parseDataStreamToTree } from '@univerjs/engine-render';

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

interface IHtmlResult {
    html: string;
}

export function convertBodyToHtml(body: IDocumentBody): string {
    const { paragraphs = [], sectionBreaks = [] } = body;
    let { dataStream } = body;

    if (!dataStream.endsWith('\r\n')) {
        dataStream += '\r\n';

        paragraphs.push({
            startIndex: dataStream.length - 2,
        });

        sectionBreaks.push({
            startIndex: dataStream.length - 1,
        });

        body.dataStream = dataStream;
        body.paragraphs = paragraphs;
        body.sectionBreaks = sectionBreaks;
    }

    const result: IHtmlResult = { html: '' };

    const nodeList = parseDataStreamToTree(dataStream);

    for (const node of nodeList) {
        processNode(node, body, result);
    }

    return result.html;
}

// eslint-disable-next-line max-lines-per-function
function processNode(node: DataStreamTreeNode, body: IDocumentBody, result: IHtmlResult) {
    switch (node.nodeType) {
        case DataStreamTreeNodeType.SECTION_BREAK: {
            for (const n of node.children) {
                processNode(n, body, result);
            }

            break;
        }

        case DataStreamTreeNodeType.PARAGRAPH: {
            const { children, startIndex, endIndex } = node;
            const paragraph = body.paragraphs!.find((p) => p.startIndex === endIndex) ?? {} as IParagraph;
            const { paragraphStyle = {} } = paragraph;
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

            result.html += `<p class="UniverNormal" ${style.length ? `style="${style.join('; ')};"` : ''}>`;

            if (children.length) {
                for (const table of children) {
                    processNode(table, body, result);
                }
            }

            result.html += `${getBodySliceHtml(body, startIndex, endIndex)}</p>`;

            break;
        }

        case DataStreamTreeNodeType.TABLE: {
            const { children } = node;

            result.html += '<table class="UniverTable" style="width: 100%; border-collapse: collapse;"><tbody>';

            for (const row of children) {
                processNode(row, body, result);
            }

            result.html += '</tbody></table>';

            break;
        }

        case DataStreamTreeNodeType.TABLE_ROW: {
            const { children } = node;

            result.html += '<tr class="UniverTableRow">';
            for (const cell of children) {
                processNode(cell, body, result);
            }
            result.html += '</tr>';

            break;
        }

        case DataStreamTreeNodeType.TABLE_CELL: {
            const { children } = node;

            result.html += '<td class="UniverTableCell">';
            for (const n of children) {
                processNode(n, body, result);
            }
            result.html += '</td>';
            break;
        }

        default: {
            throw new Error(`Unknown node type: ${node.nodeType}`);
        }
    }
}

export class UDMToHtmlService {
    convert(bodyList: IDocumentBody[]): string {
        if (bodyList.length === 0) {
            throw new Error('The bodyList length at least to be 1');
        }

        let html = '';

        for (const body of Tools.deepClone(bodyList)) {
            html += convertBodyToHtml(body);
        }

        return html;
    }
}
