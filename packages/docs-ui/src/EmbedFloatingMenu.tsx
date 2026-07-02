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
import { Button, clsx } from '@univerjs/design';
import { RemoveEmbedCommand } from '@univerjs/embed';
import { createEmbedProductFloatingMenuContributions, createEmbedReactRoot, disposeEmbedReactRoot, EmbedFloatingActiveService, EmbedRuntimeProviders, resolveEmbedFloatingMenuStage as resolveCommonEmbedFloatingMenuStage, resolveEmbedFloatingMenuRoot } from '@univerjs/embed-ui';
import { DeleteIcon } from '@univerjs/icons';
import { useDependency, useObservable } from '@univerjs/ui';
import { createElement } from 'react';

export function createDocsFloatingMenuContributions(): IEmbedFloatingMenuContribution[] {
    return createEmbedProductFloatingMenuContributions({
        childType: UniverInstanceType.UNIVER_DOC,
        mount: mountDocsFloatingMenu,
    });
}

function mountDocsFloatingMenu(context: IEmbedFloatingMenuMountContext) {
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
            entry: context.descriptor.entry,
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
    entry: string;
    fullscreen: boolean;
    usesDomFloatingStage: boolean;
    renderScopeActive$: Observable<boolean>;
}

function DocsEmbedFloatingMenu(props: IDocsEmbedFloatingMenuProps) {
    const {
        hostUnitId,
        embedId,
        entry,
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
        void commandService.executeCommand(RemoveEmbedCommand.id, { hostUnitId, embedId });
    };

    return (
        <div
            className={resolveDocsFloatingMenuClassName({ entry, fullscreen, stage })}
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

export function resolveDocsFloatingMenuClassName(params: {
    entry: string;
    fullscreen: boolean;
    stage: 'inactive' | 'stage2';
}): string {
    const { entry, fullscreen, stage } = params;

    return clsx(`
      univer-docs-embed-floating-menu univer-box-border univer-inline-flex univer-h-8 univer-items-center
      univer-rounded-lg univer-border univer-border-solid univer-border-gray-200 univer-bg-white univer-p-1
      univer-text-gray-900 univer-shadow-lg
      dark:!univer-border-gray-600 dark:!univer-bg-gray-900 dark:!univer-text-white
    `, {
        'univer-hidden': stage !== 'stage2',
        'univer-static univer-mx-auto univer-my-1.5 univer-translate-x-0': fullscreen,
        'univer-absolute univer-left-1/2 univer-z-[30] -univer-translate-x-1/2': !fullscreen,
        '-univer-top-9': !fullscreen && entry !== 'docs-custom-block',
        'univer-top-[calc(var(--univer-embed-docs-block-floating-menu-inset-top,52px)*-1)]': !fullscreen && entry === 'docs-custom-block',
    });
}
