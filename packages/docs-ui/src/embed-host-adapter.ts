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

import type { IUniverInstanceService } from '@univerjs/core';
import type { EmbedHostAnchorModelService, IEmbedHostAdapterContribution } from '@univerjs/embed';
import type { IEmbedHostContainerContribution } from '@univerjs/embed-ui';
import type { IRenderManagerService } from '@univerjs/engine-render';
import { UniverInstanceType } from '@univerjs/core';
import { createDocsCustomBlockHostAdapterContribution as createDocsCustomBlockDataHostAdapterContribution } from '@univerjs/docs';
import { DocPageLayoutService } from './services/doc-page-layout.service';

export function createDocsCustomBlockUIHostAdapterContribution(
    anchorModelService?: EmbedHostAnchorModelService,
    univerInstanceService?: IUniverInstanceService,
    renderManagerService?: IRenderManagerService
): IEmbedHostAdapterContribution {
    const adapter = createDocsCustomBlockDataHostAdapterContribution(anchorModelService, univerInstanceService);

    return {
        ...adapter,
        afterCreateAnchor: (context) => refreshDocsCustomBlockLayout(renderManagerService, context.hostUnitId),
        afterRemoveAnchor: (context) => refreshDocsCustomBlockLayout(renderManagerService, context.hostUnitId),
    };
}

export function createDocsCustomBlockHostContainerContribution(): IEmbedHostContainerContribution {
    return {
        hostType: UniverInstanceType.UNIVER_DOC,
        entry: 'docs-custom-block',
        layout: 'docs-sticky-sheet',
        supportedLayouts: ['docs-sticky-sheet', 'docs-sticky-base', 'aspect-fit', 'scroll-contained'],
        menuBehavior: 'floating',
    };
}

function refreshDocsCustomBlockLayout(renderManagerService: IRenderManagerService | undefined, unitId: string): void {
    if (!renderManagerService) {
        return;
    }

    const render = renderManagerService.getRenderById(unitId);
    if (!render) {
        return;
    }

    for (const component of render.components.values()) {
        component.makeDirty?.();
    }
    render.engine?.resize();
    render.scene?.makeDirty();
    render.with?.(DocPageLayoutService)?.calculatePagePosition?.();
}
