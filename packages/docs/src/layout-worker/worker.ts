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

import type { ICustomRangeForInterceptor } from '@univerjs/core';
import type { IDocsCustomBlockRenderViewport } from '@univerjs/engine-render';
import type { IMessageProtocol } from '@univerjs/rpc';
import type { IDocLayoutCancelRequest, IDocLayoutCreateSessionRequest, IDocLayoutDisposeMountRequest, IDocLayoutDisposeSessionRequest, IDocLayoutMountIdentity, IDocLayoutPageRequest, IDocLayoutPageResult, IDocLayoutPerformanceMetrics, IDocLayoutStartRequest, IDocLayoutStartResult, IDocLayoutStepRequest, IDocLayoutStepResult } from '../services/doc-layout-executor.service';
import type { IDocsLayoutWorkerCapabilities, IDocsLayoutWorkerRuntime } from './protocol';
import { DocumentDataModel, LocaleService, requestImmediateMacroTask, Tools } from '@univerjs/core';
import { DocumentLayoutSession, FontCache, setDocsCustomBlockRenderViewportProvider } from '@univerjs/engine-render';
import { ChannelService, fromModule } from '@univerjs/rpc';
import { Observable, shareReplay } from 'rxjs';
import { DocLayoutExecutorType, DocLayoutSessionStatus } from '../services/doc-layout-executor.service';
import { DocsLayoutWorkerPerformanceTracker } from './performance-tracker';
import { DOCS_LAYOUT_WORKER_CHANNEL, DOCS_LAYOUT_WORKER_PROTOCOL_VERSION } from './protocol';

const FONT_PROBE_CONTENT = 'Univer 文档 Worker 0123456789';
const FONT_PROBE_STYLE = '16px Arial';
const WORKER_LAYOUT_INTERRUPT_INTERVAL = 8;

function yieldForWorkerMessage(): Promise<void> {
    return new Promise((resolve) => {
        requestImmediateMacroTask(() => resolve());
    });
}

interface IDocsLayoutWorkerSession {
    sessionEpoch: number;
    dataModel: DocumentDataModel;
    layoutSessions: Map<string, IDocsLayoutWorkerMount>;
    localeService: LocaleService;
    modelRevision: number;
}

interface IDocsLayoutWorkerMount {
    mountId: string;
    layoutSession: DocumentLayoutSession;
    customBlockViewports: Record<string, IDocsCustomBlockRenderViewport>;
    metricsRevision: number;
    mountEpoch: number;
    viewportEpoch: number;
    activeGeneration: number | null;
    cancelledGeneration: number | null;
}

function createDocsLayoutWorkerMessageProtocol(
    performanceTracker: DocsLayoutWorkerPerformanceTracker
): IMessageProtocol {
    return {
        send(message: unknown): void {
            const startedAt = Tools.now();
            postMessage(message);
            performanceTracker.recordResponse(message, Tools.now() - startedAt);
        },
        onMessage: new Observable<unknown>((subscriber) => {
            const handler = (event: MessageEvent) => subscriber.next(event.data);
            addEventListener('message', handler);
            return () => removeEventListener('message', handler);
        }).pipe(shareReplay({ bufferSize: 1, refCount: true })),
    };
}

export class DocsLayoutWorkerRuntime implements IDocsLayoutWorkerRuntime {
    private readonly _sessions = new Map<string, IDocsLayoutWorkerSession>();
    readonly type = DocLayoutExecutorType.WORKER;

    constructor(
        private readonly _performanceTracker = new DocsLayoutWorkerPerformanceTracker()
    ) {}

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    async getCapabilities(): Promise<IDocsLayoutWorkerCapabilities> {
        const metrics = FontCache.getMeasureText(FONT_PROBE_CONTENT, FONT_PROBE_STYLE);
        return {
            protocolVersion: DOCS_LAYOUT_WORKER_PROTOCOL_VERSION,
            executor: DocLayoutExecutorType.WORKER,
            offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
            structuredClone: typeof structuredClone === 'function',
            fontProbe: {
                content: FONT_PROBE_CONTENT,
                font: FONT_PROBE_STYLE,
                width: metrics.width,
                actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
                actualBoundingBoxDescent: metrics.actualBoundingBoxDescent,
            },
        };
    }

    async recover(): Promise<void> {
        for (const session of this._sessions.values()) {
            for (const mount of session.layoutSessions.values()) {
                mount.layoutSession.dispose();
            }
        }
        this._sessions.clear();
    }

    async createSession(request: IDocLayoutCreateSessionRequest): Promise<void> {
        if (typeof OffscreenCanvas === 'undefined') {
            throw new Error('Document layout Worker requires OffscreenCanvas text measurement support.');
        }

        const currentSession = this._sessions.get(request.unitId);
        if (currentSession != null && request.sessionEpoch < currentSession.sessionEpoch) {
            return;
        }
        this._disposeSession(request.unitId);

        const dataModel = new DocumentDataModel(request.snapshot);
        const localeService = new LocaleService();
        if (request.localeData != null) {
            localeService.load({ [request.locale]: request.localeData });
        }
        localeService.setLocale(request.locale);
        localeService.setDirection(request.direction);
        this._sessions.set(request.unitId, {
            sessionEpoch: request.sessionEpoch,
            dataModel,
            layoutSessions: new Map(),
            localeService,
            modelRevision: request.modelRevision,
        });
    }

    async startLayout(request: IDocLayoutStartRequest): Promise<IDocLayoutStartResult> {
        const session = this._sessions.get(request.unitId);
        if (session == null) {
            return { status: DocLayoutSessionStatus.NOT_FOUND };
        }

        if (session.modelRevision !== request.baseRevision) {
            return {
                status: DocLayoutSessionStatus.RESNAPSHOT_REQUIRED,
                modelRevision: session.modelRevision,
            };
        }

        if (!this._applyMutations(session, request)) {
            return {
                status: DocLayoutSessionStatus.RESNAPSHOT_REQUIRED,
                modelRevision: session.modelRevision,
            };
        }

        this._applyCustomRangePresentations(session.dataModel, request.customRangePresentations ?? []);

        let mount = session.layoutSessions.get(request.mountId);
        if (
            mount != null && (
                request.mountEpoch < mount.mountEpoch ||
                (request.mountEpoch === mount.mountEpoch && request.viewportEpoch < mount.viewportEpoch)
            )
        ) {
            return { status: DocLayoutSessionStatus.SUPERSEDED };
        }
        if (mount != null && request.mountEpoch > mount.mountEpoch) {
            mount.layoutSession.dispose();
            session.layoutSessions.delete(request.mountId);
            mount = undefined;
        }
        if (mount == null) {
            mount = {
                mountId: request.mountId,
                layoutSession: new DocumentLayoutSession(session.dataModel, session.localeService),
                customBlockViewports: request.customBlockViewports,
                metricsRevision: request.metricsRevision,
                mountEpoch: request.mountEpoch,
                viewportEpoch: request.viewportEpoch,
                activeGeneration: null,
                cancelledGeneration: null,
            };
            session.layoutSessions.set(request.mountId, mount);
        } else {
            mount.customBlockViewports = request.customBlockViewports;
            mount.metricsRevision = request.metricsRevision;
            mount.viewportEpoch = request.viewportEpoch;
        }
        const generation = mount.layoutSession.start({
            waitForHyphenationPatterns: true,
            reason: request.reason,
            anchor: request.anchor,
            priorityAnchor: request.priorityAnchor,
            invalidation: request.invalidation,
        });
        mount.activeGeneration = generation;
        mount.cancelledGeneration = null;
        return {
            status: DocLayoutSessionStatus.ACCEPTED,
            step: await this._runLayoutStep(session, mount, generation, request.budgetMs),
        };
    }

    private _applyMutations(
        session: IDocsLayoutWorkerSession,
        request: IDocLayoutStartRequest
    ): boolean {
        for (const mutation of request.mutations) {
            if (
                mutation.baseRevision !== session.modelRevision ||
                mutation.modelRevision !== mutation.baseRevision + 1
            ) {
                return false;
            }
            session.dataModel.apply(mutation.actions);
            session.modelRevision = mutation.modelRevision;
        }
        if (session.modelRevision !== request.modelRevision) {
            return false;
        }
        if (request.mutations.length > 0) {
            for (const mount of session.layoutSessions.values()) {
                mount.activeGeneration = null;
                mount.cancelledGeneration = null;
                mount.layoutSession.resetDataModel(session.dataModel);
            }
        }
        return true;
    }

    private _applyCustomRangePresentations(
        dataModel: DocumentDataModel,
        presentations: IDocLayoutStartRequest['customRangePresentations']
    ): void {
        const rangeMaps = new Map<string, Map<string, ICustomRangeForInterceptor>>();
        const segmentModels = [
            ['', dataModel] as const,
            ...dataModel.headerModelMap,
            ...dataModel.footerModelMap,
        ];
        for (const [segmentId, segmentModel] of segmentModels) {
            const rangeMap = new Map<string, ICustomRangeForInterceptor>();
            for (const range of segmentModel.getBody()?.customRanges ?? []) {
                const workerRange = range as ICustomRangeForInterceptor;
                delete workerRange.active;
                delete workerRange.glyphAscentEm;
                delete workerRange.glyphDescentEm;
                delete workerRange.glyphWidthEm;
                delete workerRange.show;
                if (!rangeMap.has(range.rangeId)) {
                    rangeMap.set(range.rangeId, workerRange);
                }
            }
            rangeMaps.set(segmentId, rangeMap);
        }
        for (const { segmentId, rangeId, presentation } of presentations ?? []) {
            const rangeMap = rangeMaps.get(segmentId);
            const range = rangeMap?.get(rangeId);
            if (range != null) {
                Object.assign(range, presentation);
                rangeMap?.delete(rangeId);
            }
        }
    }

    async stepLayout(request: IDocLayoutStepRequest): Promise<IDocLayoutStepResult> {
        const session = this._getSession(request.unitId);
        const mount = this._getLayoutMount(session, request);
        return await this._runLayoutStep(session, mount, request.generation, request.budgetMs);
    }

    async publishBacklog(request: Omit<IDocLayoutStepRequest, 'budgetMs'>): Promise<IDocLayoutStepResult> {
        const session = this._getSession(request.unitId);
        const mount = this._getLayoutMount(session, request);
        return this._runWithCustomBlockViewports(session, mount, () => ({
            ...mount.layoutSession.publishBacklog(request.generation),
            unitId: request.unitId,
            mountId: request.mountId,
            mountEpoch: mount.mountEpoch,
            viewportEpoch: mount.viewportEpoch,
            modelRevision: session.modelRevision,
            metricsRevision: mount.metricsRevision,
        }));
    }

    async getLayoutPage(request: IDocLayoutPageRequest): Promise<IDocLayoutPageResult> {
        const session = this._getSession(request.unitId);
        const mount = this._getLayoutMount(session, request);
        return {
            ...request,
            modelRevision: session.modelRevision,
            metricsRevision: mount.metricsRevision,
            page: mount.layoutSession.getPage(request.pageIndex),
        };
    }

    async cancelLayout(request: IDocLayoutCancelRequest): Promise<void> {
        const mount = this._sessions.get(request.unitId)?.layoutSessions.get(request.mountId);
        if (
            mount?.mountEpoch === request.mountEpoch &&
            mount.viewportEpoch === request.viewportEpoch
        ) {
            if (request.generation == null || request.generation === mount.activeGeneration) {
                mount.cancelledGeneration = request.generation ?? mount.activeGeneration;
            }
            mount.layoutSession.cancel(request.generation);
        }
    }

    async getPerformanceMetrics(
        unitId: string
    ): Promise<Omit<IDocLayoutPerformanceMetrics, 'hydrationMs'>> {
        return this._performanceTracker.getMetrics(unitId);
    }

    async resetPerformanceMetrics(unitId: string): Promise<void> {
        this._performanceTracker.reset(unitId);
    }

    async disposeLayoutMount(request: IDocLayoutDisposeMountRequest): Promise<void> {
        const session = this._sessions.get(request.unitId);
        const mount = session?.layoutSessions.get(request.mountId);
        if (
            session == null ||
            mount == null ||
            mount.mountEpoch !== request.mountEpoch ||
            mount.viewportEpoch !== request.viewportEpoch
        ) {
            return;
        }

        session.layoutSessions.delete(request.mountId);
        mount.activeGeneration = null;
        mount.layoutSession.dispose();
    }

    async disposeSession(request: IDocLayoutDisposeSessionRequest): Promise<void> {
        const session = this._sessions.get(request.unitId);
        if (session?.sessionEpoch !== request.sessionEpoch) {
            return;
        }
        this._disposeSession(request.unitId);
        this._performanceTracker.reset(request.unitId);
    }

    dispose(): void {
        for (const unitId of this._sessions.keys()) {
            this._disposeSession(unitId);
        }
        this._performanceTracker.resetAll();
    }

    private _getSession(unitId: string): IDocsLayoutWorkerSession {
        const session = this._sessions.get(unitId);
        if (session == null) {
            throw new Error(`Document layout Worker session not found for unit "${unitId}".`);
        }
        return session;
    }

    private _getLayoutMount(
        session: IDocsLayoutWorkerSession,
        request: IDocLayoutMountIdentity
    ): IDocsLayoutWorkerMount {
        const mount = session.layoutSessions.get(request.mountId);
        if (mount == null) {
            throw new Error(`Document layout Worker mount not found: "${request.mountId}".`);
        }
        if (
            mount.mountEpoch !== request.mountEpoch ||
            mount.viewportEpoch !== request.viewportEpoch
        ) {
            throw new Error(`Document layout Worker rejected a stale mount publication: "${request.mountId}".`);
        }
        return mount;
    }

    private async _runLayoutStep(
        session: IDocsLayoutWorkerSession,
        mount: IDocsLayoutWorkerMount,
        generation: number,
        budgetMs: number
    ): Promise<IDocLayoutStepResult> {
        const result = this._runWithCustomBlockViewports(session, mount, () => ({
            ...mount.layoutSession.step(generation, budgetMs, WORKER_LAYOUT_INTERRUPT_INTERVAL),
            unitId: session.dataModel.getUnitId(),
            mountId: mount.mountId,
            mountEpoch: mount.mountEpoch,
            viewportEpoch: mount.viewportEpoch,
            modelRevision: session.modelRevision,
            metricsRevision: mount.metricsRevision,
        }));
        await yieldForWorkerMessage();
        if (
            mount.activeGeneration === generation &&
            mount.cancelledGeneration !== generation
        ) {
            return result;
        }

        return this._runWithCustomBlockViewports(session, mount, () => ({
            ...mount.layoutSession.step(generation, 0, 1),
            unitId: session.dataModel.getUnitId(),
            mountId: mount.mountId,
            mountEpoch: mount.mountEpoch,
            viewportEpoch: mount.viewportEpoch,
            modelRevision: session.modelRevision,
            metricsRevision: mount.metricsRevision,
        }));
    }

    private _runWithCustomBlockViewports<T>(
        session: IDocsLayoutWorkerSession,
        mount: IDocsLayoutWorkerMount,
        run: () => T
    ): T {
        const unregister = setDocsCustomBlockRenderViewportProvider((unitId, blockId) =>
            unitId === session.dataModel.getUnitId() ? mount.customBlockViewports[blockId] : null
        );
        try {
            return run();
        } finally {
            unregister();
        }
    }

    private _disposeSession(unitId: string): void {
        const session = this._sessions.get(unitId);
        if (session == null) {
            return;
        }

        this._sessions.delete(unitId);
        for (const mount of session.layoutSessions.values()) {
            mount.activeGeneration = null;
            mount.layoutSession.dispose();
        }
        session.layoutSessions.clear();
        session.dataModel.dispose();
        session.localeService.dispose();
    }
}

export function startDocsLayoutWorker(): ChannelService {
    const performanceTracker = new DocsLayoutWorkerPerformanceTracker();
    const channelService = new ChannelService(createDocsLayoutWorkerMessageProtocol(performanceTracker));
    channelService.registerChannel(
        DOCS_LAYOUT_WORKER_CHANNEL,
        fromModule(new DocsLayoutWorkerRuntime(performanceTracker))
    );
    return channelService;
}
