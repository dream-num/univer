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

import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { createDocsCustomBlockHostContainerContribution, createDocsCustomBlockUIHostAdapterContribution } from './embed-host-adapter';

describe('docs custom block UI host adapter', () => {
    it('refreshes doc layout after anchor changes', () => {
        const renderManagerService = createRenderManagerService();
        const adapter = createDocsCustomBlockUIHostAdapterContribution(undefined, undefined, renderManagerService as never);

        adapter.afterCreateAnchor?.({ hostUnitId: 'doc-1' } as never);
        adapter.afterRemoveAnchor?.({ hostUnitId: 'doc-1' } as never);

        expect(renderManagerService.getRenderById).toHaveBeenCalledWith('doc-1');
        expect(renderManagerService.getRenderById).toHaveBeenCalledTimes(2);
    });

    it('exposes the docs custom block container contribution', () => {
        expect(createDocsCustomBlockHostContainerContribution()).toMatchObject({
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            layout: 'docs-sticky-sheet',
            menuBehavior: 'floating',
            supportedLayouts: expect.arrayContaining(['docs-sticky-sheet', 'docs-sticky-base', 'aspect-fit', 'scroll-contained']),
        });
    });
});

function createRenderManagerService() {
    const component = { makeDirty: vi.fn() };
    const render = {
        components: new Map([['component', component]]),
        engine: { resize: vi.fn() },
        scene: { makeDirty: vi.fn() },
        with: vi.fn(() => ({ calculatePagePosition: vi.fn() })),
    };

    return {
        getRenderById: vi.fn(() => render),
    };
}
