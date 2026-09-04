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
    DocumentFlavor,
    LocaleType,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
} from '@univerjs/core';
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
        vi.unstubAllGlobals();
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
            protocolVersion: 4,
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
        for (let step = 0; step < 1_000 && !result.progress.complete; step++) {
            result = await runtime.stepLayout({
                ...mountIdentity,
                unitId,
                mountId: 'mount-1',
                generation: start.step.progress.generation,
                budgetMs: 0,
            });
            publications.push(result.publication);
        }

        expect(result.progress.complete).toBe(true);
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
