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

import type { IDisposable } from '@univerjs/core';
import type { EmbedLayout, IEmbedDescriptor } from '@univerjs/embed';
import type { IEmbedChildContainerContext, IEmbedContainerContext, IEmbedHostContainerContribution, IEmbedHostMountResult, IEmbedMountSession, IEmbedRenderScope } from '../types/embed-ui';
import { FOCUSING_DOC, FOCUSING_SHEET, FOCUSING_SLIDE, FOCUSING_UNIT, IContextService, Inject, Injector, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { EmbedFocusOwnerService } from '@univerjs/embed';
import { BehaviorSubject } from 'rxjs';
import { EMBED_CANVAS_ROOT_ATTRIBUTE, EMBED_CONTENT_ROOT_ATTRIBUTE, EMBED_OVERLAY_ROOT_ATTRIBUTE, EMBED_POPUP_ROOT_ATTRIBUTE, ensureEmbedDefaultRuntimeSlots, findEmbedRuntimeSlot } from '../common/embed-runtime-slots';
import { createEmbedChildRuntimeScope } from './embed-child-runtime-scope';
import { EmbedChildViewRegistryService } from './embed-child-view-registry.service';
import { EmbedFloatingActiveService } from './embed-floating-active.service';
import { EmbedFloatingMenuRegistryService } from './embed-floating-menu-registry.service';
import { EmbedHostContainerRegistryService } from './embed-host-container-registry.service';
import { EmbedInteractionBoundaryService } from './embed-interaction-boundary.service';
import { EmbedOverlayRootService } from './embed-overlay-root.service';
import { EmbedRuntimeFocusCoordinator } from './embed-runtime-focus-coordinator.service';
import { EmbedSceneCanvasCaptureService } from './embed-scene-canvas-capture.service';

export const EMBED_DUPLICATE_CHILD_UNIT_ERROR_CODE = 'EMBED_DUPLICATE_CHILD_UNIT';

export class EmbedDuplicateChildUnitError extends Error {
    readonly code = EMBED_DUPLICATE_CHILD_UNIT_ERROR_CODE;

    constructor(
        readonly childUnitId: string,
        readonly existingEmbedId: string
    ) {
        super(`${EMBED_DUPLICATE_CHILD_UNIT_ERROR_CODE}: ${childUnitId}`);
        this.name = 'EmbedDuplicateChildUnitError';
    }
}

export class EmbedMountService {
    private readonly _sessions = new Map<string, {
        session: IEmbedMountSession;
        disposables: IDisposable[];
        setActive: (active: boolean) => void;
    }>();

    constructor(
        @Inject(EmbedHostContainerRegistryService)
        private readonly _hostContainerRegistry: EmbedHostContainerRegistryService,
        @Inject(EmbedChildViewRegistryService)
        private readonly _childViewRegistry: EmbedChildViewRegistryService,
        @Inject(EmbedOverlayRootService)
        private readonly _overlayRootService: EmbedOverlayRootService,
        @Inject(EmbedSceneCanvasCaptureService)
        private readonly _sceneCanvasCaptureService: EmbedSceneCanvasCaptureService,
        @Inject(Injector)
        private readonly _injector: Injector
    ) {
        // noop
    }

    mount(descriptor: IEmbedDescriptor): IEmbedMountSession {
        return this._mountResolvedHost(descriptor);
    }

    mountIntoHostElement(descriptor: IEmbedDescriptor, hostElement: HTMLElement, runtimeRoots?: IEmbedHostMountResult['runtimeRoots']): IEmbedMountSession {
        return this._mountResolvedHost(descriptor, { hostElement, runtimeRoots });
    }

    private _mountResolvedHost(
        descriptor: IEmbedDescriptor,
        resolvedHost?: IEmbedHostMountResult
    ): IEmbedMountSession {
        if (!descriptor.childUnitId || descriptor.childType == null) {
            throw new Error('EMBED_MOUNT_CHILD_NOT_RESOLVED');
        }

        this._assertChildUnitAvailable(descriptor);

        const layout = this._resolveLayout(descriptor);
        const hostContribution = this._hostContainerRegistry.get(descriptor.hostType, descriptor.entry);
        if (!hostContribution || !this._hostContainerRegistry.supports(descriptor.hostType, descriptor.entry, layout)) {
            throw new Error('EMBED_MOUNT_HOST_NOT_REGISTERED');
        }

        const childContribution = this._childViewRegistry.get(descriptor.childType);
        if (!childContribution?.supportedLayouts.includes(layout)) {
            throw new Error('EMBED_MOUNT_CHILD_NOT_REGISTERED');
        }

        this.unmount(descriptor.embedId);

        const context: IEmbedContainerContext = {
            descriptor,
            layout,
            injector: this._injector,
            hostUnitId: descriptor.hostUnitId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId,
            childType: descriptor.childType,
        };
        const disposables: IDisposable[] = [];
        const hostMountResult = resolvedHost ?? hostContribution.mount?.(context);
        const normalizedHostMountResult = this._normalizeHostMountResult(hostMountResult);
        if (normalizedHostMountResult.disposable) {
            disposables.push(normalizedHostMountResult.disposable);
        }

        context.hostElement = normalizedHostMountResult.hostElement ?? context.hostElement;
        context.container = context.hostElement;
        if (!context.hostElement || !context.container) {
            [...disposables].reverse().forEach((disposable) => disposable.dispose());
            throw new Error('EMBED_MOUNT_HOST_CONTAINER_NOT_RESOLVED');
        }
        if (!normalizedHostMountResult.runtimeRoots) {
            disposables.push(ensureEmbedDefaultRuntimeSlots(context.hostElement));
        }

        const { renderScope, disposable: renderScopeDisposable, setActive } = this._createRenderScope(
            descriptor,
            layout,
            context.hostElement,
            normalizedHostMountResult.runtimeRoots
        );
        disposables.push(renderScopeDisposable);
        const childContextBase: Omit<IEmbedChildContainerContext, 'runtimeScope'> = {
            ...context,
            hostElement: context.hostElement,
            container: context.container,
            renderScope,
        };
        const { runtimeScope, disposable: runtimeScopeDisposable } = createEmbedChildRuntimeScope(childContextBase, setActive);
        const childContext: IEmbedChildContainerContext = {
            ...childContextBase,
            runtimeScope,
        };
        disposables.push(runtimeScopeDisposable);
        const runtimeBoundaryDisposable = this._registerRuntimeBoundary(descriptor, context.hostElement, renderScope, runtimeScope.roots);
        if (runtimeBoundaryDisposable) {
            disposables.push(runtimeBoundaryDisposable);
        }
        if (this._injector.has(EmbedRuntimeFocusCoordinator)) {
            disposables.push(this._injector.get(EmbedRuntimeFocusCoordinator).registerRuntimeScope({
                embedId: descriptor.embedId,
                hostUnitId: descriptor.hostUnitId,
                childUnitId: descriptor.childUnitId,
                childType: descriptor.childType,
            }));
        }
        disposables.push(this._registerChildFocusBridge(descriptor, context.hostElement, renderScope.mode, runtimeScope.instanceService));
        disposables.push(this._sceneCanvasCaptureService.registerContext(childContext));
        const restoreFocusAfterMount = this._createMountFocusRestorer(descriptor);
        const childDisposable = childContribution.mount?.(childContext);
        if (childDisposable) {
            disposables.push(childDisposable);
        }
        disposables.push(restoreFocusAfterMount);
        if (renderScope.mode === 'float') {
            const floatingMenuDisposable = this._mountFloatingMenu(childContext);
            if (floatingMenuDisposable) {
                disposables.push(floatingMenuDisposable);
            }
        }

        const session: IEmbedMountSession = {
            hostUnitId: descriptor.hostUnitId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId,
            childType: descriptor.childType,
            entry: descriptor.entry,
            layout,
            hostElement: context.hostElement,
            context: childContext,
        };
        this._sessions.set(descriptor.embedId, { session, disposables, setActive });
        if (layout !== 'tab-peer') {
            this._initializeFloatingSessionActiveState(descriptor, layout, setActive);
        }
        return session;
    }

    private _initializeFloatingSessionActiveState(
        descriptor: IEmbedDescriptor,
        layout: EmbedLayout,
        setActive: (active: boolean) => void
    ): void {
        if (layout === 'tab-peer') {
            return;
        }

        if (this._injector.has(EmbedFocusOwnerService)) {
            const owner = this._injector.get(EmbedFocusOwnerService).getFocusOwner();
            if (owner?.hostUnitId === descriptor.hostUnitId) {
                setActive(owner.embedId === descriptor.embedId);
                return;
            }
        }

        setActive(false);
    }

    unmount(embedId: string): void {
        const current = this._sessions.get(embedId);
        if (!current) {
            return;
        }

        [...current.disposables].reverse().forEach((disposable) => disposable.dispose());
        this._sessions.delete(embedId);
    }

    getSession(embedId: string): IEmbedMountSession | undefined {
        return this._sessions.get(embedId)?.session;
    }

    listSessions(): IEmbedMountSession[] {
        return [...this._sessions.values()].map(({ session }) => session);
    }

    activateSession(embedId: string): void {
        const current = this._sessions.get(embedId);
        if (!current) {
            return;
        }

        if (current.session.layout !== 'tab-peer') {
            this._sessions.forEach((entry) => {
                if (entry.session.layout === 'tab-peer' || entry.session.hostUnitId !== current.session.hostUnitId) {
                    return;
                }

                entry.setActive(entry.session.embedId === embedId);
            });
            return;
        }

        this._focusTabPeerSession(current.session);
        this._sessions.forEach((entry) => {
            if (entry.session.layout !== 'tab-peer' || entry.session.hostUnitId !== current.session.hostUnitId) {
                return;
            }

            entry.setActive(entry.session.embedId === embedId);
        });
    }

    deactivateTabSessions(embedId?: string): IEmbedMountSession[] {
        const deactivatedSessions: IEmbedMountSession[] = [];

        this._sessions.forEach((entry) => {
            if (entry.session.layout !== 'tab-peer') {
                return;
            }

            if (embedId && entry.session.embedId !== embedId) {
                return;
            }

            entry.setActive(false);
            deactivatedSessions.push(entry.session);
        });

        return deactivatedSessions;
    }

    setActive(embedId: string, active: boolean): void {
        this._sessions.get(embedId)?.setActive(active);
    }

    private _resolveLayout(descriptor: IEmbedDescriptor): EmbedLayout {
        const floatingConfig = descriptor.sourceMeta?.floating || undefined;
        if (floatingConfig?.layout) {
            return floatingConfig.layout;
        }

        const tabConfig = descriptor.sourceMeta?.tab || undefined;
        if (tabConfig?.enabled) {
            return 'tab-peer';
        }

        throw new Error('EMBED_MOUNT_LAYOUT_NOT_RESOLVED');
    }

    private _createRenderScope(
        descriptor: IEmbedDescriptor,
        layout: EmbedLayout,
        rootElement: HTMLElement,
        runtimeRoots?: IEmbedHostMountResult['runtimeRoots']
    ): { renderScope: IEmbedRenderScope; disposable: IDisposable; setActive: (active: boolean) => void } {
        const active$ = new BehaviorSubject(true);
        const hostAnchorId = descriptor.hostAnchorId;
        const tabConfig = descriptor.sourceMeta?.tab;
        const mode = tabConfig && tabConfig.enabled
            ? 'tab'
            : descriptor.sourceMeta?.floating
                ? 'float'
                : 'inline';

        const contentRoot = runtimeRoots?.content ?? findEmbedRuntimeSlot(rootElement, EMBED_CONTENT_ROOT_ATTRIBUTE) ?? rootElement;
        const canvasRoot = runtimeRoots?.canvas ?? findEmbedRuntimeSlot(rootElement, EMBED_CANVAS_ROOT_ATTRIBUTE) ?? rootElement;
        const overlayRoot = runtimeRoots?.overlay ?? findEmbedRuntimeSlot(rootElement, EMBED_OVERLAY_ROOT_ATTRIBUTE) ?? rootElement;
        const popupRoot = runtimeRoots?.popup ?? findEmbedRuntimeSlot(rootElement, EMBED_POPUP_ROOT_ATTRIBUTE) ?? overlayRoot;
        const overlayRootDisposable = this._overlayRootService.register({
            childUnitId: descriptor.childUnitId!,
            embedId: descriptor.embedId,
            hostAnchorId,
            root: overlayRoot,
        });
        const setActive = (active: boolean) => {
            if (active$.getValue() === active) {
                return;
            }

            applyRenderScopeActiveState(rootElement, active, mode);
            active$.next(active);
        };
        applyRenderScopeActiveState(rootElement, true, mode);

        return {
            renderScope: {
                hostUnitId: descriptor.hostUnitId,
                hostAnchorId,
                embedId: descriptor.embedId,
                childUnitId: descriptor.childUnitId!,
                childType: descriptor.childType!,
                layout,
                mode,
                rootElement,
                contentRoot,
                canvasRoot,
                overlayRoot,
                popupRoot,
                menuOutlet: runtimeRoots?.menuSlot ? { container: runtimeRoots.menuSlot } : undefined,
                active$: active$.asObservable(),
            },
            disposable: toDisposable(() => {
                overlayRootDisposable.dispose();
                setActive(false);
                active$.complete();
            }),
            setActive,
        };
    }

    private _registerRuntimeBoundary(
        descriptor: IEmbedDescriptor,
        hostElement: HTMLElement,
        renderScope: IEmbedRenderScope,
        roots: IEmbedChildContainerContext['runtimeScope']['roots']
    ): IDisposable | undefined {
        const hasInteractionBoundary = this._injector.has(EmbedInteractionBoundaryService);
        const hasFocusCoordinator = this._injector.has(EmbedRuntimeFocusCoordinator);
        if (!hasInteractionBoundary && !hasFocusCoordinator) {
            return undefined;
        }

        const interactionBoundaryService = hasInteractionBoundary
            ? this._injector.get(EmbedInteractionBoundaryService)
            : undefined;
        const focusCoordinator = hasFocusCoordinator
            ? this._injector.get(EmbedRuntimeFocusCoordinator)
            : undefined;
        const elements = new Map<HTMLElement, 'runtime' | 'child-popup'>();
        const addElement = (element: HTMLElement | undefined, role: 'runtime' | 'child-popup') => {
            if (!element) {
                return;
            }

            const previousRole = elements.get(element);
            if (!previousRole || previousRole === 'runtime') {
                elements.set(element, role);
            }
        };

        addElement(hostElement, 'runtime');
        addElement(renderScope.rootElement, 'runtime');
        addElement(renderScope.contentRoot, 'runtime');
        addElement(renderScope.canvasRoot, 'runtime');
        addElement(renderScope.overlayRoot, 'runtime');
        addElement(roots.root, 'runtime');
        addElement(roots.content, 'runtime');
        addElement(roots.canvas, 'runtime');
        addElement(roots.overlay, 'runtime');
        addElement(renderScope.popupRoot, 'child-popup');
        addElement(roots.popup, 'child-popup');

        const disposables = [...elements].flatMap(([element, role]) => [
            interactionBoundaryService?.registerRoot(descriptor.embedId, element),
            focusCoordinator?.registerElement({
                embedId: descriptor.embedId,
                role,
                element,
            }),
        ].filter((disposable): disposable is IDisposable => !!disposable));

        return toDisposable(() => {
            [...disposables].reverse().forEach((disposable) => disposable.dispose());
        });
    }

    private _normalizeHostMountResult(result: ReturnType<NonNullable<IEmbedHostContainerContribution['mount']>>): IEmbedHostMountResult {
        if (!result) {
            return {};
        }

        if ('dispose' in result) {
            return { disposable: result };
        }

        return {
            hostElement: result.hostElement,
            runtimeRoots: result.runtimeRoots,
            disposable: result.disposable ? toDisposable(() => result.disposable?.dispose()) : undefined,
        };
    }

    private _mountFloatingMenu(context: IEmbedChildContainerContext): IDisposable | undefined {
        if (!this._injector.has(EmbedFloatingMenuRegistryService)) {
            return undefined;
        }

        const contribution = this._injector.get(EmbedFloatingMenuRegistryService)
            .get(context.descriptor.hostType, context.descriptor.entry, context.childType);
        if (!contribution) {
            return undefined;
        }

        const active = this._injector.has(EmbedFloatingActiveService)
            ? this._injector.get(EmbedFloatingActiveService).getActive()
            : null;
        const disposable = contribution.mount({
            ...context,
            active,
        });

        return disposable ? toDisposable(() => disposable.dispose()) : undefined;
    }

    private _registerChildFocusBridge(
        descriptor: IEmbedDescriptor,
        rootElement: HTMLElement,
        mode: IEmbedRenderScope['mode'],
        scopedInstanceService?: IUniverInstanceService
    ): IDisposable {
        const focusChild = (event?: PointerEvent | FocusEvent) => {
            const target = event?.target instanceof Element ? event.target : null;
            if (target?.closest('[data-embed-float-drag-handle="true"], [data-embed-floating-menu="true"]')) {
                return;
            }
            if (!descriptor.childUnitId || descriptor.childType == null) {
                return;
            }

            if (mode === 'float' && scopedInstanceService) {
                scopedInstanceService.setCurrentUnitForType(descriptor.childUnitId);
                scopedInstanceService.focusUnit(descriptor.childUnitId);
            }
            if (mode === 'float' && this._injector.has(IUniverInstanceService)) {
                const instanceService = this._injector.get(IUniverInstanceService);
                const getCurrentUnitOfType = (instanceService as unknown as {
                    getCurrentUnitOfType?: (type: UniverInstanceType) => { getUnitId: () => string } | null | undefined;
                }).getCurrentUnitOfType;
                const getFocusedUnit = (instanceService as unknown as {
                    getFocusedUnit?: () => { getUnitId: () => string } | null | undefined;
                }).getFocusedUnit;
                if (
                    typeof getCurrentUnitOfType !== 'function' ||
                    getCurrentUnitOfType.call(instanceService, descriptor.childType)?.getUnitId() !== descriptor.childUnitId
                ) {
                    instanceService.setCurrentUnitForType(descriptor.childUnitId);
                }
                if (
                    typeof getFocusedUnit !== 'function' ||
                    getFocusedUnit.call(instanceService)?.getUnitId() !== descriptor.childUnitId
                ) {
                    instanceService.focusUnit(descriptor.childUnitId);
                }
            }
            if (mode === 'tab' && this._injector.has(IUniverInstanceService)) {
                const instanceService = this._injector.get(IUniverInstanceService);
                const getCurrentUnitOfType = (instanceService as unknown as {
                    getCurrentUnitOfType?: (type: UniverInstanceType) => { getUnitId: () => string } | null | undefined;
                }).getCurrentUnitOfType;
                const getFocusedUnit = (instanceService as unknown as {
                    getFocusedUnit?: () => { getUnitId: () => string } | null | undefined;
                }).getFocusedUnit;
                if (
                    typeof getCurrentUnitOfType !== 'function' ||
                    getCurrentUnitOfType.call(instanceService, descriptor.childType)?.getUnitId() !== descriptor.childUnitId
                ) {
                    instanceService.setCurrentUnitForType(descriptor.childUnitId);
                }
                if (
                    typeof getFocusedUnit !== 'function' ||
                    getFocusedUnit.call(instanceService)?.getUnitId() !== descriptor.childUnitId
                ) {
                    instanceService.focusUnit(descriptor.childUnitId);
                }
            }
            if ((mode === 'tab' || mode === 'float') && this._injector.has(IContextService)) {
                const contextService = this._injector.get(IContextService);
                contextService.setContextValue(FOCUSING_UNIT, true);
                contextService.setContextValue(FOCUSING_DOC, descriptor.childType === UniverInstanceType.UNIVER_DOC);
                contextService.setContextValue(FOCUSING_SHEET, descriptor.childType === UniverInstanceType.UNIVER_SHEET);
                contextService.setContextValue(FOCUSING_SLIDE, descriptor.childType === UniverInstanceType.UNIVER_SLIDE);
            }
            if (this._injector.has(EmbedFocusOwnerService)) {
                const focusOwnerService = this._injector.get(EmbedFocusOwnerService);
                const nextOwner = {
                    hostUnitId: descriptor.hostUnitId,
                    embedId: descriptor.embedId,
                    childUnitId: descriptor.childUnitId,
                    childType: descriptor.childType,
                    reason: 'pointer',
                } as const;
                const currentOwner = focusOwnerService.getFocusOwner();
                if (
                    currentOwner?.hostUnitId !== nextOwner.hostUnitId ||
                    currentOwner.embedId !== nextOwner.embedId ||
                    currentOwner.childUnitId !== nextOwner.childUnitId ||
                    currentOwner.childType !== nextOwner.childType ||
                    currentOwner.reason !== nextOwner.reason
                ) {
                    focusOwnerService.setFocusOwner(nextOwner);
                }
            }
            this.activateSession(descriptor.embedId);
        };

        rootElement.addEventListener('pointerdown', focusChild, { capture: true });
        rootElement.addEventListener('focusin', focusChild);

        return toDisposable(() => {
            rootElement.removeEventListener('pointerdown', focusChild, { capture: true });
            rootElement.removeEventListener('focusin', focusChild);
        });
    }

    private _focusTabPeerSession(session: IEmbedMountSession): void {
        if (this._injector.has(IUniverInstanceService)) {
            const instanceService = this._injector.get(IUniverInstanceService);
            instanceService.setCurrentUnitForType(session.childUnitId);
            instanceService.focusUnit(session.childUnitId);
        }
        if (this._injector.has(IContextService)) {
            const contextService = this._injector.get(IContextService);
            contextService.setContextValue(FOCUSING_UNIT, true);
            contextService.setContextValue(FOCUSING_DOC, session.childType === UniverInstanceType.UNIVER_DOC);
            contextService.setContextValue(FOCUSING_SHEET, session.childType === UniverInstanceType.UNIVER_SHEET);
            contextService.setContextValue(FOCUSING_SLIDE, session.childType === UniverInstanceType.UNIVER_SLIDE);
        }
        if (this._injector.has(EmbedFocusOwnerService)) {
            this._injector.get(EmbedFocusOwnerService).setFocusOwner({
                hostUnitId: session.hostUnitId,
                embedId: session.embedId,
                childUnitId: session.childUnitId,
                childType: session.childType,
                reason: 'keyboard',
            });
        }
    }

    private _createMountFocusRestorer(descriptor: IEmbedDescriptor): IDisposable {
        if (!this._injector.has(IUniverInstanceService) || !descriptor.childUnitId) {
            return toDisposable(() => {});
        }

        const instanceService = this._injector.get(IUniverInstanceService);
        const getFocusedUnit = (instanceService as unknown as { getFocusedUnit?: () => { getUnitId: () => string } | null | undefined }).getFocusedUnit;
        const focusUnit = (instanceService as unknown as { focusUnit?: (unitId: string) => void }).focusUnit;
        if (typeof getFocusedUnit !== 'function' || typeof focusUnit !== 'function') {
            return toDisposable(() => {});
        }

        const previousFocusedUnitId = getFocusedUnit.call(instanceService)?.getUnitId();
        if (!previousFocusedUnitId || previousFocusedUnitId === descriptor.childUnitId) {
            return toDisposable(() => {});
        }

        const restore = () => {
            if (getFocusedUnit.call(instanceService)?.getUnitId() === descriptor.childUnitId) {
                focusUnit.call(instanceService, previousFocusedUnitId);
            }
        };
        const timers: number[] = [];
        const frames: number[] = [];

        restore();
        if (typeof window !== 'undefined') {
            frames.push(window.requestAnimationFrame(restore));
            timers.push(window.setTimeout(restore, 0));
            timers.push(window.setTimeout(restore, 120));
        }

        return toDisposable(() => {
            if (typeof window === 'undefined') {
                return;
            }

            frames.forEach((frame) => window.cancelAnimationFrame(frame));
            timers.forEach((timer) => window.clearTimeout(timer));
        });
    }

    private _assertChildUnitAvailable(descriptor: IEmbedDescriptor): void {
        const duplicated = [...this._sessions.values()].find(({ session }) =>
            session.embedId !== descriptor.embedId && session.childUnitId === descriptor.childUnitId
        );
        if (duplicated) {
            throw new EmbedDuplicateChildUnitError(descriptor.childUnitId!, duplicated.session.embedId);
        }
    }
}

function applyRenderScopeActiveState(rootElement: HTMLElement, active: boolean, mode: IEmbedRenderScope['mode']): void {
    rootElement.dataset.embedRenderScopeActive = active ? 'true' : 'false';
    if (mode !== 'tab') {
        rootElement.removeAttribute('inert');
        rootElement.removeAttribute('aria-hidden');
        rootElement.style.removeProperty('display');
        rootElement.style.removeProperty('pointer-events');
        return;
    }

    rootElement.toggleAttribute('inert', !active);

    if (active) {
        rootElement.removeAttribute('aria-hidden');
        rootElement.style.removeProperty('display');
        rootElement.style.removeProperty('pointer-events');
        return;
    }

    rootElement.setAttribute('aria-hidden', 'true');
    rootElement.style.display = 'none';
    rootElement.style.pointerEvents = 'none';
}
