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

import type { IDocumentBody, IDocumentData, IParagraph, ITable, ITableCell, ITextRun, ITextStyle } from '@univerjs/core';
import type { IDocImage } from '@univerjs/docs-drawing';
import type { DataStreamTreeNode } from '@univerjs/engine-render';
import type { DocHtmlExportService } from './doc-html-export.service';
import {
    BaselineOffset,
    BooleanNumber,
    createParagraphId,
    createSectionId,
    CustomRangeType,
    DataStreamTreeNodeType,
    DocumentBlockRangeType,
    DrawingTypeEnum,
    HorizontalAlign,
    ImageSourceType,
    NamedStyleType,
    PresetListType,
    Tools,
} from '@univerjs/core';
import { parseDataStreamToTree } from '@univerjs/engine-render';

const DEFAULT_CLIPBOARD_FONT_FAMILY = 'Arial';

function covertImageToHtml(item: IDocImage) {
    const transformObjectToString = (obj: Record<string, string | number | undefined>) => {
        let result = '';
        Object.keys(obj).forEach((key) => {
            if (obj[key] !== undefined) {
                result += ` ${key}=${obj[key]}`;
            }
        });
        return result;
    };
    const obj = {
        'data-doc-transform-height': item.docTransform.size.height,
        'data-doc-transform-width': item.docTransform.size.width,
        'data-width': item.transform?.width,
        'data-height': item.transform?.height,
        'data-image-source-type': item.imageSourceType,
        'data-source': item.imageSourceType === ImageSourceType.UUID ? item.source : undefined,
        src: item.source,
    };
    return `<img  ${transformObjectToString(obj)}></img>`;
}

export function covertTextRunToHtml(dataStream: string, textRun: ITextRun): string {
    const { st: start, ed, ts = {} } = textRun;
    const { ff, fs, it, bl, ul, st, ol, bg, cl, va } = ts;

    let html = escapeInlineText(dataStream.slice(start, ed));
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
    style.push(`font-family: ${ff ?? DEFAULT_CLIPBOARD_FONT_FAMILY}`);

    // font color
    if (cl?.rgb) {
        style.push(`color: ${normalizeCssColor(cl.rgb)}`);
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
    if (bg?.rgb) {
        style.push(`background: ${normalizeCssColor(bg.rgb)}`);
    }

    return style.length ? `<span style="${style.join('; ')};">${html}</span>` : html;
}

function getBodyInlineSlice(body: IDocumentBody, startIndex: number, endIndex: number) {
    const { dataStream, textRuns = [] } = body;
    if (startIndex === endIndex) {
        return '';
    }
    let cursorIndex = startIndex;
    const spanList: string[] = [];

    for (const textRun of textRuns) {
        const { st, ed } = textRun;
        if (Tools.hasIntersectionBetweenTwoRanges(startIndex, endIndex, st, ed)) {
            if (st > cursorIndex) {
                spanList.push(escapeInlineText(dataStream.slice(cursorIndex, st)));

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
        spanList.push(escapeInlineText(dataStream.slice(cursorIndex, endIndex)));
    }

    return spanList.join('');
}

export function getBodySliceHtml(doc: IDocumentData, startIndex: number, endIndex: number) {
    const body = doc.body!;
    const drawings = doc.drawings || {};
    const { customRanges = [], customBlocks = [] } = body || {};
    const cloneCustomBlocks = [...customBlocks];
    const customRangesInRange = customRanges.filter((range) => range.startIndex >= startIndex && range.endIndex <= endIndex);
    let cursorIndex = startIndex;
    let html = '';
    const handleCustomBlock = (startIndex: number, endIndex: number) => {
        let sliceHtml = '';
        let customBlockLength = 0;
        let handleCustomBlockCursorIndex = startIndex;
        let blockItemIndex = cloneCustomBlocks.findIndex((block) => startIndex <= block.startIndex && endIndex >= block.startIndex);

        if (blockItemIndex === -1) {
            sliceHtml = getBodyInlineSlice(body, startIndex, endIndex);
            return { sliceHtml, customBlockLength };
        }

        while (blockItemIndex !== -1) {
            const blockItem = cloneCustomBlocks[blockItemIndex];
            cloneCustomBlocks.splice(blockItemIndex, 1);
            sliceHtml += getBodyInlineSlice(body, handleCustomBlockCursorIndex, blockItem.startIndex);
            const drawingItem = drawings[blockItem.blockId];
            if (drawingItem) {
                switch (drawingItem.drawingType) {
                    case DrawingTypeEnum.DRAWING_IMAGE: {
                        sliceHtml += covertImageToHtml(drawingItem as unknown as IDocImage);
                        customBlockLength++;
                        break;
                    }
                }
            }

            handleCustomBlockCursorIndex = blockItem.startIndex + 1;
            blockItemIndex = cloneCustomBlocks.findIndex((block) => handleCustomBlockCursorIndex <= block.startIndex && endIndex >= block.startIndex);
        }
        sliceHtml = sliceHtml + getBodyInlineSlice(body, handleCustomBlockCursorIndex, endIndex + 1);
        return { sliceHtml, customBlockLength };
    };
    customRangesInRange.forEach((range) => {
        const { startIndex, endIndex, rangeType, rangeId } = range;
        const preHtml = handleCustomBlock(cursorIndex, startIndex);
        html += preHtml.sliceHtml;
        const sliceHtml = handleCustomBlock(startIndex, endIndex + 1);
        switch (rangeType) {
            case CustomRangeType.HYPERLINK: {
                html += `<a data-rangeid="${rangeId}" href="${range.properties?.url ?? ''}">${sliceHtml.sliceHtml}</a>`;
                break;
            }
            default: {
                html += sliceHtml.sliceHtml;
                break;
            }
        }
        // If it involves customBlock, its placeholder needs to be skipped.
        cursorIndex = endIndex + 1 + (preHtml.customBlockLength + sliceHtml.customBlockLength);
    });
    const endHtml = handleCustomBlock(cursorIndex, endIndex);
    html += endHtml.sliceHtml;
    return html;
}

interface IHtmlResult {
    html: string;
    listStack?: IListHtmlContext[];
    tableIndex?: number;
    tableStack?: ITableHtmlContext[];
}

interface IListHtmlContext {
    tag: 'ol' | 'ul';
    level: number;
    listType: string;
}

interface ITableHtmlContext {
    table?: ITable;
    rowIndex: number;
    columnIndex: number;
}

export function convertBodyToHtml(doc: IDocumentData): string {
    const body = doc.body || {} as IDocumentBody;
    const { paragraphs = [], sectionBreaks = [] } = body;
    let { dataStream = '' } = body;

    if (!dataStream.endsWith('\r\n')) {
        dataStream += '\r\n';

        paragraphs.push({
            startIndex: dataStream.length - 2,
            paragraphId: createParagraphId(new Set(paragraphs.map((paragraph) => paragraph.paragraphId))),
        });

        sectionBreaks.push({
            sectionId: createSectionId(new Set(sectionBreaks.map((sectionBreak) => sectionBreak.sectionId))),
            startIndex: dataStream.length - 1,
        });

        body.dataStream = dataStream;
        body.paragraphs = paragraphs;
        body.sectionBreaks = sectionBreaks;
    }

    const result: IHtmlResult = { html: '' };

    const nodeList = parseDataStreamToTree(dataStream).sectionList;

    for (const node of nodeList) {
        processNode(node, doc, result);
    }

    closeListStack(result);

    return result.html;
}

// eslint-disable-next-line max-lines-per-function
function processNode(node: DataStreamTreeNode, doc: IDocumentData, result: IHtmlResult) {
    switch (node.nodeType) {
        case DataStreamTreeNodeType.SECTION_BREAK: {
            for (const n of node.children) {
                processNode(n, doc, result);
            }

            break;
        }

        case DataStreamTreeNodeType.PARAGRAPH: {
            const { children, startIndex, endIndex } = node;
            const paragraph = doc.body?.paragraphs?.find((p) => p.startIndex === endIndex) ?? {} as IParagraph;
            const { paragraphStyle = {} } = paragraph;
            const { horizontalAlign, spaceAbove, spaceBelow, lineSpacing } = paragraphStyle;
            const style = [];

            if (horizontalAlign != null) {
                const align = getTextAlign(horizontalAlign);
                if (align) {
                    style.push(`text-align: ${align}`);
                }
            }

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

            style.push(...serializeTextStyle(paragraphStyle.textStyle));

            const inlineHtml = applySemanticTextStyle(getBodySliceHtml(doc, startIndex, endIndex), paragraphStyle.textStyle);
            const childHtml = children.map((table) => {
                const childResult: IHtmlResult = { html: '' };
                processNode(table, doc, childResult);
                closeListStack(childResult);
                return childResult.html;
            }).join('');

            if (childHtml) {
                if (hasVisibleHtml(inlineHtml)) {
                    renderParagraphNodeHtml(doc, paragraph, startIndex, endIndex, inlineHtml, style, result);
                } else {
                    closeListStack(result);
                }

                result.html += childHtml;
                break;
            }

            renderParagraphNodeHtml(doc, paragraph, startIndex, endIndex, inlineHtml, style, result);

            break;
        }

        case DataStreamTreeNodeType.TABLE: {
            const { children } = node;

            closeListStack(result);
            result.tableIndex ??= 0;
            result.tableStack ??= [];
            const tableRange = doc.body?.tables?.[result.tableIndex++];
            const table = tableRange ? doc.tableSource?.[tableRange.tableId] : undefined;
            const width = table?.tableColumns?.reduce((sum, column) => sum + (column.size?.width?.v ?? 0), 0);
            const tableStyle = [
                'border-collapse: collapse',
                width ? `width: ${roundCssNumber(width)}px` : 'width: 100%',
            ].join('; ');

            result.tableStack.push({ table, rowIndex: -1, columnIndex: 0 });
            result.html += `<table class="MsoNormalTable UniverTable" style="${tableStyle};"><tbody>`;

            for (const row of children) {
                processNode(row, doc, result);
            }

            result.html += '</tbody></table>';
            result.tableStack.pop();

            break;
        }

        case DataStreamTreeNodeType.TABLE_ROW: {
            const { children } = node;
            const tableContext = result.tableStack?.[result.tableStack.length - 1];
            if (tableContext) {
                tableContext.rowIndex++;
                tableContext.columnIndex = 0;
            }
            const row = tableContext?.table?.tableRows?.[tableContext.rowIndex];
            const rowStyle = row?.trHeight?.val?.v != null ? ` style="height: ${roundCssNumber(row.trHeight.val.v)}px"` : '';

            result.html += `<tr class="UniverTableRow"${rowStyle}>`;
            for (const cell of children) {
                processNode(cell, doc, result);
            }
            result.html += '</tr>';

            break;
        }

        case DataStreamTreeNodeType.TABLE_CELL: {
            const { children } = node;
            const tableContext = result.tableStack?.[result.tableStack.length - 1];
            const row = tableContext?.table?.tableRows?.[tableContext.rowIndex];
            const cell = row?.tableCells?.[tableContext?.columnIndex ?? 0];
            if (tableContext) {
                tableContext.columnIndex++;
            }

            if (cell?.rowSpan === 0 || cell?.columnSpan === 0) {
                break;
            }

            result.html += `<td class="UniverTableCell"${serializeTableCellAttributes(cell)}>`;
            for (const n of children) {
                processNode(n, doc, result);
            }
            closeListStack(result);
            result.html += '</td>';
            break;
        }

        default: {
            throw new Error(`Unknown node type: ${node.nodeType}`);
        }
    }
}

function renderParagraphNodeHtml(doc: IDocumentData, paragraph: IParagraph, startIndex: number, endIndex: number, innerHtml: string, style: string[], result: IHtmlResult): void {
    const listItemHtml = renderListParagraphItemHtml(doc, paragraph, innerHtml, style);
    if (listItemHtml) {
        appendListParagraphHtml(result, listItemHtml);
        return;
    }

    closeListStack(result);
    result.html += renderBlockParagraphHtml(doc, paragraph, startIndex, endIndex, innerHtml, style);
}

function renderBlockParagraphHtml(doc: IDocumentData, paragraph: IParagraph, startIndex: number, endIndex: number, innerHtml: string, style: string[]): string {
    const blockRange = doc.body?.blockRanges?.find((range) => range.startIndex <= startIndex && endIndex <= range.endIndex + 1);
    if (blockRange && !hasVisibleHtml(innerHtml)) {
        return '';
    }

    const paragraphHtml = renderHeadingParagraphHtml(paragraph, innerHtml, style)
        ?? `<p class="UniverNormal" ${style.length ? `style="${style.join('; ')};"` : ''}>${innerHtml}</p>`;

    switch (blockRange?.blockType) {
        case DocumentBlockRangeType.QUOTE:
            return `<blockquote data-doc-type="quote" style="border-left: 4px solid #d0d7de; margin: 8px 0; padding: 4px 0 4px 12px; color: #57606a;">${paragraphHtml}</blockquote>`;
        case DocumentBlockRangeType.CODE:
            return `<pre data-doc-type="code-block" style="font-family: Consolas, 'Courier New', monospace; background: #f6f8fa; padding: 12px; border-radius: 6px; white-space: pre-wrap;"><code>${innerHtml.replace(/<\/?[^>]+>/g, '')}</code></pre>`;
        case DocumentBlockRangeType.CALLOUT:
            return `<aside data-doc-type="callout" role="note" style="background: #fff8c5; border-left: 4px solid #d4a72c; padding: 8px 12px; margin: 8px 0; border-radius: 4px;"><p><span data-callout-icon="true" style="margin-right: 6px;">💡</span>${innerHtml}</p></aside>`;
        default:
            return paragraphHtml;
    }
}

function renderHeadingParagraphHtml(paragraph: IParagraph, innerHtml: string, style: string[]): string | null {
    const headingLevel = getHeadingLevel(paragraph.paragraphStyle?.namedStyleType);
    if (!headingLevel) {
        return null;
    }

    return `<p class="UniverHeading" role="heading" aria-level="${headingLevel}" data-heading-level="${headingLevel}" ${style.length ? `style="${style.join('; ')};"` : ''}>${innerHtml}</p>`;
}

function renderListParagraphItemHtml(doc: IDocumentData, paragraph: IParagraph, innerHtml: string, style: string[]): { tag: 'ol' | 'ul'; level: number; listType: string; listStyle: string | null; html: string } | null {
    const bullet = paragraph.bullet;
    if (!bullet) {
        return null;
    }

    const ordered = isOrderedListType(String(bullet.listType));
    const tag = ordered ? 'ol' : 'ul';
    const level = bullet.nestingLevel ?? 0;
    const listStyle = getListStyleType(doc, String(bullet.listType), level);

    return {
        tag,
        level,
        listType: String(bullet.listType),
        listStyle,
        html: `<p class="UniverNormal" ${style.length ? `style="${style.join('; ')};"` : ''}>${innerHtml}</p>`,
    };
}

function appendListParagraphHtml(result: IHtmlResult, listItem: NonNullable<ReturnType<typeof renderListParagraphItemHtml>>): void {
    result.listStack ??= [];
    const stack = result.listStack;

    while (stack.length > listItem.level + 1) {
        result.html += `</li></${stack.pop()!.tag}>`;
    }

    const current = stack[stack.length - 1];
    if (current && current.level === listItem.level) {
        if (current.tag === listItem.tag && current.listType === listItem.listType) {
            result.html += '</li><li>';
        } else {
            result.html += `</li></${stack.pop()!.tag}>`;
            openList(result, listItem);
        }
    } else {
        while (stack.length < listItem.level) {
            openList(result, {
                ...listItem,
                level: stack.length,
            });
        }
        openList(result, listItem);
    }

    result.html += listItem.html;
}

function openList(result: IHtmlResult, listItem: NonNullable<ReturnType<typeof renderListParagraphItemHtml>>): void {
    const listStyleHtml = listItem.listStyle ? ` list-style-type: ${listItem.listStyle};` : '';
    const marginLeft = listItem.level > 0 ? ` margin-left: ${listItem.level * 24}px;` : '';
    result.html += `<${listItem.tag} data-doc-type="${listItem.tag === 'ol' ? 'ordered-list' : 'bullet-list'}" style="margin-top: 0; margin-bottom: 0;${marginLeft}${listStyleHtml}"><li>`;
    result.listStack!.push({ tag: listItem.tag, level: listItem.level, listType: listItem.listType });
}

function closeListStack(result: IHtmlResult): void {
    while (result.listStack?.length) {
        result.html += `</li></${result.listStack.pop()!.tag}>`;
    }
}

function serializeTableCellAttributes(cell?: ITableCell): string {
    if (!cell) {
        return '';
    }

    const attributes: string[] = [];
    const styles: string[] = [];

    if ((cell.rowSpan ?? 1) > 1) {
        attributes.push(`rowspan="${cell.rowSpan}"`);
    }
    if ((cell.columnSpan ?? 1) > 1) {
        attributes.push(`colspan="${cell.columnSpan}"`);
    }
    if (cell.size?.width?.v != null) {
        styles.push(`width: ${roundCssNumber(cell.size.width.v)}px`);
    }
    if (cell.backgroundColor?.rgb) {
        styles.push(`background-color: ${cell.backgroundColor.rgb}`);
    }

    ([
        ['top', cell.borderTop],
        ['right', cell.borderRight],
        ['bottom', cell.borderBottom],
        ['left', cell.borderLeft],
    ] as const).forEach(([side, border]) => {
        if (!border) {
            return;
        }

        styles.push(`border-${side}: ${roundCssNumber(border.width?.v ?? 1)}px solid ${border.color?.rgb ?? '#1f1f1f'}`);
    });

    if (styles.length) {
        attributes.push(`style="${styles.join('; ')};"`);
    }

    return attributes.length ? ` ${attributes.join(' ')}` : '';
}

function serializeTextStyle(textStyle: ITextStyle | undefined): string[] {
    if (!textStyle) {
        return [];
    }

    const { ff, fs, it, bl, ul, st, ol, bg, cl } = textStyle;
    const style: string[] = [];

    style.push(`font-family: ${ff ?? DEFAULT_CLIPBOARD_FONT_FAMILY}`);

    if (fs != null) {
        style.push(`font-size: ${fs}pt`);
    }

    if (cl?.rgb) {
        style.push(`color: ${normalizeCssColor(cl.rgb)}`);
    }

    if (bg?.rgb) {
        style.push(`background-color: ${normalizeCssColor(bg.rgb)}`);
    }

    if (bl === BooleanNumber.TRUE) {
        style.push('font-weight: bold');
    }

    if (it === BooleanNumber.TRUE) {
        style.push('font-style: italic');
    }

    const textDecorations: string[] = [];
    if (ul?.s === BooleanNumber.TRUE) {
        textDecorations.push('underline');
    }
    if (st?.s === BooleanNumber.TRUE) {
        textDecorations.push('line-through');
    }
    if (ol?.s === BooleanNumber.TRUE) {
        textDecorations.push('overline');
    }
    if (textDecorations.length) {
        style.push(`text-decoration: ${textDecorations.join(' ')}`);
    }

    return style;
}

function applySemanticTextStyle(html: string, textStyle: ITextStyle | undefined): string {
    if (!textStyle || !hasVisibleHtml(html)) {
        return html;
    }

    let result = html;
    if (textStyle.it === BooleanNumber.TRUE) {
        result = `<i>${result}</i>`;
    }
    if (textStyle.ul?.s === BooleanNumber.TRUE) {
        result = `<u>${result}</u>`;
    }
    if (textStyle.st?.s === BooleanNumber.TRUE) {
        result = `<s>${result}</s>`;
    }
    if (textStyle.bl === BooleanNumber.TRUE) {
        result = `<strong>${result}</strong>`;
    }

    return result;
}

function normalizeCssColor(color: string): string {
    const rgb = color.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+)?\s*\)$/i);
    if (!rgb) {
        return color;
    }

    return `#${rgb.slice(1, 4).map((part) => Math.max(0, Math.min(255, Number(part))).toString(16).padStart(2, '0')).join('')}`;
}

function roundCssNumber(value: number): number {
    return Math.round(value * 100) / 100;
}

function getHeadingLevel(namedStyleType?: NamedStyleType): number | null {
    switch (namedStyleType) {
        case NamedStyleType.TITLE:
        case NamedStyleType.HEADING_1: return 1;
        case NamedStyleType.HEADING_2: return 2;
        case NamedStyleType.HEADING_3: return 3;
        case NamedStyleType.HEADING_4: return 4;
        case NamedStyleType.HEADING_5: return 5;
        default: return null;
    }
}

function getTextAlign(horizontalAlign: HorizontalAlign): string | null {
    switch (horizontalAlign) {
        case HorizontalAlign.LEFT:
            return 'left';
        case HorizontalAlign.CENTER:
            return 'center';
        case HorizontalAlign.RIGHT:
            return 'right';
        case HorizontalAlign.JUSTIFIED:
        case HorizontalAlign.BOTH:
            return 'justify';
        default:
            return null;
    }
}

function isOrderedListType(listType: string): boolean {
    return listType.includes('ORDER') || listType === PresetListType.ORDER_LIST;
}

function getListStyleType(doc: IDocumentData, listType: string, level: number): string | null {
    const glyphType = doc.lists?.[listType]?.nestingLevel?.[level]?.glyphType;
    switch (glyphType) {
        case 3: return 'upper-alpha';
        case 4: return 'lower-alpha';
        case 5: return 'upper-roman';
        case 6: return 'lower-roman';
        default: return isOrderedListType(listType) ? 'decimal' : null;
    }
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeInlineText(value: string): string {
    return escapeHtml(stripDataStreamControlChars(value)).replace(/\r\n|\r|\n/g, '<br>');
}

function stripDataStreamControlChars(value: string): string {
    return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

function hasVisibleHtml(html: string): boolean {
    return /<(?:img|br)\b/i.test(html) || html
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .trim()
        .length > 0;
}

export class UDMToHtmlService {
    constructor(
        private readonly _docHtmlExportService?: Pick<DocHtmlExportService, 'transformDocumentForHtmlExport'>
    ) {
    }

    convert(docList: IDocumentData[]): string {
        if (docList.length === 0) {
            throw new Error('The bodyList length at least to be 1');
        }

        let html = '';

        for (const doc of Tools.deepClone(docList)) {
            html += convertBodyToHtml(this._docHtmlExportService?.transformDocumentForHtmlExport(doc) ?? doc);
        }

        return html;
    }
}
