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

import type {
    DocumentDataModel,
    ICustomRange,
    IDisposable,
    IDocumentBody,
    IDocumentData,
    ILanguagePack,
    JSONXActions,
    LocaleType,
    Nullable,
} from '@univerjs/core';
import type {
    IDocsCustomBlockRenderViewport,
    IDocumentLayoutPagePublication,
    IDocumentLayoutSessionStartOptions,
    IDocumentLayoutStepResult,
} from '@univerjs/engine-render';
import type { IRichTextEditingMutationParams } from '../commands/mutations/core-editing.mutation';
import {
    Disposable,

    DocumentFlavor,
    ICommandService,

    ILogService,
    Inject,
    isInternalEditorID,
    IUniverInstanceService,
    JSONX,

    LocaleService,

    requestImmediateMacroTask,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { getDocsCustomBlockRenderViewport } from '@univerjs/engine-render';
import { BehaviorSubject } from 'rxjs';
import { RICH_TEXT_EDITING_MUTATION_ID } from '../commands/mutations/core-editing.mutation-id';
import { createDocumentLayoutSnapshot } from './document-layout-snapshot';

export enum DocLayoutExecutorType {
    MAIN_THREAD = 'main-thread',
    WORKER = 'worker',
}

export enum DocLayoutSessionStatus {
    ACCEPTED = 'accepted',
    NOT_FOUND = 'not-found',
    RESNAPSHOT_REQUIRED = 'resnapshot-required',
    SUPERSEDED = 'superseded',
}

export enum DocLayoutExecutorState {
    UNREGISTERED = 'unregistered',
    INITIALIZING = 'initializing',
    ACTIVE = 'active',
    RECOVERING = 'recovering',
    FAILED = 'failed',
}

export interface IDocLayoutExecutorStatus {
    state: DocLayoutExecutorState;
    executor: DocLayoutExecutorType | null;
    diagnostic: string | null;
    recoveryUnitId: string | null;
}

export interface IDocLayoutPerformanceMetrics {
    hydrationMs: number[];
    mutationTransferMs: number[];
    patchTransferMs: number[];
    snapshotTransferMs: number[];
}

export interface IDocLayoutCreateSessionRequest {
    unitId: string;
    sessionEpoch: number;
    snapshot: IDocumentData;
    modelRevision: number;
    locale: LocaleType;
    localeData?: ILanguagePack;
    direction: 'ltr' | 'rtl';
}

export interface IDocLayoutDisposeSessionRequest {
    unitId: string;
    sessionEpoch: number;
}

export interface IDocLayoutMutationProjection {
    baseRevision: number;
    modelRevision: number;
    actions: JSONXActions;
}

export interface IDocLayoutMountIdentity {
    unitId: string;
    mountId: string;
    mountEpoch: number;
    viewportEpoch: number;
}

export interface IDocLayoutStartRequest extends IDocLayoutMountIdentity {
    metricsRevision: number;
    baseRevision: number;
    modelRevision: number;
    mutations: IDocLayoutMutationProjection[];
    reason: 'initial' | 'edit';
    anchor?: number;
    priorityAnchor?: number;
    invalidation?: IDocumentLayoutSessionStartOptions['invalidation'];
    customBlockViewports?: Record<string, IDocsCustomBlockRenderViewport>;
    customBlockViewportPatch?: IDocLayoutRecordPatch<IDocsCustomBlockRenderViewport>;
    customRangePresentations?: IDocLayoutCustomRangePresentationEntry[];
    customRangePresentationPatch?: IDocLayoutCustomRangePresentationPatch;
    budgetMs: number;
}

export interface IDocLayoutRecordPatch<T> {
    removals: string[];
    upserts: Record<string, T>;
}

export interface IDocLayoutCustomRangePresentation {
    active?: boolean;
    glyphAscentEm?: number;
    glyphDescentEm?: number;
    glyphWidthEm?: number;
    show?: boolean;
}

export interface IDocLayoutCustomRangePresentationEntry {
    segmentId: string;
    rangeId: string;
    presentation: IDocLayoutCustomRangePresentation;
}

export interface IDocLayoutCustomRangePresentationPatch {
    removals: Array<Pick<IDocLayoutCustomRangePresentationEntry, 'segmentId' | 'rangeId'>>;
    upserts: IDocLayoutCustomRangePresentationEntry[];
}

export interface IDocLayoutCustomRangePresentationContext {
    segmentId: string;
    body: IDocumentBody;
}

type DocLayoutCustomRangePresentationProvider = (
    unitId: string,
    range: ICustomRange,
    context: IDocLayoutCustomRangePresentationContext
) => IDocLayoutCustomRangePresentation | null | undefined;

export type IDocLayoutStartResult =
    | { status: DocLayoutSessionStatus.ACCEPTED; step: IDocLayoutStepResult }
    | { status: DocLayoutSessionStatus.NOT_FOUND }
    | { status: DocLayoutSessionStatus.SUPERSEDED }
    | { status: DocLayoutSessionStatus.RESNAPSHOT_REQUIRED; modelRevision: number };

export interface IDocLayoutStepRequest extends IDocLayoutMountIdentity {
    generation: number;
    budgetMs: number;
}

export interface IDocLayoutPageRequest extends IDocLayoutMountIdentity {
    pageIndex: number;
}

export interface IDocLayoutPageResult extends IDocLayoutMountIdentity {
    modelRevision: number;
    metricsRevision: number;
    page: IDocumentLayoutPagePublication | null;
}

export interface IDocLayoutCancelRequest extends IDocLayoutMountIdentity {
    generation?: number;
}

export type IDocLayoutDisposeMountRequest = IDocLayoutMountIdentity;

export interface IDocLayoutStepResult extends IDocumentLayoutStepResult, IDocLayoutMountIdentity {
    modelRevision: number;
    metricsRevision: number;
}

export interface IDocLayoutExecutor {
    readonly type: DocLayoutExecutorType;
    initialize(): Promise<void>;
    recover(): Promise<void>;
    /**
     * Capture the request synchronously before returning. The source document model remains mutable
     * while the returned promise tracks remote session creation.
     */
    createSession(request: IDocLayoutCreateSessionRequest): Promise<void>;
    startLayout(request: IDocLayoutStartRequest): Promise<IDocLayoutStartResult>;
    stepLayout(request: IDocLayoutStepRequest): Promise<IDocLayoutStepResult>;
    publishBacklog(request: Omit<IDocLayoutStepRequest, 'budgetMs'>): Promise<IDocLayoutStepResult>;
    getLayoutPage(request: IDocLayoutPageRequest): Promise<IDocLayoutPageResult>;
    cancelLayout(request: IDocLayoutCancelRequest): Promise<void>;
    getPerformanceMetrics(unitId: string): Promise<Omit<IDocLayoutPerformanceMetrics, 'hydrationMs'>>;
    resetPerformanceMetrics(unitId: string): Promise<void>;
    disposeLayoutMount(request: IDocLayoutDisposeMountRequest): Promise<void>;
    disposeSession(request: IDocLayoutDisposeSessionRequest): Promise<void>;
}

interface IDocLayoutManagedSession {
    sessionEpoch: number;
    modelRevision: number;
    sourceMutationRevision: number;
    workerRevision: number;
    pendingMutations: IDocLayoutMutationProjection[];
    latestStarts: Map<string, {
        startId: number;
        mountEpoch: number;
        viewportEpoch: number;
    }>;
    customBlockViewportsByMount: Map<string, {
        mountEpoch: number;
        value: Record<string, IDocsCustomBlockRenderViewport>;
    }>;
    customRangePresentations: Map<string, IDocLayoutCustomRangePresentationEntry> | null;
    queue: Promise<void>;
    needsResnapshot: boolean;
    disposed: boolean;
    cancelPendingCreateTask: (() => void) | null;
}

interface IDocLayoutProjectionPayload {
    request: Pick<
        IDocLayoutStartRequest,
        'customBlockViewports' |
        'customBlockViewportPatch' |
        'customRangePresentations' |
        'customRangePresentationPatch'
    >;
    customBlockViewports: Record<string, IDocsCustomBlockRenderViewport>;
    customRangePresentations: Map<string, IDocLayoutCustomRangePresentationEntry>;
}

function areShallowRecordsEqual(
    left: object,
    right: object
): boolean {
    const leftRecord = left as Record<string, unknown>;
    const rightRecord = right as Record<string, unknown>;
    const leftKeys = Object.keys(leftRecord);
    const rightKeys = Object.keys(rightRecord);
    return leftKeys.length === rightKeys.length && leftKeys.every((key) => leftRecord[key] === rightRecord[key]);
}

function createRecordPatch<T extends object>(
    previous: Record<string, T>,
    current: Record<string, T>
): IDocLayoutRecordPatch<T> {
    const upserts: Record<string, T> = {};
    const removals: string[] = [];
    for (const [key, value] of Object.entries(current)) {
        if (previous[key] == null || !areShallowRecordsEqual(previous[key], value)) {
            upserts[key] = value;
        }
    }
    for (const key of Object.keys(previous)) {
        if (current[key] == null) {
            removals.push(key);
        }
    }
    return { removals, upserts };
}

function getCustomRangePresentationKey(
    entry: Pick<IDocLayoutCustomRangePresentationEntry, 'segmentId' | 'rangeId'>
): string {
    return JSON.stringify([entry.segmentId, entry.rangeId]);
}

function toCustomRangePresentationMap(
    entries: IDocLayoutCustomRangePresentationEntry[]
): Map<string, IDocLayoutCustomRangePresentationEntry> {
    return new Map(entries.map((entry) => [getCustomRangePresentationKey(entry), entry]));
}

function createCustomRangePresentationPatch(
    previous: Map<string, IDocLayoutCustomRangePresentationEntry>,
    current: Map<string, IDocLayoutCustomRangePresentationEntry>
): IDocLayoutCustomRangePresentationPatch {
    const upserts: IDocLayoutCustomRangePresentationEntry[] = [];
    const removals: IDocLayoutCustomRangePresentationPatch['removals'] = [];
    for (const [key, entry] of current) {
        const previousEntry = previous.get(key);
        if (previousEntry == null || !areShallowRecordsEqual(previousEntry.presentation, entry.presentation)) {
            upserts.push(entry);
        }
    }
    for (const [key, entry] of previous) {
        if (!current.has(key)) {
            removals.push({ segmentId: entry.segmentId, rangeId: entry.rangeId });
        }
    }
    return { removals, upserts };
}

function isRichTextEditingMutationParams(value: unknown): value is IRichTextEditingMutationParams {
    return typeof value === 'object' && value != null &&
        'unitId' in value && typeof value.unitId === 'string' &&
        'actions' in value;
}

function collectCustomBlockViewports(dataModel: DocumentDataModel): Record<string, IDocsCustomBlockRenderViewport> {
    const snapshot = dataModel.getSnapshot();
    const documentStyle = snapshot.documentStyle;
    const viewports: Record<string, IDocsCustomBlockRenderViewport> = {};

    for (const customBlock of snapshot.body?.customBlocks ?? []) {
        const drawing = snapshot.drawings?.[customBlock.blockId];
        if (drawing == null) {
            continue;
        }

        const viewport = getDocsCustomBlockRenderViewport(dataModel.getUnitId(), customBlock.blockId, {
            fallbackHeight: drawing.docTransform.size.height ?? 0,
            fallbackWidth: drawing.docTransform.size.width ?? 0,
            pageMarginLeft: documentStyle.marginLeft,
            pageMarginRight: documentStyle.marginRight,
            pageWidth: documentStyle.pageSize?.width,
        });
        if (viewport != null) {
            viewports[customBlock.blockId] = { ...viewport };
        }
    }

    return viewports;
}

export interface IDocLayoutStartOptions {
    reason: 'initial' | 'edit';
    anchor?: number;
    priorityAnchor?: number;
    invalidation?: IDocumentLayoutSessionStartOptions['invalidation'];
}

export class DocLayoutExecutorService extends Disposable {
    private static readonly _performanceSampleLimit = 2048;
    private _executor: Nullable<IDocLayoutExecutor> = null;
    private _executorReady: Promise<void> | null = null;
    private _recoveryFailure: { diagnostic: string; unitId: string } | null = null;
    private _sessionEpoch = 0;
    private readonly _sessions = new Map<string, IDocLayoutManagedSession>();
    private readonly _hydrationSamples = new Map<string, number[]>();
    private readonly _customRangePresentationProviders = new Set<DocLayoutCustomRangePresentationProvider>();
    private readonly _executorStatus$ = new BehaviorSubject<IDocLayoutExecutorStatus>({
        state: DocLayoutExecutorState.UNREGISTERED,
        executor: null,
        diagnostic: null,
        recoveryUnitId: null,
    });

    readonly executorStatus$ = this._executorStatus$.asObservable();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @ILogService private readonly _logService: ILogService
    ) {
        super();

        this.disposeWithMe(
            this._univerInstanceService
                .getTypeOfUnitAdded$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
                .subscribe(({ unit }) => this._createSessionIfEligible(unit))
        );
        this.disposeWithMe(
            this._univerInstanceService
                .getTypeOfUnitDisposed$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
                .subscribe((unit) => this._disposeSession(unit.getUnitId()))
        );
        this.disposeWithMe(this._commandService.onCommandExecuted((command) => {
            if (command.id !== RICH_TEXT_EDITING_MUTATION_ID) {
                return;
            }

            const params = command.params;
            if (!isRichTextEditingMutationParams(params)) {
                this._logService.warn('[DocLayoutExecutorService]: ignored malformed document mutation parameters.');
                return;
            }
            this._enqueueCommittedMutation(params);
        }));
        this.disposeWithMe(this._localeService.localeChanged$.subscribe(() => {
            for (const unitId of this._sessions.keys()) {
                const dataModel = this._getEligibleModel(unitId);
                if (dataModel != null) {
                    this._replaceSession(dataModel).catch((error: unknown) => {
                        this._logService.error('[DocLayoutExecutorService]: failed to refresh Worker locale.', error);
                    });
                }
            }
        }));
    }

    register(executor: IDocLayoutExecutor): IDisposable {
        if (this._executor != null) {
            throw new Error('A document layout executor is already registered.');
        }

        this._executor = executor;
        this._recoveryFailure = null;
        this._executorStatus$.next({
            state: DocLayoutExecutorState.INITIALIZING,
            executor: executor.type,
            diagnostic: null,
            recoveryUnitId: null,
        });
        const executorReady = executor.initialize();
        this._executorReady = executorReady;
        executorReady.then(() => {
            if (this._executor === executor) {
                this._executorStatus$.next({
                    state: DocLayoutExecutorState.ACTIVE,
                    executor: executor.type,
                    diagnostic: null,
                    recoveryUnitId: null,
                });
            }
        }).catch((error: unknown) => {
            if (this._executor !== executor) {
                return;
            }
            this._executor = null;
            this._executorReady = null;
            this._disposeManagedSessions();
            this._sessions.clear();
            const diagnostic = error instanceof Error ? error.message : String(error);
            this._executorStatus$.next({
                state: DocLayoutExecutorState.FAILED,
                executor: executor.type,
                diagnostic,
                recoveryUnitId: null,
            });
            this._logService.error('[DocLayoutExecutorService]: document layout executor initialization failed.', error);
        });
        for (const unit of this._univerInstanceService.getAllUnitsForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)) {
            this._createSessionIfEligible(unit);
        }

        return toDisposable(() => {
            if (this._executor === executor) {
                this._executor = null;
                this._executorReady = null;
                this._disposeManagedSessions();
                this._sessions.clear();
                this._executorStatus$.next({
                    state: DocLayoutExecutorState.UNREGISTERED,
                    executor: null,
                    diagnostic: null,
                    recoveryUnitId: null,
                });
            }
        });
    }

    getExecutor(): Nullable<IDocLayoutExecutor> {
        return this._executor;
    }

    getExecutorStatus(): IDocLayoutExecutorStatus {
        return this._executorStatus$.value;
    }

    registerCustomRangePresentationProvider(provider: DocLayoutCustomRangePresentationProvider): IDisposable {
        this._customRangePresentationProviders.add(provider);
        return toDisposable(() => this._customRangePresentationProviders.delete(provider));
    }

    async getPerformanceMetrics(unitId: string): Promise<IDocLayoutPerformanceMetrics> {
        const executorMetrics = await this._executor?.getPerformanceMetrics(unitId);
        return {
            hydrationMs: [...(this._hydrationSamples.get(unitId) ?? [])],
            mutationTransferMs: [...(executorMetrics?.mutationTransferMs ?? [])],
            patchTransferMs: [...(executorMetrics?.patchTransferMs ?? [])],
            snapshotTransferMs: [...(executorMetrics?.snapshotTransferMs ?? [])],
        };
    }

    async resetPerformanceMetrics(unitId: string): Promise<void> {
        this._hydrationSamples.delete(unitId);
        await this._executor?.resetPerformanceMetrics(unitId);
    }

    recordHydrationDuration(unitId: string, durationMs: number): void {
        this._appendPerformanceSample(this._hydrationSamples, unitId, durationMs);
    }

    async recoverExecutor(unitId: string, diagnostic: string): Promise<void> {
        const executor = this._requireExecutor();
        this._executorStatus$.next({
            state: DocLayoutExecutorState.RECOVERING,
            executor: executor.type,
            diagnostic,
            recoveryUnitId: unitId,
        });
        for (const session of this._sessions.values()) {
            this._markSessionDisposed(session);
        }
        this._sessions.clear();
        this._hydrationSamples.clear();

        try {
            const executorReady = executor.recover();
            this._executorReady = executorReady;
            await executorReady;
        } catch (error) {
            const recoveryDiagnostic = error instanceof Error ? error.message : String(error);
            this._executor = null;
            this._executorReady = null;
            this._recoveryFailure = { diagnostic: recoveryDiagnostic, unitId };
            this._executorStatus$.next({
                state: DocLayoutExecutorState.RECOVERING,
                executor: executor.type,
                diagnostic: recoveryDiagnostic,
                recoveryUnitId: unitId,
            });
            throw error;
        }
    }

    completeRecovery(unitId: string): void {
        const status = this._executorStatus$.value;
        if (status.state !== DocLayoutExecutorState.RECOVERING || status.recoveryUnitId !== unitId) {
            return;
        }
        const recoveryFailure = this._recoveryFailure?.unitId === unitId
            ? this._recoveryFailure
            : null;
        this._recoveryFailure = null;
        this._executorStatus$.next({
            state: recoveryFailure == null ? DocLayoutExecutorState.ACTIVE : DocLayoutExecutorState.FAILED,
            executor: status.executor,
            diagnostic: recoveryFailure?.diagnostic ?? null,
            recoveryUnitId: null,
        });
    }

    async startLayout(
        identity: IDocLayoutMountIdentity,
        options: IDocLayoutStartOptions,
        budgetMs: number
    ): Promise<IDocLayoutStartResult | null> {
        const { unitId } = identity;
        const executor = this._executor;
        const dataModel = this._getEligibleModel(unitId);
        if (executor == null || dataModel == null) {
            return null;
        }

        let session = this._sessions.get(unitId);
        if (session != null && session.sourceMutationRevision !== dataModel.getMutationRevision()) {
            session.needsResnapshot = true;
        }
        if (session == null || session.needsResnapshot) {
            session = await this._replaceSession(dataModel);
        }

        let result = await this._startSynchronizedLayout(executor, session, identity, options, budgetMs);
        if (
            result.status === DocLayoutSessionStatus.NOT_FOUND ||
            result.status === DocLayoutSessionStatus.RESNAPSHOT_REQUIRED
        ) {
            session = await this._replaceSession(dataModel);
            result = await this._startSynchronizedLayout(executor, session, identity, options, budgetMs);
        }

        return result;
    }

    stepLayout(request: IDocLayoutStepRequest): Promise<IDocLayoutStepResult> {
        const executor = this._requireExecutor();
        return executor.stepLayout(request);
    }

    publishBacklog(request: Omit<IDocLayoutStepRequest, 'budgetMs'>): Promise<IDocLayoutStepResult> {
        const executor = this._requireExecutor();
        return executor.publishBacklog(request);
    }

    getLayoutPage(request: IDocLayoutPageRequest): Promise<IDocLayoutPageResult> {
        const executor = this._requireExecutor();
        return executor.getLayoutPage(request);
    }

    cancelLayout(request: IDocLayoutCancelRequest): Promise<void> {
        const executor = this._executor;
        return executor == null ? Promise.resolve() : executor.cancelLayout(request);
    }

    disposeLayoutMount(request: IDocLayoutDisposeMountRequest): Promise<void> {
        const executor = this._executor;
        const session = this._sessions.get(request.unitId);
        const latestStart = session?.latestStarts.get(request.mountId);
        if (
            latestStart?.mountEpoch === request.mountEpoch &&
            latestStart.viewportEpoch === request.viewportEpoch
        ) {
            session?.latestStarts.delete(request.mountId);
            session?.customBlockViewportsByMount.delete(request.mountId);
        }
        return executor == null ? Promise.resolve() : executor.disposeLayoutMount(request);
    }

    override dispose(): void {
        const executor = this._executor;
        if (executor != null) {
            for (const [unitId, session] of this._sessions) {
                this._markSessionDisposed(session);
                executor.disposeSession({ unitId, sessionEpoch: session.sessionEpoch }).catch((error: unknown) => {
                    this._logService.error('[DocLayoutExecutorService]: failed to dispose a Worker session.', error);
                });
            }
        }
        this._sessions.clear();
        this._executor = null;
        this._executorReady = null;
        this._recoveryFailure = null;
        this._executorStatus$.complete();
        this._customRangePresentationProviders.clear();
        super.dispose();
    }

    private _createSessionIfEligible(dataModel: DocumentDataModel): void {
        if (this._executor == null || !this._isEligible(dataModel) || this._sessions.has(dataModel.getUnitId())) {
            return;
        }

        this._replaceSession(dataModel).catch((error: unknown) => {
            this._logService.error('[DocLayoutExecutorService]: failed to create a Worker session.', error);
        });
    }

    private _enqueueCommittedMutation(params: IRichTextEditingMutationParams): void {
        const executor = this._executor;
        const dataModel = this._getEligibleModel(params.unitId);
        if (executor == null || dataModel == null) {
            return;
        }

        const session = this._sessions.get(params.unitId);
        if (session == null) {
            this._replaceSession(dataModel).catch((error: unknown) => {
                this._logService.error('[DocLayoutExecutorService]: failed to snapshot a document mutation.', error);
            });
            return;
        }

        if (JSONX.isNoop(params.actions)) {
            return;
        }
        const sourceMutationRevision = dataModel.getMutationRevision();
        if (sourceMutationRevision !== session.sourceMutationRevision + 1) {
            session.needsResnapshot = true;
            return;
        }

        const baseRevision = session.modelRevision;
        const modelRevision = baseRevision + 1;
        session.modelRevision = modelRevision;
        session.sourceMutationRevision = sourceMutationRevision;
        session.pendingMutations.push({
            baseRevision,
            modelRevision,
            actions: params.actions,
        });
    }

    private async _startSynchronizedLayout(
        executor: IDocLayoutExecutor,
        session: IDocLayoutManagedSession,
        identity: IDocLayoutMountIdentity,
        options: IDocLayoutStartOptions,
        budgetMs: number
    ): Promise<IDocLayoutStartResult> {
        const { unitId, mountId } = identity;
        const startId = (session.latestStarts.get(mountId)?.startId ?? 0) + 1;
        const startIdentity = {
            startId,
            mountEpoch: identity.mountEpoch,
            viewportEpoch: identity.viewportEpoch,
        };
        session.latestStarts.set(mountId, startIdentity);
        const startTask = session.queue.then(async () => {
            if (session.disposed || this._executor !== executor) {
                const result: IDocLayoutStartResult = { status: DocLayoutSessionStatus.NOT_FOUND };
                return result;
            }
            const currentModel = this._getEligibleModel(unitId);
            if (
                currentModel == null ||
                currentModel.getMutationRevision() !== session.sourceMutationRevision
            ) {
                session.needsResnapshot = true;
                const result: IDocLayoutStartResult = {
                    status: DocLayoutSessionStatus.RESNAPSHOT_REQUIRED,
                    modelRevision: session.workerRevision,
                };
                return result;
            }
            if (session.latestStarts.get(mountId) !== startIdentity) {
                const result: IDocLayoutStartResult = { status: DocLayoutSessionStatus.SUPERSEDED };
                return result;
            }

            const mutations = session.pendingMutations.slice();
            const projections = this._createLayoutProjectionPayload(
                session,
                identity,
                this._getRequiredModel(unitId)
            );
            const request: IDocLayoutStartRequest = {
                ...identity,
                metricsRevision: startId,
                baseRevision: session.workerRevision,
                modelRevision: session.modelRevision,
                mutations,
                ...projections.request,
                budgetMs,
                ...options,
            };
            const result = await executor.startLayout(request);
            if (result.status === DocLayoutSessionStatus.ACCEPTED) {
                session.workerRevision = request.modelRevision;
                session.pendingMutations.splice(0, mutations.length);
                session.customBlockViewportsByMount.set(mountId, {
                    mountEpoch: identity.mountEpoch,
                    value: projections.customBlockViewports,
                });
                session.customRangePresentations = projections.customRangePresentations;
            } else {
                session.needsResnapshot = true;
            }
            return result;
        });
        session.queue = startTask.then(
            () => undefined,
            (error: unknown) => {
                session.needsResnapshot = true;
                this._logService.error('[DocLayoutExecutorService]: synchronized layout start failed.', error);
            }
        );
        return startTask;
    }

    private _createLayoutProjectionPayload(
        session: IDocLayoutManagedSession,
        identity: IDocLayoutMountIdentity,
        dataModel: DocumentDataModel
    ): IDocLayoutProjectionPayload {
        const customBlockViewports = collectCustomBlockViewports(dataModel);
        const previousCustomBlockViewports = session.customBlockViewportsByMount.get(identity.mountId);
        const customRangePresentations = this._collectCustomRangePresentations(dataModel);
        const customRangePresentationMap = toCustomRangePresentationMap(customRangePresentations);
        const request: IDocLayoutProjectionPayload['request'] = {};
        if (previousCustomBlockViewports == null || previousCustomBlockViewports.mountEpoch !== identity.mountEpoch) {
            request.customBlockViewports = customBlockViewports;
        } else {
            const patch = createRecordPatch(previousCustomBlockViewports.value, customBlockViewports);
            if (patch.removals.length > 0 || Object.keys(patch.upserts).length > 0) {
                request.customBlockViewportPatch = patch;
            }
        }
        if (session.customRangePresentations == null) {
            request.customRangePresentations = customRangePresentations;
        } else {
            const patch = createCustomRangePresentationPatch(
                session.customRangePresentations,
                customRangePresentationMap
            );
            if (patch.removals.length > 0 || patch.upserts.length > 0) {
                request.customRangePresentationPatch = patch;
            }
        }
        return { request, customBlockViewports, customRangePresentations: customRangePresentationMap };
    }

    private async _replaceSession(dataModel: DocumentDataModel): Promise<IDocLayoutManagedSession> {
        const executor = this._requireExecutor();
        const unitId = dataModel.getUnitId();
        const previous = this._sessions.get(unitId);
        if (previous != null) {
            this._markSessionDisposed(previous);
        }

        const modelRevision = previous?.modelRevision ?? 0;
        const session: IDocLayoutManagedSession = {
            sessionEpoch: ++this._sessionEpoch,
            modelRevision,
            sourceMutationRevision: dataModel.getMutationRevision(),
            workerRevision: modelRevision,
            pendingMutations: [],
            latestStarts: new Map(),
            customBlockViewportsByMount: new Map(),
            customRangePresentations: null,
            queue: Promise.resolve(),
            needsResnapshot: false,
            disposed: false,
            cancelPendingCreateTask: null,
        };
        const createTask = this._createSessionOnNextMacroTask(executor, session, dataModel);
        session.queue = createTask;
        this._sessions.set(unitId, session);
        try {
            await createTask;
        } catch (error) {
            session.needsResnapshot = true;
            throw error;
        }
        return session;
    }

    private _disposeSession(unitId: string): void {
        const session = this._sessions.get(unitId);
        if (session == null) {
            return;
        }

        this._markSessionDisposed(session);
        this._sessions.delete(unitId);
        this._hydrationSamples.delete(unitId);
        this._executor?.disposeSession({ unitId, sessionEpoch: session.sessionEpoch }).catch((error: unknown) => {
            this._logService.error('[DocLayoutExecutorService]: failed to dispose a Worker session.', error);
        });
    }

    private _getEligibleModel(unitId: string): Nullable<DocumentDataModel> {
        const dataModel = this._univerInstanceService.getUnit<DocumentDataModel>(
            unitId,
            UniverInstanceType.UNIVER_DOC
        );
        return dataModel != null && this._isEligible(dataModel) ? dataModel : null;
    }

    private _getRequiredModel(unitId: string): DocumentDataModel {
        const dataModel = this._getEligibleModel(unitId);
        if (dataModel == null) {
            throw new Error(`Eligible document model not found for Worker layout: "${unitId}".`);
        }
        return dataModel;
    }

    private _collectCustomRangePresentations(
        dataModel: DocumentDataModel
    ): IDocLayoutCustomRangePresentationEntry[] {
        const presentations: IDocLayoutCustomRangePresentationEntry[] = [];
        const providers = Array.from(this._customRangePresentationProviders).reverse();
        if (providers.length === 0) {
            return presentations;
        }

        const collectSegment = (segmentId: string, body: IDocumentBody | null | undefined): void => {
            if (body == null) {
                return;
            }
            const seenRangeIds = new Set<string>();
            for (const range of body.customRanges ?? []) {
                if (seenRangeIds.has(range.rangeId)) {
                    continue;
                }
                seenRangeIds.add(range.rangeId);
                for (const provider of providers) {
                    const presentation = provider(dataModel.getUnitId(), range, { segmentId, body });
                    if (presentation != null) {
                        presentations.push({
                            segmentId,
                            rangeId: range.rangeId,
                            presentation: { ...presentation },
                        });
                        break;
                    }
                }
            }
        };
        collectSegment('', dataModel.getBody());
        for (const [segmentId, headerModel] of dataModel.headerModelMap) {
            collectSegment(segmentId, headerModel.getBody());
        }
        for (const [segmentId, footerModel] of dataModel.footerModelMap) {
            collectSegment(segmentId, footerModel.getBody());
        }

        return presentations;
    }

    private _isEligible(dataModel: DocumentDataModel): boolean {
        if (isInternalEditorID(dataModel.getUnitId())) {
            return false;
        }

        const flavor = dataModel.getSnapshot().documentStyle.documentFlavor;
        return flavor === DocumentFlavor.TRADITIONAL || flavor === DocumentFlavor.MODERN;
    }

    private _requireExecutor(): IDocLayoutExecutor {
        if (this._executor == null) {
            throw new Error('No document layout executor is registered.');
        }
        return this._executor;
    }

    private _appendPerformanceSample(target: Map<string, number[]>, unitId: string, durationMs: number): void {
        const samples = target.get(unitId) ?? [];
        samples.push(durationMs);
        if (samples.length > DocLayoutExecutorService._performanceSampleLimit) {
            samples.splice(0, samples.length - DocLayoutExecutorService._performanceSampleLimit);
        }
        target.set(unitId, samples);
    }

    private _createSessionOnNextMacroTask(
        executor: IDocLayoutExecutor,
        session: IDocLayoutManagedSession,
        dataModel: DocumentDataModel
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const cancelTask = requestImmediateMacroTask(() => {
                session.cancelPendingCreateTask = null;
                const unitId = dataModel.getUnitId();
                if (
                    session.disposed ||
                    this._executor !== executor ||
                    this._sessions.get(unitId) !== session
                ) {
                    resolve();
                    return;
                }

                const executorReady = this._executorReady;
                if (executorReady == null) {
                    resolve();
                    return;
                }
                executorReady.then(() => {
                    if (
                        session.disposed ||
                        this._executor !== executor ||
                        this._sessions.get(unitId) !== session ||
                        this._getEligibleModel(unitId) !== dataModel
                    ) {
                        resolve();
                        return;
                    }

                    // Mutations committed before the deferred transfer are already present in the
                    // live model snapshot. Fold them into the baseline instead of replaying them.
                    session.sourceMutationRevision = dataModel.getMutationRevision();
                    session.workerRevision = session.modelRevision;
                    session.pendingMutations.length = 0;
                    const request: IDocLayoutCreateSessionRequest = {
                        unitId,
                        sessionEpoch: session.sessionEpoch,
                        snapshot: createDocumentLayoutSnapshot(dataModel.getSnapshot()),
                        modelRevision: session.modelRevision,
                        locale: this._localeService.getCurrentLocale(),
                        localeData: this._localeService.getLocales(),
                        direction: this._localeService.getDirection(),
                    };
                    executor.createSession(request).then(resolve, reject);
                }, reject);
            });
            session.cancelPendingCreateTask = () => {
                cancelTask();
                session.cancelPendingCreateTask = null;
                resolve();
            };
        });
    }

    private _markSessionDisposed(session: IDocLayoutManagedSession): void {
        session.disposed = true;
        session.cancelPendingCreateTask?.();
        session.cancelPendingCreateTask = null;
    }

    private _disposeManagedSessions(): void {
        for (const session of this._sessions.values()) {
            this._markSessionDisposed(session);
        }
    }
}
