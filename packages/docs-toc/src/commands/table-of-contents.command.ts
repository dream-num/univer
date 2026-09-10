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

import type { DocumentDataModel, IAccessor, ICommand, ICustomRange, IDocumentBody, IParagraph, ITextRange, ITextRun } from '@univerjs/core';
import type { DocumentSkeleton } from '@univerjs/engine-render';
import {
    BuildTextUtils,
    CommandType,
    CustomRangeType,
    generateRandomId,
    getBodySlice,
    getPlainText,
    getRichTextEditPath,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    JSONX,
    NamedStyleType,
    SliceBodyType,
    TabStopAlignment,
    TabStopLeader,
    TextX,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, DocStateChangeManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { filter, firstValueFrom, take, timeout } from 'rxjs';

const FIELD_START = '\u001F';
const FIELD_END = '\u001E';

async function replaceBodyRange(
    accessor: IAccessor,
    doc: DocumentDataModel,
    unitId: string,
    selection: ITextRange,
    body: IDocumentBody,
    historyAction: string,
    historyGroupId = generateRandomId()
): Promise<boolean> {
    const textX = new TextX();
    textX.push(...BuildTextUtils.selection.delete([selection], doc.getBody()!, 0, body));
    const caretOffset = selection.startOffset + body.dataStream.length;
    accessor.get(DocStateChangeManagerService).flushPendingChanges(unitId);
    const group = accessor.get(IUndoRedoService).beginUndoRedoGroup(unitId, historyGroupId, 'append');
    try {
        return Boolean(accessor.get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, {
            unitId,
            historyAction,
            actions: JSONX.getInstance().editOp(textX.serialize(), getRichTextEditPath(doc)),
            textRanges: [{
                startOffset: caretOffset,
                endOffset: caretOffset,
                collapsed: true,
            }],
            debounce: false,
            trigger: historyAction,
        }));
    } finally {
        group.dispose();
    }
}

export interface IUpdateTableOfContentsCommandParams {
    unitId?: string;
    rangeId?: string;
    mode?: 'pageNumbersOnly' | 'entireTable';
}

export interface IInsertTableOfContentsCommandParams {
    unitId?: string;
    levels?: number;
    showPageNumbers?: boolean;
    rightAlignPageNumbers?: boolean;
    tabLeader?: TableOfContentsTabLeader;
    format?: TableOfContentsFormat;
    title?: string;
}

export type TableOfContentsTabLeader = 'none' | 'dots' | 'dashes' | 'underline';
export type TableOfContentsFormat = 'fromTemplate' | 'classic' | 'modern' | 'simple';

export interface IDeleteTableOfContentsCommandParams {
    unitId?: string;
    rangeId?: string;
}

interface ITableOfContentsHeading {
    bookmarkId?: string;
    headingId: string;
    level: number;
    paragraph: IParagraph;
    startOffset: number;
    text: string;
}

export const UpdateTableOfContentsCommand: ICommand<IUpdateTableOfContentsCommandParams> = {
    id: 'doc.command.update-table-of-contents',
    type: CommandType.COMMAND,
    handler: (accessor, params) => updateTableOfContents(accessor, params),
};

async function updateTableOfContents(
    accessor: IAccessor,
    params?: IUpdateTableOfContentsCommandParams,
    historyGroupId = generateRandomId()
): Promise<boolean> {
    const instanceService = accessor.get(IUniverInstanceService);
    const doc = params?.unitId
        ? instanceService.getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC)
        : instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    const body = doc?.getBody();
    const selection = accessor.get(DocSelectionManagerService).getActiveTextRange();
    const toc = params?.rangeId
        ? body?.customRanges?.find((range) => range.rangeId === params.rangeId && isTableOfContentsRange(range))
        : findTableOfContentsAtOffset(body, selection?.startOffset);
    const unitId = doc?.getUnitId();
    const render = unitId ? accessor.get(IRenderManagerService).getRenderUnitById(unitId) : undefined;
    const renderInjector = render?.getInjector?.();
    if (!doc || !body || !toc || !unitId || !render || !renderInjector?.has(DocSkeletonManagerService)) {
        return false;
    }

    const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
    if (!await waitForCompleteLayout(skeleton)) {
        return false;
    }
    let updated = false;
    for (let iteration = 0; iteration < 3; iteration += 1) {
        const currentBody = doc.getBody();
        const currentToc = currentBody?.customRanges?.find((range) => range.rangeId === toc.rangeId && isTableOfContentsRange(range));
        if (!currentBody || !currentToc) {
            return false;
        }
        const resolvePageNumber = (offset: number) => {
            const pageIndex = skeleton.findBodyPageIndexByCharIndex(offset);
            return skeleton.getSkeletonData()?.pages[pageIndex]?.pageNumber;
        };
        const replacement = params?.mode === 'pageNumbersOnly'
            ? buildPageNumberOnlyTableOfContentsBody(currentBody, currentToc, resolvePageNumber)
            : buildTableOfContentsBody(currentBody, currentToc, resolvePageNumber);
        if (!replacement) {
            return false;
        }
        if (updated && currentBody.dataStream.slice(currentToc.startIndex, currentToc.endIndex + 1) === replacement.dataStream) {
            return true;
        }
        const generation = skeleton.getLayoutProgress()?.generation ?? -1;
        updated = await replaceBodyRange(accessor, doc, unitId, {
            startOffset: currentToc.startIndex,
            endOffset: currentToc.endIndex + 1,
            collapsed: false,
        }, replacement, UpdateTableOfContentsCommand.id, historyGroupId);
        if (!updated || iteration === 2) {
            return updated;
        }
        if (!await waitForNextCompleteLayout(skeleton, generation)) {
            return false;
        }
    }
    return updated;
}

export const DeleteTableOfContentsCommand: ICommand<IDeleteTableOfContentsCommandParams> = {
    id: 'doc.command.delete-table-of-contents',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        const instanceService = accessor.get(IUniverInstanceService);
        const doc = params?.unitId
            ? instanceService.getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC)
            : instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const body = doc?.getBody();
        const selection = accessor.get(DocSelectionManagerService).getActiveTextRange();
        const toc = params?.rangeId
            ? body?.customRanges?.find((range) => range.rangeId === params.rangeId && isTableOfContentsRange(range))
            : findTableOfContentsAtOffset(body, selection?.startOffset);
        const unitId = doc?.getUnitId();
        if (!toc || !unitId) {
            return false;
        }

        return replaceBodyRange(accessor, doc!, unitId, {
            startOffset: toc.startIndex,
            endOffset: toc.endIndex + 1,
            collapsed: false,
        }, { dataStream: '' }, DeleteTableOfContentsCommand.id);
    },
};

export const InsertTableOfContentsCommand: ICommand<IInsertTableOfContentsCommandParams> = {
    id: 'doc.command.insert-table-of-contents',
    type: CommandType.COMMAND,
    async handler(accessor, params) {
        const instanceService = accessor.get(IUniverInstanceService);
        const doc = params?.unitId
            ? instanceService.getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC)
            : instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const selection = accessor.get(DocSelectionManagerService).getActiveTextRange();
        const body = doc?.getBody();
        const unitId = doc?.getUnitId();
        const render = unitId ? accessor.get(IRenderManagerService).getRenderUnitById(unitId) : undefined;
        const renderInjector = render?.getInjector?.();
        if (!doc || !body || !unitId || !selection || selection.segmentId || selection.startOffset !== selection.endOffset ||
            findTableOfContentsAtOffset(body, selection.startOffset) || !render || !renderInjector?.has(DocSkeletonManagerService)) {
            return false;
        }

        const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
        if (!await waitForCompleteLayout(skeleton)) {
            return false;
        }
        const levels = Math.min(9, Math.max(1, Math.trunc(params?.levels ?? 3)));
        const showPageNumbers = params?.showPageNumbers ?? true;
        const rightAlignPageNumbers = showPageNumbers && (params?.rightAlignPageNumbers ?? true);
        const tabLeader = params?.tabLeader ?? 'dots';
        const format = params?.format ?? 'fromTemplate';
        const rangeId = generateRandomId();
        const toc: ICustomRange = {
            rangeId,
            rangeType: CustomRangeType.FIELD,
            startIndex: selection.startOffset,
            endIndex: selection.startOffset,
            wholeEntity: false,
            properties: {
                fieldType: 'TOC',
                instruction: buildTableOfContentsInstruction({ levels, showPageNumbers, rightAlignPageNumbers }),
                sourceKind: 'complex',
                showPageNumbers,
                rightAlignPageNumbers,
                tabLeader,
                format,
                title: params?.title,
            },
        };
        const { pageSize, marginLeft = 0, marginRight = 0 } = doc.getDocumentStyle();
        const replacement = buildTableOfContentsBody(body, toc, (offset) => {
            const pageIndex = skeleton.findBodyPageIndexByCharIndex(offset);
            return skeleton.getSkeletonData()?.pages[pageIndex]?.pageNumber;
        }, generateRandomId, { tabStopOffset: Math.max(72, (pageSize?.width ?? 594.3) - marginLeft - marginRight) });
        if (!replacement) {
            return false;
        }

        const historyGroupId = generateRandomId();
        const inserted = await replaceBodyRange(accessor, doc, unitId, {
            startOffset: selection.startOffset,
            endOffset: selection.startOffset,
            collapsed: true,
        }, replacement, InsertTableOfContentsCommand.id, historyGroupId);
        if (!inserted) {
            return false;
        }
        await updateTableOfContents(accessor, {
            unitId,
            rangeId,
            mode: 'entireTable',
        }, historyGroupId);
        return true;
    },
};

export function buildTableOfContentsInstruction(
    options: Pick<IInsertTableOfContentsCommandParams, 'levels' | 'showPageNumbers' | 'rightAlignPageNumbers'> = {}
): string {
    const levels = Math.min(9, Math.max(1, Math.trunc(options.levels ?? 3)));
    const showPageNumbers = options.showPageNumbers ?? true;
    const rightAlignPageNumbers = showPageNumbers && (options.rightAlignPageNumbers ?? true);
    const switches = [
        `\\o "1-${levels}"`,
        '\\h',
        '\\z',
        '\\u',
        ...(!showPageNumbers ? ['\\n'] : []),
        ...(showPageNumbers && !rightAlignPageNumbers ? ['\\p " "'] : []),
    ];
    return `TOC ${switches.join(' ')}`;
}

function isTableOfContentsRange(range: ICustomRange): boolean {
    return range.rangeType === CustomRangeType.FIELD && range.properties?.fieldType === 'TOC';
}

export function findTableOfContentsAtOffset(body: IDocumentBody | null | undefined, offset: number | undefined): ICustomRange | undefined {
    if (offset == null) {
        return undefined;
    }
    return body?.customRanges
        ?.filter((range) => isTableOfContentsRange(range) && range.startIndex <= offset && offset <= range.endIndex)
        .sort((left, right) => left.endIndex - left.startIndex - (right.endIndex - right.startIndex))[0];
}

async function waitForCompleteLayout(skeleton: DocumentSkeleton): Promise<boolean> {
    const progress = skeleton.getLayoutProgress();
    if (progress == null || progress.complete) {
        return true;
    }
    try {
        await firstValueFrom(skeleton.layoutProgress$.pipe(
            filter((next) => next.complete),
            take(1),
            timeout({ first: 30_000 })
        ));
        return true;
    } catch {
        return false;
    }
}

async function waitForNextCompleteLayout(skeleton: DocumentSkeleton, generation: number): Promise<boolean> {
    try {
        await firstValueFrom(skeleton.layoutProgress$.pipe(
            filter((next) => next.generation > generation && next.complete),
            take(1),
            timeout({ first: 30_000 })
        ));
        return true;
    } catch {
        return false;
    }
}

export function buildPageNumberOnlyTableOfContentsBody(
    body: IDocumentBody,
    toc: ICustomRange,
    resolvePageNumber: (offset: number) => number | undefined
): IDocumentBody | null {
    const result = getBodySlice(body, toc.startIndex, toc.endIndex + 1, true, SliceBodyType.cut);
    const pageFields = result.customRanges
        ?.filter((range) => range.rangeType === CustomRangeType.FIELD && range.properties?.fieldType === 'PAGEREF')
        .sort((left, right) => right.startIndex - left.startIndex) ?? [];

    for (const pageField of pageFields) {
        const originalField = body.customRanges?.find((range) => range.rangeId === pageField.rangeId);
        const targetOffset = originalField && resolvePageReferenceOffset(body, originalField);
        const pageNumber = targetOffset == null ? undefined : resolvePageNumber(targetOffset);
        if (pageNumber == null) {
            return null;
        }
        replaceFieldResult(result, pageField, String(pageNumber));
    }
    const outer = result.customRanges?.find((range) => range.rangeId === toc.rangeId);
    if (outer?.properties) {
        outer.properties.cachedResult = getPlainText(result.dataStream.slice(1, -1));
    }
    return result;
}

function resolvePageReferenceOffset(body: IDocumentBody, pageField: ICustomRange): number | undefined {
    const targetId = String(pageField.properties?.instruction ?? '').match(/PAGEREF\s+"?([^"\s\\]+)"?/i)?.[1];
    if (targetId) {
        const bookmark = body.customRanges?.find((range) =>
            range.rangeType === CustomRangeType.BOOKMARK && range.properties?.bookmarkId === targetId
        );
        if (bookmark) {
            return bookmark.startIndex;
        }
    }
    const link = body.customRanges?.find((range) =>
        range.rangeType === CustomRangeType.HYPERLINK &&
        range.startIndex <= pageField.startIndex && pageField.endIndex <= range.endIndex
    );
    const headingId = link?.properties?.headingId;
    return body.paragraphs?.find((paragraph) => paragraph.paragraphStyle?.headingId === headingId)?.startIndex;
}

function replaceFieldResult(body: IDocumentBody, field: ICustomRange, value: string): void {
    const start = field.startIndex + 1;
    const end = field.endIndex;
    const delta = value.length - (end - start);
    body.dataStream = `${body.dataStream.slice(0, start)}${value}${body.dataStream.slice(end)}`;
    shiftRuns(body.textRuns, start, end, delta);
    body.paragraphs?.forEach((paragraph) => {
        if (paragraph.startIndex >= end) {
            paragraph.startIndex += delta;
        }
    });
    body.customRanges?.forEach((range) => {
        if (range.startIndex >= end) {
            range.startIndex += delta;
            range.endIndex += delta;
        } else if (range.endIndex >= end) {
            range.endIndex += delta;
        }
        if (range.rangeId === field.rangeId && range.properties) {
            range.properties.cachedResult = value;
        }
    });
}

function shiftRuns(runs: ITextRun[] | undefined, start: number, end: number, delta: number): void {
    runs?.forEach((run) => {
        if (run.st >= end) {
            run.st += delta;
            run.ed += delta;
        } else if (run.ed > start) {
            run.ed += delta;
        }
    });
}

export function buildTableOfContentsBody(
    body: IDocumentBody,
    toc: ICustomRange,
    resolvePageNumber: (offset: number) => number | undefined,
    idFactory: () => string = generateRandomId,
    options?: { tabStopOffset?: number }
): IDocumentBody | null {
    const instruction = String(toc.properties?.instruction ?? '');
    if (/\\c\s+/i.test(instruction)) {
        return null;
    }
    const [minLevel, maxLevel] = parseOutlineLevelRange(instruction);
    const headings = collectHeadings(body, toc, minLevel, maxLevel);
    if (headings.length === 0) {
        return null;
    }
    const showPageNumbers = toc.properties?.showPageNumbers !== false && !/\\n(?:\s|$)/i.test(instruction);
    const rightAlignPageNumbers = showPageNumbers && toc.properties?.rightAlignPageNumbers !== false && !/\\p\s+/i.test(instruction);
    const tabLeader = normalizeTabLeader(toc.properties?.tabLeader);
    const format = normalizeFormat(toc.properties?.format);
    const isExistingToc = body.customRanges?.some((range) => range.rangeId === toc.rangeId) ?? false;
    const oldParagraphs = isExistingToc
        ? body.paragraphs?.filter((paragraph) =>
            paragraph.startIndex >= toc.startIndex && paragraph.startIndex <= toc.endIndex
        ) ?? []
        : [];
    const title = typeof toc.properties?.title === 'string'
        ? toc.properties.title.trim()
        : getExistingTableOfContentsTitle(body, oldParagraphs);
    const result: IDocumentBody = { dataStream: FIELD_START, paragraphs: [], customRanges: [] };
    const ranges = result.customRanges!;
    let cachedResult = '';

    if (title) {
        result.dataStream += `${title}\r`;
        cachedResult += `${title}\r`;
        result.paragraphs!.push({
            startIndex: result.dataStream.length - 1,
            paragraphId: idFactory(),
            styleId: 'TOCHeading',
        });
    }

    for (const [index, heading] of headings.entries()) {
        const pageNumber = showPageNumbers ? resolvePageNumber(heading.startOffset) : undefined;
        if (showPageNumbers && pageNumber == null) {
            return null;
        }
        const entryStart = result.dataStream.length;
        const separator = showPageNumbers ? (rightAlignPageNumbers ? '\t' : ' ') : '';
        const visibleEntry = `${heading.text}${separator}${pageNumber ?? ''}`;
        result.dataStream += `${heading.text}${separator}`;
        const targetId = heading.bookmarkId ?? heading.headingId;
        const link: ICustomRange = {
            startIndex: entryStart,
            endIndex: result.dataStream.length - 1,
            rangeId: idFactory(),
            rangeType: CustomRangeType.HYPERLINK,
            wholeEntity: false,
            properties: heading.bookmarkId ? { bookmarkId: targetId } : { headingId: targetId },
        };
        ranges.push(link);
        if (showPageNumbers) {
            const pageFieldStart = result.dataStream.length;
            result.dataStream += `${FIELD_START}${pageNumber}${FIELD_END}`;
            const pageFieldEnd = result.dataStream.length - 1;
            link.endIndex = pageFieldEnd;
            ranges.push({
                startIndex: pageFieldStart,
                endIndex: pageFieldEnd,
                rangeId: idFactory(),
                rangeType: CustomRangeType.FIELD,
                wholeEntity: false,
                properties: {
                    fieldType: 'PAGEREF',
                    instruction: `PAGEREF ${targetId} \\h`,
                    cachedResult: String(pageNumber),
                    sourceKind: 'complex',
                },
            });
        }
        result.dataStream += '\r';
        cachedResult += `${visibleEntry}\r`;
        result.paragraphs!.push(copyTocParagraph(
            oldParagraphs,
            index,
            heading.level,
            result.dataStream.length - 1,
            idFactory,
            rightAlignPageNumbers ? options?.tabStopOffset : undefined,
            tabLeader,
            format
        ));
    }

    result.dataStream += FIELD_END;
    ranges.push({
        startIndex: 0,
        endIndex: result.dataStream.length - 1,
        rangeId: toc.rangeId,
        rangeType: CustomRangeType.FIELD,
        wholeEntity: false,
        properties: {
            ...Tools.deepClone(toc.properties ?? {}),
            fieldType: 'TOC',
            instruction,
            cachedResult,
        },
    });
    ranges.sort((left, right) => left.startIndex - right.startIndex || right.endIndex - left.endIndex);
    return result;
}

function getExistingTableOfContentsTitle(body: IDocumentBody, paragraphs: IParagraph[]): string {
    const titleParagraph = paragraphs.find((paragraph) => paragraph.styleId?.toLowerCase() === 'tocheading');
    if (!titleParagraph) {
        return '';
    }
    const allParagraphs = [...(body.paragraphs ?? [])].sort((left, right) => left.startIndex - right.startIndex);
    const index = allParagraphs.findIndex((paragraph) => paragraph === titleParagraph || paragraph.paragraphId === titleParagraph.paragraphId);
    let start = index > 0 ? allParagraphs[index - 1].startIndex + 1 : 0;
    while (body.dataStream[start] === FIELD_START || body.dataStream[start] === FIELD_END) {
        start += 1;
    }
    return getPlainText(body.dataStream.slice(start, titleParagraph.startIndex)).trim();
}

export function countTableOfContentsHeadings(body: IDocumentBody | null | undefined, levels = 3): number {
    if (!body) {
        return 0;
    }
    const maxLevel = Math.min(9, Math.max(1, Math.trunc(levels)));
    return collectHeadings(body, undefined, 1, maxLevel).length;
}

function parseOutlineLevelRange(instruction: string): [number, number] {
    const match = instruction.match(/\\o\s+"(\d+)\s*-\s*(\d+)"/i);
    const min = Math.max(1, Number(match?.[1] ?? 1));
    const max = Math.min(9, Math.max(min, Number(match?.[2] ?? 3)));
    return [min, max];
}

function collectHeadings(body: IDocumentBody, toc: ICustomRange | undefined, minLevel: number, maxLevel: number): ITableOfContentsHeading[] {
    const paragraphs = [...(body.paragraphs ?? [])].sort((left, right) => left.startIndex - right.startIndex);
    let paragraphStart = 0;
    return paragraphs.flatMap((paragraph) => {
        let startOffset = paragraphStart;
        while (body.dataStream[startOffset] === FIELD_START || body.dataStream[startOffset] === FIELD_END) {
            startOffset += 1;
        }
        paragraphStart = paragraph.startIndex + 1;
        const level = getOutlineLevel(paragraph);
        const headingId = paragraph.paragraphStyle?.headingId;
        if (!headingId || level == null || level < minLevel || level > maxLevel ||
            (toc && startOffset >= toc.startIndex && paragraph.startIndex <= toc.endIndex)) {
            return [];
        }
        const text = getPlainText(body.dataStream.slice(startOffset, paragraph.startIndex)).trim();
        if (!text) {
            return [];
        }
        const bookmark = body.customRanges?.find((range) =>
            range.rangeType === CustomRangeType.BOOKMARK &&
            range.startIndex <= paragraph.startIndex &&
            range.endIndex >= startOffset &&
            range.properties?.bookmarkId
        );
        return [{
            bookmarkId: bookmark?.properties?.bookmarkId,
            headingId,
            level,
            paragraph,
            startOffset,
            text,
        }];
    });
}

function getOutlineLevel(paragraph: IParagraph): number | undefined {
    const outlineLevel = paragraph.paragraphStyle?.outlineLevel;
    if (outlineLevel != null && outlineLevel >= 0 && outlineLevel <= 8) {
        return outlineLevel + 1;
    }
    const namedStyle = paragraph.paragraphStyle?.namedStyleType;
    if (namedStyle != null && namedStyle >= NamedStyleType.HEADING_1 && namedStyle <= NamedStyleType.HEADING_5) {
        return namedStyle - NamedStyleType.HEADING_1 + 1;
    }
}

function copyTocParagraph(
    oldParagraphs: IParagraph[],
    index: number,
    level: number,
    startIndex: number,
    idFactory: () => string,
    tabStopOffset?: number,
    tabLeader: TableOfContentsTabLeader = 'dots',
    format: TableOfContentsFormat = 'fromTemplate'
): IParagraph {
    const byStyleLevel = oldParagraphs.find((paragraph) => paragraph.styleId?.match(/TOC(\d+)/i)?.[1] === String(level));
    const source = byStyleLevel ?? oldParagraphs[Math.min(index, oldParagraphs.length - 1)];
    if (source) {
        return {
            ...Tools.deepClone(source),
            startIndex,
        };
    }
    return {
        startIndex,
        paragraphId: idFactory(),
        styleId: `TOC${level}`,
        paragraphStyle: {
            indentStart: { v: Math.max(0, level - 1) * getFormatIndent(format) },
            spaceBelow: format === 'modern' ? { v: 4 } : format === 'classic' ? { v: 2 } : undefined,
            tabStops: tabStopOffset == null
                ? undefined
                : [{
                    offset: tabStopOffset,
                    alignment: TabStopAlignment.END,
                    leader: getTabStopLeader(tabLeader),
                }],
        },
    };
}

function normalizeTabLeader(value: unknown): TableOfContentsTabLeader {
    return value === 'none' || value === 'dashes' || value === 'underline' ? value : 'dots';
}

function getTabStopLeader(value: TableOfContentsTabLeader): TabStopLeader {
    return {
        none: TabStopLeader.NONE,
        dots: TabStopLeader.DOT,
        dashes: TabStopLeader.HYPHEN,
        underline: TabStopLeader.UNDERSCORE,
    }[value];
}

function normalizeFormat(value: unknown): TableOfContentsFormat {
    return value === 'classic' || value === 'modern' || value === 'simple' ? value : 'fromTemplate';
}

function getFormatIndent(format: TableOfContentsFormat): number {
    return {
        fromTemplate: 18,
        classic: 14,
        modern: 20,
        simple: 12,
    }[format];
}
