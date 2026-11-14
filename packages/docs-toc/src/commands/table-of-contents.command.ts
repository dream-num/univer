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

import type { DocumentDataModel, IAccessor, ICommand, ICustomBlock, ICustomRange, IDocStyles, IDocumentBody, IDocumentStyle, ILists, IParagraph, ISpecialCharacterCustomRange, ITables, ITextRange, ITextRun } from '@univerjs/core';
import type { DocumentSkeleton } from '@univerjs/engine-render';
import {
    binSearchFirstGreaterThanTarget,
    BooleanNumber,
    BuildTextUtils,
    cloneParagraphWithId,
    CommandType,
    createParagraphId,
    CustomRangeType,
    DocStyleType,
    DocumentFlavor,
    generateRandomId,
    getBodySlice,
    getPlainText,
    getRichTextEditPath,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    JSONX,
    NamedStyleType,
    NumberUnitType,
    PRESET_LIST_TYPE,
    resolveDocumentParagraphBullet,
    resolveDocumentParagraphStyle,
    SliceBodyType,
    SpecialCharacterKind,
    TabStopAlignment,
    TabStopLeader,
    TextX,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, DocStateChangeManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { getFontStyleString, getNumberUnitValue, IRenderManagerService, measureDocumentNoWrapTextWidth, resolveDocumentParagraphNumbering } from '@univerjs/engine-render';
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

export interface ITableOfContentsHeading {
    bookmarkId?: string;
    headingId: string;
    level: number;
    paragraph: IParagraph;
    startOffset: number;
    /** Printed label supplied by an embedded story whose anchor is in the main body. */
    pageNumber?: number | string;
    text: string;
    /** Generated label before a tab separator; used to retain the number's tab spacing. */
    numberingText?: string;
    textRuns?: ITextRun[];
    customBlocks?: ICustomBlock[];
    specialCharacters?: ISpecialCharacterCustomRange[];
    showPageNumber?: boolean;
}

interface ITableOfContentsBuildOptions {
    tabStopOffset?: number;
    availableWidth?: number;
    entries?: ITableOfContentsHeading[];
    showPageNumbers?: boolean;
    styles?: IDocStyles;
    documentStyle?: IDocumentStyle;
    lists?: ILists;
    tableSource?: ITables;
    preserveLeadingParagraph?: boolean;
    resetEntryParagraphFormatting?: boolean;
    entryStyleName?: string;
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
    if (!doc || !body || !toc || toc.properties?.locked === BooleanNumber.TRUE || !unitId) {
        return false;
    }
    const render = accessor.get(IRenderManagerService).getRenderUnitById(unitId);
    const renderInjector = render?.getInjector?.();
    if (!render || !renderInjector?.has(DocSkeletonManagerService)) {
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
        if (!currentBody || !currentToc || currentToc.properties?.locked === BooleanNumber.TRUE) {
            return false;
        }
        const resolvePageNumber = (offset: number) => {
            const pageIndex = skeleton.findBodyPageIndexByCharIndex(offset);
            return skeleton.getSkeletonData()?.pages[pageIndex]?.pageNumber;
        };
        const replacement = params?.mode === 'pageNumbersOnly'
            ? buildPageNumberOnlyTableOfContentsBody(currentBody, currentToc, resolvePageNumber)
            : buildTableOfContentsBody(currentBody, currentToc, resolvePageNumber, undefined, {
                documentStyle: doc.getDocumentStyle(),
                styles: doc.getSnapshot().styles,
                lists: doc.getSnapshot().lists,
                tableSource: doc.getSnapshot().tableSource,
                availableWidth: getDocumentTextWidth(currentBody, currentToc.startIndex, doc.getDocumentStyle()),
            });
        if (!replacement) {
            return false;
        }
        // An accurate page-only update must not create history or restart pagination.
        // Compare metadata too: identical visible text can still have stale field caches.
        if (params?.mode === 'pageNumbersOnly' && Tools.diffValue(
            getBodySlice(currentBody, currentToc.startIndex, currentToc.endIndex + 1, true, SliceBodyType.cut),
            replacement
        )) {
            return true;
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
        const availableWidth = getDocumentTextWidth(body, selection.startOffset, doc.getDocumentStyle());
        const replacement = buildTableOfContentsBody(body, toc, (offset) => {
            const pageIndex = skeleton.findBodyPageIndexByCharIndex(offset);
            return skeleton.getSkeletonData()?.pages[pageIndex]?.pageNumber;
        }, generateRandomId, {
            tabStopOffset: Math.max(72, availableWidth ?? 594.3),
            availableWidth,
            documentStyle: doc.getDocumentStyle(),
            styles: doc.getSnapshot().styles,
            lists: doc.getSnapshot().lists,
            tableSource: doc.getSnapshot().tableSource,
        });
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
    resolvePageNumber: (offset: number) => number | string | undefined,
    resolvePageField?: (field: ICustomRange) => number | string | undefined
): IDocumentBody | null {
    if (toc.properties?.locked === BooleanNumber.TRUE) {
        return null;
    }
    // Slice metadata may share nested range properties with the source. Build the
    // replacement in isolation so history captures the unmodified field caches.
    const result = Tools.deepClone(getBodySlice(body, toc.startIndex, toc.endIndex + 1, true, SliceBodyType.cut));
    const pageFields = result.customRanges
        ?.filter((range) => range.rangeType === CustomRangeType.FIELD && range.properties?.fieldType === 'PAGEREF' &&
            range.properties?.locked !== BooleanNumber.TRUE)
        .sort((left, right) => right.startIndex - left.startIndex) ?? [];

    for (const pageField of pageFields) {
        const originalField = body.customRanges?.find((range) => range.rangeId === pageField.rangeId);
        const targetOffset = originalField && resolvePageReferenceOffset(body, originalField);
        const pageNumber = (originalField && resolvePageField?.(originalField)) ??
            (targetOffset == null ? undefined : resolvePageNumber(targetOffset));
        if (pageNumber == null) {
            return null;
        }
        replaceFieldResult(result, pageField, String(pageNumber));
    }
    const outer = result.customRanges?.find((range) => range.rangeId === toc.rangeId);
    if (outer?.properties) {
        outer.properties.cachedResult = getPlainText(result.dataStream.slice(1, -1))
            .replaceAll(FIELD_START, '')
            .replaceAll(FIELD_END, '');
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
    return body.paragraphs?.find((paragraph) => paragraph.paragraphStyle?.headingId === headingId || paragraph.paragraphId === headingId)?.startIndex;
}

function replaceFieldResult(body: IDocumentBody, field: ICustomRange, value: string): void {
    const start = field.startIndex + 1;
    const end = field.endIndex;
    if (field.properties) {
        field.properties.cachedResult = value;
    }
    // Unchanged text can still need a cache repair, but cannot shift any ranges.
    if (body.dataStream.slice(start, end) === value) {
        return;
    }
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

function getDocumentTextWidth(body: IDocumentBody, offset: number, documentStyle?: IDocumentStyle): number | undefined {
    const section = body.sectionBreaks?.find((entry) => offset <= entry.startIndex);
    const pageWidth = section?.pageSize?.width ?? documentStyle?.pageSize?.width;
    return section?.columnProperties?.[0]?.width ?? (pageWidth == null ? undefined : pageWidth - (section?.marginLeft ?? documentStyle?.marginLeft ?? 0) - (section?.marginRight ?? documentStyle?.marginRight ?? 0));
}

export function buildTableOfContentsBody(
    body: IDocumentBody,
    toc: ICustomRange,
    resolvePageNumber: (offset: number) => number | string | undefined,
    idFactory: () => string = generateRandomId,
    options?: ITableOfContentsBuildOptions
): IDocumentBody | null {
    if (toc.properties?.locked === BooleanNumber.TRUE) {
        return null;
    }
    options = { ...options, availableWidth: options?.availableWidth ?? getDocumentTextWidth(body, toc.startIndex, options?.documentStyle) };
    const instruction = String(toc.properties?.instruction ?? '');
    if (/\\c\s+/i.test(instruction) && !options?.entries) {
        return null;
    }
    const [minLevel, maxLevel] = parseOutlineLevelRange(instruction);
    const headings = options?.entries ?? collectHeadings(body, toc, minLevel, maxLevel, options?.styles, options ?? {});
    if (headings.length === 0) {
        return null;
    }
    const showPageNumbers = options?.showPageNumbers ?? (toc.properties?.showPageNumbers !== false && !/\\n(?:\s|$)/i.test(instruction));
    const rightAlignPageNumbers = showPageNumbers && toc.properties?.rightAlignPageNumbers !== false && !/\\p\s+/i.test(instruction);
    const tabLeader = normalizeTabLeader(toc.properties?.tabLeader);
    const format = normalizeFormat(toc.properties?.format);
    const isExistingToc = body.customRanges?.some((range) => range.rangeId === toc.rangeId) ?? false;
    const oldParagraphs = isExistingToc
        ? body.paragraphs?.filter((paragraph) =>
            paragraph.startIndex >= toc.startIndex && (paragraph.startIndex <= toc.endIndex ||
                (paragraph.startIndex === toc.endIndex + 1 && body.dataStream[paragraph.startIndex] === '\r' && /^(toc[1-9]|tableoffigures)$/.test(getTocStyleName(paragraph, options?.styles))))
        ) ?? []
        : [];
    const title = typeof toc.properties?.title === 'string'
        ? toc.properties.title.trim()
        : getExistingTableOfContentsTitle(body, oldParagraphs, toc.startIndex, options?.styles);
    const result: IDocumentBody = { dataStream: '', paragraphs: [], customRanges: [] };
    const ranges = result.customRanges!;
    const oldTitleParagraph = oldParagraphs.find((paragraph) => getTocStyleName(paragraph, options?.styles) === 'tocheading');
    const hasExternalTitle = isExistingToc && body.paragraphs?.some((paragraph) =>
        paragraph.startIndex === toc.startIndex - 1 && getTocStyleName(paragraph, options?.styles) === 'tocheading');
    const hasLeadingParagraph = isExistingToc && body.dataStream[toc.startIndex + 1] === '\r';
    const oldLeadingParagraph = hasLeadingParagraph ? oldParagraphs.find((paragraph) => paragraph.startIndex === toc.startIndex + 1) : undefined;
    const oldEntryParagraphs = oldParagraphs.filter((paragraph) => paragraph !== oldTitleParagraph && paragraph !== oldLeadingParagraph);
    const oldParagraphsByTarget = getTocParagraphsByTarget(body, toc, oldEntryParagraphs);
    const usedParagraphIds = new Set<string>();
    let cachedResult = '';

    // Word replaces the entire field result; keep a newly authored title outside it.
    if (!isExistingToc && title) {
        result.dataStream = `${title}\r`;
        result.paragraphs!.push(cloneParagraphWithId({
            startIndex: result.dataStream.length - 1,
            paragraphId: '',
            styleId: 'TOCHeading',
        }, usedParagraphIds));
    }
    const fieldStart = result.dataStream.length;
    result.dataStream += FIELD_START;

    if (options?.preserveLeadingParagraph === true || (hasLeadingParagraph && options?.preserveLeadingParagraph !== false)) {
        result.dataStream += '\r';
        cachedResult += '\r';
        result.paragraphs!.push(cloneParagraphWithId({ ...Tools.deepClone(oldLeadingParagraph ?? { paragraphId: '', startIndex: 1 }), startIndex: result.dataStream.length - 1 }, usedParagraphIds));
    }

    if (title && isExistingToc && !hasExternalTitle) {
        result.dataStream += `${title}\r`;
        cachedResult += `${title}\r`;
        result.paragraphs!.push(cloneParagraphWithId({
            ...Tools.deepClone(oldTitleParagraph ?? {}),
            startIndex: result.dataStream.length - 1,
            paragraphId: oldTitleParagraph?.paragraphId ?? '',
            styleId: oldTitleParagraph?.styleId ?? 'TOCHeading',
        }, usedParagraphIds));
    }

    for (const [index, heading] of headings.entries()) {
        const showEntryPageNumber = showPageNumbers && heading.showPageNumber !== false;
        const pageNumber = showEntryPageNumber ? heading.pageNumber ?? resolvePageNumber(heading.startOffset) : undefined;
        if (showEntryPageNumber && pageNumber == null) {
            return null;
        }
        const entryStart = result.dataStream.length;
        if (heading.specialCharacters?.length) {
            ranges.push(...heading.specialCharacters.map((character) => ({
                ...Tools.deepClone(character),
                rangeId: idFactory(),
                startIndex: entryStart + character.startIndex,
                endIndex: entryStart + character.endIndex,
            })));
        }
        if (heading.customBlocks?.length) {
            result.customBlocks ??= [];
            result.customBlocks.push(...heading.customBlocks.map((block) => ({ ...block, startIndex: entryStart + block.startIndex })));
        }
        if (heading.textRuns?.length) {
            result.textRuns ??= [];
            result.textRuns.push(...heading.textRuns.map((run) => ({
                ...Tools.deepClone(run),
                st: entryStart + run.st,
                ed: entryStart + run.ed,
            })));
        }
        const separator = showEntryPageNumber ? (rightAlignPageNumbers ? '\t' : ' ') : '';
        const visibleEntry = `${heading.text}${separator}${pageNumber ?? ''}`;
        result.dataStream += `${heading.text}${separator}`;
        const targetId = heading.bookmarkId ?? heading.headingId;
        const link: ICustomRange = {
            startIndex: entryStart,
            endIndex: result.dataStream.length - 1,
            rangeId: idFactory(),
            rangeType: CustomRangeType.HYPERLINK,
            wholeEntity: false,
            properties: {
                ...(heading.bookmarkId ? { bookmarkId: targetId } : { headingId: targetId }),
                textStyleMode: 'text',
            },
        };
        if (heading.text.length || showEntryPageNumber) {
            ranges.push(link);
        }
        if (showEntryPageNumber) {
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
        const paragraph = copyTocParagraph(
            oldEntryParagraphs,
            index,
            heading.level,
            result.dataStream.length - 1,
            usedParagraphIds,
            {
                tabStopOffset: rightAlignPageNumbers ? options?.tabStopOffset : undefined,
                tabLeader: toc.properties?.tabLeader == null ? undefined : tabLeader,
                format,
                styles: options?.styles,
                refreshPageTab: rightAlignPageNumbers,
                resetEntryParagraphFormatting: options?.resetEntryParagraphFormatting,
                styleName: options?.entryStyleName,
                sourceParagraph: oldParagraphsByTarget.get(heading.bookmarkId ?? heading.headingId) ?? oldParagraphsByTarget.get(heading.paragraph.paragraphId),
            }
        );
        formatNumberedEntry(paragraph, heading, toc.rangeId, options);
        result.paragraphs!.push(paragraph);
    }

    result.dataStream += FIELD_END;
    ranges.push({
        startIndex: fieldStart,
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
    if (!isExistingToc) {
        // A shared closing paragraph lets Word's directory update consume the next heading's bookmark.
        result.dataStream += '\r';
        result.paragraphs!.push(cloneParagraphWithId({
            startIndex: result.dataStream.length - 1,
            paragraphId: '',
            paragraphStyle: { outlineLevel: 9 },
        }, usedParagraphIds));
    }
    ranges.sort((left, right) => left.startIndex - right.startIndex || right.endIndex - left.endIndex);
    return result;
}

function getTocStyleName(paragraph: IParagraph, styles?: IDocStyles): string {
    const styleId = (paragraph.styleId ?? '').replace(/\s+/g, '').toLowerCase();
    return /^toc(?:[1-9]|heading)$/.test(styleId)
        ? styleId
        : (styles?.[paragraph.styleId ?? '']?.name ?? styleId).replace(/\s+/g, '').toLowerCase();
}

function getExistingTableOfContentsTitle(body: IDocumentBody, paragraphs: IParagraph[], fieldStart: number, styles?: IDocStyles): string {
    const titleParagraph = paragraphs.find((paragraph) => getTocStyleName(paragraph, styles) === 'tocheading');
    if (!titleParagraph) {
        return '';
    }
    const allParagraphs = [...(body.paragraphs ?? [])].sort((left, right) => left.startIndex - right.startIndex);
    const index = allParagraphs.findIndex((paragraph) => paragraph === titleParagraph || paragraph.paragraphId === titleParagraph.paragraphId);
    let start = index > 0 ? allParagraphs[index - 1].startIndex + 1 : 0;
    start = Math.max(start, fieldStart + 1);
    while (body.dataStream[start] === FIELD_START || body.dataStream[start] === FIELD_END) {
        start += 1;
    }
    return getPlainText(body.dataStream.slice(start, titleParagraph.startIndex)).trim();
}

export function countTableOfContentsHeadings(body: IDocumentBody | null | undefined, levels = 3, styles?: IDocStyles): number {
    if (!body) {
        return 0;
    }
    const maxLevel = Math.min(9, Math.max(1, Math.trunc(levels)));
    return collectHeadings(body, undefined, 1, maxLevel, styles).length;
}

function parseOutlineLevelRange(instruction: string): [number, number] {
    const match = instruction.match(/\\o\s+"(\d+)\s*-\s*(\d+)"/i);
    const min = Math.max(1, Number(match?.[1] ?? 1));
    const max = Math.min(9, Math.max(min, Number(match?.[2] ?? 3)));
    return [min, max];
}

function formatNumberedEntry(paragraph: IParagraph, heading: ITableOfContentsHeading, rangeId: string, options?: ITableOfContentsBuildOptions): void {
    if (!heading.numberingText || options?.documentStyle?.documentFlavor === DocumentFlavor.MODERN) {
        return;
    }
    const style = resolveDocumentParagraphStyle(options?.documentStyle, paragraph.paragraphStyle, { styles: options?.styles, paragraphStyleId: paragraph.styleId });
    const numberStyle = heading.textRuns?.find((run) => run.st === 0 && run.ed >= heading.numberingText!.length)?.ts;
    const textStyle = { ...style.textStyle, ...numberStyle };
    const font = getFontStyleString(textStyle, options?.documentStyle?.fontFamilyFallbacks, options?.documentStyle?.fontFamilyClasses);
    const width = measureDocumentNoWrapTextWidth({
        id: rangeId,
        documentStyle: { ...options?.documentStyle, textStyle },
        body: { dataStream: heading.numberingText },
    });
    const characterWidth = font.originFontSize * 4 / 3;
    const first = getNumberUnitValue(style.indentFirstLine, characterWidth);
    const start = getNumberUnitValue(style.indentStart, characterWidth) + (first > 0 ? first : -getNumberUnitValue(style.hanging, characterWidth));
    const tabs = style.tabStops ?? [];
    const nextTab = tabs.filter((tab) => !tab.clear && tab.offset > start + width).sort((left, right) => left.offset - right.offset)[0];
    if (nextTab && (nextTab.alignment === TabStopAlignment.START || nextTab.alignment === TabStopAlignment.TAB_STOP_ALIGNMENT_UNSPECIFIED) && (options?.availableWidth == null || nextTab.offset < options.availableWidth)) {
        if (paragraph.paragraphStyle?.tabStops) {
            paragraph.paragraphStyle = { ...paragraph.paragraphStyle, tabStops: [...paragraph.paragraphStyle.tabStops].sort((left, right) => left.offset - right.offset) };
        }
        return;
    }
    // Word leaves an extra 11-point grid interval after the numbered label.
    const interval = 11 * 4 / 3;
    const offset = (Math.floor((start + width) / interval + 1e-6) + 2) * 11 * 4 / 3;
    paragraph.paragraphStyle = {
        ...paragraph.paragraphStyle,
        tabStops: [...tabs, { offset, alignment: TabStopAlignment.START, leader: TabStopLeader.NONE }].sort((left, right) => left.offset - right.offset),
    };
}

function collectHeadings(body: IDocumentBody, toc: ICustomRange | undefined, minLevel: number, maxLevel: number, styles?: IDocStyles, options?: ITableOfContentsBuildOptions): ITableOfContentsHeading[] {
    // Counting headings does not need list resolution or text measurement.
    const snapshot = options && { body, styles, documentStyle: options.documentStyle, lists: { ...PRESET_LIST_TYPE, ...options.lists }, tableSource: options.tableSource };
    const numbering = snapshot && resolveDocumentParagraphNumbering(snapshot);
    const paragraphs = [...(body.paragraphs ?? [])].sort((left, right) => left.startIndex - right.startIndex);
    let paragraphStart = 0;
    return paragraphs.flatMap((paragraph) => {
        let startOffset = paragraphStart;
        while (body.dataStream[startOffset] === FIELD_START || body.dataStream[startOffset] === FIELD_END) {
            startOffset += 1;
        }
        paragraphStart = paragraph.startIndex + 1;
        const level = getOutlineLevel(paragraph, styles);
        const headingId = paragraph.paragraphStyle?.headingId || paragraph.paragraphId;
        if (!headingId || level == null || level < minLevel || level > maxLevel ||
            (toc && startOffset >= toc.startIndex && paragraph.startIndex <= toc.endIndex)) {
            return [];
        }
        const characters = (body.customRanges ?? []).filter((range): range is ISpecialCharacterCustomRange =>
            range.rangeType === CustomRangeType.CUSTOM && range.wholeEntity === true && range.startIndex === range.endIndex &&
            range.startIndex >= startOffset && range.endIndex < paragraph.startIndex &&
            ((range.properties?.kind === SpecialCharacterKind.NON_BREAKING_HYPHEN && body.dataStream[range.startIndex] === '\u2011') ||
                (range.properties?.kind === SpecialCharacterKind.OPTIONAL_HYPHEN && body.dataStream[range.startIndex] === '\u00AD')));
        const optionalHyphens = new Set(characters.filter((range) => range.properties.kind === SpecialCharacterKind.OPTIONAL_HYPHEN).map((range) => range.startIndex));
        const offsets: number[] = [];
        let content = '';
        for (let index = startOffset; index < paragraph.startIndex; index++) {
            offsets[index - startOffset] = content.length;
            if (!optionalHyphens.has(index)) {
                content += getPlainText(body.dataStream[index]);
            }
        }
        const leading = content.length - content.trimStart().length;
        let text = content.trim();
        if (!text) {
            return [];
        }
        const bookmark = body.customRanges?.find((range) =>
            range.rangeType === CustomRangeType.BOOKMARK &&
            range.startIndex <= paragraph.startIndex &&
            range.endIndex >= startOffset &&
            range.properties?.bookmarkId
        );
        const label = numbering?.get(paragraph.startIndex)?.label;
        const bullet = snapshot && resolveDocumentParagraphBullet(snapshot, paragraph);
        const definition = bullet && snapshot?.lists[bullet.listType];
        const followNumberWith = bullet && definition?.nestingLevel[bullet.nestingLevel]?.followNumberWith;
        const preset = bullet && options?.lists?.[bullet.listType] == null && PRESET_LIST_TYPE[bullet.listType];
        const separator = followNumberWith === 0 || (followNumberWith == null && preset) ? '\t' : ' ';
        const prefix = label ? label.replace(/[ \t]+$/, '') + separator : '';
        if (label && !/\\w(?:\s|$)/i.test(String(toc?.properties?.instruction ?? ''))) {
            text = text.replace(/\t/g, ' ');
        }
        const numberFont = Object.fromEntries(Object.entries(paragraph.paragraphStyle?.paragraphMarkTextStyle ?? {}).filter(([key]) => ['ff', 'eastAsiaFontFamily', 'eastAsiaFontTheme', 'complexScriptFontFamily', 'fontHint'].includes(key)));
        return [{
            bookmarkId: bookmark?.properties?.bookmarkId,
            headingId,
            level,
            paragraph,
            startOffset,
            text: `${prefix}${text}`,
            numberingText: prefix && separator === '\t' ? prefix.slice(0, -1) : undefined,
            // The local numbering font survives; size and separator follow the directory style.
            textRuns: prefix && Object.keys(numberFont).length ? [{ st: 0, ed: prefix.length - separator.length, ts: numberFont }] : undefined,
            specialCharacters: characters.filter((range) => range.properties.kind === SpecialCharacterKind.NON_BREAKING_HYPHEN).map((range) => ({
                ...range,
                startIndex: prefix.length + offsets[range.startIndex - startOffset] - leading,
                endIndex: prefix.length + offsets[range.endIndex - startOffset] - leading,
            })),
        }];
    });
}

function getOutlineLevel(paragraph: IParagraph, styles?: IDocStyles): number | undefined {
    const style = resolveDocumentParagraphStyle(undefined, paragraph.paragraphStyle, { styles, paragraphStyleId: paragraph.styleId });
    const outlineLevel = style.outlineLevel;
    if (outlineLevel != null) {
        return outlineLevel >= 0 && outlineLevel <= 8 ? outlineLevel + 1 : undefined;
    }
    const namedStyle = style.namedStyleType;
    if (namedStyle != null && namedStyle >= NamedStyleType.HEADING_1 && namedStyle <= NamedStyleType.HEADING_5) {
        return namedStyle - NamedStyleType.HEADING_1 + 1;
    }
}

function getTocParagraphsByTarget(body: IDocumentBody, toc: ICustomRange, entries: IParagraph[]): Map<string, IParagraph> {
    const result = new Map<string, IParagraph>();
    if (!entries.length) {
        return result;
    }
    const paragraphs = body.paragraphs ?? [];
    const ends = paragraphs.map((paragraph) => paragraph.startIndex);
    const byEnd = new Map(entries.map((paragraph) => [paragraph.startIndex, paragraph]));
    const bookmarks = new Map((body.customRanges ?? [])
        .filter((range) => range.rangeType === CustomRangeType.BOOKMARK && range.properties?.bookmarkId)
        .map((range) => [String(range.properties!.bookmarkId).toLowerCase(), range.startIndex]));
    for (const range of body.customRanges ?? []) {
        if (range.rangeType !== CustomRangeType.HYPERLINK || range.startIndex <= toc.startIndex || range.endIndex >= toc.endIndex) {
            continue;
        }
        const source = byEnd.get(paragraphs[binSearchFirstGreaterThanTarget(ends, range.startIndex - 1)]?.startIndex);
        const targetId = range.properties?.bookmarkId ?? range.properties?.headingId;
        if (!source || !targetId) {
            continue;
        }
        result.set(targetId, source);
        const offset = bookmarks.get(targetId.toLowerCase());
        if (offset != null) {
            const target = paragraphs[binSearchFirstGreaterThanTarget(ends, offset - 1)];
            if (target) {
                result.set(target.paragraphId, source);
                if (target.paragraphStyle?.headingId) {
                    result.set(target.paragraphStyle.headingId, source);
                }
            }
        }
    }
    return result;
}

interface ITableOfContentsParagraphFormat {
    tabStopOffset?: number;
    tabLeader?: TableOfContentsTabLeader;
    format?: TableOfContentsFormat;
    styles?: IDocStyles;
    refreshPageTab?: boolean;
    resetEntryParagraphFormatting?: boolean;
    styleName?: string;
    sourceParagraph?: IParagraph;
}

function copyTocParagraph(
    oldParagraphs: IParagraph[],
    index: number,
    level: number,
    startIndex: number,
    usedParagraphIds: Set<string>,
    options: ITableOfContentsParagraphFormat = {}
): IParagraph {
    const { tabStopOffset, tabLeader, format = 'fromTemplate', styles, refreshPageTab = false, resetEntryParagraphFormatting = false } = options;
    const styleName = options.styleName ?? `toc${level}`;
    // Keep per-entry formatting, including the extra tab stop of numbered headings.
    const byIndex = oldParagraphs[index];
    const byStyleLevel = byIndex && getTocStyleName(byIndex, styles) === styleName
        ? byIndex
        : oldParagraphs.find((paragraph) => getTocStyleName(paragraph, styles) === styleName);
    const byTarget = options.sourceParagraph && getTocStyleName(options.sourceParagraph, styles) === styleName ? options.sourceParagraph : undefined;
    const source = byTarget ?? byStyleLevel ?? oldParagraphs[Math.min(index, oldParagraphs.length - 1)];
    const defaultStyleId = styleName === 'tableoffigures' ? 'TableOfFigures' : `TOC${level}`;
    const canonicalStyle = styles?.[defaultStyleId];
    const styleId = canonicalStyle?.type === DocStyleType.paragraph &&
        (canonicalStyle.name ?? defaultStyleId).replace(/\s+/g, '').toLowerCase() === styleName
        ? defaultStyleId
        : Object.keys(styles ?? {}).find((id) => styles![id].type === DocStyleType.paragraph &&
            (styles![id].name ?? id).replace(/\s+/g, '').toLowerCase() === styleName);
    const replaceSourceStyle = !source?.styleId || getTocStyleName(source, styles) === 'normal' ||
        (resetEntryParagraphFormatting && getTocStyleName(source, styles) !== styleName);
    let paragraphStyleId = source?.styleId;
    if (replaceSourceStyle) {
        paragraphStyleId = styleId ?? paragraphStyleId;
        if (resetEntryParagraphFormatting && styleId == null) {
            paragraphStyleId = defaultStyleId;
        }
    }
    const namedTabs = resolveDocumentParagraphStyle(undefined, undefined, { styles, paragraphStyleId }).tabStops ?? [];
    const oldTabs = source?.paragraphStyle?.tabStops ?? [];
    const namedPageTabs = namedTabs.filter((tab) => tab.alignment === TabStopAlignment.END);
    const pageOffset = tabStopOffset ?? oldTabs.filter((tab) => tab.alignment === TabStopAlignment.END).pop()?.offset;
    const pageTabs = namedPageTabs.map((tab) => ({ ...tab, ...(tabLeader == null ? {} : { leader: getTabStopLeader(tabLeader) }) }));
    if (!pageTabs.length && pageOffset != null) {
        pageTabs.push({ offset: pageOffset, alignment: TabStopAlignment.END, leader: getTabStopLeader(tabLeader ?? 'dots') });
    }
    const tabStops = refreshPageTab && pageTabs.length
        ? [...oldTabs.filter((tab) => tab.alignment !== TabStopAlignment.END), ...pageTabs]
        : undefined;
    const missingWordStyle = resetEntryParagraphFormatting && format === 'fromTemplate' && styleId == null && /^toc[1-9]$/.test(styleName);
    const fallbackIndent = missingWordStyle ? { indentStart: { v: Math.max(0, level - 1) * 2, u: NumberUnitType.CHARACTER } } : {};
    // A same-level paragraph is a formatting template, not the identity of every
    // entry. Keep distinct existing row IDs and allocate only for additional rows.
    if (source) {
        let paragraphStyle = source.paragraphStyle;
        if (resetEntryParagraphFormatting) {
            const entryTabs = tabStops ?? oldTabs.filter((tab) => tab.alignment !== TabStopAlignment.END);
            paragraphStyle = { ...fallbackIndent, ...(entryTabs.length ? { tabStops: entryTabs } : {}) };
        } else if (tabStops) {
            paragraphStyle = { ...paragraphStyle, tabStops };
        }
        return cloneParagraphWithId({
            ...source,
            ...(resetEntryParagraphFormatting || tabStops ? { paragraphStyle } : {}),
            ...(replaceSourceStyle ? { styleId: paragraphStyleId } : {}),
            startIndex,
            paragraphId: oldParagraphs[index]?.paragraphId ?? '',
        }, usedParagraphIds);
    }
    let paragraphStyle: IParagraph['paragraphStyle'] = {
        indentStart: { v: Math.max(0, level - 1) * getFormatIndent(format) },
    };
    if (format === 'modern' || format === 'classic') {
        paragraphStyle.spaceBelow = { v: format === 'modern' ? 4 : 2 };
    }
    if (tabStops) {
        paragraphStyle.tabStops = tabStops;
    } else if (tabStopOffset != null) {
        paragraphStyle.tabStops = [{ offset: tabStopOffset, alignment: TabStopAlignment.END, leader: getTabStopLeader(tabLeader ?? 'dots') }];
    }
    if (resetEntryParagraphFormatting) {
        paragraphStyle = { ...fallbackIndent, ...(tabStops?.length ? { tabStops } : {}) };
    }
    return {
        startIndex,
        paragraphId: createParagraphId(usedParagraphIds),
        styleId: styleId ?? defaultStyleId,
        paragraphStyle,
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
