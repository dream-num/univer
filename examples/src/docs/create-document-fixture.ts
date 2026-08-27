import type {
    IDocumentBody,
    IDocumentData,
    IParagraph,
    ISectionBreak,
    LocaleType,
} from '@univerjs/core';
import {
    BaselineOffset,
    BlockType,
    BooleanNumber,
    ColumnSeparatorType,
    CustomDecorationType,
    DashStyleType,
    DataStreamTreeTokenType,
    DocStyleType,
    DocumentBlockRangeType,
    DocumentFlavor,
    DrawingTypeEnum,
    getDocsEmptySnapshot,
    HorizontalAlign,
    ImageSourceType,
    NamedStyleType,
    PositionedObjectLayoutType,
    PresetListType,
    RichTextBuilder,
    SectionType,
    TableLayoutType,
    TextDecoration,
    TextDirection,
    VerticalAlignmentType,
    WrapTextType,
} from '@univerjs/core';
import { buildDocTransform, createSectionColumnProperties, docDrawingPositionToTransform } from '@univerjs/docs';
import { genTableSource, getTableColumn } from '@univerjs/docs-ui';
import { DOCS_DRAWING_PLUGIN } from '@univerjs/preset-docs-drawing';

import { createGeneratedSvg } from '../generated-svg';

const BLOCK_END_PLACEHOLDER = '\uE001';
const BLOCK_START_PLACEHOLDER = '\uE000';
const COMMENT_IDS = ['comment-layout', 'comment-review'] as const;
const COMMENT_TARGETS = ['检查段落间距与边框', '检查绘图、链接与批注'] as const;
const DEFAULT_FOOTER_ID = 'footer-default';
const DEFAULT_HEADER_ID = 'header-default';
const DOCUMENT_ID = 'document-01';
const FLOATING_DRAWING_ID = 'drawing-floating-card';
const FIRST_PAGE_HEADER_ID = 'header-first-page';
const INLINE_DRAWING_ID = 'drawing-workflow';
const SECTION_MARKERS = ['[[CAPABILITY_COLUMNS]]', '[[CAPABILITY_TABLE]]'] as const;
const TABLE_ID = 'capability-table';

const FLOW_DRAWING = createGeneratedSvg({
    width: 420,
    height: 128,
    content: [
        '<rect width="420" height="128" rx="18" fill="#eef2ff"/>',
        '<rect x="24" y="38" width="96" height="52" rx="12" fill="#365cf5"/>',
        '<path d="M128 64h23m-9-9 9 9-9 9" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
        '<rect x="162" y="38" width="96" height="52" rx="12" fill="#b45309"/>',
        '<path d="M266 64h23m-9-9 9 9-9 9" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
        '<rect x="300" y="38" width="96" height="52" rx="12" fill="#047857"/>',
        '<text x="72" y="69" text-anchor="middle" fill="white" font-family="Arial" font-size="14">Edit</text>',
        '<text x="210" y="69" text-anchor="middle" fill="white" font-family="Arial" font-size="14">Review</text>',
        '<text x="348" y="69" text-anchor="middle" fill="white" font-family="Arial" font-size="14">Ship</text>',
    ],
});

const FLOATING_DRAWING = createGeneratedSvg({
    width: 240,
    height: 136,
    content: [
        '<rect x="2" y="2" width="236" height="132" rx="18" fill="#fff7ed" stroke="#fb923c" stroke-width="3"/>',
        '<circle cx="42" cy="42" r="18" fill="#f97316"/>',
        '<path d="m34 42 6 6 12-15" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
        '<text x="72" y="48" fill="#9a3412" font-family="Arial" font-size="16" font-weight="700">Wrapped image</text>',
        '<text x="120" y="96" text-anchor="middle" fill="#7c2d12" font-family="Arial" font-size="13">Move · resize · arrange</text>',
    ],
});

interface ITableStreamData {
    dataStream: string;
    paragraphs: IParagraph[];
    sectionBreaks: ISectionBreak[];
    textRuns: NonNullable<IDocumentBody['textRuns']>;
}

function addCapabilityMap(builder: RichTextBuilder): RichTextBuilder {
    return builder
        .paragraph({ align: HorizontalAlign.CENTER, keepNext: true, spaceAfter: 8 })
        .span('Univer Docs Capability Workbench', {
            bold: true,
            color: '#1d4ed8',
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 26,
        })
        .paragraph({ align: HorizontalAlign.CENTER, spaceAfter: 18 })
        .span('Edit every sample. The document is a compact map of public Docs capabilities.', {
            color: '#64748b',
            fontSize: 11,
            italic: true,
        })
        .paragraph({ keepNext: true, spaceAfter: 6 })
        .span('1. Capability map', { bold: true, color: '#0f172a', fontSize: 19 })
        .paragraph({ lineHeight: 1.45, firstLineIndent: 20, spaceAfter: 8 })
        .text('Use this document to exercise text, paragraph, list, layout, table, drawing, link and review workflows. ')
        .link('Open Univer documentation', 'https://docs.univer.ai')
        .text(' to verify the hyperlink popup and editing actions.')
        .listItem('Text runs: font family, size, color, highlight, bold, italic and decorations', {
            type: PresetListType.BULLET_LIST,
            listId: 'capability-map',
        })
        .listItem('Paragraphs: alignment, spacing, indentation, tabs, borders and named styles', {
            type: PresetListType.BULLET_LIST,
            listId: 'capability-map',
            level: 1,
        })
        .listItem('Document layout: pages, sections, columns, headers, footers and tables', {
            type: PresetListType.BULLET_LIST,
            listId: 'capability-map',
        })
        .listItem('Objects and review: inline/floating drawings, links and thread comments', {
            type: PresetListType.BULLET_LIST,
            listId: 'capability-map',
        })
        .paragraph({ lineHeight: 1.4, spaceBefore: 10, spaceAfter: 8 })
        .span('Status\tOwner\tDue', { bold: true, color: '#334155' })
        .paragraph({ lineHeight: 1.4, spaceAfter: 12 })
        .text('Editable\tDocs team\tToday');
}

function addTextAndParagraphLab(builder: RichTextBuilder): RichTextBuilder {
    return builder.text('\f')
        .paragraph({ keepNext: true, spaceAfter: 6 })
        .span('2. Text and paragraph laboratory', { bold: true, color: '#0f766e', fontSize: 19 })
        .paragraph({ lineHeight: 1.5, spaceAfter: 8 })
        .text('Inline formatting: ')
        .span('bold', { bold: true })
        .text(' · ')
        .span('italic', { italic: true })
        .text(' · ')
        .span('highlight', { background: '#fef08a', color: '#713f12' })
        .text(' · ')
        .span('underline', { ul: { s: BooleanNumber.TRUE, t: TextDecoration.WAVE } })
        .text(' · ')
        .span('strike', { st: { s: BooleanNumber.TRUE, t: TextDecoration.SINGLE } })
        .text(' · H')
        .span('2', { va: BaselineOffset.SUBSCRIPT })
        .text('O · x')
        .span('2', { va: BaselineOffset.SUPERSCRIPT })
        .text(' · ')
        .code('pnpm test')
        .paragraph({ align: HorizontalAlign.JUSTIFIED, firstLineIndent: 24, lineHeight: 1.55, spaceAfter: 10 })
        .text('Justified paragraph — long enough to wrap across lines and expose line spacing, first-line indentation, '
            + 'word wrapping and selection behavior while editing. 中英文混排用于检查字体回退、标点与换行。')
        .paragraph({ align: HorizontalAlign.RIGHT, indentStart: 36, indentEnd: 18, spaceAfter: 8 })
        .span('Right aligned with leading and trailing indentation', { color: '#7c3aed', italic: true })
        .paragraph({ hangingIndent: 24, indentStart: 36, lineHeight: 1.4, spaceAfter: 10 })
        .text(`${COMMENT_TARGETS[0]}：这是悬挂缩进段落；选择本句可验证 comment decoration、段落底纹和边框。`)
        .listItem('Ordered step one: select a paragraph', {
            type: PresetListType.ORDER_LIST,
            listId: 'ordered-workflow',
        })
        .listItem('Nested step: change the list level', {
            type: PresetListType.ORDER_LIST,
            listId: 'ordered-workflow',
            level: 1,
        })
        .listItem('Ordered step two: switch numbering style', {
            type: PresetListType.ORDER_LIST,
            listId: 'ordered-workflow',
        })
        .listItem('Checklist item: verify toolbar state', {
            type: PresetListType.CHECK_LIST,
            listId: 'review-checklist',
        })
        .listItem('Checklist item: undo and redo an edit', {
            type: PresetListType.CHECK_LIST,
            listId: 'review-checklist',
        })
        .paragraph({ keepNext: true, spaceBefore: 12, spaceAfter: 6 })
        .span('Structured blocks', { bold: true, color: '#334155', fontSize: 15 })
        .paragraph({ lineHeight: 1.4, indentStart: 20, indentEnd: 20, spaceAfter: 8 })
        .text(BLOCK_START_PLACEHOLDER)
        .span('“A quote block should remain movable, selectable and distinct from ordinary body text.”', {
            color: '#475569',
            italic: true,
        })
        .paragraph()
        .text(BLOCK_END_PLACEHOLDER)
        .paragraph({ lineHeight: 1.4, indentStart: 20, indentEnd: 20, spaceAfter: 8 })
        .text(BLOCK_START_PLACEHOLDER)
        .span('Tip: try paragraph alignment, background color and block movement here.', { color: '#075985' })
        .paragraph()
        .text(BLOCK_END_PLACEHOLDER)
        .paragraph({ lineHeight: 1.35, indentStart: 20, indentEnd: 20, spaceAfter: 8 })
        .text(BLOCK_START_PLACEHOLDER)
        .code('const capability = { editable: true, deterministic: true };')
        .paragraph()
        .text(BLOCK_END_PLACEHOLDER);
}

function addLayoutAndReview(builder: RichTextBuilder): RichTextBuilder {
    return builder.text('\f')
        .paragraph({ keepNext: true, spaceAfter: 6 })
        .span('3. Layout, drawing and review', { bold: true, color: '#b45309', fontSize: 19 })
        .paragraph({ lineHeight: 1.45, spaceAfter: 8 })
        .text('This page combines inline and wrapped objects. Select each image to inspect resize, arrange, wrapping and delete actions.')
        .paragraph({ align: HorizontalAlign.CENTER, spaceAfter: 8 })
        .text('\b')
        .paragraph({ lineHeight: 1.45, spaceAfter: 8 })
        .text('\b')
        .text(`${COMMENT_TARGETS[1]}。The orange card is a floating image with square wrapping; the workflow is inline.`)
        .paragraph({ lineHeight: 1.45, spaceAfter: 10 })
        .text('Mixed direction sample: English left-to-right · العربية من اليمين إلى اليسار · 中文标点与自动换行。')
        .paragraph({ keepNext: true, spaceBefore: 10, spaceAfter: 6 })
        .span('Review workflow', { bold: true, color: '#334155', fontSize: 15 })
        .listItem('Open the comment panel and reply to the seeded thread', {
            type: PresetListType.CHECK_LIST,
            listId: 'review-workflow',
        })
        .listItem('Edit the link, then copy and paste it into another paragraph', {
            type: PresetListType.CHECK_LIST,
            listId: 'review-workflow',
        })
        .listItem('Move the floating card and resize the inline workflow', {
            type: PresetListType.CHECK_LIST,
            listId: 'review-workflow',
        })
        .paragraph()
        .text(SECTION_MARKERS[0]);
}

function addCommandIndexAndTableIntro(builder: RichTextBuilder): RichTextBuilder {
    return builder.paragraph({ keepNext: true, spaceAfter: 6 })
        .span('4. Two-column command index', { bold: true, color: '#6d28d9', fontSize: 18 })
        .paragraph({ lineHeight: 1.35, spaceAfter: 8 })
        .span('Edit', { bold: true })
        .text(' — select, copy, paste, undo, redo, find and replace.')
        .paragraph({ lineHeight: 1.35, spaceAfter: 8 })
        .span('Format', { bold: true })
        .text(' — text runs, named headings, paragraph spacing, borders and lists.')
        .paragraph({ lineHeight: 1.35, spaceAfter: 8 })
        .span('Insert', { bold: true })
        .text(' — tables, links, images, page breaks, headers and footers.')
        .paragraph({ lineHeight: 1.35, spaceAfter: 8 })
        .span('Review', { bold: true })
        .text(' — comments, replies, resolved state and selection highlights.')
        .paragraph({ lineHeight: 1.35, spaceAfter: 8 })
        .span('Layout', { bold: true })
        .text(' — page size, margins, pagination, sections and columns.')
        .paragraph()
        .text(SECTION_MARKERS[1])
        .paragraph({ keepNext: true, spaceAfter: 6 })
        .span('5. Editable capability matrix', { bold: true, color: '#0369a1', fontSize: 19 })
        .paragraph({ lineHeight: 1.4, spaceAfter: 8 })
        .text('Use the table context menu to insert/delete rows or columns, resize columns and edit the merged cells below.');
}

function createRichText(): RichTextBuilder {
    const builder = RichTextBuilder.create();

    addCapabilityMap(builder);
    addTextAndParagraphLab(builder);
    addLayoutAndReview(builder);

    return addCommandIndexAndTableIntro(builder);
}

function replaceBlockPlaceholders(body: IDocumentBody): void {
    const blockTypes = [
        DocumentBlockRangeType.QUOTE,
        DocumentBlockRangeType.CALLOUT,
        DocumentBlockRangeType.CODE,
    ];
    let searchStart = 0;

    body.blockRanges = blockTypes.map((blockType) => {
        const startIndex = body.dataStream.indexOf(BLOCK_START_PLACEHOLDER, searchStart);
        const endIndex = body.dataStream.indexOf(BLOCK_END_PLACEHOLDER, startIndex + 1);
        searchStart = endIndex + 1;

        return { blockId: `block-${blockType}`, blockType, startIndex, endIndex };
    });
    body.dataStream = body.dataStream
        .replaceAll(BLOCK_START_PLACEHOLDER, DataStreamTreeTokenType.BLOCK_START)
        .replaceAll(BLOCK_END_PLACEHOLDER, DataStreamTreeTokenType.BLOCK_END);
}

function shiftBodyMetadata(body: IDocumentBody, threshold: number, delta: number): void {
    const shift = (index: number) => index >= threshold ? index + delta : index;

    body.paragraphs?.forEach((paragraph) => {
        paragraph.startIndex = shift(paragraph.startIndex);
    });
    body.sectionBreaks?.forEach((sectionBreak) => {
        sectionBreak.startIndex = shift(sectionBreak.startIndex);
    });
    body.textRuns?.forEach((run) => {
        run.st = shift(run.st);
        run.ed = shift(run.ed);
    });
    body.customRanges?.forEach((range) => {
        range.startIndex = shift(range.startIndex);
        range.endIndex = shift(range.endIndex);
    });
    body.customBlocks?.forEach((block) => {
        block.startIndex = shift(block.startIndex);
    });
    body.customDecorations?.forEach((decoration) => {
        decoration.startIndex = shift(decoration.startIndex);
        decoration.endIndex = shift(decoration.endIndex);
    });
    body.blockRanges?.forEach((range) => {
        range.startIndex = shift(range.startIndex);
        range.endIndex = shift(range.endIndex);
    });
    body.tables?.forEach((table) => {
        table.startIndex = shift(table.startIndex);
        table.endIndex = shift(table.endIndex);
    });
}

function replaceSectionMarker(
    body: IDocumentBody,
    marker: string,
    section: Omit<ISectionBreak, 'startIndex'>
): void {
    const startIndex = body.dataStream.indexOf(marker);
    const endIndex = startIndex + marker.length + DataStreamTreeTokenType.PARAGRAPH.length;
    const markerParagraphIndex = endIndex - 1;
    const delta = DataStreamTreeTokenType.SECTION_BREAK.length - (endIndex - startIndex);

    body.dataStream = body.dataStream.slice(0, startIndex)
        + DataStreamTreeTokenType.SECTION_BREAK
        + body.dataStream.slice(endIndex);
    body.paragraphs = body.paragraphs?.filter(({ startIndex: paragraphIndex }) => paragraphIndex !== markerParagraphIndex);
    shiftBodyMetadata(body, endIndex, delta);
    body.sectionBreaks?.push({ ...section, startIndex });
}

function findParagraph(body: IDocumentBody, text: string): IParagraph {
    const textStart = body.dataStream.indexOf(text);
    const paragraphs = body.paragraphs ?? [];
    const paragraph = paragraphs.find(({ startIndex }, index) => {
        const contentStart = index === 0 ? 0 : paragraphs[index - 1].startIndex + 1;

        return contentStart <= textStart && startIndex >= textStart + text.length;
    });

    if (!paragraph) {
        throw new Error(`Missing fixture paragraph: ${text}`);
    }

    return paragraph;
}

function applyParagraphFeatures(body: IDocumentBody): void {
    const namedParagraphs = [
        ['Univer Docs Capability Workbench', 'style-title', NamedStyleType.TITLE],
        ['1. Capability map', 'style-heading-1', NamedStyleType.HEADING_1],
        ['2. Text and paragraph laboratory', 'style-heading-1', NamedStyleType.HEADING_1],
        ['3. Layout, drawing and review', 'style-heading-1', NamedStyleType.HEADING_1],
        ['4. Two-column command index', 'style-heading-1', NamedStyleType.HEADING_1],
        ['5. Editable capability matrix', 'style-heading-1', NamedStyleType.HEADING_1],
        ['Structured blocks', 'style-heading-2', NamedStyleType.HEADING_2],
        ['Review workflow', 'style-heading-2', NamedStyleType.HEADING_2],
    ] as const;

    namedParagraphs.forEach(([text, styleId, namedStyleType], index) => {
        const paragraph = findParagraph(body, text);
        paragraph.styleId = styleId;
        paragraph.paragraphStyle = {
            ...paragraph.paragraphStyle,
            headingId: `heading-${index + 1}`,
            namedStyleType,
        };
    });

    for (const text of ['Status\tOwner\tDue', 'Editable\tDocs team\tToday']) {
        const paragraph = findParagraph(body, text);
        paragraph.paragraphStyle = {
            ...paragraph.paragraphStyle,
            tabStops: [
                { alignment: 1, offset: 210 },
                { alignment: 1, offset: 390 },
            ],
        };
    }

    const borderedParagraph = findParagraph(body, `${COMMENT_TARGETS[0]}：`);
    borderedParagraph.paragraphStyle = {
        ...borderedParagraph.paragraphStyle,
        borderLeft: { color: { rgb: '#3a60f7' }, dashStyle: DashStyleType.SOLID, padding: 8, width: 3 },
        borderBottom: { color: { rgb: '#bfdbfe' }, dashStyle: DashStyleType.SOLID, padding: 5, width: 1 },
        shading: { backgroundColor: { rgb: '#eff6ff' } },
    };
}

function createDocumentBody(
    direction: 'ltr' | 'rtl',
    documentStyle: IDocumentData['documentStyle']
): IDocumentBody {
    const body = createRichText().getData().body!;
    const contentDirection = direction === 'rtl' ? TextDirection.RIGHT_TO_LEFT : TextDirection.LEFT_TO_RIGHT;

    replaceBlockPlaceholders(body);
    replaceSectionMarker(body, SECTION_MARKERS[0], {
        sectionId: 'section-main',
        sectionType: SectionType.NEXT_PAGE,
        contentDirection,
    });
    replaceSectionMarker(body, SECTION_MARKERS[1], {
        sectionId: 'section-columns',
        sectionType: SectionType.NEXT_PAGE,
        contentDirection,
        columnProperties: createSectionColumnProperties(documentStyle, undefined, 2, 22),
        columnSeparatorType: ColumnSeparatorType.BETWEEN_EACH_COLUMN,
    });

    body.paragraphs?.forEach((paragraph, index) => {
        paragraph.paragraphId = `paragraph-${index + 1}`;
    });
    body.sectionBreaks?.forEach((sectionBreak, index) => {
        if (!['section-main', 'section-columns'].includes(sectionBreak.sectionId)) {
            sectionBreak.sectionId = `section-${index + 1}`;
        }
        sectionBreak.contentDirection = contentDirection;
    });
    body.customRanges?.forEach((range, index) => {
        range.rangeId = `link-${index + 1}`;
    });
    const inlineDrawingStartIndex = body.dataStream.indexOf(DataStreamTreeTokenType.CUSTOM_BLOCK);
    body.customBlocks = [
        {
            blockId: INLINE_DRAWING_ID,
            blockType: BlockType.DRAWING,
            startIndex: inlineDrawingStartIndex,
        },
        {
            blockId: FLOATING_DRAWING_ID,
            blockType: BlockType.DRAWING,
            startIndex: body.dataStream.indexOf(DataStreamTreeTokenType.CUSTOM_BLOCK, inlineDrawingStartIndex + 1),
        },
    ];
    body.customDecorations = COMMENT_TARGETS.map((target, index) => {
        const startIndex = body.dataStream.indexOf(target);

        return {
            id: COMMENT_IDS[index],
            type: CustomDecorationType.COMMENT,
            startIndex,
            endIndex: startIndex + target.length - 1,
        };
    });
    applyParagraphFeatures(body);

    return body;
}

function createTableStream(): ITableStreamData {
    const rows = [
        ['Capability', 'Seeded sample', 'Development action'],
        ['Text', 'Rich runs + hyperlink', 'Edit styles, copy and paste'],
        ['Paragraph', 'Lists + tabs + blocks', 'Change indent, spacing and alignment'],
        ['Layout', 'Pages + sections + columns', 'Inspect header/footer and pagination'],
        ['Objects', 'Inline + wrapped image', 'Resize, move and arrange'],
        ['', 'Thread comments', 'Reply, resolve and restore'],
    ];
    const paragraphs: IParagraph[] = [];
    const sectionBreaks: ISectionBreak[] = [];
    const textRuns: NonNullable<IDocumentBody['textRuns']> = [];
    let dataStream: string = DataStreamTreeTokenType.TABLE_START;

    rows.forEach((row, rowIndex) => {
        dataStream += DataStreamTreeTokenType.TABLE_ROW_START;
        row.forEach((text, columnIndex) => {
            dataStream += DataStreamTreeTokenType.TABLE_CELL_START;
            const textStart = dataStream.length;
            dataStream += text;
            const paragraphIndex = dataStream.length;
            dataStream += DataStreamTreeTokenType.PARAGRAPH;
            const sectionIndex = dataStream.length;
            dataStream += DataStreamTreeTokenType.SECTION_BREAK + DataStreamTreeTokenType.TABLE_CELL_END;

            paragraphs.push({
                paragraphId: `paragraph-table-${rowIndex + 1}-${columnIndex + 1}`,
                startIndex: paragraphIndex,
                paragraphStyle: {
                    horizontalAlign: rowIndex === 0 ? HorizontalAlign.CENTER : HorizontalAlign.LEFT,
                    lineSpacing: 1.2,
                    spaceAbove: { v: 2 },
                    spaceBelow: { v: 2 },
                },
                ...(rowIndex === 2 && columnIndex === 1
                    ? { bullet: { listId: 'table-check', listType: PresetListType.CHECK_LIST, nestingLevel: 0 } }
                    : {}),
            });
            sectionBreaks.push({ sectionId: `section-table-${rowIndex + 1}-${columnIndex + 1}`, startIndex: sectionIndex });
            if (text) {
                textRuns.push({
                    st: textStart,
                    ed: textStart + text.length,
                    ts: rowIndex === 0
                        ? { bl: BooleanNumber.TRUE, cl: { rgb: '#ffffff' }, fs: 10 }
                        : { cl: { rgb: '#334155' }, fs: 9 },
                });
            }
        });
        dataStream += DataStreamTreeTokenType.TABLE_ROW_END;
    });
    dataStream += DataStreamTreeTokenType.TABLE_END;

    return { dataStream, paragraphs, sectionBreaks, textRuns };
}

function appendCapabilityTable(snapshot: IDocumentData): void {
    const body = snapshot.body!;
    const tableStream = createTableStream();
    const tableStart = body.dataStream.length - 1;
    const trailingParagraph = DataStreamTreeTokenType.PARAGRAPH;
    const insertedLength = tableStream.dataStream.length + trailingParagraph.length;
    const table = genTableSource(6, 3, 600);

    shiftBodyMetadata(body, tableStart, insertedLength);
    body.dataStream = body.dataStream.slice(0, tableStart)
        + tableStream.dataStream
        + trailingParagraph
        + body.dataStream.slice(tableStart);
    body.paragraphs?.push(
        ...tableStream.paragraphs.map((paragraph) => ({ ...paragraph, startIndex: paragraph.startIndex + tableStart })),
        { paragraphId: 'paragraph-after-table', startIndex: tableStart + tableStream.dataStream.length }
    );
    body.sectionBreaks?.push(...tableStream.sectionBreaks.map((sectionBreak) => ({
        ...sectionBreak,
        startIndex: sectionBreak.startIndex + tableStart,
    })));
    body.textRuns?.push(...tableStream.textRuns.map((run) => ({
        ...run,
        st: run.st + tableStart,
        ed: run.ed + tableStart,
    })));
    body.tables?.push({
        tableId: TABLE_ID,
        startIndex: tableStart,
        endIndex: tableStart + tableStream.dataStream.length,
    });

    table.tableId = TABLE_ID;
    table.description = 'Editable Docs capability coverage matrix';
    table.layout = TableLayoutType.FIXED;
    table.tableColumns = [getTableColumn(120), getTableColumn(190), getTableColumn(290)];
    table.tableRows[0].isFirstRow = BooleanNumber.TRUE;
    table.tableRows[0].repeatHeaderRow = BooleanNumber.TRUE;
    table.tableRows[4].tableCells[0].rowSpan = 2;
    table.tableRows[5].tableCells[0].rowSpan = 0;
    table.tableRows[5].tableCells[0].columnSpan = 0;
    table.tableRows.forEach((row, rowIndex) => {
        row.cantSplit = BooleanNumber.TRUE;
        row.tableCells.forEach((cell) => {
            cell.vAlign = VerticalAlignmentType.CENTER;
            cell.backgroundColor = { rgb: rowIndex === 0 ? '#3a60f7' : rowIndex % 2 ? '#f8fafc' : '#eef2ff' };
            cell.borderTop = { color: { rgb: '#cbd5e1' }, width: { v: 1 } };
            cell.borderBottom = { color: { rgb: '#cbd5e1' }, width: { v: 1 } };
            cell.borderLeft = { color: { rgb: '#cbd5e1' }, width: { v: 1 } };
            cell.borderRight = { color: { rgb: '#cbd5e1' }, width: { v: 1 } };
        });
    });
    snapshot.tableSource = { [TABLE_ID]: table };

    body.paragraphs?.sort((a, b) => a.startIndex - b.startIndex);
    body.sectionBreaks?.sort((a, b) => a.startIndex - b.startIndex);
    body.textRuns?.sort((a, b) => a.st - b.st);
}

function createSegmentBody(
    text: string,
    segment: 'header' | 'footer',
    direction: 'ltr' | 'rtl',
    align: HorizontalAlign
): IDocumentBody {
    return {
        dataStream: `${text}\r\n`,
        paragraphs: [{
            paragraphId: `paragraph-${segment}-${text.replaceAll(' ', '-').toLowerCase()}`,
            startIndex: text.length,
            paragraphStyle: { horizontalAlign: align, lineSpacing: 1 },
        }],
        sectionBreaks: [{
            sectionId: `section-${segment}-${text.replaceAll(' ', '-').toLowerCase()}`,
            startIndex: text.length + 1,
            contentDirection: direction === 'rtl' ? TextDirection.RIGHT_TO_LEFT : TextDirection.LEFT_TO_RIGHT,
        }],
        textRuns: [{ st: 0, ed: text.length, ts: { cl: { rgb: '#64748b' }, fs: 9 } }],
    };
}

function createDrawings() {
    const inlineTransform = buildDocTransform(FLOW_DRAWING.width, FLOW_DRAWING.height);
    const floatingTransform = buildDocTransform(FLOATING_DRAWING.width, FLOATING_DRAWING.height, {
        left: 390,
        top: 90,
    });

    return {
        [INLINE_DRAWING_ID]: {
            unitId: DOCUMENT_ID,
            subUnitId: DOCUMENT_ID,
            drawingId: INLINE_DRAWING_ID,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.BASE64,
            source: FLOW_DRAWING.source,
            transform: docDrawingPositionToTransform(inlineTransform),
            docTransform: inlineTransform,
            behindDoc: BooleanNumber.FALSE,
            title: 'Editable review workflow',
            description: 'Local SVG showing the edit, review and ship workflow',
            layoutType: PositionedObjectLayoutType.INLINE,
            wrapText: WrapTextType.BOTH_SIDES,
        },
        [FLOATING_DRAWING_ID]: {
            unitId: DOCUMENT_ID,
            subUnitId: DOCUMENT_ID,
            drawingId: FLOATING_DRAWING_ID,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.BASE64,
            source: FLOATING_DRAWING.source,
            transform: docDrawingPositionToTransform(floatingTransform),
            docTransform: floatingTransform,
            behindDoc: BooleanNumber.FALSE,
            title: 'Floating wrapped image',
            description: 'Local SVG for resize, arrange and text wrapping development',
            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
            wrapText: WrapTextType.LEFT,
            distL: 12,
            distT: 8,
            distB: 8,
        },
    };
}

function createDrawingResource(
    drawings: NonNullable<IDocumentData['drawings']>,
    order: string[]
) {
    return {
        name: DOCS_DRAWING_PLUGIN,
        data: JSON.stringify({ data: drawings, order }),
    };
}

function createCommentBody(id: string, text: string): IDocumentBody {
    const dataStream = `${text}\r\n`;
    return {
        dataStream,
        paragraphs: [{ startIndex: dataStream.length - 2, paragraphId: `${id}-paragraph` }],
        sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: `${id}-section` }],
    };
}

function createCommentResource() {
    return {
        name: 'SHEET_UNIVER_THREAD_COMMENT_PLUGIN',
        data: JSON.stringify({
            default_doc: COMMENT_IDS.map((id, index) => ({
                id,
                threadId: id,
                ref: COMMENT_TARGETS[index],
                dT: `2026/08/19 10:0${index}`,
                personId: '',
                text: createCommentBody(
                    id,
                    index === 0 ? '请核对段落布局和样式。' : '请验证绘图、链接与批注定位。'
                ),
                unitId: DOCUMENT_ID,
                subUnitId: 'default_doc',
                children: index === 1
                    ? [{
                        id: 'comment-review-reply',
                        threadId: id,
                        parentId: id,
                        dT: '2026/08/19 10:12',
                        personId: '',
                        text: createCommentBody('comment-review-reply', '已加入内联与浮动两种本地 SVG。'),
                        unitId: DOCUMENT_ID,
                        subUnitId: 'default_doc',
                    }]
                    : [],
            })),
        }),
    };
}

export function createDocumentFixture(
    locale: LocaleType,
    direction: 'ltr' | 'rtl' = 'ltr',
    zoomRatio: number = 1
): IDocumentData {
    const snapshot = getDocsEmptySnapshot(
        DOCUMENT_ID,
        locale,
        'Univer Docs Capability Workbench',
        DocumentFlavor.TRADITIONAL
    );

    snapshot.body = createDocumentBody(direction, snapshot.documentStyle);
    snapshot.documentStyle = {
        ...snapshot.documentStyle,
        defaultHeaderId: DEFAULT_HEADER_ID,
        defaultFooterId: DEFAULT_FOOTER_ID,
        firstPageHeaderId: FIRST_PAGE_HEADER_ID,
        firstPageFooterId: DEFAULT_FOOTER_ID,
        useFirstPageHeaderFooter: BooleanNumber.TRUE,
        marginHeader: 24,
        marginFooter: 24,
    };
    snapshot.settings = {
        ...snapshot.settings,
        zoomRatio,
    };
    snapshot.styles = {
        'style-title': {
            name: 'Capability Title',
            type: DocStyleType.paragraph,
            textStyle: { bl: BooleanNumber.TRUE, cl: { rgb: '#1d4ed8' }, fs: 26 },
            paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER, keepNext: BooleanNumber.TRUE },
        },
        'style-heading-1': {
            name: 'Capability Heading 1',
            type: DocStyleType.paragraph,
            textStyle: { bl: BooleanNumber.TRUE, cl: { rgb: '#0f172a' }, fs: 19 },
            paragraphStyle: { keepNext: BooleanNumber.TRUE, spaceBelow: { v: 6 } },
        },
        'style-heading-2': {
            name: 'Capability Heading 2',
            basedOn: 'style-heading-1',
            type: DocStyleType.paragraph,
            textStyle: { bl: BooleanNumber.TRUE, cl: { rgb: '#334155' }, fs: 15 },
            paragraphStyle: { keepNext: BooleanNumber.TRUE, spaceBelow: { v: 4 } },
        },
    };
    snapshot.headers = {
        [FIRST_PAGE_HEADER_ID]: {
            headerId: FIRST_PAGE_HEADER_ID,
            body: createSegmentBody('UNIVER DOCS · CAPABILITY LAB', 'header', direction, HorizontalAlign.CENTER),
        },
        [DEFAULT_HEADER_ID]: {
            headerId: DEFAULT_HEADER_ID,
            body: createSegmentBody('UNIVER DOCS · EDIT · LAYOUT · REVIEW', 'header', direction, HorizontalAlign.RIGHT),
        },
    };
    snapshot.footers = {
        [DEFAULT_FOOTER_ID]: {
            footerId: DEFAULT_FOOTER_ID,
            body: createSegmentBody('DEVELOP · INSPECT · REGRESS', 'footer', direction, HorizontalAlign.CENTER),
        },
    };
    const drawings = createDrawings();
    const drawingsOrder = [INLINE_DRAWING_ID, FLOATING_DRAWING_ID];
    snapshot.drawings = drawings;
    snapshot.drawingsOrder = drawingsOrder;
    snapshot.resources = [createDrawingResource(drawings, drawingsOrder), createCommentResource()];
    appendCapabilityTable(snapshot);

    return snapshot;
}
