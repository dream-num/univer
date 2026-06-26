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

import type { IDisposable, Injector } from '@univerjs/core';
import type { IEmbedChildContainerContext, IEmbedChildRuntimeScope } from '../types/embed-ui';
import { ICommandService, IUniverInstanceService, toDisposable } from '@univerjs/core';
import { IMenuManagerService } from '@univerjs/ui';
import {
    EMBED_CANVAS_ROOT_ATTRIBUTE,
    EMBED_CONTENT_ROOT_ATTRIBUTE,
    EMBED_FOOTER_SLOT_ATTRIBUTE,
    EMBED_MENU_SLOT_ATTRIBUTE,
    EMBED_OVERLAY_ROOT_ATTRIBUTE,
    EMBED_POPUP_ROOT_ATTRIBUTE,
    findEmbedRuntimeSlot,
} from '../common/embed-runtime-slots';
import { createEmbedChildUnitScopedInjector } from './embed-child-unit-scoped-injector';

export type EmbedChildRuntimeScopeCreateContext = Omit<IEmbedChildContainerContext, 'runtimeScope'>;

export function createEmbedChildRuntimeScope(
    context: EmbedChildRuntimeScopeCreateContext,
    setActive: (active: boolean) => void
): { runtimeScope: IEmbedChildRuntimeScope; disposable: IDisposable } {
    const scopedInjector = createScopedChildInjectorIfPossible(context) ?? context.injector;
    const ownsScopedInjector = scopedInjector !== context.injector;
    const roots = resolveRuntimeRoots(context);
    const runtimeScope: IEmbedChildRuntimeScope = {
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
        instanceService: getOptional<IUniverInstanceService>(scopedInjector, IUniverInstanceService),
        commandService: getOptional<ICommandService>(scopedInjector, ICommandService),
        menuManagerService: getOptional<IMenuManagerService>(scopedInjector, IMenuManagerService),
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

function resolveRuntimeRoots(context: EmbedChildRuntimeScopeCreateContext): IEmbedChildRuntimeScope['roots'] {
    const root = context.renderScope.rootElement;
    const content = context.renderScope.contentRoot
        ?? findEmbedRuntimeSlot(root, EMBED_CONTENT_ROOT_ATTRIBUTE)
        ?? root;
    const overlay = context.renderScope.overlayRoot
        ?? findEmbedRuntimeSlot(root, EMBED_OVERLAY_ROOT_ATTRIBUTE)
        ?? root;

    return {
        root,
        content,
        canvas: context.renderScope.canvasRoot
            ?? findEmbedRuntimeSlot(root, EMBED_CANVAS_ROOT_ATTRIBUTE)
            ?? undefined,
        overlay,
        popup: context.renderScope.popupRoot
            ?? findEmbedRuntimeSlot(root, EMBED_POPUP_ROOT_ATTRIBUTE)
            ?? overlay,
        menuSlot: context.renderScope.menuOutlet?.container
            ?? findEmbedRuntimeSlot(root, EMBED_MENU_SLOT_ATTRIBUTE)
            ?? undefined,
        footerSlot: findEmbedRuntimeSlot(root, EMBED_FOOTER_SLOT_ATTRIBUTE) ?? undefined,
    };
}

function createScopedChildInjectorIfPossible(context: EmbedChildRuntimeScopeCreateContext): Injector | undefined {
    if (!context.injector.has(IUniverInstanceService) || !context.injector.has(ICommandService)) {
        return undefined;
    }

    return createEmbedChildUnitScopedInjector(context as IEmbedChildContainerContext);
}

function getOptional<T>(injector: Injector, identifier: unknown): T | undefined {
    if (!injector.has(identifier as never)) {
        return undefined;
    }

    return injector.get(identifier as never) as T;
}

function resolveRuntimeHostLayout(context: EmbedChildRuntimeScopeCreateContext): IEmbedChildRuntimeScope['host']['layout'] {
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
