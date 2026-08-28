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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import type { IDocLayoutExecutor, IDocLayoutMountIdentity, IDocLayoutStartResult } from '../doc-layout-executor.service';
import {

    DocumentFlavor,
    ICommandService,

    IUniverInstanceService,
    JSONX,
    LifecycleService,
    LifecycleStages,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    TextX,
    TextXActionType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    IRenderManagerService,
    RenderManagerService,
    setDocsCustomBlockRenderViewportProvider,
} from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RichTextEditingMutation } from '../../commands/mutations/core-editing.mutation';
import { UniverDocsPlugin } from '../../plugin';
import {
    DocLayoutExecutorService,
    DocLayoutExecutorState,
    DocLayoutExecutorType,
    DocLayoutSessionStatus,

} from '../doc-layout-executor.service';

function createDocumentData(id: string, documentFlavor: DocumentFlavor): IDocumentData {
    return {
        id,
        body: {
            dataStream: 'Hello\r\n',
            paragraphs: [{ paragraphId: 'paragraph-1', startIndex: 5 }],
        },
        documentStyle: {
            documentFlavor,
            pageSize: { width: 594, height: 840 },
        },
    };
}

function createMountIdentity(mountId = 'mount-1', viewportEpoch = 1): IDocLayoutMountIdentity {
    return { unitId: 'traditional-doc', mountId, mountEpoch: 1, viewportEpoch };
}

function createStartResult(
    modelRevision: number,
    metricsRevision = 1,
    identity = createMountIdentity()
): IDocLayoutStartResult {
    return {
        status: DocLayoutSessionStatus.ACCEPTED,
        step: {
            ...identity,
            progress: {
                generation: 1,
                publicationRevision: 1,
                didPublish: true,
                didPublishAnchor: true,
                publishedPageCount: 1,
                reason: 'initial',
                mode: 'paginated',
                complete: false,
                cancelled: false,
                anchorReady: true,
                laidOutThrough: 5,
                stableLaidOutThrough: 4,
                pageCount: 1,
                processedBlockCount: 1,
                totalBlockCount: 1,
                estimatedPageCount: 1,
                estimatedHeight: 840,
                elapsedTime: 1,
                maxBlockDuration: 1,
                interactionWindowComplete: false,
            },
            publication: null,
            modelRevision,
            metricsRevision,
        },
    };
}

function getRequestIdentity(request: IDocLayoutMountIdentity): IDocLayoutMountIdentity {
    return {
        unitId: request.unitId,
        mountId: request.mountId,
        mountEpoch: request.mountEpoch,
        viewportEpoch: request.viewportEpoch,
    };
}

function createExecutor(): IDocLayoutExecutor {
    return {
        type: DocLayoutExecutorType.WORKER,
        initialize: vi.fn(async () => {}),
        recover: vi.fn(async () => {}),
        createSession: vi.fn(async () => {}),
        startLayout: vi.fn(async (request) =>
            createStartResult(request.modelRevision, request.metricsRevision, getRequestIdentity(request))),
        stepLayout: vi.fn(async () => {
            throw new Error('not used');
        }),
        publishBacklog: vi.fn(async () => {
            throw new Error('not used');
        }),
        getLayoutPage: vi.fn(async () => {
            throw new Error('not used');
        }),
        cancelLayout: vi.fn(async () => {}),
        getPerformanceMetrics: vi.fn(async () => ({
            mutationTransferMs: [],
            patchTransferMs: [],
            snapshotTransferMs: [],
        })),
        resetPerformanceMetrics: vi.fn(async () => {}),
        disposeLayoutMount: vi.fn(async () => {}),
        disposeSession: vi.fn(async () => {}),
    };
}

describe('DocLayoutExecutorService', () => {
    let univer: Univer;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.get(LifecycleService).stage = LifecycleStages.Starting;
        univer.registerPlugin(UniverDocsPlugin);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('owns Worker sessions only for paginated and modern documents', async () => {
        const injector = univer.__getInjector();
        const service = injector.get(DocLayoutExecutorService);
        const executor = createExecutor();
        const registration = service.register(executor);
        await vi.waitFor(() => expect(service.getExecutorStatus()).toEqual({
            state: DocLayoutExecutorState.ACTIVE,
            executor: DocLayoutExecutorType.WORKER,
            diagnostic: null,
            recoveryUnitId: null,
        }));

        univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocumentData('traditional-doc', DocumentFlavor.TRADITIONAL)
        );
        univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocumentData('modern-doc', DocumentFlavor.MODERN)
        );
        univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocumentData('editor-doc', DocumentFlavor.UNSPECIFIED)
        );
        await vi.waitFor(() => expect(executor.createSession).toHaveBeenCalledTimes(2));
        expect(executor.createSession).toHaveBeenCalledWith(expect.objectContaining({
            unitId: 'traditional-doc',
            sessionEpoch: expect.any(Number),
            modelRevision: 0,
        }));
        expect(executor.createSession).toHaveBeenCalledWith(expect.objectContaining({
            unitId: 'modern-doc',
            modelRevision: 0,
        }));

        const result = await service.startLayout(createMountIdentity(), { reason: 'initial' }, 32);
        expect(result).toEqual(expect.objectContaining({
            status: DocLayoutSessionStatus.ACCEPTED,
            step: expect.objectContaining({ modelRevision: 0 }),
        }));
        expect(executor.startLayout).toHaveBeenCalledWith({
            unitId: 'traditional-doc',
            mountId: 'mount-1',
            mountEpoch: 1,
            viewportEpoch: 1,
            metricsRevision: 1,
            baseRevision: 0,
            modelRevision: 0,
            mutations: [],
            customBlockViewports: {},
            reason: 'initial',
            budgetMs: 32,
        });
        expect(await service.startLayout(
            { ...createMountIdentity(), unitId: 'editor-doc' },
            { reason: 'initial' },
            32
        )).toBeNull();

        injector.get(IUniverInstanceService).disposeUnit('traditional-doc');
        expect(executor.disposeSession).toHaveBeenCalledWith({
            unitId: 'traditional-doc',
            sessionEpoch: expect.any(Number),
        });
        registration.dispose();
    });

    it('cancels a deferred snapshot transfer when the document is disposed in the same task', async () => {
        const injector = univer.__getInjector();
        const service = injector.get(DocLayoutExecutorService);
        const executor = createExecutor();
        service.register(executor);

        univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocumentData('traditional-doc', DocumentFlavor.TRADITIONAL)
        );
        injector.get(IUniverInstanceService).disposeUnit('traditional-doc');
        await new Promise<void>((resolve) => setTimeout(resolve, 20));

        expect(executor.createSession).not.toHaveBeenCalled();
        expect(executor.disposeSession).toHaveBeenCalledWith({
            unitId: 'traditional-doc',
            sessionEpoch: expect.any(Number),
        });
    });

    it('folds mutations committed before a deferred snapshot transfer into one consistent Worker baseline', async () => {
        const injector = univer.__getInjector();
        const service = injector.get(DocLayoutExecutorService);
        const executor = createExecutor();
        service.register(executor);
        univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocumentData('traditional-doc', DocumentFlavor.TRADITIONAL)
        );

        const textX = new TextX();
        textX.push({ t: TextXActionType.RETAIN, len: 5 });
        textX.push({
            t: TextXActionType.INSERT,
            len: 1,
            body: { dataStream: 'A' },
        });
        injector.get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, {
            unitId: 'traditional-doc',
            actions: JSONX.getInstance().editOp(textX.serialize(), ['body']),
            textRanges: [],
        });

        await service.startLayout(createMountIdentity(), { reason: 'edit', anchor: 6 }, 32);

        expect(executor.createSession).toHaveBeenCalledTimes(1);
        expect(executor.createSession).toHaveBeenCalledWith(expect.objectContaining({
            modelRevision: 1,
            snapshot: expect.objectContaining({
                body: expect.objectContaining({ dataStream: 'HelloA\r\n' }),
            }),
        }));
        expect(executor.startLayout).toHaveBeenCalledWith(expect.objectContaining({
            baseRevision: 1,
            modelRevision: 1,
            mutations: [],
        }));
    });

    it('rebases the deferred Worker snapshot after executor initialization completes', async () => {
        const injector = univer.__getInjector();
        const service = injector.get(DocLayoutExecutorService);
        const executor = createExecutor();
        let resolveInitialization: () => void = () => {};
        vi.mocked(executor.initialize).mockImplementation(() => new Promise<void>((resolve) => {
            resolveInitialization = resolve;
        }));
        service.register(executor);
        univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocumentData('traditional-doc', DocumentFlavor.TRADITIONAL)
        );
        await new Promise<void>((resolve) => setTimeout(resolve, 20));
        expect(executor.createSession).not.toHaveBeenCalled();

        const textX = new TextX();
        textX.push({ t: TextXActionType.RETAIN, len: 5 });
        textX.push({
            t: TextXActionType.INSERT,
            len: 1,
            body: { dataStream: 'A' },
        });
        injector.get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, {
            unitId: 'traditional-doc',
            actions: JSONX.getInstance().editOp(textX.serialize(), ['body']),
            textRanges: [],
        });
        resolveInitialization();

        await service.startLayout(createMountIdentity(), { reason: 'edit', anchor: 6 }, 32);

        expect(executor.createSession).toHaveBeenCalledWith(expect.objectContaining({
            modelRevision: 1,
            snapshot: expect.objectContaining({
                body: expect.objectContaining({ dataStream: 'HelloA\r\n' }),
            }),
        }));
        expect(executor.startLayout).toHaveBeenCalledWith(expect.objectContaining({
            baseRevision: 1,
            modelRevision: 1,
            mutations: [],
        }));
    });

    it('reports capability initialization failures and unregisters the executor', async () => {
        const service = univer.__getInjector().get(DocLayoutExecutorService);
        const executor = createExecutor();
        vi.mocked(executor.initialize).mockRejectedValue(new Error('font metrics mismatch'));

        service.register(executor);

        await vi.waitFor(() => expect(service.getExecutor()).toBeNull());
        expect(service.getExecutorStatus()).toEqual({
            state: DocLayoutExecutorState.FAILED,
            executor: DocLayoutExecutorType.WORKER,
            diagnostic: 'font metrics mismatch',
            recoveryUnitId: null,
        });
    });

    it('collects bounded transfer and hydration diagnostics without changing executor results', async () => {
        const service = univer.__getInjector().get(DocLayoutExecutorService);
        const executor = createExecutor();
        vi.mocked(executor.getPerformanceMetrics).mockResolvedValue({
            mutationTransferMs: [2],
            patchTransferMs: [3, 4],
            snapshotTransferMs: [5],
        });
        service.register(executor);
        univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocumentData('traditional-doc', DocumentFlavor.TRADITIONAL)
        );
        expect(executor.createSession).not.toHaveBeenCalled();
        await vi.waitFor(() => expect(executor.createSession).toHaveBeenCalledTimes(1));

        service.recordHydrationDuration('traditional-doc', 6);
        const metrics = await service.getPerformanceMetrics('traditional-doc');

        expect(metrics).toMatchObject({
            hydrationMs: [6],
            mutationTransferMs: [2],
            patchTransferMs: [3, 4],
            snapshotTransferMs: [5],
        });
        await service.resetPerformanceMetrics('traditional-doc');
        expect(executor.resetPerformanceMetrics).toHaveBeenCalledWith('traditional-doc');
        expect((await service.getPerformanceMetrics('traditional-doc')).hydrationMs).toEqual([]);
    });

    it('keeps the affected document in recovery until a canonical layout completes', async () => {
        const service = univer.__getInjector().get(DocLayoutExecutorService);
        const executor = createExecutor();
        service.register(executor);
        await vi.waitFor(() => expect(service.getExecutorStatus().state).toBe(DocLayoutExecutorState.ACTIVE));

        await service.recoverExecutor('doc-1', 'layout convergence failed');

        expect(executor.recover).toHaveBeenCalledTimes(1);
        expect(service.getExecutorStatus()).toEqual({
            state: DocLayoutExecutorState.RECOVERING,
            executor: DocLayoutExecutorType.WORKER,
            diagnostic: 'layout convergence failed',
            recoveryUnitId: 'doc-1',
        });

        service.completeRecovery('another-doc');
        expect(service.getExecutorStatus().state).toBe(DocLayoutExecutorState.RECOVERING);

        service.completeRecovery('doc-1');
        expect(service.getExecutorStatus()).toEqual({
            state: DocLayoutExecutorState.ACTIVE,
            executor: DocLayoutExecutorType.WORKER,
            diagnostic: null,
            recoveryUnitId: null,
        });
    });

    it('projects committed mutations to the Worker in revision order before layout starts', async () => {
        const injector = univer.__getInjector();
        const service = injector.get(DocLayoutExecutorService);
        const executor = createExecutor();
        service.register(executor);
        univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocumentData('traditional-doc', DocumentFlavor.TRADITIONAL)
        );
        await vi.waitFor(() => expect(executor.createSession).toHaveBeenCalledTimes(1));

        const commandService = injector.get(ICommandService);
        for (const [offset, text] of [[5, 'A'], [6, 'B']] as const) {
            const textX = new TextX();
            textX.push({ t: TextXActionType.RETAIN, len: offset });
            textX.push({
                t: TextXActionType.INSERT,
                len: text.length,
                body: { dataStream: text },
            });
            commandService.syncExecuteCommand(RichTextEditingMutation.id, {
                unitId: 'traditional-doc',
                actions: JSONX.getInstance().editOp(textX.serialize(), ['body']),
                textRanges: [],
            });
        }

        await service.startLayout(createMountIdentity(), { reason: 'edit', anchor: 5 }, 32);

        expect(executor.startLayout).toHaveBeenLastCalledWith({
            unitId: 'traditional-doc',
            mountId: 'mount-1',
            mountEpoch: 1,
            viewportEpoch: 1,
            metricsRevision: 1,
            baseRevision: 0,
            modelRevision: 2,
            mutations: [
                expect.objectContaining({ baseRevision: 0, modelRevision: 1 }),
                expect.objectContaining({ baseRevision: 1, modelRevision: 2 }),
            ],
            customBlockViewports: {},
            reason: 'edit',
            anchor: 5,
            budgetMs: 32,
        });
        expect(executor.createSession).toHaveBeenCalledTimes(1);
    });

    it('re-snapshots before layout when a direct document model mutation bypasses the projected command stream', async () => {
        const injector = univer.__getInjector();
        const service = injector.get(DocLayoutExecutorService);
        const executor = createExecutor();
        service.register(executor);
        const model = univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocumentData('traditional-doc', DocumentFlavor.TRADITIONAL)
        );
        await vi.waitFor(() => expect(executor.createSession).toHaveBeenCalledTimes(1));

        model.updateDocumentStyle({
            ...model.getDocumentStyle(),
            marginTop: 123,
        });
        await service.startLayout(createMountIdentity(), { reason: 'edit', anchor: 5 }, 32);

        expect(executor.createSession).toHaveBeenCalledTimes(2);
        expect(executor.createSession).toHaveBeenLastCalledWith(expect.objectContaining({
            unitId: 'traditional-doc',
            modelRevision: 0,
            snapshot: expect.objectContaining({
                documentStyle: expect.objectContaining({ marginTop: 123 }),
            }),
        }));
        expect(executor.startLayout).toHaveBeenLastCalledWith(expect.objectContaining({
            baseRevision: 0,
            modelRevision: 0,
            mutations: [],
        }));
    });

    it('re-snapshots when a direct model mutation lands while a queued Worker start is waiting', async () => {
        const injector = univer.__getInjector();
        const service = injector.get(DocLayoutExecutorService);
        const executor = createExecutor();
        let resolveInitialSession: () => void = () => {};
        vi.mocked(executor.createSession)
            .mockImplementationOnce(() => new Promise<void>((resolve) => {
                resolveInitialSession = resolve;
            }))
            .mockResolvedValue(undefined);
        service.register(executor);
        const model = univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocumentData('traditional-doc', DocumentFlavor.TRADITIONAL)
        );
        await vi.waitFor(() => expect(executor.createSession).toHaveBeenCalledTimes(1));

        const start = service.startLayout(createMountIdentity(), { reason: 'initial' }, 32);
        model.updateDocumentStyle({
            ...model.getDocumentStyle(),
            marginBottom: 456,
        });
        resolveInitialSession();
        await start;

        expect(executor.createSession).toHaveBeenCalledTimes(2);
        expect(executor.createSession).toHaveBeenLastCalledWith(expect.objectContaining({
            snapshot: expect.objectContaining({
                documentStyle: expect.objectContaining({ marginBottom: 456 }),
            }),
        }));
        expect(executor.startLayout).toHaveBeenCalledTimes(1);
        expect(executor.startLayout).toHaveBeenCalledWith(expect.objectContaining({
            baseRevision: 0,
            modelRevision: 0,
            mutations: [],
        }));
    });

    it('preserves paste, undo, redo, remote, and table-format actions in one ordered Worker batch', async () => {
        const injector = univer.__getInjector();
        const service = injector.get(DocLayoutExecutorService);
        const executor = createExecutor();
        service.register(executor);
        univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocumentData('traditional-doc', DocumentFlavor.TRADITIONAL)
        );
        await vi.waitFor(() => expect(executor.createSession).toHaveBeenCalledTimes(1));

        const commandService = injector.get(ICommandService);
        const pastedText = '大段粘贴内容'.repeat(1_024);
        const pasteTextX = new TextX();
        pasteTextX.push({ t: TextXActionType.RETAIN, len: 5 });
        pasteTextX.push({
            t: TextXActionType.INSERT,
            len: pastedText.length,
            body: { dataStream: pastedText },
        });
        const pasteActions = JSONX.getInstance().editOp(pasteTextX.serialize(), ['body']);

        const undoTextX = new TextX();
        undoTextX.push({ t: TextXActionType.RETAIN, len: 5 });
        undoTextX.push({ t: TextXActionType.DELETE, len: pastedText.length });
        const undoActions = JSONX.getInstance().editOp(undoTextX.serialize(), ['body']);

        const redoTextX = new TextX();
        redoTextX.push({ t: TextXActionType.RETAIN, len: 5 });
        redoTextX.push({
            t: TextXActionType.INSERT,
            len: pastedText.length,
            body: { dataStream: pastedText },
        });
        const redoActions = JSONX.getInstance().editOp(redoTextX.serialize(), ['body']);

        const remoteTextX = new TextX();
        remoteTextX.push({ t: TextXActionType.RETAIN, len: 5 });
        remoteTextX.push({
            t: TextXActionType.INSERT,
            len: 2,
            body: { dataStream: '远端' },
        });
        const remoteActions = JSONX.getInstance().editOp(remoteTextX.serialize(), ['body']);
        const tableFormatActions = JSONX.getInstance().insertOp(['tableSource', 'table-1'], {
            tableId: 'table-1',
            tableRows: [{ tableCells: [{ backgroundColor: { rgb: '#fff4b9' } }] }],
            tableColumns: [{}],
        });

        for (const [actions, textRanges] of [
            [pasteActions, []],
            [undoActions, []],
            [redoActions, []],
            [remoteActions, null],
            [tableFormatActions, []],
        ] as const) {
            commandService.syncExecuteCommand(RichTextEditingMutation.id, {
                unitId: 'traditional-doc',
                actions,
                textRanges,
            });
        }

        await service.startLayout(createMountIdentity(), { reason: 'edit', anchor: 5 }, 32);

        const request = vi.mocked(executor.startLayout).mock.lastCall?.[0];
        expect(request).toEqual(expect.objectContaining({
            baseRevision: 0,
            modelRevision: 5,
            reason: 'edit',
            anchor: 5,
        }));
        expect(request?.mutations).toEqual([
            { baseRevision: 0, modelRevision: 1, actions: pasteActions },
            { baseRevision: 1, modelRevision: 2, actions: undoActions },
            { baseRevision: 2, modelRevision: 3, actions: redoActions },
            { baseRevision: 3, modelRevision: 4, actions: remoteActions },
            { baseRevision: 4, modelRevision: 5, actions: tableFormatActions },
        ]);
    });

    it('serializes main-thread custom block viewport measurements with a layout start', async () => {
        const injector = univer.__getInjector();
        const service = injector.get(DocLayoutExecutorService);
        const executor = createExecutor();
        service.register(executor);
        const unregister = setDocsCustomBlockRenderViewportProvider((unitId, blockId, input) => {
            if (unitId !== 'traditional-doc' || blockId !== 'embed-1') {
                return null;
            }
            return {
                width: input.fallbackWidth + 10,
                height: input.fallbackHeight + 20,
                contentWidth: 640,
                contentHeight: 480,
            };
        });
        const documentData = createDocumentData('traditional-doc', DocumentFlavor.TRADITIONAL);
        documentData.body = {
            dataStream: '\b\r\n',
            paragraphs: [{ paragraphId: 'paragraph-1', startIndex: 1 }],
            customBlocks: [{ startIndex: 0, blockId: 'embed-1' }],
        };
        documentData.drawings = {
            'embed-1': {
                unitId: 'traditional-doc',
                subUnitId: 'traditional-doc',
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
        univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, documentData);
        await Promise.resolve();

        await service.startLayout(createMountIdentity(), { reason: 'initial' }, 32);

        expect(executor.startLayout).toHaveBeenCalledWith(expect.objectContaining({
            customBlockViewports: {
                'embed-1': {
                    width: 110,
                    height: 100,
                    contentWidth: 640,
                    contentHeight: 480,
                },
            },
        }));
        unregister();
    });

    it('skips queued layout starts that a newer edit superseded', async () => {
        const injector = univer.__getInjector();
        const service = injector.get(DocLayoutExecutorService);
        const executor = createExecutor();
        let resolveFirstStart: (result: IDocLayoutStartResult) => void = () => {};
        vi.mocked(executor.startLayout)
            .mockImplementationOnce(() => new Promise((resolve) => {
                resolveFirstStart = resolve;
            }))
            .mockImplementation(async (request) =>
                createStartResult(request.modelRevision, request.metricsRevision, getRequestIdentity(request)));
        service.register(executor);
        univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocumentData('traditional-doc', DocumentFlavor.TRADITIONAL)
        );
        await Promise.resolve();

        const firstStart = service.startLayout(createMountIdentity(), { reason: 'edit', anchor: 5 }, 32);
        await vi.waitFor(() => expect(executor.startLayout).toHaveBeenCalledTimes(1));
        const supersededStart = service.startLayout(createMountIdentity('mount-1', 2), { reason: 'edit', anchor: 6 }, 32);
        const latestStart = service.startLayout(createMountIdentity('mount-1', 3), { reason: 'edit', anchor: 7 }, 32);
        resolveFirstStart(createStartResult(0));

        await expect(firstStart).resolves.toEqual(createStartResult(0));
        await expect(supersededStart).resolves.toEqual({ status: DocLayoutSessionStatus.SUPERSEDED });
        await expect(latestStart).resolves.toEqual(createStartResult(0, 3, createMountIdentity('mount-1', 3)));
        expect(executor.startLayout).toHaveBeenCalledTimes(2);
        expect(executor.startLayout).toHaveBeenLastCalledWith(expect.objectContaining({ anchor: 7 }));
    });

    it('keeps queued starts for different document mounts independent', async () => {
        const injector = univer.__getInjector();
        const service = injector.get(DocLayoutExecutorService);
        const executor = createExecutor();
        let resolveFirstStart: (result: IDocLayoutStartResult) => void = () => {};
        vi.mocked(executor.startLayout)
            .mockImplementationOnce(() => new Promise((resolve) => {
                resolveFirstStart = resolve;
            }))
            .mockImplementation(async (request) =>
                createStartResult(request.modelRevision, request.metricsRevision, getRequestIdentity(request)));
        service.register(executor);
        univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            createDocumentData('traditional-doc', DocumentFlavor.TRADITIONAL)
        );
        await Promise.resolve();

        const firstMountStart = service.startLayout(
            createMountIdentity(),
            { reason: 'edit', anchor: 5 },
            32
        );
        await vi.waitFor(() => expect(executor.startLayout).toHaveBeenCalledTimes(1));
        const secondMountStart = service.startLayout(
            createMountIdentity('mount-2'),
            { reason: 'edit', anchor: 6 },
            32
        );
        resolveFirstStart(createStartResult(0));

        await expect(firstMountStart).resolves.toEqual(createStartResult(0));
        await expect(secondMountStart).resolves.toEqual(createStartResult(0, 1, createMountIdentity('mount-2')));
        expect(executor.startLayout).toHaveBeenCalledTimes(2);
        expect(executor.startLayout).toHaveBeenLastCalledWith(expect.objectContaining({
            mountId: 'mount-2',
            anchor: 6,
        }));

        await service.disposeLayoutMount(createMountIdentity());
        expect(executor.disposeLayoutMount).toHaveBeenCalledWith({
            unitId: 'traditional-doc',
            mountId: 'mount-1',
            mountEpoch: 1,
            viewportEpoch: 1,
        });
    });
});
