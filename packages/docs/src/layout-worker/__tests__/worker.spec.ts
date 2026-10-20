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

import {
    createDocumentModelWithStyle,
    CustomRangeType,
    DataStreamTreeTokenType,
    DocumentFlavor,
    JSONX,
    LocaleType,
    NamedStyleType,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    TableAlignmentType,
    TableRowHeightRule,
    TableSizeType,
    TableTextWrapType,
    TextX,
    TextXActionType,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import { getFontStyleString, invalidateDocumentFontMetrics } from '@univerjs/engine-render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocLayoutSessionStatus } from '../../services/doc-layout-executor.service';
import { DocsLayoutWorkerPerformanceTracker } from '../performance-tracker';
import { DocsLayoutWorkerRuntime } from '../worker';

function stubOffscreenCanvas(): void {
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
}

describe('DocsLayoutWorkerRuntime', () => {
    afterEach(() => {
        invalidateDocumentFontMetrics(() => true);
        vi.unstubAllGlobals();
    });

    it('uses browser normal font spacing for initial layout and a newly introduced font during editing', async () => {
        stubOffscreenCanvas();
        vi.stubGlobal('document', undefined);
        const source = createDocumentModelWithStyle('Normal spacing', { ff: 'Initial Font', fs: 12 });
        source.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        source.updateDocumentDataPageSize(300, 300);
        source.updateDocumentDataMargin({ t: 0, r: 0, b: 0, l: 0 });
        const snapshot = structuredClone(source.getSnapshot());
        const runtime = new DocsLayoutWorkerRuntime();
        const identity = { unitId: source.getUnitId(), mountId: 'font-mount', mountEpoch: 1, viewportEpoch: 1 };
        const fontKey = (ff: string) => getFontStyleString({ ff, fs: 1000 }).fontString.trim();
        invalidateDocumentFontMetrics(() => true);
        await runtime.createSession({
            unitId: identity.unitId,
            sessionEpoch: 1,
            snapshot,
            modelRevision: 0,
            locale: LocaleType.EN_US,
            direction: 'ltr',
            normalFontLineHeights: { [fontKey('Initial Font')]: 1.5 },
        });
        try {
            for (const revision of [0, 1]) {
                const start = await runtime.startLayout({
                    ...identity,
                    metricsRevision: revision + 1,
                    baseRevision: 0,
                    modelRevision: revision,
                    mutations: revision === 0
                        ? []
                        : [{
                            baseRevision: 0,
                            modelRevision: 1,
                            actions: JSONX.getInstance().replaceOp(
                                ['body', 'textRuns', 0, 'ts', 'ff'],
                                'Initial Font',
                                'Edited Font'
                            ),
                        }],
                    normalFontLineHeights: revision === 0 ? undefined : { [fontKey('Edited Font')]: 1.75 },
                    reason: revision === 0 ? 'initial' : 'edit',
                    budgetMs: 8,
                });
                if (start.status !== DocLayoutSessionStatus.ACCEPTED) {
                    throw new Error('Expected layout to accept the font measurement update.');
                }
                let step = start.step;
                await expect.poll(async () => {
                    if (!step.progress.complete) {
                        step = await runtime.stepLayout({ ...identity, generation: step.progress.generation, budgetMs: 8 });
                    }
                    return step.progress.complete;
                }).toBe(true);
                const result = await runtime.getLayoutPage({ ...identity, pageIndex: 0 });
                const line = result.page?.page.sections[0].columns[0].lines[0];
                expect(line?.lineHeight).toBeCloseTo(revision === 0 ? 18 : 21);
                expect(line?.divides.flatMap((divide) => divide.glyphGroup).map((glyph) => glyph.raw).join(''))
                    .toBe(snapshot.body!.dataStream);
            }
        } finally {
            await runtime.disposeSession({ unitId: identity.unitId, sessionEpoch: 1 });
        }
    });

    it('preserves heading visibility through Worker edits, undo/redo, and snapshot recovery', async () => {
        stubOffscreenCanvas();
        const source = createDocumentModelWithStyle('Parent\rHidden\rPeer\rTail', {});
        source.updateDocumentStyle({ documentFlavor: DocumentFlavor.MODERN });
        const snapshot = structuredClone(source.getSnapshot());
        snapshot.body!.paragraphs = [
            { startIndex: 6, paragraphId: 'parent', headingCollapsed: false, paragraphStyle: { namedStyleType: NamedStyleType.HEADING_1 } },
            { startIndex: 13, paragraphId: 'hidden' },
            { startIndex: 18, paragraphId: 'peer', paragraphStyle: { namedStyleType: NamedStyleType.HEADING_1 } },
            { startIndex: 23, paragraphId: 'tail' },
        ];
        const runtime = new DocsLayoutWorkerRuntime();
        const identity = { unitId: source.getUnitId(), mountId: 'heading-mount', mountEpoch: 1, viewportEpoch: 1 };
        const createSession = (sessionEpoch: number, modelRevision: number) => runtime.createSession({
            unitId: identity.unitId,
            sessionEpoch,
            snapshot: structuredClone(snapshot),
            modelRevision,
            locale: LocaleType.EN_US,
            direction: 'ltr',
        });
        await createSession(1, 0);
        try {
            for (let revision = 0; revision < 5; revision++) {
                const collapsed = revision === 1 || revision >= 3;
                const textX = new TextX();
                textX.push({ t: TextXActionType.RETAIN, len: 6 });
                textX.push({
                    t: TextXActionType.RETAIN,
                    len: 1,
                    coverType: UpdateDocsAttributeType.COVER,
                    body: { dataStream: '', paragraphs: [{ paragraphId: 'parent', startIndex: 0, headingCollapsed: collapsed }] },
                });
                if (revision === 4) {
                    snapshot.body!.paragraphs![0].headingCollapsed = true;
                    await createSession(2, revision);
                }
                const recovered = revision === 0 || revision === 4;
                const start = await runtime.startLayout({
                    ...identity,
                    metricsRevision: revision + 1,
                    baseRevision: recovered ? revision : revision - 1,
                    modelRevision: revision,
                    mutations: recovered
                        ? []
                        : [{
                            baseRevision: revision - 1,
                            modelRevision: revision,
                            actions: JSONX.getInstance().editOp(textX.serialize(), ['body']),
                        }],
                    reason: recovered ? 'initial' : 'edit',
                    budgetMs: 0,
                });
                if (start.status !== DocLayoutSessionStatus.ACCEPTED) {
                    throw new Error('Expected Worker heading layout to start.');
                }
                let step = start.step;
                await expect.poll(async () => {
                    if (!step.progress.complete) {
                        step = await runtime.stepLayout({ ...identity, generation: step.progress.generation, budgetMs: 8 });
                    }
                    return step.progress.complete;
                }).toBe(true);
                const result = await runtime.getLayoutPage({ ...identity, pageIndex: 0 });
                const lines = result.page!.page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines));
                expect(lines.map((line) => line.paragraphIndex)).toEqual(collapsed ? [6, 18, 23] : [6, 13, 18, 23]);
                expect(lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup))
                    .map((glyph) => glyph.raw).join('')).toContain('Peer');
            }
        } finally {
            runtime.dispose();
            source.dispose();
        }
    });

    it('loads folded tables and images without publishing hidden resources and supersedes an unfinished expansion', async () => {
        stubOffscreenCanvas();
        const T = DataStreamTreeTokenType;
        const prefix = 'Intro\rParent\r';
        const table = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell\r\n${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const content = `${prefix}${T.CUSTOM_BLOCK}\r${table}\rPeer\r${'Visible tail\r'.repeat(50)}\n`;
        const source = createDocumentModelWithStyle(content, {});
        source.updateDocumentStyle({ documentFlavor: DocumentFlavor.MODERN });
        const snapshot = structuredClone(source.getSnapshot());
        const parentOffset = prefix.length - 1;
        const peerOffset = content.indexOf('Peer') + 4;
        snapshot.body!.paragraphs = [...content.matchAll(/\r/g)].map((match, index) => ({
            startIndex: match.index,
            paragraphId: `resource-p${index}`,
            headingCollapsed: match.index === parentOffset,
            paragraphStyle: match.index === parentOffset || match.index === peerOffset
                ? { namedStyleType: NamedStyleType.HEADING_1 }
                : undefined,
        }));
        snapshot.body!.sectionBreaks = [...content.matchAll(/\n/g)].map((match, index) => ({ startIndex: match.index, sectionId: `resource-s${index}` }));
        snapshot.body!.customBlocks = [{ blockId: 'image', startIndex: prefix.length }];
        snapshot.body!.tables = [{ tableId: 'table', startIndex: prefix.length + 2, endIndex: prefix.length + 2 + table.length }];
        snapshot.drawings = { image: {
            unitId: snapshot.id,
            subUnitId: snapshot.id,
            drawingId: 'image',
            drawingType: 1,
            layoutType: PositionedObjectLayoutType.INLINE,
            docTransform: {
                angle: 0,
                positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                size: { width: 100, height: 80 },
            },
        } };
        snapshot.tableSource = { table: {
            tableId: 'table',
            align: TableAlignmentType.START,
            indent: { v: 0 },
            textWrap: TableTextWrapType.NONE,
            position: { positionH: { relativeFrom: ObjectRelativeFromH.PAGE }, positionV: { relativeFrom: ObjectRelativeFromV.PAGE } },
            dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
            size: { type: TableSizeType.SPECIFIED, width: { v: 80 } },
            cellMargin: { top: { v: 0 }, bottom: { v: 0 }, start: { v: 0 }, end: { v: 0 } },
            tableRows: [{ tableCells: [{}], trHeight: { val: { v: 0 }, hRule: TableRowHeightRule.AUTO } }],
            tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 80 } } }],
        } };
        const runtime = new DocsLayoutWorkerRuntime();
        const identity = { unitId: snapshot.id, mountId: 'folded-resources', mountEpoch: 1, viewportEpoch: 1 };
        await runtime.createSession({ unitId: snapshot.id, sessionEpoch: 1, snapshot, modelRevision: 0, locale: LocaleType.EN_US, direction: 'ltr' });
        try {
            let interruptedGeneration: number | undefined;
            for (let revision = 0; revision < 5; revision++) {
                const collapsed = revision % 2 === 0;
                const textX = new TextX();
                textX.push({ t: TextXActionType.RETAIN, len: parentOffset });
                textX.push({ t: TextXActionType.RETAIN, len: 1, coverType: UpdateDocsAttributeType.COVER, body: {
                    dataStream: '',
                    paragraphs: [{ paragraphId: 'resource-p1', startIndex: 0, headingCollapsed: collapsed }],
                } });
                const start = await runtime.startLayout({
                    ...identity,
                    metricsRevision: revision + 1,
                    baseRevision: Math.max(0, revision - 1),
                    modelRevision: revision,
                    mutations: revision === 0 ? [] : [{ baseRevision: revision - 1, modelRevision: revision, actions: JSONX.getInstance().editOp(textX.serialize(), ['body']) }],
                    reason: revision === 0 ? 'initial' : 'edit',
                    anchor: parentOffset,
                    budgetMs: 0,
                });
                if (start.status !== DocLayoutSessionStatus.ACCEPTED) {
                    throw new Error('Expected folded resource layout to start.');
                }
                if (revision === 1) {
                    expect(start.step.progress.complete).toBe(false);
                    interruptedGeneration = start.step.progress.generation;
                    continue;
                }
                if (revision === 2) {
                    const superseded = await runtime.stepLayout({ ...identity, generation: interruptedGeneration!, budgetMs: 8 });
                    expect(superseded.progress.cancelled).toBe(true);
                }
                let step = start.step;
                for (let index = 0; index < 500; index++) {
                    if (collapsed && step.publication?.kind === 'block') {
                        expect(step.publication.block.skeDrawings).toHaveLength(0);
                        expect(step.publication.block.skeTables).toHaveLength(0);
                    }
                    if (!collapsed && step.publication?.kind === 'block' && step.progress.stableLaidOutThrough >= peerOffset) {
                        expect(step.publication.block.skeDrawings).toHaveLength(1);
                        expect(step.publication.block.skeTables).toHaveLength(1);
                    }
                    if (step.progress.complete) {
                        break;
                    }
                    step = await runtime.stepLayout({ ...identity, generation: step.progress.generation, budgetMs: 0 });
                }
                expect(step.progress.complete).toBe(true);
                const result = await runtime.getLayoutPage({ ...identity, pageIndex: 0 });
                expect(result.page!.page.skeTables).toHaveLength(collapsed ? 0 : 1);
                expect(result.page!.page.skeDrawings).toHaveLength(collapsed ? 0 : 1);
                expect(result.page!.page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines))
                    .some((line) => line.paragraphIndex === peerOffset)).toBe(true);
            }
        } finally {
            runtime.dispose();
            source.dispose();
        }
    });

    it('applies custom range presentations to the matching body, header, and footer segments', async () => {
        stubOffscreenCanvas();
        const sourceModel = createDocumentModelWithStyle('Body\r', {});
        sourceModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        const snapshot = structuredClone(sourceModel.getSnapshot());
        const createRange = (startIndex: number) => ({
            startIndex,
            endIndex: startIndex,
            rangeId: 'shared-range',
            rangeType: CustomRangeType.CUSTOM,
        });
        snapshot.body!.customRanges = [createRange(0)];
        snapshot.headers = {
            'header-1': {
                headerId: 'header-1',
                body: {
                    dataStream: 'Header\r\n',
                    paragraphs: [{ paragraphId: 'header-paragraph', startIndex: 6 }],
                    customRanges: [createRange(1)],
                },
            },
        };
        snapshot.footers = {
            'footer-1': {
                footerId: 'footer-1',
                body: {
                    dataStream: 'Footer\r\n',
                    paragraphs: [{ paragraphId: 'footer-paragraph', startIndex: 6 }],
                    customRanges: [createRange(2)],
                },
            },
        };
        const runtime = new DocsLayoutWorkerRuntime();
        const unitId = sourceModel.getUnitId();
        await runtime.createSession({
            unitId,
            sessionEpoch: 1,
            snapshot,
            modelRevision: 0,
            locale: LocaleType.EN_US,
            localeData: {},
            direction: 'ltr',
        });

        await runtime.startLayout({
            unitId,
            mountId: 'mount-1',
            mountEpoch: 1,
            viewportEpoch: 1,
            metricsRevision: 1,
            baseRevision: 0,
            modelRevision: 0,
            mutations: [],
            customBlockViewports: {},
            customRangePresentations: [
                { segmentId: '', rangeId: 'shared-range', presentation: { glyphWidthEm: 1 } },
                { segmentId: '', rangeId: 'shared-range', presentation: { glyphWidthEm: 99 } },
                { segmentId: 'header-1', rangeId: 'shared-range', presentation: { glyphWidthEm: 2 } },
                { segmentId: 'footer-1', rangeId: 'shared-range', presentation: { glyphWidthEm: 3 } },
            ],
            reason: 'initial',
            budgetMs: 0,
        });

        const dataModel = [...((runtime as unknown as {
            _sessions: Map<string, { dataModel: ReturnType<typeof createDocumentModelWithStyle> }>;
        })._sessions.values())][0].dataModel;
        expect(dataModel.getBody()?.customRanges?.[0]).toMatchObject({ glyphWidthEm: 1 });
        expect(dataModel.getSelfOrHeaderFooterModel('header-1')?.getBody()?.customRanges?.[0]).toMatchObject({ glyphWidthEm: 2 });
        expect(dataModel.getSelfOrHeaderFooterModel('footer-1')?.getBody()?.customRanges?.[0]).toMatchObject({ glyphWidthEm: 3 });

        await runtime.startLayout({
            unitId,
            mountId: 'mount-1',
            mountEpoch: 1,
            viewportEpoch: 1,
            metricsRevision: 2,
            baseRevision: 0,
            modelRevision: 0,
            mutations: [],
            customBlockViewportPatch: { removals: [], upserts: {} },
            customRangePresentationPatch: {
                removals: [{ segmentId: '', rangeId: 'shared-range' }],
                upserts: [{
                    segmentId: 'header-1',
                    rangeId: 'shared-range',
                    presentation: { glyphWidthEm: 4 },
                }],
            },
            reason: 'edit',
            budgetMs: 0,
        });

        expect(dataModel.getBody()?.customRanges?.[0]).not.toHaveProperty('glyphWidthEm');
        expect(dataModel.getSelfOrHeaderFooterModel('header-1')?.getBody()?.customRanges?.[0]).toMatchObject({ glyphWidthEm: 4 });
        expect(dataModel.getSelfOrHeaderFooterModel('footer-1')?.getBody()?.customRanges?.[0]).toMatchObject({ glyphWidthEm: 3 });
    });

    it('applies many presentations with one bounded pass over each segment range list', () => {
        const rangeCount = 100;
        let indexedRangeReads = 0;
        const ranges = new Proxy(Array.from({ length: rangeCount }, (_, index) => ({
            startIndex: index,
            endIndex: index,
            rangeId: `range-${index}`,
            rangeType: CustomRangeType.CUSTOM,
        })), {
            get(target, property, receiver) {
                if (typeof property === 'string' && /^\d+$/.test(property)) {
                    indexedRangeReads++;
                }
                return Reflect.get(target, property, receiver);
            },
        });
        const body = { dataStream: 'Body\r\n', customRanges: ranges };
        const dataModel = {
            getBody: () => body,
            headerModelMap: new Map(),
            footerModelMap: new Map(),
            getSelfOrHeaderFooterModel: () => ({ getBody: () => body }),
        };
        const presentations = ranges.map((range, index) => ({
            segmentId: '',
            rangeId: range.rangeId,
            presentation: { glyphWidthEm: index + 1 },
        }));
        indexedRangeReads = 0;

        (new DocsLayoutWorkerRuntime() as unknown as {
            _applyCustomRangePresentations(dataModel: unknown, presentations: unknown): void;
        })._applyCustomRangePresentations(dataModel, presentations);

        expect(indexedRangeReads).toBeLessThanOrEqual(rangeCount * 2);
        expect(ranges[0]).toMatchObject({ glyphWidthEm: 1 });
        expect(ranges[rangeCount - 1]).toMatchObject({ glyphWidthEm: rangeCount });
    });

    it('lays out a snapshot and enforces sequential model revisions', async () => {
        stubOffscreenCanvas();

        const sourceModel = createDocumentModelWithStyle('First page\fSecond page\fThird page\r', {});
        sourceModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        sourceModel.updateDocumentDataPageSize(240, 180);
        sourceModel.updateDocumentDataMargin({ t: 10, r: 10, b: 10, l: 10 });
        const performanceTracker = new DocsLayoutWorkerPerformanceTracker();
        const runtime = new DocsLayoutWorkerRuntime(performanceTracker);
        const unitId = sourceModel.getUnitId();
        const mountIdentity = { mountEpoch: 1, viewportEpoch: 1 };

        await runtime.createSession({
            unitId,
            sessionEpoch: 1,
            snapshot: structuredClone(sourceModel.getSnapshot()),
            modelRevision: 1,
            locale: LocaleType.EN_US,
            localeData: {},
            direction: 'ltr',
        });

        await expect(runtime.getCapabilities()).resolves.toMatchObject({
            protocolVersion: 5,
            executor: 'worker',
            offscreenCanvas: true,
            structuredClone: true,
            fontProbe: {
                font: '16px Arial',
                width: expect.any(Number),
            },
        });

        const start = await runtime.startLayout({
            ...mountIdentity,
            unitId,
            mountId: 'mount-1',
            metricsRevision: 1,
            baseRevision: 1,
            modelRevision: 1,
            mutations: [],
            customBlockViewports: {},
            reason: 'initial',
            budgetMs: 0,
        });
        if (start.status !== DocLayoutSessionStatus.ACCEPTED) {
            throw new Error('Expected the Worker layout session to start.');
        }

        let result = start.step;
        const publications = [result.publication];
        // Hyphenation patterns load asynchronously; slice count is not a loading deadline.
        await expect.poll(async () => {
            if (!result.progress.complete) {
                result = await runtime.stepLayout({
                    ...mountIdentity,
                    unitId,
                    mountId: 'mount-1',
                    generation: start.step.progress.generation,
                    budgetMs: 0,
                });
                publications.push(result.publication);
            }
            return result.progress.complete;
        }, { timeout: 5_000, interval: 5 }).toBe(true);
        expect(result.modelRevision).toBe(1);
        expect(publications.flatMap((publication) =>
            publication?.kind === 'page' ? publication.pages : []
        ).length).toBeGreaterThan(1);
        expect(() => structuredClone(publications)).not.toThrow();
        const firstPage = await runtime.getLayoutPage({
            ...mountIdentity,
            unitId,
            mountId: 'mount-1',
            pageIndex: 0,
        });
        expect(firstPage).toMatchObject({
            ...mountIdentity,
            unitId,
            mountId: 'mount-1',
            page: { pageIndex: 0 },
        });
        expect(() => structuredClone(firstPage)).not.toThrow();

        const customBlockModel = createDocumentModelWithStyle('\b\r\n', {});
        customBlockModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        const customBlockSnapshot = structuredClone(customBlockModel.getSnapshot());
        customBlockSnapshot.id = 'custom-block-doc';
        if (customBlockSnapshot.body == null) {
            throw new Error('Expected a document body.');
        }
        customBlockSnapshot.body.customBlocks = [{ startIndex: 0, blockId: 'embed-1' }];
        customBlockSnapshot.drawings = {
            'embed-1': {
                unitId: customBlockSnapshot.id,
                subUnitId: customBlockSnapshot.id,
                drawingId: 'embed-1',
                drawingType: 1,
                layoutType: PositionedObjectLayoutType.INLINE,
                docTransform: {
                    angle: 0,
                    positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                    size: { width: 100, height: 80 },
                },
            },
        };
        await runtime.createSession({
            unitId: customBlockSnapshot.id,
            sessionEpoch: 1,
            snapshot: customBlockSnapshot,
            modelRevision: 0,
            locale: LocaleType.EN_US,
            localeData: {},
            direction: 'ltr',
        });
        const customBlockStart = await runtime.startLayout({
            ...mountIdentity,
            unitId: customBlockSnapshot.id,
            mountId: 'custom-block-mount',
            metricsRevision: 1,
            baseRevision: 0,
            modelRevision: 0,
            mutations: [],
            customBlockViewports: {
                'embed-1': { width: 222, height: 111, layoutWidth: 222 },
            },
            reason: 'initial',
            budgetMs: 32,
        });
        if (customBlockStart.status !== DocLayoutSessionStatus.ACCEPTED) {
            throw new Error('Expected the custom block layout session to start.');
        }
        expect(JSON.stringify(customBlockStart.step.publication)).toContain('"width":222');

        const updatedCustomBlockStart = await runtime.startLayout({
            ...mountIdentity,
            unitId: customBlockSnapshot.id,
            mountId: 'custom-block-mount',
            metricsRevision: 2,
            baseRevision: 0,
            modelRevision: 0,
            mutations: [],
            customBlockViewportPatch: {
                removals: [],
                upserts: { 'embed-1': { width: 333, height: 111, layoutWidth: 333 } },
            },
            reason: 'edit',
            budgetMs: 32,
        });
        if (updatedCustomBlockStart.status !== DocLayoutSessionStatus.ACCEPTED) {
            throw new Error('Expected the updated custom block layout session to start.');
        }
        expect(JSON.stringify(updatedCustomBlockStart.step.publication)).toContain('"width":333');

        const resetCustomBlockStart = await runtime.startLayout({
            ...mountIdentity,
            unitId: customBlockSnapshot.id,
            mountId: 'custom-block-mount',
            metricsRevision: 3,
            baseRevision: 0,
            modelRevision: 0,
            mutations: [],
            customBlockViewportPatch: {
                removals: ['embed-1'],
                upserts: {},
            },
            reason: 'edit',
            budgetMs: 32,
        });
        if (resetCustomBlockStart.status !== DocLayoutSessionStatus.ACCEPTED) {
            throw new Error('Expected the reset custom block layout session to start.');
        }
        expect(JSON.stringify(resetCustomBlockStart.step.publication)).toContain('"width":100');

        const secondMountStart = await runtime.startLayout({
            ...mountIdentity,
            unitId,
            mountId: 'mount-2',
            metricsRevision: 1,
            baseRevision: 1,
            modelRevision: 1,
            mutations: [],
            customBlockViewports: {},
            reason: 'initial',
            budgetMs: 0,
        });
        if (secondMountStart.status !== DocLayoutSessionStatus.ACCEPTED) {
            throw new Error('Expected a second mounted layout session to start.');
        }
        const newerViewportStart = await runtime.startLayout({
            ...mountIdentity,
            viewportEpoch: 2,
            unitId,
            mountId: 'mount-2',
            metricsRevision: 2,
            baseRevision: 1,
            modelRevision: 1,
            mutations: [],
            customBlockViewports: {},
            reason: 'initial',
            budgetMs: 0,
        });
        if (newerViewportStart.status !== DocLayoutSessionStatus.ACCEPTED) {
            throw new Error('Expected the newer viewport layout to start.');
        }
        await expect(runtime.startLayout({
            ...mountIdentity,
            unitId,
            mountId: 'mount-2',
            metricsRevision: 1,
            baseRevision: 1,
            modelRevision: 1,
            mutations: [],
            customBlockViewports: {},
            reason: 'initial',
            budgetMs: 0,
        })).resolves.toEqual({ status: DocLayoutSessionStatus.SUPERSEDED });
        await runtime.disposeLayoutMount({ ...mountIdentity, unitId, mountId: 'mount-2' });
        await expect(runtime.stepLayout({
            ...mountIdentity,
            viewportEpoch: 2,
            unitId,
            mountId: 'mount-2',
            generation: newerViewportStart.step.progress.generation,
            budgetMs: 0,
        })).resolves.toEqual(expect.objectContaining({ viewportEpoch: 2 }));
        await runtime.disposeLayoutMount({ ...mountIdentity, unitId, mountId: 'mount-1' });
        await expect(runtime.stepLayout({
            ...mountIdentity,
            viewportEpoch: 2,
            unitId,
            mountId: 'mount-2',
            generation: newerViewportStart.step.progress.generation,
            budgetMs: 0,
        })).resolves.toEqual(expect.objectContaining({ modelRevision: 1 }));
        await expect(runtime.stepLayout({
            ...mountIdentity,
            unitId,
            mountId: 'mount-1',
            generation: start.step.progress.generation,
            budgetMs: 0,
        })).rejects.toThrow('Document layout Worker mount not found');

        const editedStart = await runtime.startLayout({
            ...mountIdentity,
            unitId,
            mountId: 'mount-1',
            metricsRevision: 2,
            baseRevision: 1,
            modelRevision: 2,
            mutations: [{ baseRevision: 1, modelRevision: 2, actions: null }],
            customBlockViewports: {},
            reason: 'edit',
            budgetMs: 0,
        });
        expect(editedStart.status).toBe(DocLayoutSessionStatus.ACCEPTED);
        await expect(runtime.startLayout({
            ...mountIdentity,
            unitId,
            mountId: 'mount-1',
            metricsRevision: 3,
            baseRevision: 3,
            modelRevision: 4,
            mutations: [{ baseRevision: 3, modelRevision: 4, actions: null }],
            customBlockViewports: {},
            reason: 'edit',
            budgetMs: 0,
        })).resolves.toEqual({
            status: DocLayoutSessionStatus.RESNAPSHOT_REQUIRED,
            modelRevision: 2,
        });

        performanceTracker.recordResponse({
            data: { unitId, publication: { pages: [] } },
        }, 5);
        expect((await runtime.getPerformanceMetrics(unitId)).patchTransferMs).toEqual([5]);
        await runtime.disposeSession({ unitId, sessionEpoch: 1 });
        expect((await runtime.getPerformanceMetrics(unitId)).patchTransferMs).toEqual([]);
        await expect(runtime.startLayout({
            ...mountIdentity,
            unitId,
            mountId: 'mount-1',
            metricsRevision: 4,
            baseRevision: 2,
            modelRevision: 2,
            mutations: [],
            customBlockViewports: {},
            reason: 'edit',
            budgetMs: 0,
        })).resolves.toEqual({ status: DocLayoutSessionStatus.NOT_FOUND });

        await runtime.createSession({
            unitId,
            sessionEpoch: 2,
            snapshot: structuredClone(sourceModel.getSnapshot()),
            modelRevision: 2,
            locale: LocaleType.EN_US,
            localeData: {},
            direction: 'ltr',
        });
        await runtime.disposeSession({ unitId, sessionEpoch: 1 });
        await runtime.createSession({
            unitId,
            sessionEpoch: 1,
            snapshot: structuredClone(sourceModel.getSnapshot()),
            modelRevision: 1,
            locale: LocaleType.EN_US,
            localeData: {},
            direction: 'ltr',
        });
        await expect(runtime.startLayout({
            ...mountIdentity,
            mountEpoch: 2,
            unitId,
            mountId: 'mount-after-recreate',
            metricsRevision: 1,
            baseRevision: 2,
            modelRevision: 2,
            mutations: [],
            customBlockViewports: {},
            reason: 'initial',
            budgetMs: 0,
        })).resolves.toEqual(expect.objectContaining({ status: DocLayoutSessionStatus.ACCEPTED }));
        await runtime.disposeSession({ unitId, sessionEpoch: 2 });

        runtime.dispose();
        sourceModel.dispose();
        customBlockModel.dispose();
    });

    it('yields after a bounded paragraph batch and observes cancellation before publishing', async () => {
        stubOffscreenCanvas();
        const sourceModel = createDocumentModelWithStyle(
            Array.from({ length: 80 }, (_, index) => `Worker paragraph ${index}\r`).join(''),
            {}
        );
        sourceModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        sourceModel.updateDocumentDataPageSize(240, 180);
        const runtime = new DocsLayoutWorkerRuntime();
        const unitId = sourceModel.getUnitId();
        const identity = {
            unitId,
            mountId: 'bounded-worker-layout',
            mountEpoch: 1,
            viewportEpoch: 1,
        };
        await runtime.createSession({
            unitId,
            sessionEpoch: 1,
            snapshot: structuredClone(sourceModel.getSnapshot()),
            modelRevision: 0,
            locale: LocaleType.EN_US,
            localeData: {},
            direction: 'ltr',
        });

        const boundedStart = await runtime.startLayout({
            ...identity,
            metricsRevision: 1,
            baseRevision: 0,
            modelRevision: 0,
            mutations: [],
            customBlockViewports: {},
            reason: 'initial',
            budgetMs: 10_000,
        });
        if (boundedStart.status !== DocLayoutSessionStatus.ACCEPTED) {
            throw new Error('Expected the bounded Worker layout session to start.');
        }
        expect(boundedStart.step.progress.complete).toBe(false);
        expect(boundedStart.step.progress.processedBlockCount).toBeLessThanOrEqual(8);

        const cancellingIdentity = { ...identity, mountId: 'cancelled-worker-layout' };
        const cancellingStart = runtime.startLayout({
            ...cancellingIdentity,
            metricsRevision: 1,
            baseRevision: 0,
            modelRevision: 0,
            mutations: [],
            customBlockViewports: {},
            reason: 'initial',
            budgetMs: 10_000,
        });
        await runtime.cancelLayout(cancellingIdentity);
        const cancelledStart = await cancellingStart;
        if (cancelledStart.status !== DocLayoutSessionStatus.ACCEPTED) {
            throw new Error('Expected the cancelled Worker layout session to start.');
        }
        expect(cancelledStart.step.progress.cancelled).toBe(true);
        expect(cancelledStart.step.publication).toBeNull();

        runtime.dispose();
        sourceModel.dispose();
    });
});
