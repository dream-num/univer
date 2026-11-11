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

import { BooleanNumber, CellValueType, CommandService, ConfigService, ContextService, createInternalEditorID, CustomRangeType, DesktopLogService, DOCS_COMMENT_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DocumentDataModel, DocumentFlavor, ICommandService, IConfigService, IContextService, ILogService, Injector, IUniverInstanceService, LocaleService, SHEET_TEXT_LINE_GAP, UniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { FontCache, registerDocumentHeaderFooterReferenceResolver, registerDocumentLayoutPresentation } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IDocLayoutExecutor } from '../doc-layout-executor.service';
import { DocLayoutExecutorService, DocLayoutExecutorType, DocLayoutSessionStatus } from '../doc-layout-executor.service';
import { DocSkeletonManagerService } from '../doc-skeleton-manager.service';

let testInjector: Injector;
beforeEach(() => {
    testInjector = new Injector();
});
afterEach(() => testInjector.dispose());

function createDocument(options?: { documentFlavor?: DocumentFlavor; id?: string }) {
    return testInjector.createInstance(DocumentDataModel, {
        id: options?.id ?? 'doc-1',
        body: {
            dataStream: 'Hello\r\n',
            paragraphs: [{ paragraphId: 'p1', startIndex: 5 }],
            sectionBreaks: [{ sectionId: 'section_fixture_126', startIndex: 7 }],
            customRanges: [],
            customDecorations: [],
            customBlocks: [],
            tables: [],
        },
        documentStyle: {
            pageSize: { width: 594, height: 840 },
            documentFlavor: options?.documentFlavor ?? DocumentFlavor.TRADITIONAL,
        },
    });
}

function createExecutor(): IDocLayoutExecutor {
    return {
        type: DocLayoutExecutorType.WORKER,
        initialize: async () => {},
        recover: async () => {},
        createSession: async () => {},
        startLayout: async () => ({ status: DocLayoutSessionStatus.NOT_FOUND }),
        stepLayout: async () => {
            throw new Error('not used');
        },
        publishBacklog: async () => {
            throw new Error('not used');
        },
        getLayoutPage: async () => {
            throw new Error('not used');
        },
        cancelLayout: async () => {},
        getPerformanceMetrics: async () => ({
            mutationTransferMs: [],
            patchTransferMs: [],
            snapshotTransferMs: [],
        }),
        resetPerformanceMetrics: async () => {},
        disposeLayoutMount: async () => {},
        disposeSession: async () => {},
    };
}

function createService(document: DocumentDataModel, registerExecutor = false, textLineGap = 0) {
    const injector = testInjector.createChild();
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([LocaleService]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([DocLayoutExecutorService]);
    injector.get(IConfigService).setConfig(SHEET_TEXT_LINE_GAP, textLineGap);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    univerInstanceService.__addUnit(document);
    if (registerExecutor) {
        injector.get(DocLayoutExecutorService).register(createExecutor());
    }

    injector.add([DocSkeletonManagerService, {
        useFactory: () => injector.createInstance(DocSkeletonManagerService, {
            unit: document,
            unitId: document.getUnitId(),
            type: UniverInstanceType.UNIVER_DOC,
        }),
    }]);
    return injector.get(DocSkeletonManagerService);
}

describe('DocSkeletonManagerService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('builds and publishes a document skeleton for the render context document', async () => {
        vi.stubGlobal('document', {
            getElementById: () => null,
            getElementsByTagName: () => [{ appendChild: vi.fn() }],
            createElement: () => ({
                id: '',
                style: { cssText: '' },
                textContent: '',
                getBoundingClientRect: () => ({ width: 40, height: 10 }),
                getContext: () => ({
                    font: '',
                    measureText: (content: string) => ({
                        actualBoundingBoxAscent: 8,
                        actualBoundingBoxDescent: 2,
                        width: content.length * 8,
                    }),
                }),
            }),
        });
        const document = createDocument();
        const service = createService(document);

        expect(service.getViewModel().getDataModel().getUnitId()).toBe('doc-1');
        expect(service.getSkeleton()).toBeTruthy();

        const publishedSkeletons: unknown[] = [];
        const subscription = service.currentSkeleton$.subscribe((skeleton) => publishedSkeletons.push(skeleton));
        const skeleton = service.recalculate();

        expect(skeleton).toBe(service.getSkeleton());
        expect(publishedSkeletons).toEqual([skeleton, skeleton]);
        await expect(service.getLayoutPerformanceMetrics()).resolves.toEqual({
            hydrationMs: [],
            mutationTransferMs: [],
            patchTransferMs: [],
            snapshotTransferMs: [],
        });
        subscription.unsubscribe();
    });

    it.each([
        ['internal editor', { id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY, documentFlavor: DocumentFlavor.UNSPECIFIED }],
        ['unspecified document', { id: 'unspecified-doc', documentFlavor: DocumentFlavor.UNSPECIFIED }],
    ] as const)('calculates %s synchronously before publishing', (_label, options) => {
        const service = createService(createDocument(options));

        expect(service.getSkeleton().getSkeletonData()).not.toBeNull();
        expect(service.supportsIncrementalLayout()).toBe(false);
    });

    it.each([
        DocumentFlavor.TRADITIONAL,
        DocumentFlavor.MODERN,
    ])('keeps an interactive document synchronous without a registered executor: %s', (documentFlavor) => {
        const service = createService(createDocument({ documentFlavor }));

        expect(service.supportsIncrementalLayout()).toBe(false);
        expect(service.getSkeleton().getSkeletonData()).not.toBeNull();
    });

    it.each([
        DocumentFlavor.TRADITIONAL,
        DocumentFlavor.MODERN,
    ])('enables incremental layout for a registered executor and interactive flavor: %s', (documentFlavor) => {
        const service = createService(createDocument({ documentFlavor }), true);

        expect(service.supportsIncrementalLayout()).toBe(true);
        expect(service.getSkeleton().getSkeletonData()).toBeUndefined();
    });

    it('keeps a host layout projection synchronous while ordinary Docs can use the registered executor', () => {
        const document = createDocument({ documentFlavor: DocumentFlavor.TRADITIONAL });
        const registration = registerDocumentLayoutPresentation(document, {
            getSnapshot: (snapshot) => snapshot,
            captureState: () => undefined,
            applyActions: () => {},
            restoreState: () => {},
        });
        const service = createService(document, true);
        expect(service.supportsIncrementalLayout()).toBe(false);
        expect(service.getSkeleton().getSkeletonData()).not.toBeNull();
        registration.dispose();
        expect(service.supportsIncrementalLayout()).toBe(true);
        service.dispose();
    });

    it('keeps an internal editor synchronous even if its flavor is paginated', () => {
        const service = createService(createDocument({
            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            documentFlavor: DocumentFlavor.TRADITIONAL,
        }));

        expect(service.supportsIncrementalLayout()).toBe(false);
        expect(service.getSkeleton().getSkeletonData()).not.toBeNull();
    });

    it.each([
        [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, 4],
        [DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, 4],
        [DOCS_COMMENT_EDITOR_UNIT_ID_KEY, 0],
        ['ordinary-document', 0],
    ])('applies sheet line gaps only to the cell and formula editors: %s', (id, heightChange) => {
        const injector = testInjector;
        const document = injector.createInstance(DocumentDataModel, {
            id,
            body: {
                dataStream: 'one\rtwo\rthree\r\n',
                paragraphs: [{ startIndex: 3, paragraphId: 'one' }, { startIndex: 7, paragraphId: 'two' }, { startIndex: 13, paragraphId: 'three' }],
                sectionBreaks: [{ startIndex: 14, sectionId: 'section' }],
            },
            documentStyle: { documentFlavor: DocumentFlavor.UNSPECIFIED, pageSize: { width: 400, height: Infinity } },
        });
        const baseline = createService(document);
        const spaced = createService(document, false, 2);
        try {
            const oldPage = baseline.getSkeleton().getSkeletonData()!.pages[0];
            const newPage = spaced.getSkeleton().getSkeletonData()!.pages[0];
            expect(newPage.height).toBeCloseTo(oldPage.height + heightChange);
            const oldLines = oldPage.sections[0].columns[0].lines;
            const newLines = newPage.sections[0].columns[0].lines;
            expect(newLines).toHaveLength(3);
            newLines.forEach((line, index) => {
                expect(line.top + line.marginTop - oldLines[index].top - oldLines[index].marginTop).toBeCloseTo(index * heightChange / 2);
            });
        } finally {
            spaced.dispose();
            baseline.dispose();
            injector.dispose();
        }
    });

    it.each([
        { id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY, initial: ['오늘 전략', '을'], resized: ['오늘 전', '략을'] },
        { id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, initial: ['오늘 전략', '을'], resized: ['오늘 전', '략을'] },
        { id: 'ordinary-document', initial: ['오늘 ', '전략을'], resized: ['오늘 ', '전략을'] },
        { id: createInternalEditorID('shape-word-wrap'), initial: ['오늘 ', '전략을'], resized: ['오늘 ', '전략을'] },
    ])('keeps host wrapping when alignment metadata is cleared and the editor is resized: $id', ({ id, initial, resized }) => {
        const measure = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text) => ({
            width: text.length * 10,
            fontBoundingBoxAscent: 10,
            fontBoundingBoxDescent: 2,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 2,
        }));
        const injector = new Injector();
        const document = injector.createInstance(DocumentDataModel, {
            id,
            body: {
                dataStream: '오늘 전략을\r\n',
                paragraphs: [{ startIndex: 6, paragraphId: 'korean', paragraphStyle: { snapToGrid: BooleanNumber.FALSE } }],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.UNSPECIFIED,
                textStyle: { lang: 'ko-KR' },
                pageSize: { width: 50, height: Infinity },
                marginTop: 0,
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                renderConfig: { cellValueType: CellValueType.STRING, zeroWidthParagraphBreak: BooleanNumber.TRUE },
            },
        });
        const before = JSON.stringify(document.getSnapshot());
        const service = createService(document);
        const lines = () => {
            const pages = service.getSkeleton().getSkeletonData()!.pages;
            return pages
                .flatMap((page) => page.sections)
                .flatMap((section) => section.columns)
                .flatMap((column) => column.lines)
                .map((line) => line.divides.flatMap((divide) => divide.glyphGroup.map((glyph) => glyph.content)).join('').replace(/\r$/, ''));
        };
        try {
            expect(lines()).toEqual(initial);
            expect(JSON.stringify(document.getSnapshot())).toBe(before);
            document.updateDocumentRenderConfig({ cellValueType: undefined });
            document.updateDocumentDataPageSize(40, Infinity);
            const resizedSnapshot = JSON.stringify(document.getSnapshot());
            service.recalculate();
            expect(lines()).toEqual(resized);
            expect(JSON.stringify(document.getSnapshot())).toBe(resizedSnapshot);
        } finally {
            service.dispose();
            injector.dispose();
            measure.mockRestore();
        }
    });

    it.each(['STYLEREF', 'PAGE'])('keeps only host-resolved reference stories on their live model (%s)', (fieldType) => {
        const data = createDocument().getSnapshot();
        const document = testInjector.createInstance(DocumentDataModel, {
            ...data,
            documentStyle: { ...data.documentStyle, defaultHeaderId: 'header' },
            headers: {
                header: {
                    headerId: 'header',
                    body: {
                        dataStream: '\u001Fcached\u001E\r\n',
                        paragraphs: [{ paragraphId: 'header-paragraph', startIndex: 8 }],
                        customRanges: [{ rangeId: 'field', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 7, properties: { fieldType, instruction: `${fieldType} Title`, cachedResult: 'cached' } }],
                    },
                },
            },
        });
        const registration = registerDocumentHeaderFooterReferenceResolver(document, () => undefined);
        const service = createService(document, true);
        expect(service.supportsIncrementalLayout()).toBe(fieldType === 'PAGE');
        if (fieldType === 'STYLEREF') {
            expect(service.getSkeleton().getSkeletonData()).toBeTruthy();
        }
        registration.dispose();
        expect(service.supportsIncrementalLayout()).toBe(true);
        service.dispose();
        document.dispose();
    });
});
