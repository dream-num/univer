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

import type { IEmbedFloatingActivation, IEmbedFloatingMenuContribution, IEmbedFloatingMenuMountContext } from '@univerjs/embed-ui';
import type { Observable } from 'rxjs';
import { ICommandService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { createEmbedProductFloatingMenuContributions, createEmbedReactRoot, disposeEmbedReactRoot, EmbedFloatingActiveService, EmbedRuntimeProviders, RemoveHostEmbedCommand, resolveEmbedFloatingMenuStage as resolveCommonEmbedFloatingMenuStage, resolveEmbedFloatingMenuRoot } from '@univerjs/embed-ui';
import { DeleteIcon } from '@univerjs/icons';
import { useDependency, useObservable } from '@univerjs/ui';
import { createElement } from 'react';

const DOCS_FLOATING_MENU_STYLE_ID = 'univer-docs-embed-floating-menu-styles';
export const DOCS_FLOATING_MENU_STYLE_TEXT = `
.univer-docs-embed-floating-menu {
    position: absolute;
    top: -36px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
}
[data-embed-floating-menu-entry="docs-custom-block"] .univer-docs-embed-floating-menu {
    top: calc(var(--univer-embed-docs-block-floating-menu-inset-top, 52px) * -1);
}
.univer-docs-embed-floating-menu:not([data-embed-float-stage="stage2"]) {
    display: none;
}
[data-embed-fullscreen-menu-slot="true"] .univer-docs-embed-floating-menu {
    position: static;
    margin: 6px auto;
    transform: none;
}
`;

export function createDocsFloatingMenuContributions(): IEmbedFloatingMenuContribution[] {
    return createEmbedProductFloatingMenuContributions({
        childType: UniverInstanceType.UNIVER_DOC,
        mount: mountDocsFloatingMenu,
    });
}

function mountDocsFloatingMenu(context: IEmbedFloatingMenuMountContext) {
    ensureDocsFloatingMenuStyles();

    const root = resolveEmbedFloatingMenuRoot(context);
    const menu = document.createElement('div');
    menu.setAttribute('data-embed-floating-menu-entry', context.descriptor.entry);
    root.appendChild(menu);

    const reactRoot = createEmbedReactRoot(menu);
    reactRoot.render(createElement(
        EmbedRuntimeProviders,
        { injector: context.runtimeScope.injector, mountContainer: root, embedId: context.embedId },
        createElement(DocsEmbedFloatingMenu, {
            hostUnitId: context.hostUnitId,
            embedId: context.embedId,
            fullscreen: Boolean(context.renderScope.fullscreen),
            usesDomFloatingStage: context.descriptor.entry !== 'slides-floating-object',
            renderScopeActive$: context.renderScope.active$,
        })
    ));

    return toDisposable(() => {
        disposeEmbedReactRoot(reactRoot);
        globalThis.setTimeout(() => menu.remove(), 0);
    });
}

interface IDocsEmbedFloatingMenuProps {
    hostUnitId: string;
    embedId: string;
    fullscreen: boolean;
    usesDomFloatingStage: boolean;
    renderScopeActive$: Observable<boolean>;
}

function DocsEmbedFloatingMenu(props: IDocsEmbedFloatingMenuProps) {
    const {
        hostUnitId,
        embedId,
        fullscreen,
        usesDomFloatingStage,
        renderScopeActive$,
    } = props;
    const renderScopeActive = useObservable(() => renderScopeActive$, false, false, [renderScopeActive$]);
    const commandService = useDependency(ICommandService);
    const floatingActiveService = useDependency(EmbedFloatingActiveService);
    const activation = useObservable(
        () => floatingActiveService.active$,
        floatingActiveService.getActive(),
        false,
        [floatingActiveService]
    );
    const stage = resolveDocsFloatingMenuStage({
        embedId,
        active: activation,
        fullscreen,
        usesDomFloatingStage,
        renderScopeActive,
    });
    const removeEmbed = () => {
        void commandService.executeCommand(RemoveHostEmbedCommand.id, { hostUnitId, embedId });
    };

    return (
        <div
            className="
              univer-docs-embed-floating-menu univer-box-border univer-inline-flex univer-h-8 univer-items-center
              univer-rounded-lg univer-border univer-border-solid univer-border-gray-200 univer-bg-white univer-p-1
              univer-text-gray-900 univer-shadow-lg
              dark:!univer-border-gray-600 dark:!univer-bg-gray-900 dark:!univer-text-white
            "
            data-embed-floating-menu="true"
            data-embed-id={embedId}
            data-embed-float-stage={stage}
            onPointerDown={(event) => event.stopPropagation()}
        >
            <Button
                type="button"
                size="small"
                variant="ghost"
                className="
                  univer-size-6 univer-p-0 univer-text-red-500
                  hover:univer-text-red-600
                "
                title="Delete embed block"
                aria-label="Delete embed block"
                onClick={removeEmbed}
            >
                <DeleteIcon />
            </Button>
        </div>
    );
}

export function resolveDocsFloatingMenuStage(params: {
    embedId: string;
    active: IEmbedFloatingActivation | null;
    fullscreen: boolean;
    usesDomFloatingStage: boolean;
    renderScopeActive: boolean;
}): 'inactive' | 'stage2' {
    return resolveCommonEmbedFloatingMenuStage(params);
}

function ensureDocsFloatingMenuStyles(): void {
    if (typeof document === 'undefined' || document.getElementById(DOCS_FLOATING_MENU_STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = DOCS_FLOATING_MENU_STYLE_ID;
    style.textContent = DOCS_FLOATING_MENU_STYLE_TEXT;
    document.head.appendChild(style);
}
