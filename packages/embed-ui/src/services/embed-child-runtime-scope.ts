import type { ICommandService, IDisposable, Injector, IUniverInstanceService } from '@univerjs/core';
import type { IMenuManagerService } from '@univerjs/ui';
import type { EmbedChildContainerContext, EmbedChildRuntimeScope } from '../types/embed-ui';
import { ICommandService as ICommandServiceIdentifier, IUniverInstanceService as IUniverInstanceServiceIdentifier, toDisposable } from '@univerjs/core';
import { IMenuManagerService as IMenuManagerServiceIdentifier } from '@univerjs/ui';
import { EMBED_CANVAS_ROOT_ATTRIBUTE, EMBED_FOOTER_SLOT_ATTRIBUTE, EMBED_MENU_SLOT_ATTRIBUTE, EMBED_OVERLAY_ROOT_ATTRIBUTE, EMBED_POPUP_ROOT_ATTRIBUTE, findEmbedRuntimeSlot } from '../common/embed-runtime-slots';
import { createEmbedChildUnitScopedInjector } from './embed-child-unit-scoped-injector';

export type EmbedChildRuntimeScopeCreateContext = Omit<EmbedChildContainerContext, 'runtimeScope'>;

export function createEmbedChildRuntimeScope(
    context: EmbedChildRuntimeScopeCreateContext,
    setActive: (active: boolean) => void
): { runtimeScope: EmbedChildRuntimeScope; disposable: IDisposable } {
    const scopedInjector = createScopedChildInjectorIfPossible(context) ?? context.injector;
    const ownsScopedInjector = scopedInjector !== context.injector;
    const roots = resolveRuntimeRoots(context);
    const runtimeScope: EmbedChildRuntimeScope = {
        descriptor: context.descriptor,
        host: {
            unitId: context.hostUnitId,
            type: context.descriptor.hostType,
            anchorId: context.descriptor.hostAnchorId,
            entry: context.descriptor.entry,
            layout: resolveRuntimeHostLayout(context),
        },
        child: {
            unitId: context.childUnitId,
            type: context.childType,
        },
        injector: scopedInjector,
        instanceService: getOptional<IUniverInstanceService>(scopedInjector, IUniverInstanceServiceIdentifier),
        commandService: getOptional<ICommandService>(scopedInjector, ICommandServiceIdentifier),
        menuManagerService: getOptional<IMenuManagerService>(scopedInjector, IMenuManagerServiceIdentifier),
        roots,
        activate: () => setActive(true),
        deactivate: () => setActive(false),
        dispose: () => {
            if (ownsScopedInjector) {
                scopedInjector.dispose();
            }
        },
    };

    return {
        runtimeScope,
        disposable: toDisposable(() => runtimeScope.dispose()),
    };
}

function resolveRuntimeRoots(context: EmbedChildRuntimeScopeCreateContext): EmbedChildRuntimeScope['roots'] {
    const root = context.renderScope.rootElement;
    const overlay = context.renderScope.overlayRoot
        ?? findEmbedRuntimeSlot(root, EMBED_OVERLAY_ROOT_ATTRIBUTE)
        ?? root;

    return {
        root,
        canvas: context.renderScope.canvasRoot
            ?? findEmbedRuntimeSlot(root, EMBED_CANVAS_ROOT_ATTRIBUTE)
            ?? undefined,
        overlay,
        popup: findEmbedRuntimeSlot(root, EMBED_POPUP_ROOT_ATTRIBUTE) ?? overlay,
        menuSlot: context.renderScope.menuOutlet?.container
            ?? findEmbedRuntimeSlot(root, EMBED_MENU_SLOT_ATTRIBUTE)
            ?? undefined,
        footerSlot: findEmbedRuntimeSlot(root, EMBED_FOOTER_SLOT_ATTRIBUTE) ?? undefined,
    };
}

function createScopedChildInjectorIfPossible(context: EmbedChildRuntimeScopeCreateContext): Injector | undefined {
    if (!context.injector.has(IUniverInstanceServiceIdentifier) || !context.injector.has(ICommandServiceIdentifier)) {
        return undefined;
    }

    return createEmbedChildUnitScopedInjector(context as EmbedChildContainerContext);
}

function getOptional<T>(injector: Injector, identifier: unknown): T | undefined {
    if (!injector.has(identifier as never)) {
        return undefined;
    }

    return injector.get(identifier as never) as T;
}

function resolveRuntimeHostLayout(context: EmbedChildRuntimeScopeCreateContext): EmbedChildRuntimeScope['host']['layout'] {
    switch (context.descriptor.entry) {
        case 'docs-custom-block':
            return 'doc-flow';
        case 'sheets-floating-object':
        case 'slides-floating-object':
        case 'boards-floating-object':
            return 'float';
        case 'sheets-sheet-tab':
        case 'bases-table-list-block':
        case 'slides-page-list-block':
            return 'tab-peer';
        default:
            break;
    }

    if (context.layout === 'tab-peer' || context.descriptor.sourceMeta?.tab) {
        return 'tab-peer';
    }

    if (context.descriptor.sourceMeta?.floating) {
        return 'float';
    }

    if (context.layout.startsWith('docs-') || context.layout === 'scroll-contained') {
        return 'doc-flow';
    }

    return 'float';
}
