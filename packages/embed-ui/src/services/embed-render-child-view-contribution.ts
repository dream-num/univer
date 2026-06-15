import type { DependencyIdentifier, IDisposable, UniverInstanceType } from '@univerjs/core';
import type { EmbedChildContainerContext, EmbedChildViewContribution } from '../types/embed-ui';
import type { EmbedLayout } from '@univerjs/embed';
import { Injector, toDisposable } from '@univerjs/core';
import { createEmbedChildUnitScopedInjector } from './embed-child-unit-scoped-injector';

export interface EmbedRenderLike {
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

export interface EmbedRenderManagerServiceLike {
    getRenderById: (unitId: string) => EmbedRenderLike | null | undefined | void;
    createRender: (unitId: string, options?: {
        embeddedRender?: boolean;
        makeCurrent?: boolean;
        renderParentInjector?: Injector;
        skipAutoRender?: boolean;
    }) => EmbedRenderLike;
    removeRender?: (unitId: string) => void;
}

export interface CreateEmbedRenderChildViewContributionOptions {
    childType: UniverInstanceType;
    supportedLayouts: readonly EmbedLayout[];
    renderManagerService: DependencyIdentifier<EmbedRenderManagerServiceLike>;
}

export function createEmbedRenderChildViewContribution(
    options: CreateEmbedRenderChildViewContributionOptions
): EmbedChildViewContribution {
    return {
        childType: options.childType,
        supportedLayouts: [...options.supportedLayouts],
        mount: (context) => mountEmbedRenderChildUnit(context, options.renderManagerService),
    };
}

export function mountEmbedRenderChildUnit(
    context: EmbedChildContainerContext,
    renderManagerServiceIdentifier: DependencyIdentifier<EmbedRenderManagerServiceLike>,
    target: HTMLElement = context.renderScope.rootElement
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
    refreshEmbedChildRender(render, { activate: true });

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

function ensureEmbedRenderCanvasAttached(render: EmbedRenderLike, target: HTMLElement): void {
    const canvas = render.engine.getCanvasElement?.() ?? render.engine.getCanvas?.()?.getCanvasEle?.();
    if (!canvas || canvas.parentElement === target) {
        return;
    }

    target.appendChild(canvas);
}

export function ensureEmbedChildRender(renderManagerService: EmbedRenderManagerServiceLike, childUnitId: string): EmbedRenderLike | undefined {
    try {
        return renderManagerService.getRenderById(childUnitId)
            ?? renderManagerService.createRender(childUnitId, { embeddedRender: true, makeCurrent: false, skipAutoRender: true });
    } catch {
        return undefined;
    }
}

export function createEmbedChildRender(
    renderManagerService: EmbedRenderManagerServiceLike,
    childUnitId: string,
    renderParentInjector?: Injector
): EmbedRenderLike | undefined {
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

function getRenderInjector(render: EmbedRenderLike): Injector | undefined {
    try {
        return render.with?.(Injector);
    } catch {
        return undefined;
    }
}

export function refreshEmbedChildRender(render: EmbedRenderLike, options: { activate?: boolean } = {}): void {
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
