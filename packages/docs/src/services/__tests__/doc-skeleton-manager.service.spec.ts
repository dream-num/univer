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

import type { IDocLayoutExecutor } from '../doc-layout-executor.service';
import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentDataModel,
    DocumentFlavor,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocLayoutExecutorService, DocLayoutExecutorType, DocLayoutSessionStatus } from '../doc-layout-executor.service';
import { DocSkeletonManagerService } from '../doc-skeleton-manager.service';

function createDocument(options?: { documentFlavor?: DocumentFlavor; id?: string }) {
    return new DocumentDataModel({
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

function createService(document: DocumentDataModel, registerExecutor = false) {
    const injector = new Injector();
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([LocaleService]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([DocLayoutExecutorService]);
    const univerInstanceService = injector.get(IUniverInstanceService) as UniverInstanceService;
    univerInstanceService.__addUnit(document);
    if (registerExecutor) {
        injector.get(DocLayoutExecutorService).register(createExecutor());
    }

    return injector.createInstance(DocSkeletonManagerService, {
        unit: document,
        unitId: document.getUnitId(),
        type: UniverInstanceType.UNIVER_DOC,
    });
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
        ['internal editor', createDocument({ id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY, documentFlavor: DocumentFlavor.UNSPECIFIED })],
        ['unspecified document', createDocument({ id: 'unspecified-doc', documentFlavor: DocumentFlavor.UNSPECIFIED })],
    ])('calculates %s synchronously before publishing', (_label, document) => {
        const service = createService(document);

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

    it('keeps an internal editor synchronous even if its flavor is paginated', () => {
        const service = createService(createDocument({
            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            documentFlavor: DocumentFlavor.TRADITIONAL,
        }));

        expect(service.supportsIncrementalLayout()).toBe(false);
        expect(service.getSkeleton().getSkeletonData()).not.toBeNull();
    });
});
