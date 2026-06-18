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

import type { EmbedFloatingActivation, EmbedFloatingMenuContribution, EmbedFloatingMenuMountContext } from '@univerjs/embed-ui';
import type { Observable } from 'rxjs';
import { Injector, toDisposable, UniverInstanceType } from '@univerjs/core';
import { createEmbedReactRoot, disposeEmbedReactRoot, EmbedFloatingActiveService, EmbedRuntimeProviders, mountEmbedProductRibbonMenu, resolveEmbedFloatingMenuRoot } from '@univerjs/embed-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import { createElement, useEffect, useRef } from 'react';

const DOCS_FLOATING_MENU_STYLE_ID = 'univer-docs-embed-floating-menu-styles';

export function createDocsFloatingMenuContributions(): EmbedFloatingMenuContribution[] {
    return [
        {
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            childType: UniverInstanceType.UNIVER_DOC,
            mount: mountDocsFloatingMenu,
        },
        {
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-floating-object',
            childType: UniverInstanceType.UNIVER_DOC,
            mount: mountDocsFloatingMenu,
        },
        {
            hostType: UniverInstanceType.UNIVER_SLIDE,
            entry: 'slides-floating-object',
            childType: UniverInstanceType.UNIVER_DOC,
            mount: mountDocsFloatingMenu,
        },
    ];
}

function mountDocsFloatingMenu(context: EmbedFloatingMenuMountContext) {
    ensureDocsFloatingMenuStyles();

    const root = resolveEmbedFloatingMenuRoot(context);
    const menu = document.createElement('div');
    root.appendChild(menu);

    const reactRoot = createEmbedReactRoot(menu);
    reactRoot.render(createElement(
        EmbedRuntimeProviders,
        { injector: context.runtimeScope.injector, mountContainer: root },
        createElement(DocsEmbedFloatingMenu, {
            childUnitId: context.childUnitId,
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
    childUnitId: string;
    embedId: string;
    fullscreen: boolean;
    usesDomFloatingStage: boolean;
    renderScopeActive$: Observable<boolean>;
}

function DocsEmbedFloatingMenu(props: IDocsEmbedFloatingMenuProps) {
    const {
        childUnitId,
        embedId,
        fullscreen,
        usesDomFloatingStage,
        renderScopeActive$,
    } = props;
    const containerRef = useRef<HTMLDivElement | null>(null);
    const renderScopeActive = useObservable(() => renderScopeActive$, false, false, [renderScopeActive$]);
    const injector = useDependency(Injector);
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

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const disposable = mountEmbedProductRibbonMenu({
            container,
            childType: UniverInstanceType.UNIVER_DOC,
            childUnitId,
            injector,
            menuSchema: undefined,
            menuTitlePrefix: 'Docs',
            toolbarOnly: true,
        });

        return () => disposable?.dispose();
    }, [childUnitId, injector]);

    return (
        <div
            className="univer-docs-embed-floating-menu"
            data-embed-floating-menu="true"
            data-embed-id={embedId}
            data-embed-float-stage={stage}
            onPointerDown={(event) => event.stopPropagation()}
        >
            <div ref={containerRef} />
        </div>
    );
}

export function resolveDocsFloatingMenuStage(params: {
    embedId: string;
    active: EmbedFloatingActivation | null;
    fullscreen: boolean;
    usesDomFloatingStage: boolean;
    renderScopeActive: boolean;
}): 'inactive' | 'stage2' {
    if (params.fullscreen) {
        return 'stage2';
    }

    if (params.active?.embedId === params.embedId && params.active.stage === 'stage2') {
        return 'stage2';
    }

    if (!params.usesDomFloatingStage && params.renderScopeActive) {
        return 'stage2';
    }

    return 'inactive';
}

function ensureDocsFloatingMenuStyles(): void {
    if (typeof document === 'undefined' || document.getElementById(DOCS_FLOATING_MENU_STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = DOCS_FLOATING_MENU_STYLE_ID;
    style.textContent = `
.univer-docs-embed-floating-menu {
    position: absolute;
    top: -36px;
    left: 34px;
    z-index: 30;
}
.univer-docs-embed-floating-menu:not([data-embed-float-stage="stage2"]) {
    display: none;
}
[data-embed-fullscreen-menu-slot="true"] .univer-docs-embed-floating-menu {
    position: static;
    margin: 6px auto;
}
`;
    document.head.appendChild(style);
}
