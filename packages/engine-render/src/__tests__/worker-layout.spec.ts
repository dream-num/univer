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

import type { IDocumentSkeletonPage } from '../basics/i-document-skeleton-cached';
import { cpuUsage } from 'node:process';
import {
    ColumnLayoutType,
    ColumnResponsiveType,
    createDocumentModelWithStyle,
    DataStreamTreeTokenType,
    DocumentDataModel,
    DocumentFlavor,
    DrawingTypeEnum,
    JSONX,
    LocaleService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    PresetListType,
    TableAlignmentType,
    TableRowHeightRule,
    TableSizeType,
    TableTextWrapType,
    TextX,
    TextXActionType,
    VerticalAlignmentType,
} from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocumentSkeleton } from '../components/docs/layout/doc-skeleton';
import { DocumentViewModel } from '../components/docs/view-model/document-view-model';
import { DocumentLayoutSession } from '../worker-layout';

type LayoutPublication = ReturnType<DocumentLayoutSession['step']>['publication'];

function normalizeSkeleton(value: unknown): unknown {
    if (value instanceof Map) {
        return [...value].map(([key, item]) => [key, normalizeSkeleton(item)]);
    }
    if (Array.isArray(value)) {
        return value.map(normalizeSkeleton);
    }
    if (value != null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value)
                // drawingAnchor.elements contains active-layout line references.
                // Publications preserve the anchor's persistent paragraph/top
                // semantics and deliberately rebuild those scratch references.
                .filter(([key]) => key !== 'parent' && key !== 'elements')
                .map(([key, item]) => [key, normalizeSkeleton(item)])
        );
    }
    return value;
}

function percentile(samples: number[], ratio: number): number {
    const sorted = [...samples].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)] ?? 0;
}

function expectBoundedPatchTransfer(samples: number[]): void {
    expect(samples.length).toBeGreaterThan(0);
    expect(percentile(samples, 0.95)).toBeLessThan(50);
    expect(Math.max(...samples)).toBeLessThan(100);
}

function summarizePages(skeleton: ReturnType<DocumentSkeleton['getSkeletonData']>) {
    return skeleton?.pages.map((page) => ({
        st: page.st,
        ed: page.ed,
        headerId: page.headerId,
        footerId: page.footerId,
        drawingIds: [...page.skeDrawings.keys()],
        tableIds: [...page.skeTables.keys()],
        columnGroupIds: [...page.skeColumnGroups.keys()],
    }));
}

function summarizeDrawingAnchors(skeleton: ReturnType<DocumentSkeleton['getSkeletonData']>) {
    return [...(skeleton?.drawingAnchor ?? [])].map(([segmentId, anchors]) => ({
        segmentId,
        anchors: [...anchors].map(([paragraphIndex, anchor]) => ({
            paragraphIndex,
            top: anchor.top,
        })),
    }));
}

function collectNestedElementIds(skeleton: ReturnType<DocumentSkeleton['getSkeletonData']>) {
    const drawingIds = new Set<string>();
    const tableIds = new Set<string>();
    const columnGroupIds = new Set<string>();
    const visit = (page: IDocumentSkeletonPage): void => {
        page.skeDrawings.forEach((_drawing, drawingId) => drawingIds.add(drawingId));
        page.skeTables.forEach((table, tableId) => {
            tableIds.add(tableId);
            table.rows.forEach((row) => row.cells.forEach(visit));
        });
        page.skeColumnGroups.forEach((columnGroup, columnGroupId) => {
            columnGroupIds.add(columnGroupId);
            columnGroup.columns.forEach((column) => visit(column.page));
        });
    };
    skeleton?.pages.forEach(visit);
    skeleton?.skeHeaders.forEach((pages) => pages.forEach(visit));
    skeleton?.skeFooters.forEach((pages) => pages.forEach(visit));
    return { drawingIds, tableIds, columnGroupIds };
}

describe('worker document layout session', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('publishes list nesting jumps and tolerates legacy sparse list caches', () => {
        vi.stubGlobal('document', undefined);
        vi.stubGlobal('OffscreenCanvas', class {
            getContext() {
                return {
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText(content: string) {
                        return {
                            width: content.length * 7,
                            fontBoundingBoxAscent: 9,
                            fontBoundingBoxDescent: 3,
                            actualBoundingBoxAscent: 8,
                            actualBoundingBoxDescent: 2,
                        };
                    },
                };
            }
        });

        const rootText = 'Root item';
        const deepText = 'Deep item';
        const rootEnd = rootText.length;
        const deepEnd = rootEnd + DataStreamTreeTokenType.PARAGRAPH.length + deepText.length;
        const dataModel = new DocumentDataModel({
            id: 'sparse-list-document',
            body: {
                dataStream: `${rootText}${DataStreamTreeTokenType.PARAGRAPH}${deepText}${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                paragraphs: [
                    { startIndex: rootEnd, paragraphId: 'sparse-list-root' },
                    { startIndex: deepEnd, paragraphId: 'sparse-list-deep' },
                ],
                sectionBreaks: [{
                    startIndex: deepEnd + DataStreamTreeTokenType.PARAGRAPH.length,
                    sectionId: 'sparse-list-section',
                }],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 240, height: 180 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const paragraphs = dataModel.getBody()?.paragraphs;
        if (!paragraphs || paragraphs.length < 2) {
            throw new Error('Expected two list paragraphs.');
        }
        paragraphs[0].bullet = {
            listId: 'sparse-list',
            listType: PresetListType.ORDER_LIST,
            nestingLevel: 0,
        };
        paragraphs[1].bullet = {
            listId: 'sparse-list',
            listType: PresetListType.ORDER_LIST,
            nestingLevel: 6,
        };
        const session = new DocumentLayoutSession(dataModel, new LocaleService());
        const targetModel = new DocumentDataModel(structuredClone(dataModel.getSnapshot()));
        const targetSkeleton = DocumentSkeleton.create(new DocumentViewModel(targetModel), new LocaleService());
        targetSkeleton.beginExternalLayout({ reason: 'initial' });

        const initialGeneration = session.start({ reason: 'initial' });
        let initialResult = session.step(initialGeneration, 0);
        for (let step = 0; step < 1_000 && !initialResult.progress.complete; step++) {
            if (initialResult.publication) {
                targetSkeleton.applyLayoutPublication(
                    structuredClone(initialResult.publication),
                    initialResult.progress
                );
            }
            initialResult = session.step(initialGeneration, 0);
        }
        if (initialResult.publication) {
            targetSkeleton.applyLayoutPublication(
                structuredClone(initialResult.publication),
                initialResult.progress
            );
        }

        expect(initialResult.progress.complete).toBe(true);
        const initialLevels = targetSkeleton.getSkeletonData()?.skeListLevel?.get('sparse-list');
        expect(initialLevels).toHaveLength(7);
        expect(initialLevels?.every((level) => Array.isArray(level))).toBe(true);

        const sessionSkeleton = (session as unknown as { _skeleton: DocumentSkeleton })._skeleton;
        const legacyLevels = sessionSkeleton.getSkeletonData()?.skeListLevel?.get('sparse-list');
        if (!legacyLevels) {
            throw new Error('Expected the Worker list cache.');
        }
        delete legacyLevels[3];

        // Regression: ISSUE-001 — sparse imported list levels crashed incremental publication after unrelated edits.
        // Found by /qa on 2026-08-29.
        // Report: .gstack/qa-reports/qa-report-docs-regressions-2026-08-29.md
        targetSkeleton.beginExternalLayout({ reason: 'edit' });
        const editGeneration = session.start({ reason: 'edit', anchor: paragraphs[1].startIndex });
        let editResult = session.step(editGeneration, 0);
        for (let step = 0; step < 1_000 && !editResult.progress.complete; step++) {
            if (editResult.publication) {
                targetSkeleton.applyLayoutPublication(
                    structuredClone(editResult.publication),
                    editResult.progress
                );
            }
            editResult = session.step(editGeneration, 0);
        }
        if (editResult.publication) {
            targetSkeleton.applyLayoutPublication(structuredClone(editResult.publication), editResult.progress);
        }

        expect(editResult.progress).toMatchObject({ complete: true, cancelled: false });
        const publishedLevels = targetSkeleton.getSkeletonData()?.skeListLevel?.get('sparse-list');
        expect(publishedLevels).toHaveLength(7);
        expect(publishedLevels?.every((level) => Array.isArray(level))).toBe(true);

        session.dispose();
        targetSkeleton.dispose();
        dataModel.dispose();
        targetModel.dispose();
    });

    it('publishes structured-cloneable pages without a DOM', () => {
        vi.stubGlobal('document', undefined);
        vi.stubGlobal('OffscreenCanvas', class {
            getContext() {
                return {
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText(content: string) {
                        return {
                            width: content.length * 7,
                            fontBoundingBoxAscent: 9,
                            fontBoundingBoxDescent: 3,
                            actualBoundingBoxAscent: 8,
                            actualBoundingBoxDescent: 2,
                        };
                    },
                };
            }
        });

        const dataModel = createDocumentModelWithStyle(
            `${'Worker layout content '.repeat(40)}\rSecond paragraph.\r`,
            {}
        );
        const firstParagraph = dataModel.getBody()?.paragraphs?.[0];
        if (firstParagraph == null) {
            throw new Error('Expected the test document first paragraph.');
        }
        firstParagraph.bullet = {
            listId: 'worker-layout-list',
            listType: PresetListType.ORDER_LIST,
            nestingLevel: 0,
        };
        dataModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        dataModel.updateDocumentDataPageSize(240, 180);
        const localeService = new LocaleService();
        const session = new DocumentLayoutSession(dataModel, localeService);
        const targetModel = new DocumentDataModel(structuredClone(dataModel.getSnapshot()));
        const targetSkeleton = DocumentSkeleton.create(new DocumentViewModel(targetModel), new LocaleService());
        targetSkeleton.calculate();
        const initialTargetPages = [...(targetSkeleton.getSkeletonData()?.pages ?? [])];
        const synchronousModel = new DocumentDataModel(structuredClone(dataModel.getSnapshot()));
        const synchronousSkeleton = DocumentSkeleton.create(new DocumentViewModel(synchronousModel), new LocaleService());
        synchronousSkeleton.calculate();
        const initialGeneration = session.start({ reason: 'initial' });
        let initialResult = session.step(initialGeneration, 0);
        for (let step = 0; step < 1_000 && !initialResult.progress.complete; step++) {
            initialResult = session.step(initialGeneration, 0);
        }
        expect(initialResult.progress.complete).toBe(true);

        const body = dataModel.getBody();
        if (body == null) {
            throw new Error('Expected the test document body.');
        }
        targetSkeleton.beginExternalLayout({ reason: 'edit' });
        const generation = session.start({
            reason: 'edit',
            anchor: Math.floor(body.dataStream.length / 3),
        });
        const publications: LayoutPublication[] = [];
        const transferDurations: number[] = [];
        let sawPlaceholderTail = false;

        let result = session.step(generation, 0);
        publications.push(result.publication);
        if (result.publication != null) {
            const transferStart = cpuUsage();
            const transferredPublication = structuredClone(result.publication);
            targetSkeleton.applyLayoutPublication(transferredPublication, result.progress);
            const transferCpu = cpuUsage(transferStart);
            transferDurations.push((transferCpu.user + transferCpu.system) / 1_000);
            if (result.progress.didPublishAnchor && !result.progress.complete) {
                const partialSkeleton = targetSkeleton.getSkeletonData();
                if (partialSkeleton == null) {
                    throw new Error('Expected a published skeleton.');
                }
                const tail = partialSkeleton.pages.slice(result.progress.publishedPageCount);
                sawPlaceholderTail = tail.length > 0 && tail.every((page) => page.isLayoutPlaceholder);
            }
        }
        for (let step = 0; step < 1_000 && !result.progress.complete; step++) {
            result = session.step(generation, 0);
            publications.push(result.publication);
            if (result.publication != null) {
                const transferStart = cpuUsage();
                const transferredPublication = structuredClone(result.publication);
                targetSkeleton.applyLayoutPublication(transferredPublication, result.progress);
                const transferCpu = cpuUsage(transferStart);
                transferDurations.push((transferCpu.user + transferCpu.system) / 1_000);
                if (result.progress.didPublishAnchor && !result.progress.complete) {
                    const partialSkeleton = targetSkeleton.getSkeletonData();
                    if (partialSkeleton == null) {
                        throw new Error('Expected a published skeleton.');
                    }
                    const tail = partialSkeleton.pages.slice(result.progress.publishedPageCount);
                    sawPlaceholderTail = tail.length > 0 && tail.every((page) => page.isLayoutPlaceholder);
                }
            }
        }

        expect(result.progress).toMatchObject({ complete: true, cancelled: false });
        expect(sawPlaceholderTail).toBe(true);
        // Placeholder publication must not mutate the complete layout pages that
        // the next Main typing generation reuses when the caret crosses a page.
        expect(initialTargetPages.slice(1).some((page) =>
            page.sections.length === 0 &&
            page.skeDrawings.size === 0 &&
            page.skeTables.size === 0 &&
            page.skeColumnGroups.size === 0
        )).toBe(false);
        const pagePublications = publications.flatMap((publication) =>
            publication?.kind === 'page' ? publication.pages : []
        );
        expect(pagePublications.length).toBeGreaterThan(1);
        expect(publications.every((publication) =>
            publication == null || publication.kind !== 'page' || publication.pages.length <= 1
        )).toBe(true);
        const geometryPublications = publications.filter((publication) => publication != null);
        expect(geometryPublications[0]?.resources.reset).toBe(true);
        expect(geometryPublications.at(-1)?.resources.reset).toBe(true);
        expect(geometryPublications.slice(1, -1).every((publication) => !publication.resources.reset)).toBe(true);
        expect(() => structuredClone(publications)).not.toThrow();
        expect(
            DocumentLayoutSession.hydratePage(pagePublications[0], dataModel.getSnapshot()).sections.length
        ).toBeGreaterThan(0);
        expectBoundedPatchTransfer(transferDurations);
        expect(synchronousSkeleton.getSkeletonData()?.skeListLevel?.size).toBeGreaterThan(0);
        expect(synchronousSkeleton.getSkeletonData()?.drawingAnchor?.size).toBeGreaterThan(0);
        expect(normalizeSkeleton(targetSkeleton.getSkeletonData())).toEqual(
            normalizeSkeleton(synchronousSkeleton.getSkeletonData())
        );

        session.dispose();
        targetSkeleton.dispose();
        synchronousSkeleton.dispose();
        dataModel.dispose();
        targetModel.dispose();
        synchronousModel.dispose();
        localeService.dispose();
    });

    it('keeps only the requested page window materialized on Main and fetches distant pages from Worker', () => {
        vi.stubGlobal('document', undefined);
        vi.stubGlobal('OffscreenCanvas', class {
            getContext() {
                return {
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText(content: string) {
                        return {
                            width: content.length * 7,
                            fontBoundingBoxAscent: 9,
                            fontBoundingBoxDescent: 3,
                            actualBoundingBoxAscent: 8,
                            actualBoundingBoxDescent: 2,
                        };
                    },
                };
            }
        });

        const content = Array.from(
            { length: 160 },
            (_, index) => `Materialized page window paragraph ${index} has enough text to wrap across lines.\r`
        ).join('');
        const workerModel = createDocumentModelWithStyle(content, {});
        workerModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        workerModel.updateDocumentDataPageSize(240, 180);
        const session = new DocumentLayoutSession(workerModel, new LocaleService());
        const mainModel = new DocumentDataModel(structuredClone(workerModel.getSnapshot()));
        const mainSkeleton = DocumentSkeleton.create(
            new DocumentViewModel(mainModel),
            new LocaleService()
        );
        mainSkeleton.beginExternalLayout({ reason: 'initial' });

        const initialWindow = { startPageIndex: 0, endPageIndex: 4 };
        const generation = session.start({ reason: 'initial' });
        let result = session.step(generation, 0);
        for (let step = 0; step < 4_000; step++) {
            if (result.publication != null) {
                mainSkeleton.applyLayoutPublication(
                    structuredClone(result.publication),
                    result.progress,
                    initialWindow
                );
                expect(mainSkeleton.getSkeletonData()?.pages.filter((page) =>
                    !page.isLayoutPlaceholder && !page.isMaterializationPlaceholder
                ).length).toBeLessThanOrEqual(5);
            }
            if (result.progress.complete) {
                break;
            }
            result = session.step(generation, 0);
        }

        const pages = mainSkeleton.getSkeletonData()?.pages;
        expect(result.progress.complete).toBe(true);
        expect(pages?.length).toBeGreaterThan(12);
        expect(pages?.slice(0, 5).every((page) =>
            !page.isLayoutPlaceholder && !page.isMaterializationPlaceholder
        )).toBe(true);
        expect(pages?.slice(5).every((page) => page.isMaterializationPlaceholder)).toBe(true);

        const distantPageIndex = 10;
        const distantWindow = { startPageIndex: 8, endPageIndex: 12 };
        for (
            let pageIndex = distantWindow.startPageIndex;
            pageIndex <= distantWindow.endPageIndex;
            pageIndex++
        ) {
            const pagePublication = session.getPage(pageIndex);
            if (pagePublication == null) {
                throw new Error(`Expected Worker to retain canonical page ${pageIndex}.`);
            }
            expect(mainSkeleton.applyLayoutPagePublication(
                structuredClone(pagePublication),
                distantWindow
            )).toBe(true);
        }

        const materializedPages = mainSkeleton.getSkeletonData()?.pages.filter((page) =>
            !page.isLayoutPlaceholder && !page.isMaterializationPlaceholder
        ) ?? [];
        expect(materializedPages).toHaveLength(5);
        expect(mainSkeleton.getSkeletonData()?.pages[0].isMaterializationPlaceholder).toBe(true);
        const distantPublication = session.getPage(distantPageIndex);
        if (distantPublication == null) {
            throw new Error('Expected Worker to retain the canonical distant page.');
        }
        expect(normalizeSkeleton(mainSkeleton.getSkeletonData()?.pages[distantPageIndex])).toEqual(
            normalizeSkeleton(DocumentLayoutSession.hydratePage(distantPublication, workerModel.getSnapshot()))
        );

        const editAnchor = mainSkeleton.getSkeletonData()?.pages[distantPageIndex].st;
        if (editAnchor == null || editAnchor < 0) {
            throw new Error('Expected the distant Main page to expose a logical edit anchor.');
        }
        const textX = new TextX();
        textX.push({ t: TextXActionType.RETAIN, len: editAnchor });
        textX.push({ t: TextXActionType.INSERT, len: 1, body: { dataStream: 'X' } });
        mainModel.apply(JSONX.getInstance().editOp(textX.serialize(), ['body']));
        mainSkeleton.getViewModel().reset(mainModel);
        const mainGeneration = mainSkeleton.startIncrementalLayout({
            reason: 'edit',
            anchor: editAnchor,
            priorityAnchor: editAnchor + 1,
            invalidation: {
                oldStart: editAnchor,
                oldEnd: editAnchor,
                newEnd: editAnchor + 1,
            },
        });
        let mainProgress = mainSkeleton.stepIncrementalLayout(mainGeneration, 0, 1);
        for (let step = 0; step < 20 && !mainProgress.didPublishAnchor; step++) {
            mainProgress = mainSkeleton.stepIncrementalLayout(mainGeneration, 0, 1);
        }
        expect(mainProgress.didPublishAnchor).toBe(true);
        expect(mainSkeleton.findNodePositionByCharIndex(editAnchor + 1)).not.toBeNull();

        session.dispose();
        mainSkeleton.dispose();
        workerModel.dispose();
        mainModel.dispose();
    });

    it('converges a stable edit tail and keeps its completion transfer page-bounded', () => {
        vi.stubGlobal('document', undefined);
        vi.stubGlobal('OffscreenCanvas', class {
            getContext() {
                return {
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText(content: string) {
                        return {
                            width: content.length * 7,
                            fontBoundingBoxAscent: 9,
                            fontBoundingBoxDescent: 3,
                            actualBoundingBoxAscent: 8,
                            actualBoundingBoxDescent: 2,
                        };
                    },
                };
            }
        });

        const content = Array.from(
            { length: 240 },
            (_, index) => `Stable Worker paragraph ${index} leaves room for a local insertion.\r`
        ).join('');
        const initialModel = createDocumentModelWithStyle(content, {});
        initialModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        initialModel.updateDocumentDataPageSize(240, 260);
        const session = new DocumentLayoutSession(initialModel, new LocaleService());
        const initialGeneration = session.start({ reason: 'initial' });
        let initialResult = session.step(initialGeneration, 0);
        for (let step = 0; step < 2_000 && !initialResult.progress.complete; step++) {
            initialResult = session.step(initialGeneration, 0);
        }
        expect(initialResult.progress.complete).toBe(true);

        const initialSkeleton = DocumentSkeleton.create(
            new DocumentViewModel(new DocumentDataModel(structuredClone(initialModel.getSnapshot()))),
            new LocaleService()
        );
        initialSkeleton.calculate();
        const pages = initialSkeleton.getSkeletonData()?.pages ?? [];
        expect(pages.length).toBeGreaterThan(20);
        const anchorPageIndex = 8;
        const anchor = pages[anchorPageIndex].st + 5;
        const nextSnapshot = structuredClone(initialModel.getSnapshot());
        const previousDataStream = nextSnapshot.body!.dataStream;
        nextSnapshot.body!.dataStream = `${previousDataStream.slice(0, anchor)}x${previousDataStream.slice(anchor)}`;
        for (const paragraph of nextSnapshot.body!.paragraphs ?? []) {
            if (paragraph.startIndex >= anchor) {
                paragraph.startIndex++;
            }
        }
        for (const sectionBreak of nextSnapshot.body!.sectionBreaks ?? []) {
            if (sectionBreak.startIndex >= anchor) {
                sectionBreak.startIndex++;
            }
        }
        const nextModel = new DocumentDataModel(nextSnapshot);
        session.resetDataModel(nextModel);
        const generation = session.start({
            reason: 'edit',
            anchor,
            priorityAnchor: anchor + 1,
            invalidation: {
                oldStart: anchor,
                oldEnd: anchor,
                newEnd: anchor + 1,
            },
        });

        let result = session.step(generation, 0);
        for (let step = 0; step < 100 && result.publication == null; step++) {
            result = session.step(generation, 0);
        }
        expect(result.publication).not.toBeNull();
        expect(result.progress).toMatchObject({
            complete: false,
            didPublishAnchor: true,
        });

        const pagePublications: LayoutPublication[] = [result.publication];
        let layoutStepCount = 0;
        for (let step = 0; step < 2_000 && !result.progress.complete; step++) {
            result = session.publishBacklog(generation);
            if (!result.progress.didPublish) {
                result = session.step(generation, 0);
                layoutStepCount++;
            }
            pagePublications.push(result.publication);
        }
        expect(result.progress).toMatchObject({ complete: true, cancelled: false });
        expect(layoutStepCount).toBeLessThan(200);
        expect(pagePublications.every((publication) =>
            publication?.kind !== 'page' || publication.pages.length <= 1
        )).toBe(true);

        session.dispose();
        initialSkeleton.dispose();
        nextModel.dispose();
        initialModel.dispose();
    });

    it('preserves logical offsets across sequential page publications with explicit page breaks', () => {
        vi.stubGlobal('document', undefined);
        vi.stubGlobal('OffscreenCanvas', class {
            getContext() {
                return {
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText(content: string) {
                        return {
                            width: content.length * 7,
                            fontBoundingBoxAscent: 9,
                            fontBoundingBoxDescent: 3,
                            actualBoundingBoxAscent: 8,
                            actualBoundingBoxDescent: 2,
                        };
                    },
                };
            }
        });

        const pageBreak = DataStreamTreeTokenType.PAGE_BREAK;
        const phrase = 'The target sentence ends here.';
        const content = [
            `First explicit page${pageBreak}`,
            `Second explicit page${pageBreak}`,
            `Third explicit page${pageBreak}`,
            `Fourth explicit page${pageBreak}`,
            `${phrase}\r`,
        ].join('');
        const dataModel = createDocumentModelWithStyle(content, {});
        dataModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        dataModel.updateDocumentDataPageSize(240, 180);
        const localeService = new LocaleService();
        const session = new DocumentLayoutSession(dataModel, localeService);
        const targetModel = new DocumentDataModel(structuredClone(dataModel.getSnapshot()));
        const targetSkeleton = DocumentSkeleton.create(new DocumentViewModel(targetModel), new LocaleService());
        const synchronousModel = new DocumentDataModel(structuredClone(dataModel.getSnapshot()));
        const synchronousSkeleton = DocumentSkeleton.create(new DocumentViewModel(synchronousModel), new LocaleService());
        synchronousSkeleton.calculate();
        targetSkeleton.beginExternalLayout({ reason: 'initial' });

        const generation = session.start({ reason: 'initial' });
        let result = session.step(generation, 0);
        for (let step = 0; step < 1_000; step++) {
            if (result.publication != null) {
                targetSkeleton.applyLayoutPublication(structuredClone(result.publication), result.progress);
            }
            if (result.progress.complete) {
                break;
            }
            result = session.step(generation, 0);
        }

        expect(result.progress).toMatchObject({ complete: true, cancelled: false });
        expect(normalizeSkeleton(targetSkeleton.getSkeletonData())).toEqual(
            normalizeSkeleton(synchronousSkeleton.getSkeletonData())
        );
        const expectedOffset = content.indexOf(phrase) + phrase.length;
        const targetPosition = targetSkeleton.findNodePositionByCharIndex(expectedOffset, true);
        if (targetPosition == null) {
            throw new Error('Expected the published Worker skeleton to resolve the target offset');
        }
        expect(targetSkeleton.findCharIndexByPosition(targetPosition)).toBe(expectedOffset);

        session.dispose();
        targetSkeleton.dispose();
        synchronousSkeleton.dispose();
        dataModel.dispose();
        targetModel.dispose();
        synchronousModel.dispose();
        localeService.dispose();
    });

    it('publishes every bridge page from the dirty boundary through a transformed collaboration anchor', () => {
        vi.stubGlobal('document', undefined);
        vi.stubGlobal('OffscreenCanvas', class {
            getContext() {
                return {
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText(content: string) {
                        return {
                            width: content.length * 7,
                            fontBoundingBoxAscent: 9,
                            fontBoundingBoxDescent: 3,
                            actualBoundingBoxAscent: 8,
                            actualBoundingBoxDescent: 2,
                        };
                    },
                };
            }
        });

        const content = Array.from(
            { length: 120 },
            (_, index) => `Collaboration paragraph ${index} spans compact pages.\r`
        ).join('');
        const dataModel = createDocumentModelWithStyle(content, {});
        dataModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        dataModel.updateDocumentDataPageSize(240, 180);
        const localeService = new LocaleService();
        const session = new DocumentLayoutSession(dataModel, localeService);
        const referenceModel = new DocumentDataModel(structuredClone(dataModel.getSnapshot()));
        const referenceSkeleton = DocumentSkeleton.create(
            new DocumentViewModel(referenceModel),
            new LocaleService()
        );
        referenceSkeleton.calculate();
        const localPage = referenceSkeleton.getSkeletonData()?.pages[5];
        const localOffset = localPage?.sections[0]?.columns[0]?.lines[0]?.st;
        if (localOffset == null) {
            throw new Error('Expected a local collaboration anchor on the sixth page.');
        }

        const initialGeneration = session.start({ reason: 'initial' });
        let initialResult = session.step(initialGeneration, 0);
        for (let step = 0; step < 2_000 && !initialResult.progress.complete; step++) {
            initialResult = session.step(initialGeneration, 0);
        }
        expect(initialResult.progress.complete).toBe(true);

        const remoteText = 'REMOTE COLLABORATOR '.repeat(300);
        const textX = new TextX();
        textX.push({
            t: TextXActionType.INSERT,
            len: remoteText.length,
            body: { dataStream: remoteText },
        });
        dataModel.apply(JSONX.getInstance().editOp(textX.serialize(), ['body']));
        session.resetDataModel(dataModel);

        const generation = session.start({
            reason: 'edit',
            anchor: 0,
            priorityAnchor: localOffset + remoteText.length,
            invalidation: {
                oldStart: 0,
                oldEnd: 0,
                newEnd: remoteText.length,
            },
        });
        let result = session.step(generation, 0);
        for (let step = 0; step < 2_000 && !result.progress.didPublishAnchor; step++) {
            result = session.step(generation, 0);
        }

        expect(result.progress.didPublishAnchor).toBe(true);
        expect(result.progress.publishedPageCount).toBeGreaterThan(2);
        expect(result.publication?.kind).toBe('page');
        if (result.publication?.kind !== 'page') {
            throw new Error('Expected a paginated collaboration publication.');
        }
        expect(result.publication.pages.map((page) => page.pageIndex)).toEqual(
            Array.from({ length: result.progress.publishedPageCount }, (_, pageIndex) => pageIndex)
        );

        session.dispose();
        referenceSkeleton.dispose();
        referenceModel.dispose();
        dataModel.dispose();
        localeService.dispose();
    });

    it('keeps a divergent Main interaction boundary stable while publishing the Worker tail progressively', () => {
        vi.stubGlobal('document', undefined);
        vi.stubGlobal('OffscreenCanvas', class {
            getContext() {
                return {
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText(content: string) {
                        return {
                            width: content.length * 7,
                            fontBoundingBoxAscent: 9,
                            fontBoundingBoxDescent: 3,
                            actualBoundingBoxAscent: 8,
                            actualBoundingBoxDescent: 2,
                        };
                    },
                };
            }
        });

        const dataModel = createDocumentModelWithStyle(`${'Protected page content '.repeat(240)}\r`, {});
        dataModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        dataModel.updateDocumentDataPageSize(240, 180);
        const localeService = new LocaleService();
        const session = new DocumentLayoutSession(dataModel, localeService);
        const targetModel = new DocumentDataModel(structuredClone(dataModel.getSnapshot()));
        const targetSkeleton = DocumentSkeleton.create(new DocumentViewModel(targetModel), new LocaleService());
        targetSkeleton.calculate();
        const initialTargetSkeletonData = targetSkeleton.getSkeletonData();

        const initialGeneration = session.start({ reason: 'initial' });
        let initialResult = session.step(initialGeneration, 0);
        for (let step = 0; step < 2_000 && !initialResult.progress.complete; step++) {
            initialResult = session.step(initialGeneration, 0);
        }
        expect(initialResult.progress.complete).toBe(true);

        const anchor = Math.floor((dataModel.getBody()?.dataStream.length ?? 0) / 3);
        const textX = new TextX();
        textX.push({ t: TextXActionType.RETAIN, len: anchor });
        textX.push({ t: TextXActionType.INSERT, len: 1, body: { dataStream: 'X' } });
        const actions = JSONX.getInstance().editOp(textX.serialize(), ['body']);
        dataModel.apply(actions);
        targetModel.apply(actions);
        session.resetDataModel(dataModel);
        targetSkeleton.getViewModel().reset(targetModel);

        const mainGeneration = targetSkeleton.startIncrementalLayout({
            reason: 'edit',
            anchor,
            invalidation: { oldStart: anchor, oldEnd: anchor, newEnd: anchor + 1 },
        });
        let mainProgress = targetSkeleton.stepIncrementalLayout(mainGeneration, 8);
        for (let step = 0; step < 2_000 && !mainProgress.didPublishAnchor; step++) {
            mainProgress = targetSkeleton.stepIncrementalLayout(mainGeneration, 8);
        }
        expect(mainProgress.didPublishAnchor).toBe(true);
        const protectedPageIndex = targetSkeleton.findNodePositionByCharIndex(anchor)?.page ?? -1;
        const protectedPage = targetSkeleton.getSkeletonData()?.pages[protectedPageIndex];
        expect(protectedPageIndex).toBeGreaterThanOrEqual(0);
        expect(protectedPage).toBeDefined();

        targetSkeleton.beginExternalLayout({
            reason: 'edit',
            protectedRange: {
                mode: 'paginated',
                startPageIndex: protectedPageIndex,
                endPageIndex: protectedPageIndex,
            },
        });
        const workerGeneration = session.start({
            reason: 'edit',
            anchor,
            invalidation: { oldStart: anchor, oldEnd: anchor, newEnd: anchor + 1 },
        });
        let workerResult = session.step(workerGeneration, 0);
        let changedProtectedPublication = false;
        let acceptedPresentationDifference = false;
        let stagedProtectedPublication = false;
        let publishedUnprotectedTail = false;
        let didReplaceProtectedPages = false;
        for (let step = 0; step < 2_000; step++) {
            if (workerResult.publication != null) {
                if (workerResult.publication.kind === 'page' && !changedProtectedPublication) {
                    const protectedPublication = workerResult.publication.pages.find(
                        (page) => page.pageIndex === protectedPageIndex
                    );
                    if (protectedPublication != null) {
                        const presentationOnlyPublication = structuredClone(workerResult.publication);
                        const presentationOnlyProtectedPage = presentationOnlyPublication.pages.find(
                            (page) => page.pageIndex === protectedPageIndex
                        );
                        if (presentationOnlyProtectedPage == null) {
                            throw new Error('Expected a protected page publication.');
                        }
                        presentationOnlyProtectedPage.page.width += 1;
                        expect(() => targetSkeleton.applyLayoutPublication(
                            presentationOnlyPublication,
                            workerResult.progress
                        )).not.toThrow();
                        expect(targetSkeleton.getSkeletonData()?.pages[protectedPageIndex]).toBe(protectedPage);
                        acceptedPresentationDifference = true;
                        protectedPublication.page.pageWidth += 1;
                        changedProtectedPublication = true;
                    }
                }
                const applyResult = targetSkeleton.applyLayoutPublication(
                    workerResult.publication,
                    workerResult.progress
                );
                didReplaceProtectedPages ||= applyResult.didReplaceProtectedPages;
                if (changedProtectedPublication && !workerResult.progress.complete) {
                    stagedProtectedPublication = true;
                    expect(applyResult.didReplaceProtectedPages).toBe(false);
                }
                if (!workerResult.progress.complete) {
                    expect(targetSkeleton.getSkeletonData()?.pages[protectedPageIndex]).toBe(protectedPage);
                    const publishedTailPage = workerResult.publication.kind === 'page'
                        ? workerResult.publication.pages.find((page) => page.pageIndex > protectedPageIndex)
                        : undefined;
                    if (changedProtectedPublication && publishedTailPage != null) {
                        expect(
                            targetSkeleton.getSkeletonData()?.pages[publishedTailPage.pageIndex]?.isLayoutPlaceholder
                        ).not.toBe(true);
                        publishedUnprotectedTail = true;
                    }
                }
            }
            if (workerResult.progress.complete) {
                break;
            }
            workerResult = session.step(workerGeneration, 0);
        }

        expect(changedProtectedPublication).toBe(true);
        expect(acceptedPresentationDifference).toBe(true);
        expect(stagedProtectedPublication).toBe(true);
        expect(publishedUnprotectedTail).toBe(true);
        expect(workerResult.progress.complete).toBe(true);
        expect(didReplaceProtectedPages).toBe(true);
        expect(targetSkeleton.getSkeletonData()?.pages[protectedPageIndex]).not.toBe(protectedPage);
        expect(targetSkeleton.getSkeletonData()?.pages[protectedPageIndex]?.pageWidth).toBe(
            (protectedPage?.pageWidth ?? 0) + 1
        );
        expect(targetSkeleton.getSkeletonData()?.pages[protectedPageIndex]?.isLayoutPlaceholder).not.toBe(true);
        expect(initialTargetSkeletonData?.pages).not.toHaveLength(0);
        expect(protectedPage?.sections).not.toHaveLength(0);

        session.dispose();
        targetSkeleton.dispose();
        dataModel.dispose();
        targetModel.dispose();
        localeService.dispose();
    });

    it('publishes inline drawings with the page that owns their flow geometry', () => {
        vi.stubGlobal('document', undefined);
        vi.stubGlobal('OffscreenCanvas', class {
            getContext() {
                return {
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText(content: string) {
                        return {
                            width: content.length * 7,
                            fontBoundingBoxAscent: 9,
                            fontBoundingBoxDescent: 3,
                            actualBoundingBoxAscent: 8,
                            actualBoundingBoxDescent: 2,
                        };
                    },
                };
            }
        });

        const drawingId = 'inline-picture';
        const content = [
            `Before${DataStreamTreeTokenType.CUSTOM_BLOCK}after${DataStreamTreeTokenType.PARAGRAPH}`,
            ...Array.from(
                { length: 20 },
                (_, index) => `Paragraph ${index} fills the following pages.${DataStreamTreeTokenType.PARAGRAPH}`
            ),
        ].join('');
        const sourceModel = createDocumentModelWithStyle(content, {});
        const snapshot = sourceModel.getSnapshot();
        if (snapshot.body == null) {
            throw new Error('Expected the drawing test document body.');
        }
        snapshot.body.customBlocks = [{
            startIndex: content.indexOf(DataStreamTreeTokenType.CUSTOM_BLOCK),
            blockId: drawingId,
        }];
        snapshot.drawings = {
            [drawingId]: {
                drawingId,
                drawingType: DrawingTypeEnum.DRAWING_BLOCK,
                unitId: snapshot.id,
                subUnitId: snapshot.id,
                layoutType: PositionedObjectLayoutType.INLINE,
                docTransform: {
                    angle: 0,
                    positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                    size: { width: 100, height: 50 },
                },
            },
        };
        const dataModel = new DocumentDataModel(snapshot);
        dataModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        dataModel.updateDocumentDataPageSize(240, 180);
        const localeService = new LocaleService();
        const session = new DocumentLayoutSession(dataModel, localeService);
        const generation = session.start({ reason: 'initial' });
        const publishedDrawingIds = new Set<string>();
        let result = session.step(generation, 0);
        for (let step = 0; step < 1_000; step++) {
            if (result.publication?.kind === 'page') {
                for (const pagePublication of result.publication.pages) {
                    for (const [publishedDrawingId] of pagePublication.page.skeDrawings) {
                        publishedDrawingIds.add(publishedDrawingId);
                    }
                }
            }
            if (result.progress.complete) {
                break;
            }
            result = session.step(generation, 0);
        }

        expect(result.progress).toMatchObject({ complete: true, cancelled: false });
        expect(result.progress.pageCount).toBeGreaterThan(1);
        expect(publishedDrawingIds).toEqual(new Set([drawingId]));

        session.dispose();
        dataModel.dispose();
        sourceModel.dispose();
        localeService.dispose();
    });

    it('keeps modern explicit-page drawing geometry stable across block publications', () => {
        vi.stubGlobal('document', undefined);
        vi.stubGlobal('OffscreenCanvas', class {
            getContext() {
                return {
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText(content: string) {
                        return {
                            width: content.length * 7,
                            fontBoundingBoxAscent: 9,
                            fontBoundingBoxDescent: 3,
                            actualBoundingBoxAscent: 8,
                            actualBoundingBoxDescent: 2,
                        };
                    },
                };
            }
        });

        const T = DataStreamTreeTokenType;
        const firstDrawingId = 'modern-first-page-drawing';
        const secondDrawingId = 'modern-second-page-drawing';
        const content = [
            `First ${T.CUSTOM_BLOCK} page${T.PARAGRAPH}${T.PAGE_BREAK}`,
            `Second ${T.CUSTOM_BLOCK} page${T.PARAGRAPH}${T.PAGE_BREAK}`,
            ...Array.from({ length: 20 }, (_, index) => `Trailing paragraph ${index}${T.PARAGRAPH}`),
        ].join('');
        const sourceModel = createDocumentModelWithStyle(content, {});
        const snapshot = sourceModel.getSnapshot();
        if (snapshot.body == null) {
            throw new Error('Expected the modern drawing test document body.');
        }
        const firstDrawingStart = content.indexOf(T.CUSTOM_BLOCK);
        const secondDrawingStart = content.indexOf(T.CUSTOM_BLOCK, firstDrawingStart + 1);
        snapshot.body.customBlocks = [
            { startIndex: firstDrawingStart, blockId: firstDrawingId },
            { startIndex: secondDrawingStart, blockId: secondDrawingId },
        ];
        snapshot.drawings = Object.fromEntries([firstDrawingId, secondDrawingId].map((drawingId) => [drawingId, {
            drawingId,
            drawingType: DrawingTypeEnum.DRAWING_BLOCK,
            unitId: snapshot.id,
            subUnitId: snapshot.id,
            layoutType: PositionedObjectLayoutType.WRAP_NONE,
            docTransform: {
                angle: 0,
                positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                size: { width: 40, height: 20 },
            },
        }]));
        const dataModel = new DocumentDataModel(snapshot);
        dataModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.MODERN });
        const session = new DocumentLayoutSession(dataModel, new LocaleService());
        const targetModel = new DocumentDataModel(structuredClone(dataModel.getSnapshot()));
        const targetSkeleton = DocumentSkeleton.create(new DocumentViewModel(targetModel), new LocaleService());
        const synchronousModel = new DocumentDataModel(structuredClone(dataModel.getSnapshot()));
        const synchronousSkeleton = DocumentSkeleton.create(new DocumentViewModel(synchronousModel), new LocaleService());
        synchronousSkeleton.calculate();
        const generation = session.start({ reason: 'initial' });
        const secondDrawingTops: number[] = [];
        let result = session.step(generation, 0);
        for (let step = 0; step < 100; step++) {
            if (result.publication?.kind === 'block') {
                targetSkeleton.applyLayoutPublication(structuredClone(result.publication), result.progress);
                const drawing = result.publication.block.skeDrawings.find(([drawingId]) => drawingId === secondDrawingId)?.[1];
                if (drawing != null && !result.progress.complete) {
                    secondDrawingTops.push(drawing.aTop);
                }
            }
            if (result.progress.complete) {
                break;
            }
            result = session.step(generation, 0);
        }

        expect(result.progress).toMatchObject({ complete: true, mode: 'continuous', pageCount: 1 });
        expect(secondDrawingTops.length).toBeGreaterThan(1);
        expect(new Set(secondDrawingTops).size).toBe(1);
        expect(normalizeSkeleton(targetSkeleton.getSkeletonData())).toEqual(
            normalizeSkeleton(synchronousSkeleton.getSkeletonData())
        );

        synchronousSkeleton.dispose();
        synchronousModel.dispose();
        targetSkeleton.dispose();
        targetModel.dispose();
        session.dispose();
        dataModel.dispose();
        sourceModel.dispose();
    });

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN])('preserves rich elements with bounded deferred snapshots across Worker transport (%s)', (flavor) => {
        vi.stubGlobal('document', undefined);
        vi.stubGlobal('OffscreenCanvas', class {
            getContext() {
                return {
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText(content: string) {
                        return {
                            width: content.length * 7,
                            fontBoundingBoxAscent: 9,
                            fontBoundingBoxDescent: 3,
                            actualBoundingBoxAscent: 8,
                            actualBoundingBoxDescent: 2,
                        };
                    },
                };
            }
        });

        const T = DataStreamTreeTokenType;
        const documentId = 'worker-rich-elements';
        const bodyDrawingId = 'worker-rich-elements-body-drawing';
        const tableDrawingId = 'worker-rich-elements-table-drawing';
        const columnDrawingId = 'worker-rich-elements-column-drawing';
        const headerDrawingId = 'worker-rich-elements-header-drawing';
        const footerDrawingId = 'worker-rich-elements-footer-drawing';
        const tableId = 'worker-rich-elements-table';
        const columnTableId = 'worker-rich-elements-column-table';
        const columnGroupId = 'worker-rich-elements-columns';
        const intro = `List paragraph${T.PARAGRAPH}`;
        const drawingParagraph = `Before ${T.CUSTOM_BLOCK} after${T.PARAGRAPH}`;
        const tableCellText = `Table ${T.CUSTOM_BLOCK} cell content crosses the Worker transport.`;
        const tableStream = [
            T.TABLE_START,
            T.TABLE_ROW_START,
            T.TABLE_CELL_START,
            tableCellText,
            T.PARAGRAPH,
            T.SECTION_BREAK,
            T.TABLE_CELL_END,
            T.TABLE_ROW_END,
            T.TABLE_END,
        ].join('');
        const columnTableStream = [
            T.TABLE_START,
            T.TABLE_ROW_START,
            T.TABLE_CELL_START,
            `Nested column table${T.PARAGRAPH}`,
            T.SECTION_BREAK,
            T.TABLE_CELL_END,
            T.TABLE_ROW_END,
            T.TABLE_END,
        ].join('');
        const columnGroupStream = [
            T.COLUMN_GROUP_START,
            T.COLUMN_START,
            `Left ${T.CUSTOM_BLOCK} column${T.PARAGRAPH}`,
            columnTableStream,
            T.PARAGRAPH,
            T.COLUMN_END,
            T.COLUMN_START,
            `Right column${T.PARAGRAPH}`,
            T.COLUMN_END,
            T.COLUMN_GROUP_END,
        ].join('');
        const trailing = Array.from(
            { length: 24 },
            (_, index) => `Trailing paragraph ${index} fills another physical page.${T.PARAGRAPH}`
        ).join('');
        const dataStream = `${intro}${drawingParagraph}${tableStream}${T.PARAGRAPH}${columnGroupStream}${T.PARAGRAPH}${trailing}${T.SECTION_BREAK}`;
        const tableStart = dataStream.indexOf(T.TABLE_START);
        const columnTableStart = dataStream.indexOf(T.TABLE_START, tableStart + 1);
        const columnGroupStart = dataStream.indexOf(T.COLUMN_GROUP_START);
        const bodyDrawingStart = dataStream.indexOf(T.CUSTOM_BLOCK);
        const tableDrawingStart = dataStream.indexOf(T.CUSTOM_BLOCK, bodyDrawingStart + 1);
        const columnDrawingStart = dataStream.indexOf(T.CUSTOM_BLOCK, tableDrawingStart + 1);
        const paragraphs = [...dataStream.matchAll(new RegExp(T.PARAGRAPH, 'g'))].map((match, index) => ({
            startIndex: match.index,
            paragraphId: `worker-rich-elements-paragraph-${index}`,
            ...(index === 0
                ? {
                    bullet: {
                        listId: 'worker-rich-elements-list',
                        listType: PresetListType.ORDER_LIST,
                        nestingLevel: 0,
                    },
                }
                : {}),
        }));
        const snapshot = {
            id: documentId,
            body: {
                dataStream,
                paragraphs,
                sectionBreaks: [
                    {
                        sectionId: 'worker-rich-elements-cell-section',
                        startIndex: tableStart + tableStream.indexOf(T.SECTION_BREAK),
                    },
                    {
                        sectionId: 'worker-rich-elements-column-cell-section',
                        startIndex: columnTableStart + columnTableStream.indexOf(T.SECTION_BREAK),
                    },
                    {
                        sectionId: 'worker-rich-elements-body-section',
                        startIndex: dataStream.length - 1,
                        defaultHeaderId: 'worker-rich-elements-header',
                        defaultFooterId: 'worker-rich-elements-footer',
                    },
                ],
                customBlocks: [
                    { startIndex: bodyDrawingStart, blockId: bodyDrawingId },
                    { startIndex: tableDrawingStart, blockId: tableDrawingId },
                    { startIndex: columnDrawingStart, blockId: columnDrawingId },
                ],
                tables: [
                    { startIndex: tableStart, endIndex: tableStart + tableStream.length, tableId },
                    {
                        startIndex: columnTableStart,
                        endIndex: columnTableStart + columnTableStream.length,
                        tableId: columnTableId,
                    },
                ],
                columnGroups: [{
                    startIndex: columnGroupStart,
                    endIndex: columnGroupStart + columnGroupStream.length - 1,
                    columnGroupId,
                    gap: { v: 12 },
                    layout: ColumnLayoutType.FIXED,
                    responsive: ColumnResponsiveType.SHRINK,
                    columns: [
                        { columnId: 'worker-rich-elements-left', widthRatio: 1, minWidth: { v: 40 } },
                        { columnId: 'worker-rich-elements-right', widthRatio: 1, minWidth: { v: 40 } },
                    ],
                }],
            },
            tableSource: {
                [tableId]: {
                    tableId,
                    description: 'large-table-source-payload'.repeat(1_000),
                    align: TableAlignmentType.CENTER,
                    indent: { v: 0 },
                    textWrap: TableTextWrapType.NONE,
                    position: {
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 0 },
                    },
                    dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                    size: { type: TableSizeType.SPECIFIED, width: { v: 220 } },
                    tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 220 } } }],
                    tableRows: [{
                        trHeight: { hRule: TableRowHeightRule.AUTO, val: { v: 0 } },
                        tableCells: [{ vAlign: VerticalAlignmentType.TOP }],
                    }],
                },
                [columnTableId]: {
                    tableId: columnTableId,
                    align: TableAlignmentType.START,
                    indent: { v: 0 },
                    textWrap: TableTextWrapType.NONE,
                    position: {
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 0 },
                    },
                    dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                    size: { type: TableSizeType.SPECIFIED, width: { v: 90 } },
                    tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 90 } } }],
                    tableRows: [{
                        trHeight: { hRule: TableRowHeightRule.AUTO, val: { v: 0 } },
                        tableCells: [{ vAlign: VerticalAlignmentType.TOP }],
                    }],
                },
            },
            drawings: {
                [bodyDrawingId]: {
                    drawingId: bodyDrawingId,
                    description: 'large-drawing-source-payload'.repeat(1_000),
                    drawingType: DrawingTypeEnum.DRAWING_BLOCK,
                    unitId: documentId,
                    subUnitId: documentId,
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        angle: 0,
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        size: { width: 80, height: 40 },
                    },
                },
                [tableDrawingId]: {
                    drawingId: tableDrawingId,
                    drawingType: DrawingTypeEnum.DRAWING_BLOCK,
                    unitId: documentId,
                    subUnitId: documentId,
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        angle: 0,
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        size: { width: 30, height: 20 },
                    },
                },
                [columnDrawingId]: {
                    drawingId: columnDrawingId,
                    drawingType: DrawingTypeEnum.DRAWING_BLOCK,
                    unitId: documentId,
                    subUnitId: documentId,
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        angle: 0,
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        size: { width: 25, height: 18 },
                    },
                },
                [headerDrawingId]: {
                    drawingId: headerDrawingId,
                    drawingType: DrawingTypeEnum.DRAWING_BLOCK,
                    unitId: documentId,
                    subUnitId: documentId,
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        angle: 0,
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        size: { width: 20, height: 12 },
                    },
                },
                [footerDrawingId]: {
                    drawingId: footerDrawingId,
                    drawingType: DrawingTypeEnum.DRAWING_BLOCK,
                    unitId: documentId,
                    subUnitId: documentId,
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        angle: 0,
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        size: { width: 20, height: 12 },
                    },
                },
            },
            drawingsOrder: [
                bodyDrawingId,
                tableDrawingId,
                columnDrawingId,
                headerDrawingId,
                footerDrawingId,
            ],
            headers: {
                'worker-rich-elements-header': {
                    headerId: 'worker-rich-elements-header',
                    body: {
                        dataStream: `Header ${T.CUSTOM_BLOCK} content${T.PARAGRAPH}${T.SECTION_BREAK}`,
                        paragraphs: [{ startIndex: 16, paragraphId: 'worker-rich-elements-header-paragraph' }],
                        sectionBreaks: [{ startIndex: 17, sectionId: 'worker-rich-elements-header-section' }],
                        customBlocks: [{ startIndex: 7, blockId: headerDrawingId }],
                    },
                },
            },
            footers: {
                'worker-rich-elements-footer': {
                    footerId: 'worker-rich-elements-footer',
                    body: {
                        dataStream: `Footer ${T.CUSTOM_BLOCK} content${T.PARAGRAPH}${T.SECTION_BREAK}`,
                        paragraphs: [{ startIndex: 16, paragraphId: 'worker-rich-elements-footer-paragraph' }],
                        sectionBreaks: [{ startIndex: 17, sectionId: 'worker-rich-elements-footer-section' }],
                        customBlocks: [{ startIndex: 7, blockId: footerDrawingId }],
                    },
                },
            },
            documentStyle: {
                documentFlavor: flavor,
                pageSize: { width: 280, height: 220 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
                marginHeader: 10,
                marginFooter: 10,
            },
        };
        const sourceModel = new DocumentDataModel(structuredClone(snapshot));
        const targetModel = new DocumentDataModel(structuredClone(snapshot));
        const incrementalModel = new DocumentDataModel(structuredClone(snapshot));
        const synchronousModel = new DocumentDataModel(structuredClone(snapshot));
        const localeService = new LocaleService();
        const session = new DocumentLayoutSession(sourceModel, localeService);
        const targetSkeleton = DocumentSkeleton.create(new DocumentViewModel(targetModel), new LocaleService());
        const incrementalSkeleton = DocumentSkeleton.create(
            new DocumentViewModel(incrementalModel),
            new LocaleService()
        );
        const synchronousSkeleton = DocumentSkeleton.create(
            new DocumentViewModel(synchronousModel),
            new LocaleService()
        );
        expect(incrementalSkeleton.getViewModel().getTableByStartIndex(tableStart)?.tableSource.tableId).toBe(tableId);
        expect(incrementalSkeleton.getViewModel().getColumnGroupByStartIndex(columnGroupStart)?.columnGroup.columnGroupId)
            .toBe(columnGroupId);
        synchronousSkeleton.calculate();
        const incrementalGeneration = incrementalSkeleton.startIncrementalLayout({ reason: 'initial' });
        let incrementalProgress = incrementalSkeleton.stepIncrementalLayout(incrementalGeneration, 0);
        for (let step = 0; step < 2_000 && !incrementalProgress.complete; step++) {
            incrementalProgress = incrementalSkeleton.stepIncrementalLayout(incrementalGeneration, 0);
        }
        expect(incrementalProgress.complete).toBe(true);
        if (flavor === DocumentFlavor.MODERN) {
            targetSkeleton.calculate();
        }
        targetSkeleton.beginExternalLayout({
            reason: 'initial',
            protectedRange: flavor === DocumentFlavor.MODERN
                ? { mode: 'continuous', startOffset: 0, endOffset: dataStream.length }
                : undefined,
        });

        const generation = session.start({ reason: 'initial' });
        const publicationPayloads: string[] = [];
        let result = session.step(generation, 0);
        for (let step = 0; step < 2_000; step++) {
            if (result.publication != null) {
                publicationPayloads.push(JSON.stringify(result.publication));
                targetSkeleton.applyLayoutPublication(structuredClone(result.publication), result.progress);
                if (result.publication.kind === 'block' && !result.progress.complete) {
                    const deferred = (targetSkeleton as unknown as {
                        _externalProtectedContinuousLayout: {
                            pendingPublications: Array<Extract<NonNullable<LayoutPublication>, { kind: 'block' }>>;
                        };
                    })._externalProtectedContinuousLayout.pendingPublications;
                    // Repeated snapshots must not retain one copy of all previous
                    // tables, drawings and nested columns per published text delta.
                    const retainedObjects = deferred.reduce((count, { block }) => count +
                        block.skeTables.length + block.skeDrawings.length + block.skeColumnGroups.length, 0);
                    const latest = result.publication.block;
                    expect(retainedObjects).toBeLessThanOrEqual(
                        latest.skeTables.length + latest.skeDrawings.length + latest.skeColumnGroups.length
                    );
                }
            }
            if (result.progress.complete) {
                break;
            }
            result = session.step(generation, 0);
        }

        expect(result.progress).toMatchObject({ complete: true, cancelled: false });
        if (flavor === DocumentFlavor.MODERN) {
            expect(result.progress.pageCount).toBe(1);
        } else {
            expect(result.progress.pageCount).toBeGreaterThan(1);
        }
        expect(publicationPayloads.join('')).toContain(bodyDrawingId);
        expect(publicationPayloads.join('')).toContain(tableId);
        expect(publicationPayloads.join('')).not.toContain('"drawingOrigin"');
        expect(publicationPayloads.join('')).not.toContain('"tableSource"');
        expect(publicationPayloads.join('')).not.toContain('"rowSource"');
        expect(publicationPayloads.join('')).not.toContain('large-drawing-source-payload');
        expect(publicationPayloads.join('')).not.toContain('large-table-source-payload');
        expect(() => structuredClone(targetSkeleton.getSkeletonData())).not.toThrow();
        expect(summarizePages(targetSkeleton.getSkeletonData())).toEqual(
            summarizePages(incrementalSkeleton.getSkeletonData())
        );
        expect(normalizeSkeleton(targetSkeleton.getSkeletonData()?.pages)).toEqual(
            normalizeSkeleton(incrementalSkeleton.getSkeletonData()?.pages)
        );
        expect(normalizeSkeleton(targetSkeleton.getSkeletonData()?.skeHeaders)).toEqual(
            normalizeSkeleton(incrementalSkeleton.getSkeletonData()?.skeHeaders)
        );
        expect(normalizeSkeleton(targetSkeleton.getSkeletonData()?.skeFooters)).toEqual(
            normalizeSkeleton(incrementalSkeleton.getSkeletonData()?.skeFooters)
        );
        expect(normalizeSkeleton(targetSkeleton.getSkeletonData()?.skeListLevel)).toEqual(
            normalizeSkeleton(incrementalSkeleton.getSkeletonData()?.skeListLevel)
        );
        expect(summarizeDrawingAnchors(targetSkeleton.getSkeletonData())).toEqual(
            summarizeDrawingAnchors(incrementalSkeleton.getSkeletonData())
        );
        const targetElements = collectNestedElementIds(targetSkeleton.getSkeletonData());
        expect(targetElements.drawingIds).toContain(bodyDrawingId);
        expect(targetElements.tableIds).toContain(tableId);
        const targetPages = targetSkeleton.getSkeletonData()?.pages ?? [];
        const hydratedBodyDrawing = targetPages.flatMap((page) => [...page.skeDrawings.values()])
            .find((drawing) => drawing.drawingId === bodyDrawingId);
        const hydratedBodyTable = targetPages.flatMap((page) => [...page.skeTables.values()])
            .find((table) => table.tableSource.tableId === tableId);
        expect(hydratedBodyDrawing?.drawingOrigin).toBe(targetModel.getSnapshot().drawings?.[bodyDrawingId]);
        expect(hydratedBodyTable?.tableSource).toBe(targetModel.getSnapshot().tableSource?.[tableId]);
        expect([...targetSkeleton.getSkeletonData()?.drawingAnchor?.values() ?? []]
            .flatMap((anchors) => [...anchors.values()])
            .every((anchor) => anchor.elements.length === 0)).toBe(true);
        expect(normalizeSkeleton(incrementalSkeleton.getSkeletonData()?.pages)).toEqual(
            normalizeSkeleton(synchronousSkeleton.getSkeletonData()?.pages)
        );
        expect(normalizeSkeleton(incrementalSkeleton.getSkeletonData()?.skeHeaders)).toEqual(
            normalizeSkeleton(synchronousSkeleton.getSkeletonData()?.skeHeaders)
        );
        expect(normalizeSkeleton(incrementalSkeleton.getSkeletonData()?.skeFooters)).toEqual(
            normalizeSkeleton(synchronousSkeleton.getSkeletonData()?.skeFooters)
        );
        expect(normalizeSkeleton(incrementalSkeleton.getSkeletonData()?.skeListLevel)).toEqual(
            normalizeSkeleton(synchronousSkeleton.getSkeletonData()?.skeListLevel)
        );
        expect(summarizeDrawingAnchors(incrementalSkeleton.getSkeletonData())).toEqual(
            summarizeDrawingAnchors(synchronousSkeleton.getSkeletonData())
        );

        const targetData = targetSkeleton.getSkeletonData();
        const nestedElementIds = collectNestedElementIds(targetData);
        expect(targetData?.skeHeaders.size).toBe(flavor === DocumentFlavor.MODERN ? 0 : 1);
        expect(targetData?.skeFooters.size).toBe(flavor === DocumentFlavor.MODERN ? 0 : 1);
        expect(targetData?.skeListLevel?.size).toBeGreaterThan(0);
        expect(nestedElementIds.drawingIds).toEqual(new Set([
            bodyDrawingId,
            tableDrawingId,
            columnDrawingId,
            ...(flavor === DocumentFlavor.MODERN ? [] : [headerDrawingId, footerDrawingId]),
        ]));
        expect(nestedElementIds.tableIds.has(tableId)).toBe(true);
        expect(nestedElementIds.tableIds.has(columnTableId)).toBe(true);
        expect(nestedElementIds.columnGroupIds.has(columnGroupId)).toBe(true);
        const headerPages = [...targetData?.skeHeaders.get('worker-rich-elements-header')?.values() ?? []];
        const footerPages = [...targetData?.skeFooters.get('worker-rich-elements-footer')?.values() ?? []];
        expect(headerPages.some((page) => page.skeDrawings.has(headerDrawingId))).toBe(flavor === DocumentFlavor.TRADITIONAL);
        expect(footerPages.some((page) => page.skeDrawings.has(footerDrawingId))).toBe(flavor === DocumentFlavor.TRADITIONAL);

        session.dispose();
        targetSkeleton.dispose();
        incrementalSkeleton.dispose();
        synchronousSkeleton.dispose();
        sourceModel.dispose();
        targetModel.dispose();
        incrementalModel.dispose();
        synchronousModel.dispose();
        localeService.dispose();
    });

    it('publishes modern documents as bounded continuous block patches', () => {
        vi.stubGlobal('document', undefined);
        vi.stubGlobal('OffscreenCanvas', class {
            getContext() {
                return {
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText(content: string) {
                        return {
                            width: content.length * 7,
                            fontBoundingBoxAscent: 9,
                            fontBoundingBoxDescent: 3,
                            actualBoundingBoxAscent: 8,
                            actualBoundingBoxDescent: 2,
                        };
                    },
                };
            }
        });

        const content = Array.from(
            { length: 24 },
            (_, index) => `Modern paragraph ${index} is laid out independently.\r`
        ).join('');
        const dataModel = createDocumentModelWithStyle(content, {});
        dataModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.MODERN });
        dataModel.updateDocumentDataPageSize(320, Number.POSITIVE_INFINITY);
        const localeService = new LocaleService();
        const session = new DocumentLayoutSession(dataModel, localeService);
        const targetModel = new DocumentDataModel(structuredClone(dataModel.getSnapshot()));
        const targetSkeleton = DocumentSkeleton.create(new DocumentViewModel(targetModel), new LocaleService());
        const synchronousModel = new DocumentDataModel(structuredClone(dataModel.getSnapshot()));
        let synchronousSkeleton = DocumentSkeleton.create(new DocumentViewModel(synchronousModel), new LocaleService());
        synchronousSkeleton.calculate();
        targetSkeleton.beginExternalLayout({ reason: 'initial' });

        const generation = session.start({ reason: 'initial' });
        const blockLineCounts: number[] = [];
        const publications: LayoutPublication[] = [];
        const transferDurations: number[] = [];
        let result = session.step(generation, 0);
        for (let step = 0; step < 1_000; step++) {
            if (result.publication != null) {
                publications.push(result.publication);
                expect(result.publication.kind).toBe('block');
                if (result.publication.kind === 'block') {
                    blockLineCounts.push(result.publication.block.flow.lines.length);
                }
                const transferStart = cpuUsage();
                const transferredPublication = structuredClone(result.publication);
                targetSkeleton.applyLayoutPublication(transferredPublication, result.progress);
                const transferCpu = cpuUsage(transferStart);
                transferDurations.push((transferCpu.user + transferCpu.system) / 1_000);
            }
            if (result.progress.complete) {
                break;
            }
            result = session.step(generation, 0);
        }

        const finalLineCount = synchronousSkeleton.getSkeletonData()?.pages[0].sections.flatMap(
            (section) => section.columns
        ).flatMap((column) => column.lines).length ?? 0;
        expect(result.progress).toMatchObject({ mode: 'continuous', complete: true, pageCount: 1 });
        expect(publications.length).toBeGreaterThan(10);
        expect(Math.max(...blockLineCounts.slice(1))).toBeLessThan(finalLineCount);
        expect(() => structuredClone(publications)).not.toThrow();
        expectBoundedPatchTransfer(transferDurations);
        expect(normalizeSkeleton(targetSkeleton.getSkeletonData())).toEqual(
            normalizeSkeleton(synchronousSkeleton.getSkeletonData())
        );

        const anchor = content.indexOf('Modern paragraph 12') + 'Modern paragraph '.length;
        const insertedText = 'EDIT-';
        const textX = new TextX();
        textX.push({ t: TextXActionType.RETAIN, len: anchor });
        textX.push({
            t: TextXActionType.INSERT,
            len: insertedText.length,
            body: { dataStream: insertedText },
        });
        const actions = JSONX.getInstance().editOp(textX.serialize(), ['body']);
        dataModel.apply(actions);
        targetModel.apply(actions);
        synchronousModel.apply(actions);
        session.resetDataModel(dataModel);
        targetSkeleton.getViewModel().reset(targetModel);
        synchronousSkeleton.dispose();
        synchronousSkeleton = DocumentSkeleton.create(new DocumentViewModel(synchronousModel), new LocaleService());
        synchronousSkeleton.calculate();

        const mainEditGeneration = targetSkeleton.startIncrementalLayout({
            reason: 'edit',
            anchor,
            priorityAnchor: anchor + insertedText.length,
            invalidation: {
                oldStart: anchor,
                oldEnd: anchor,
                newEnd: anchor + insertedText.length,
            },
        });
        // A zero budget still completes one atomic block, but cannot consume the
        // whole small fixture in a fast process before exposing its continuation.
        let mainEditProgress = targetSkeleton.stepIncrementalLayout(mainEditGeneration, 0);
        for (let step = 0; step < 1_000 && !mainEditProgress.didPublishAnchor; step++) {
            mainEditProgress = targetSkeleton.stepIncrementalLayout(mainEditGeneration, 0);
        }
        expect(mainEditProgress.didPublishAnchor).toBe(true);
        expect(mainEditProgress.stableLaidOutThrough).toBeLessThan(mainEditProgress.laidOutThrough);
        const protectedContinuousPage = targetSkeleton.getSkeletonData()?.pages[0];
        expect(protectedContinuousPage).toBeDefined();

        const probeProtectedEndOffset = anchor + insertedText.length;
        targetSkeleton.beginExternalLayout({
            reason: 'edit',
            protectedRange: {
                mode: 'continuous',
                startOffset: anchor,
                endOffset: probeProtectedEndOffset,
            },
        });
        const probeGeneration = session.start({
            reason: 'edit',
            anchor,
            invalidation: {
                oldStart: anchor,
                oldEnd: anchor,
                newEnd: anchor + insertedText.length,
            },
        });
        let probeResult = session.step(probeGeneration, 0);
        let deferredBoundaryGeometryMismatch = false;
        for (let step = 0; step < 1_000 && !probeResult.progress.complete; step++) {
            const publication = probeResult.publication;
            if (publication?.kind === 'block') {
                const transferredPublication = structuredClone(publication);
                const firstUnprotectedLineIndex = transferredPublication.block.flow.lines.findIndex(
                    (line) => line.st > probeProtectedEndOffset
                );
                const workerBoundaryLine = transferredPublication.block.flow.lines[firstUnprotectedLineIndex - 1];
                if (workerBoundaryLine != null) {
                    workerBoundaryLine.top += 1;
                    workerBoundaryLine.lineHeight += 1;
                    workerBoundaryLine.width = (workerBoundaryLine.width ?? 0) + 1;
                    expect(() => targetSkeleton.applyLayoutPublication(
                        transferredPublication,
                        probeResult.progress
                    )).not.toThrow();
                    deferredBoundaryGeometryMismatch = true;
                    break;
                }
            }
            probeResult = session.step(probeGeneration, 0);
        }
        expect(deferredBoundaryGeometryMismatch).toBe(true);
        expect(targetSkeleton.getSkeletonData()?.pages[0]).toBe(protectedContinuousPage);
        targetSkeleton.cancelExternalLayout();

        targetSkeleton.beginExternalLayout({
            reason: 'edit',
            protectedRange: {
                mode: 'continuous',
                startOffset: anchor,
                endOffset: probeProtectedEndOffset,
            },
        });
        const logicalMismatchGeneration = session.start({
            reason: 'edit',
            anchor,
            invalidation: {
                oldStart: anchor,
                oldEnd: anchor,
                newEnd: anchor + insertedText.length,
            },
        });
        let logicalMismatchResult = session.step(logicalMismatchGeneration, 0);
        let deferredBoundaryLogicalMismatch = false;
        for (let step = 0; step < 1_000 && !logicalMismatchResult.progress.complete; step++) {
            const publication = logicalMismatchResult.publication;
            if (publication?.kind === 'block') {
                const transferredPublication = structuredClone(publication);
                const firstUnprotectedLineIndex = transferredPublication.block.flow.lines.findIndex(
                    (line) => line.st > probeProtectedEndOffset
                );
                const workerBoundaryLine = transferredPublication.block.flow.lines[firstUnprotectedLineIndex - 1];
                if (workerBoundaryLine != null) {
                    workerBoundaryLine.st++;
                    workerBoundaryLine.ed++;
                    expect(() => targetSkeleton.applyLayoutPublication(
                        transferredPublication,
                        logicalMismatchResult.progress
                    )).not.toThrow();
                    deferredBoundaryLogicalMismatch = true;
                    break;
                }
            }
            logicalMismatchResult = session.step(logicalMismatchGeneration, 0);
        }
        expect(deferredBoundaryLogicalMismatch).toBe(true);
        expect(targetSkeleton.getSkeletonData()?.pages[0]).toBe(protectedContinuousPage);
        targetSkeleton.cancelExternalLayout();

        targetSkeleton.beginExternalLayout({
            reason: 'edit',
            protectedRange: {
                mode: 'continuous',
                startOffset: anchor,
                endOffset: mainEditProgress.stableLaidOutThrough,
            },
        });

        const editGeneration = session.start({
            reason: 'edit',
            anchor,
            invalidation: {
                oldStart: anchor,
                oldEnd: anchor,
                newEnd: anchor + insertedText.length,
            },
        });
        let editResult = session.step(editGeneration, 0);
        let firstEditBlockLineIndex: number | null = null;
        const editTransferDurations: number[] = [];
        for (let step = 0; step < 1_000; step++) {
            if (editResult.publication != null) {
                if (editResult.publication.kind === 'block' && firstEditBlockLineIndex == null) {
                    firstEditBlockLineIndex = editResult.publication.block.flow.lineIndex;
                }
                const transferStart = cpuUsage();
                const transferredPublication = structuredClone(editResult.publication);
                targetSkeleton.applyLayoutPublication(transferredPublication, editResult.progress);
                const transferCpu = cpuUsage(transferStart);
                editTransferDurations.push((transferCpu.user + transferCpu.system) / 1_000);
                if (!editResult.progress.complete) {
                    expect(targetSkeleton.getSkeletonData()?.pages[0]).toBe(protectedContinuousPage);
                }
            }
            if (editResult.progress.complete) {
                break;
            }
            editResult = session.step(editGeneration, 0);
        }

        expect(firstEditBlockLineIndex).not.toBeNull();
        expect(firstEditBlockLineIndex).toBeGreaterThan(0);
        expect(targetSkeleton.getSkeletonData()?.pages[0]).toBe(protectedContinuousPage);
        expectBoundedPatchTransfer(editTransferDurations);
        expect(normalizeSkeleton(targetSkeleton.getSkeletonData())).toEqual(
            normalizeSkeleton(synchronousSkeleton.getSkeletonData())
        );

        const remotePrefix = 'REMOTE PREFIX '.repeat(120);
        const remoteTextX = new TextX();
        remoteTextX.push({
            t: TextXActionType.INSERT,
            len: remotePrefix.length,
            body: { dataStream: remotePrefix },
        });
        const remoteActions = JSONX.getInstance().editOp(remoteTextX.serialize(), ['body']);
        dataModel.apply(remoteActions);
        targetModel.apply(remoteActions);
        synchronousModel.apply(remoteActions);
        session.resetDataModel(dataModel);
        targetSkeleton.getViewModel().reset(targetModel);
        synchronousSkeleton.dispose();
        synchronousSkeleton = DocumentSkeleton.create(new DocumentViewModel(synchronousModel), new LocaleService());
        synchronousSkeleton.calculate();

        const transformedCaret = (dataModel.getBody()?.dataStream.length ?? 0) - 2;
        const remoteMainGeneration = targetSkeleton.startIncrementalLayout({
            reason: 'edit',
            anchor: 0,
            priorityAnchor: transformedCaret,
            invalidation: {
                oldStart: 0,
                oldEnd: 0,
                newEnd: remotePrefix.length,
            },
        });
        let remoteMainProgress = targetSkeleton.stepIncrementalLayout(remoteMainGeneration, 0);
        for (let step = 0; step < 1_000 && !remoteMainProgress.didPublishAnchor; step++) {
            remoteMainProgress = targetSkeleton.stepIncrementalLayout(remoteMainGeneration, 0);
        }
        expect(remoteMainProgress.didPublishAnchor).toBe(true);
        const remotelyProtectedPage = targetSkeleton.getSkeletonData()?.pages[0];
        expect(remotelyProtectedPage).toBeDefined();

        targetSkeleton.beginExternalLayout({
            reason: 'edit',
            protectedRange: {
                mode: 'continuous',
                startOffset: transformedCaret,
                endOffset: dataModel.getBody()?.dataStream.length ?? transformedCaret,
            },
        });
        const remoteGeneration = session.start({
            reason: 'edit',
            anchor: 0,
            invalidation: {
                oldStart: 0,
                oldEnd: 0,
                newEnd: remotePrefix.length,
            },
        });
        let remoteResult = session.step(remoteGeneration, 0);
        let didReplaceProtectedContinuousLayout = false;
        for (let step = 0; step < 1_000; step++) {
            if (remoteResult.publication != null) {
                const applyResult = targetSkeleton.applyLayoutPublication(
                    structuredClone(remoteResult.publication),
                    remoteResult.progress
                );
                didReplaceProtectedContinuousLayout ||= applyResult.didReplaceProtectedPages;
                if (!remoteResult.progress.complete) {
                    expect(targetSkeleton.getSkeletonData()?.pages[0]).toBe(remotelyProtectedPage);
                }
            }
            if (remoteResult.progress.complete) {
                break;
            }
            remoteResult = session.step(remoteGeneration, 0);
        }

        expect(remoteResult.progress.complete).toBe(true);
        expect(didReplaceProtectedContinuousLayout).toBe(true);
        expect(targetSkeleton.getSkeletonData()?.pages[0]).toBe(remotelyProtectedPage);
        expect(normalizeSkeleton(targetSkeleton.getSkeletonData())).toEqual(
            normalizeSkeleton(synchronousSkeleton.getSkeletonData())
        );

        session.dispose();
        targetSkeleton.dispose();
        synchronousSkeleton.dispose();
        dataModel.dispose();
        targetModel.dispose();
        synchronousModel.dispose();
        localeService.dispose();
    });
});
