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

import type { DocumentDataModel, IDocumentBody, IParagraph, Nullable } from '@univerjs/core';
import type {
    Documents,
    IDocumentSkeletonColumn,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonSection,
    IPageRenderConfig,
    IRenderContext,
    IRenderModule,
    UniverRenderingContext,
} from '@univerjs/engine-render';
import type { IUniverDocsUIConfig } from '../../config/config';
import type { LocaleKey } from '../../locale/types';
import {
    DataStreamTreeTokenType,
    Disposable,
    DocumentFlavor,
    IConfigService,
    Inject,
    isInternalEditorID,
    LocaleService,
    NAMED_STYLE_MAP,
    NamedStyleType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { getDocsTableRenderViewport, getDocsTableViewportLeft, getTableIdAndSliceIndex } from '@univerjs/engine-render';
import { DOCS_UI_PLUGIN_CONFIG_KEY } from '../../config/config';

const PLACEHOLDER_COLOR = 'gray.400';
const DEFAULT_PLACEHOLDER_FONT_SIZE = 12;
const MIN_BODY_TEXT_PLACEHOLDER_FONT_SIZE = 16;
const DEFAULT_PLACEHOLDER_FONT_FAMILY = 'Arial';
const LIST_PLACEHOLDER_GAP = 4;

export interface IParagraphPlaceholderLayout {
    clipBottom?: number;
    clipLeft?: number;
    clipRight?: number;
    clipTop?: number;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    maxWidth: number;
    text: string;
    x: number;
    y: number;
}

interface IParagraphPlaceholderLocale {
    heading1: string;
    heading2: string;
    heading3: string;
    heading4: string;
    heading5: string;
    listItem: string;
    normalText: string;
}

interface IParagraphPlaceholderLayoutOptions {
    docsLeft?: number;
    unitId?: string;
}

interface IParagraphPlaceholderClip {
    left: number;
    right: number;
}

export class DocParagraphPlaceholderRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(DocSelectionManagerService) private readonly _docSelectionManagerService: DocSelectionManagerService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        this._initParagraphPlaceholderRender();
    }

    private _initParagraphPlaceholderRender(): void {
        const config = this._configService.getConfig<IUniverDocsUIConfig>(DOCS_UI_PLUGIN_CONFIG_KEY);
        if (!shouldRenderParagraphPlaceholder(this._context.unit, this._context.unitId, config)) {
            return;
        }

        const documents = this._context.mainComponent as Documents | undefined;
        if (!documents) {
            return;
        }

        this.disposeWithMe(documents.pageRender$.subscribe((pageRenderConfig) => this._drawPagePlaceholders(pageRenderConfig)));
        this.disposeWithMe(this._docSelectionManagerService.textSelection$.subscribe(({ unitId }) => {
            if (unitId === this._context.unitId) {
                documents.makeDirty(true);
            }
        }));
    }

    private _drawPagePlaceholders({ page, pageLeft, pageTop, ctx }: IPageRenderConfig): void {
        const body = this._context.unit.getSelfOrHeaderFooterModel(page.segmentId)?.getBody();
        if (!body) {
            return;
        }

        const activeRange = this._docSelectionManagerService.getActiveTextRange();
        if (!activeRange || (activeRange.segmentId ?? '') !== (page.segmentId ?? '')) {
            return;
        }
        if (
            activeRange.startOffset == null ||
            activeRange.endOffset == null ||
            activeRange.startOffset !== activeRange.endOffset
        ) {
            return;
        }

        const placeholders = getParagraphPlaceholderLayouts(
            page,
            body,
            this._getLocale(),
            pageLeft,
            pageTop,
            activeRange.startOffset,
            {
                docsLeft: (this._context.mainComponent as Documents | undefined)?.getOffsetConfig().docsLeft,
                unitId: this._context.unitId,
            }
        );
        if (!placeholders.length) {
            return;
        }

        drawParagraphPlaceholders(ctx, placeholders);
    }

    private _getLocale(): IParagraphPlaceholderLocale {
        return {
            heading1: this._localeService.t<LocaleKey>('docs-ui.placeholder.heading1'),
            heading2: this._localeService.t<LocaleKey>('docs-ui.placeholder.heading2'),
            heading3: this._localeService.t<LocaleKey>('docs-ui.placeholder.heading3'),
            heading4: this._localeService.t<LocaleKey>('docs-ui.placeholder.heading4'),
            heading5: this._localeService.t<LocaleKey>('docs-ui.placeholder.heading5'),
            listItem: this._localeService.t<LocaleKey>('docs-ui.placeholder.listItem'),
            normalText: this._localeService.t<LocaleKey>('docs-ui.placeholder.normalText'),
        };
    }
}

export function shouldRenderParagraphPlaceholder(
    documentModel: DocumentDataModel,
    unitId: string,
    config?: Nullable<IUniverDocsUIConfig>
): boolean {
    if (config?.placeholder === false) {
        return false;
    }

    if (isInternalEditorID(unitId)) {
        return false;
    }

    return documentModel.getSnapshot().documentStyle?.documentFlavor === DocumentFlavor.MODERN;
}

export function getParagraphPlaceholderLayouts(
    page: IDocumentSkeletonPage,
    body: IDocumentBody,
    locale: IParagraphPlaceholderLocale,
    pageLeft = 0,
    pageTop = 0,
    activeOffset: number,
    options?: IParagraphPlaceholderLayoutOptions
): IParagraphPlaceholderLayout[] {
    const paragraphs = new Map((body.paragraphs ?? []).map((paragraph) => [paragraph.startIndex, paragraph]));
    const layouts: IParagraphPlaceholderLayout[] = [];

    const visitSection = (
        section: IDocumentSkeletonSection,
        originLeft: number,
        originTop: number,
        clip?: IParagraphPlaceholderClip
    ) => {
        for (const column of section.columns) {
            visitColumn(
                column,
                body,
                paragraphs,
                locale,
                layouts,
                originLeft + column.left,
                originTop + section.top,
                activeOffset,
                clip
            );
        }
    };

    for (const section of page.sections) {
        visitSection(section, pageLeft + page.marginLeft, pageTop + page.marginTop);
    }

    page.skeTables?.forEach((table, tableId) => {
        const sourceTableId = getTableIdAndSliceIndex(table.tableId ?? tableId).tableId;
        const viewport = getDocsTableRenderViewport(options?.unitId ?? '', sourceTableId);
        const hasHorizontalViewport = viewport != null &&
            (viewport.leadingInsetLeft ?? 0) +
            viewport.contentWidth +
            (viewport.trailingInsetRight ?? 0) > viewport.viewportWidth;
        const tableLeft = pageLeft + page.marginLeft + table.left;
        const tableViewportLeft = hasHorizontalViewport
            ? getDocsTableViewportLeft(
                viewport,
                tableLeft - (viewport.leadingInsetLeft ?? 0),
                options?.docsLeft
            )
            : tableLeft;
        const tableViewportRight = tableViewportLeft +
            (hasHorizontalViewport ? viewport.viewportWidth : table.width);
        const tableScrollLeft = hasHorizontalViewport ? viewport.scrollLeft : 0;

        for (const row of table.rows) {
            for (const cell of row.cells) {
                const cellLeft = tableLeft + cell.left - tableScrollLeft;
                const cellContentLeft = cellLeft + cell.marginLeft;
                const cellContentRight = cellLeft + cell.pageWidth - cell.marginRight;
                const clipLeft = Math.max(cellContentLeft, tableViewportLeft);
                const clipRight = Math.min(cellContentRight, tableViewportRight);
                if (clipRight <= clipLeft) {
                    continue;
                }

                for (const section of cell.sections) {
                    visitSection(
                        section,
                        cellContentLeft,
                        pageTop + page.marginTop + table.top + row.top + cell.marginTop,
                        { left: clipLeft, right: clipRight }
                    );
                }
            }
        }
    });

    return layouts;
}

function visitColumn(
    column: IDocumentSkeletonColumn,
    body: IDocumentBody,
    paragraphs: Map<number, IParagraph>,
    locale: IParagraphPlaceholderLocale,
    layouts: IParagraphPlaceholderLayout[],
    originLeft: number,
    originTop: number,
    activeOffset: number,
    clip?: IParagraphPlaceholderClip
): void {
    for (const line of column.lines) {
        if (!line.paragraphStart) {
            continue;
        }

        const paragraphStart = line.st;
        const paragraphEnd = line.paragraphIndex;
        if (!isOffsetInParagraph(activeOffset, paragraphStart, paragraphEnd)) {
            continue;
        }

        const paragraph = paragraphs.get(paragraphEnd);
        if (!paragraph || !isEmptyParagraph(body.dataStream, line.st, line.paragraphIndex)) {
            continue;
        }

        const text = getPlaceholderText(paragraph, locale);
        if (!text) {
            continue;
        }

        layouts.push(getLinePlaceholderLayout(line, paragraph, text, originLeft, originTop, clip));
    }
}

function isOffsetInParagraph(offset: number, paragraphStart: number, paragraphEnd: number): boolean {
    return paragraphStart <= offset && offset <= paragraphEnd;
}

function getPlaceholderText(paragraph: IParagraph, locale: IParagraphPlaceholderLocale): string {
    if (paragraph.bullet) {
        return locale.listItem;
    }

    switch (paragraph.paragraphStyle?.namedStyleType) {
        case NamedStyleType.HEADING_1:
            return locale.heading1;
        case NamedStyleType.HEADING_2:
            return locale.heading2;
        case NamedStyleType.HEADING_3:
            return locale.heading3;
        case NamedStyleType.HEADING_4:
            return locale.heading4;
        case NamedStyleType.HEADING_5:
            return locale.heading5;
        default:
            return locale.normalText;
    }
}

function getLinePlaceholderLayout(
    line: IDocumentSkeletonLine,
    paragraph: IParagraph,
    text: string,
    originLeft: number,
    originTop: number,
    clip?: IParagraphPlaceholderClip
): IParagraphPlaceholderLayout {
    const divide = line.divides[0];
    const glyphs = divide?.glyphGroup ?? [];
    const firstGlyph = glyphs[0];
    const namedStyleType = paragraph.paragraphStyle?.namedStyleType ?? NamedStyleType.NORMAL_TEXT;
    const textStyle = NAMED_STYLE_MAP[namedStyleType];
    const fontSize = getPlaceholderFontSize(line, paragraph);
    const fontFamily = getLineFontFamily(line) ?? DEFAULT_PLACEHOLDER_FONT_FAMILY;
    const fontWeight = textStyle?.bl ? 'bold' : 'normal';
    const lineStartX = originLeft + (divide?.left ?? 0) + (divide?.paddingLeft ?? 0);
    const listOffset = paragraph.bullet && firstGlyph ? firstGlyph.left + firstGlyph.width + LIST_PLACEHOLDER_GAP : 0;
    const x = lineStartX + listOffset;
    const naturalMaxWidth = Math.max(0, (divide?.width ?? line.width ?? 0) - listOffset);
    const clipLeft = Math.max(x, clip?.left ?? x);
    const clipRight = Math.min(x + naturalMaxWidth, clip?.right ?? x + naturalMaxWidth);
    const clipTop = originTop + line.top;

    return {
        clipBottom: clipTop + line.lineHeight,
        clipLeft,
        clipRight,
        clipTop,
        fontFamily,
        fontSize,
        fontWeight,
        maxWidth: Math.max(0, clipRight - clipLeft),
        text,
        x,
        y: originTop + line.top + line.marginTop + line.paddingTop + line.asc,
    };
}

function isEmptyParagraph(dataStream: string | undefined, paragraphStart: number, paragraphEnd: number): boolean {
    const text = dataStream?.slice(paragraphStart, paragraphEnd) ?? '';
    return stripNonTextTokens(text).trim() === '';
}

function stripNonTextTokens(text: string): string {
    return text
        .replaceAll(DataStreamTreeTokenType.PARAGRAPH, '')
        .replaceAll(DataStreamTreeTokenType.SECTION_BREAK, '')
        .replaceAll(DataStreamTreeTokenType.DOCS_END, '');
}

function getLineFontSize(line: IDocumentSkeletonLine): Nullable<number> {
    for (const divide of line.divides) {
        for (const glyph of divide.glyphGroup) {
            const fontSize = glyph.fontStyle?.originFontSize ?? glyph.fontStyle?.fontSize ?? glyph.ts?.fs;
            if (fontSize) {
                return fontSize;
            }
        }
    }

    return null;
}

function getPlaceholderFontSize(line: IDocumentSkeletonLine, paragraph: IParagraph): number {
    const namedStyleType = paragraph.paragraphStyle?.namedStyleType ?? NamedStyleType.NORMAL_TEXT;
    const textStyle = NAMED_STYLE_MAP[namedStyleType];
    const fontSize = getLineFontSize(line) ?? textStyle?.fs ?? DEFAULT_PLACEHOLDER_FONT_SIZE;

    if (namedStyleType !== NamedStyleType.NORMAL_TEXT) {
        return fontSize;
    }

    return Math.max(fontSize, MIN_BODY_TEXT_PLACEHOLDER_FONT_SIZE);
}

function getLineFontFamily(line: IDocumentSkeletonLine): Nullable<string> {
    for (const divide of line.divides) {
        for (const glyph of divide.glyphGroup) {
            const fontFamily = glyph.fontStyle?.fontFamily ?? glyph.ts?.ff;
            if (fontFamily) {
                return fontFamily;
            }
        }
    }

    return null;
}

export function drawParagraphPlaceholders(ctx: UniverRenderingContext, placeholders: IParagraphPlaceholderLayout[]): void {
    ctx.save();
    ctx.fillStyle = PLACEHOLDER_COLOR;
    ctx.textBaseline = 'alphabetic';

    for (const placeholder of placeholders) {
        const clipLeft = placeholder.clipLeft ?? placeholder.x;
        const clipRight = placeholder.clipRight ?? placeholder.x + placeholder.maxWidth;
        const clipTop = placeholder.clipTop ?? placeholder.y - placeholder.fontSize;
        const clipBottom = placeholder.clipBottom ?? placeholder.y + placeholder.fontSize;
        if (clipRight <= clipLeft || clipBottom <= clipTop) {
            continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.rectByPrecision(clipLeft, clipTop, clipRight - clipLeft, clipBottom - clipTop);
        ctx.closePath();
        ctx.clip();
        ctx.font = `${placeholder.fontWeight} ${placeholder.fontSize}px ${placeholder.fontFamily}`;
        ctx.fillText(placeholder.text, placeholder.x, placeholder.y);
        ctx.restore();
    }

    ctx.restore();
}
