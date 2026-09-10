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

import type { IMessageProtocol } from '@univerjs/rpc';
import type { IDocLayoutCancelRequest, IDocLayoutCreateSessionRequest, IDocLayoutDisposeMountRequest, IDocLayoutDisposeSessionRequest, IDocLayoutExecutor, IDocLayoutPageRequest, IDocLayoutPageResult, IDocLayoutPerformanceMetrics, IDocLayoutStartRequest, IDocLayoutStartResult, IDocLayoutStepRequest, IDocLayoutStepResult } from '../services/doc-layout-executor.service';
import type { IDocsLayoutFontFace, IUniverDocsLayoutWorkerConfig } from './config/config';
import type { IDocsLayoutWorkerCapabilities, IDocsLayoutWorkerRuntime } from './protocol';
import { DependentOn, Disposable, IConfigService, Inject, Injector, merge, Plugin, Tools } from '@univerjs/core';
import { FontCache } from '@univerjs/engine-render';
import { ChannelService, toModule } from '@univerjs/rpc';
import { Observable, shareReplay } from 'rxjs';
import pkg from '../../package.json';
import { UniverDocsPlugin } from '../plugin';
import { DocLayoutExecutorService, DocLayoutExecutorType } from '../services/doc-layout-executor.service';
import { DEFAULT_DOCS_LAYOUT_WORKER_REQUEST_TIMEOUT_MS, defaultPluginDocsLayoutWorkerConfig, DOCS_LAYOUT_WORKER_PLUGIN_CONFIG_KEY } from './config/config';
import { collectDocumentFontFamilies, measureDocumentFontFamilies } from './document-font-metrics';
import { DocsLayoutFontLoader } from './font-loader';
import { DocsLayoutWorkerPerformanceTracker } from './performance-tracker';
import { DOCS_LAYOUT_WORKER_CHANNEL, DOCS_LAYOUT_WORKER_PROTOCOL_VERSION } from './protocol';
import { startDocsLayoutWorker } from './worker';

const FONT_METRICS_TOLERANCE = 1;

export class DocsLayoutWorkerCapabilityError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DocsLayoutWorkerCapabilityError';
    }
}

function createDocsLayoutWorkerMessageProtocol(
    worker: Worker,
    performanceTracker: DocsLayoutWorkerPerformanceTracker
): IMessageProtocol {
    return {
        send(message: unknown): void {
            const startedAt = Tools.now();
            worker.postMessage(message);
            performanceTracker.recordRequest(message, Tools.now() - startedAt);
        },
        onMessage: new Observable<unknown>((subscriber) => {
            const handler = (event: MessageEvent) => subscriber.next(event.data);
            worker.addEventListener('message', handler);
            return () => worker.removeEventListener('message', handler);
        }).pipe(shareReplay({ bufferSize: 1, refCount: true })),
    };
}

export class DocsLayoutWorkerClientService extends Disposable implements IDocLayoutExecutor {
    readonly type = DocLayoutExecutorType.WORKER;
    private _worker: Worker | null = null;
    private _channelService: ChannelService | null = null;
    private _runtime: IDocsLayoutWorkerRuntime | null = null;
    private _initialization: Promise<void>;
    private _initialized = false;
    private readonly _performanceTracker = new DocsLayoutWorkerPerformanceTracker();
    private readonly _fontFamilies = new Map<string, Set<string>>();
    private readonly _fontLoader = new DocsLayoutFontLoader();

    constructor(
        private readonly _workerFactory: () => Worker,
        private readonly _requestTimeoutMs = DEFAULT_DOCS_LAYOUT_WORKER_REQUEST_TIMEOUT_MS,
        private readonly _fontFaces: IDocsLayoutFontFace[] = []
    ) {
        super();
        this.disposeWithMe(this._fontLoader);
        this._initialization = this._replaceRuntime();
    }

    initialize(): Promise<void> {
        return this._initialization;
    }

    get renderingFontsReady(): Promise<void> | undefined {
        return this._fontFaces.length > 0 ? this._initialization : undefined;
    }

    async getCapabilities(): Promise<IDocsLayoutWorkerCapabilities> {
        await this._initialization;
        return this._getRuntime().getCapabilities();
    }

    async recover(): Promise<void> {
        this._initialization = this._replaceRuntime();
        await this._initialization;
    }

    createSession(request: IDocLayoutCreateSessionRequest): Promise<void> {
        const families = new Set<string>();
        collectDocumentFontFamilies(request.snapshot, families);
        this._fontFamilies.set(request.unitId, families);
        const measuredRequest = { ...request, normalFontLineHeights: measureDocumentFontFamilies(families) };
        if (this._initialized) {
            return this._withTimeout(this._getRuntime().createSession(measuredRequest), 'create session');
        }

        const capturedRequest = Tools.deepClone(measuredRequest);
        return this._initialization.then(() =>
            this._withTimeout(this._getRuntime().createSession(capturedRequest), 'create session'));
    }

    async startLayout(request: IDocLayoutStartRequest): Promise<IDocLayoutStartResult> {
        await this._initialization;
        const families = this._fontFamilies.get(request.unitId);
        if (families != null) {
            collectDocumentFontFamilies(request.mutations, families);
        }
        const measuredRequest = families == null
            ? request
            : { ...request, normalFontLineHeights: measureDocumentFontFamilies(families) };
        return this._withTimeout(this._getRuntime().startLayout(measuredRequest), 'start layout');
    }

    async stepLayout(request: IDocLayoutStepRequest): Promise<IDocLayoutStepResult> {
        await this._initialization;
        return this._withTimeout(this._getRuntime().stepLayout(request), 'step layout');
    }

    async publishBacklog(request: Omit<IDocLayoutStepRequest, 'budgetMs'>): Promise<IDocLayoutStepResult> {
        await this._initialization;
        return this._withTimeout(this._getRuntime().publishBacklog(request), 'publish layout backlog');
    }

    async getLayoutPage(request: IDocLayoutPageRequest): Promise<IDocLayoutPageResult> {
        await this._initialization;
        return this._withTimeout(this._getRuntime().getLayoutPage(request), 'get layout page');
    }

    async cancelLayout(request: IDocLayoutCancelRequest): Promise<void> {
        await this._initialization;
        return this._withTimeout(this._getRuntime().cancelLayout(request), 'cancel layout');
    }

    async getPerformanceMetrics(
        unitId: string
    ): Promise<Omit<IDocLayoutPerformanceMetrics, 'hydrationMs'>> {
        await this._initialization;
        const workerMetrics = await this._withTimeout(
            this._getRuntime().getPerformanceMetrics(unitId),
            'read performance metrics'
        );
        const clientMetrics = this._performanceTracker.getMetrics(unitId);
        return {
            mutationTransferMs: clientMetrics.mutationTransferMs,
            patchTransferMs: workerMetrics.patchTransferMs,
            snapshotTransferMs: clientMetrics.snapshotTransferMs,
        };
    }

    async resetPerformanceMetrics(unitId: string): Promise<void> {
        await this._initialization;
        await this._withTimeout(
            this._getRuntime().resetPerformanceMetrics(unitId),
            'reset performance metrics'
        );
        this._performanceTracker.reset(unitId);
    }

    async disposeLayoutMount(request: IDocLayoutDisposeMountRequest): Promise<void> {
        await this._initialization;
        return this._withTimeout(this._getRuntime().disposeLayoutMount(request), 'dispose layout mount');
    }

    async disposeSession(request: IDocLayoutDisposeSessionRequest): Promise<void> {
        await this._initialization;
        await this._withTimeout(this._getRuntime().disposeSession(request), 'dispose session');
        this._performanceTracker.reset(request.unitId);
        this._fontFamilies.delete(request.unitId);
    }

    override dispose(): void {
        this._disposeRuntime();
        super.dispose();
    }

    private async _replaceRuntime(): Promise<void> {
        this._initialized = false;
        this._disposeRuntime();
        await this._withTimeout(this._fontLoader.load(this._fontFaces), 'load rendering fonts');
        this.ensureNotDisposed();
        const worker = this._workerFactory();
        const channelService = new ChannelService(createDocsLayoutWorkerMessageProtocol(worker, this._performanceTracker));
        this._worker = worker;
        this._channelService = channelService;
        this._runtime = toModule<IDocsLayoutWorkerRuntime>(
            channelService.requestChannel(DOCS_LAYOUT_WORKER_CHANNEL)
        );
        try {
            await this._withTimeout(this._runtime.initialize(this._fontFaces), 'load Worker fonts');
            await this._withTimeout(this._verifyCapabilities(), 'verify capabilities');
            this.ensureNotDisposed();
            this._initialized = true;
        } catch (error) {
            if (this._worker === worker) {
                this._disposeRuntime();
            }
            throw error;
        }
    }

    private _disposeRuntime(): void {
        this._fontFamilies.clear();
        this._initialized = false;
        this._channelService?.dispose();
        this._channelService = null;
        this._runtime = null;
        this._worker?.terminate();
        this._worker = null;
        this._performanceTracker.resetAll();
    }

    private _getRuntime(): IDocsLayoutWorkerRuntime {
        if (this._runtime == null) {
            throw new Error('Document layout Worker runtime is unavailable.');
        }
        return this._runtime;
    }

    private _withTimeout<T>(task: Promise<T>, operation: string): Promise<T> {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        const timeout = new Promise<never>((_resolve, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error(`Document layout Worker timed out while attempting to ${operation}.`));
            }, this._requestTimeoutMs);
        });
        return Promise.race([task, timeout]).finally(() => {
            if (timeoutId != null) {
                clearTimeout(timeoutId);
            }
        });
    }

    private async _verifyCapabilities(): Promise<void> {
        const capabilities = await this._getRuntime().getCapabilities();
        if (capabilities.protocolVersion !== DOCS_LAYOUT_WORKER_PROTOCOL_VERSION) {
            throw new DocsLayoutWorkerCapabilityError('Document layout Worker protocol version mismatch.');
        }
        if (!capabilities.offscreenCanvas || !capabilities.structuredClone) {
            throw new DocsLayoutWorkerCapabilityError(
                'Document layout Worker requires OffscreenCanvas and structured clone support.'
            );
        }

        const mainMetrics = FontCache.getMeasureText(
            capabilities.fontProbe.content,
            capabilities.fontProbe.font
        );
        const metricPairs = [
            [mainMetrics.width, capabilities.fontProbe.width],
            [mainMetrics.actualBoundingBoxAscent, capabilities.fontProbe.actualBoundingBoxAscent],
            [mainMetrics.actualBoundingBoxDescent, capabilities.fontProbe.actualBoundingBoxDescent],
        ];
        if (metricPairs.some(([mainValue, workerValue]) =>
            !Number.isFinite(mainValue) ||
            !Number.isFinite(workerValue) ||
            Math.abs(mainValue - workerValue) > FONT_METRICS_TOLERANCE
        )) {
            throw new DocsLayoutWorkerCapabilityError(
                'Document layout Worker font metrics differ from the main rendering context.'
            );
        }
    }
}

@DependentOn(UniverDocsPlugin)
export class UniverDocsLayoutWorkerPlugin extends Plugin {
    static override pluginName = 'DOCS_LAYOUT_WORKER_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;

    constructor(
        private readonly _config: Partial<IUniverDocsLayoutWorkerConfig> = defaultPluginDocsLayoutWorkerConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(DocLayoutExecutorService) private readonly _layoutExecutorService: DocLayoutExecutorService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        const { ...rest } = merge(
            {},
            defaultPluginDocsLayoutWorkerConfig,
            this._config
        );
        this._configService.setConfig(DOCS_LAYOUT_WORKER_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        if (typeof this._config.workerFactory !== 'function') {
            throw new TypeError('[UniverDocsLayoutWorkerPlugin]: workerFactory is required.');
        }
        const requestTimeoutMs = this._config.requestTimeoutMs ?? DEFAULT_DOCS_LAYOUT_WORKER_REQUEST_TIMEOUT_MS;
        if (!Number.isFinite(requestTimeoutMs) || requestTimeoutMs <= 0) {
            throw new RangeError('[UniverDocsLayoutWorkerPlugin]: requestTimeoutMs must be a positive finite number.');
        }

        const client = new DocsLayoutWorkerClientService(this._config.workerFactory, requestTimeoutMs, this._config.fontFaces);
        this._injector.add([DocsLayoutWorkerClientService, { useValue: client }]);
        this.disposeWithMe(client);
        this.disposeWithMe(this._layoutExecutorService.register(client));
    }
}

export type { IUniverDocsLayoutWorkerConfig } from './config/config';
export type { IDocsLayoutWorkerCapabilities, IDocsLayoutWorkerFontProbe, IDocsLayoutWorkerRuntime } from './protocol';
export { startDocsLayoutWorker };
