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

import type { DependencyIdentifier, IDisposable, UniverInstanceType } from '@univerjs/core';
import type { EmbedLayout } from '@univerjs/embed';
import type { IEmbedChildContainerContext, IEmbedChildViewContribution } from '../types/embed-ui';
import { Injector, toDisposable } from '@univerjs/core';
import { createEmbedChildUnitScopedInjector } from './embed-child-unit-scoped-injector';

export interface IEmbedRenderLike {
    engine: {
        mount: (target: HTMLElement) => void;
        unmount?: () => void;
        resize: () => void;
        getCanvasElement?: () => HTMLCanvasElement | undefined;
        getCanvas?: () => { getCanvasEle?: () => HTMLCanvasElement | undefined } | undefined;
    };
    activate?: () => void;
    components: {
        forEach: (callback: (component: {
            makeForceDirty?: (dirty: boolean) => void;
            makeDirty?: (dirty?: boolean) => void;
        }) => void) => void;
    };
    mainComponent?: {
        makeDirty?: (dirty?: boolean) => void;
    } | null | void;
    scene: {
        makeDirty: () => void;
        render?: () => void;
    };
    with?: <T>(dependency: DependencyIdentifier<T>) => T;
}

export interface IEmbedRenderManagerServiceLike {
    getRenderById: (unitId: string) => IEmbedRenderLike | null | undefined | void;
    createRender: (unitId: string, options?: {
        embeddedRender?: boolean;
        makeCurrent?: boolean;
        renderParentInjector?: Injector;
        skipAutoRender?: boolean;
    }) => IEmbedRenderLike;
    removeRender?: (unitId: string) => void;
}

export interface ICreateEmbedRenderChildViewContributionOptions {
    childType: UniverInstanceType;
    supportedLayouts: readonly EmbedLayout[];
    renderManagerService: DependencyIdentifier<IEmbedRenderManagerServiceLike>;
}

export interface IMountEmbedRenderChildUnitOptions {
    activate?: boolean;
}

export function createEmbedRenderChildViewContribution(
    options: ICreateEmbedRenderChildViewContributionOptions
): IEmbedChildViewContribution {
    return {
        childType: options.childType,
        supportedLayouts: [...options.supportedLayouts],
        mount: (context) => mountEmbedRenderChildUnit(context, options.renderManagerService),
    };
}

export function mountEmbedRenderChildUnit(
    context: IEmbedChildContainerContext,
    renderManagerServiceIdentifier: DependencyIdentifier<IEmbedRenderManagerServiceLike>,
    target: HTMLElement = resolveEmbedRenderChildTarget(context),
    options: IMountEmbedRenderChildUnitOptions = {}
): IDisposable | undefined {
    const renderManagerService = context.injector.get(renderManagerServiceIdentifier);
    const scopedInjector = context.runtimeScope?.injector ?? createEmbedChildUnitScopedInjector(context);
    const ownsScopedInjector = scopedInjector !== context.runtimeScope?.injector;
    const render = createEmbedChildRender(renderManagerService, context.childUnitId, scopedInjector);
    if (!render) {
        if (ownsScopedInjector) {
            scopedInjector?.dispose();
        }
        return undefined;
    }

    target.dataset.embedChildRenderUnitId = context.childUnitId;
    target.dataset.embedChildRenderMode = context.renderScope.mode;
    try {
        render.engine.unmount?.();
    } catch {
        // A reused render can already be detached by its previous host.
    }
    render.engine.mount(target);
    ensureEmbedRenderCanvasAttached(render, target);
    refreshEmbedChildRender(render, { activate: options.activate ?? true });

    return toDisposable(() => {
        try {
            render.engine.unmount?.();
        } catch {
            // The render engine may already have been moved or disposed by the host.
        }
        renderManagerService.removeRender?.(context.childUnitId);
        target.removeAttribute('data-embed-child-render-unit-id');
        target.removeAttribute('data-embed-child-render-mode');
        if (ownsScopedInjector) {
            scopedInjector?.dispose();
        }
    });
}

function resolveEmbedRenderChildTarget(context: IEmbedChildContainerContext): HTMLElement {
    return context.runtimeScope.roots.canvas
        ?? context.renderScope.canvasRoot
        ?? context.renderScope.contentRoot
        ?? context.renderScope.rootElement;
}

function ensureEmbedRenderCanvasAttached(render: IEmbedRenderLike, target: HTMLElement): void {
    const canvas = render.engine.getCanvasElement?.() ?? render.engine.getCanvas?.()?.getCanvasEle?.();
    if (!canvas || canvas.parentElement === target) {
        return;
    }

    target.appendChild(canvas);
}

export function ensureEmbedChildRender(renderManagerService: IEmbedRenderManagerServiceLike, childUnitId: string): IEmbedRenderLike | undefined {
    try {
        return renderManagerService.getRenderById(childUnitId)
            ?? renderManagerService.createRender(childUnitId, { embeddedRender: true, makeCurrent: false, skipAutoRender: true });
    } catch {
        return undefined;
    }
}

export function createEmbedChildRender(
    renderManagerService: IEmbedRenderManagerServiceLike,
    childUnitId: string,
    renderParentInjector?: Injector
): IEmbedRenderLike | undefined {
    try {
        const existingRender = renderManagerService.getRenderById(childUnitId);
        if (existingRender) {
            if (!renderParentInjector || getRenderInjector(existingRender) === renderParentInjector) {
                return existingRender;
            }

            renderManagerService.removeRender?.(childUnitId);
        }

        return renderManagerService.createRender(childUnitId, { embeddedRender: true, makeCurrent: false, renderParentInjector, skipAutoRender: true });
    } catch (error) {
        renderManagerService.removeRender?.(childUnitId);
        console.warn('[embed-ui] failed to create embedded child render', error);
        return undefined;
    }
}

function getRenderInjector(render: IEmbedRenderLike): Injector | undefined {
    try {
        return render.with?.(Injector);
    } catch {
        return undefined;
    }
}

export function refreshEmbedChildRender(render: IEmbedRenderLike, options: { activate?: boolean } = {}): void {
    if (options.activate) {
        render.activate?.();
    }
    render.engine.resize();
    render.components.forEach((component) => {
        component.makeForceDirty?.(true);
        component.makeDirty?.(true);
    });
    render.mainComponent?.makeDirty?.(true);
    render.scene.makeDirty();
    render.scene.render?.();
}
