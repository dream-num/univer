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

/**
 * @vitest-environment jsdom
 */

import type { IEmbedDescriptor } from '@univerjs/embed';
import type { EmbedChildRuntimeScopeCreateContext } from '../embed-child-runtime-scope';
import { Injector, UniverInstanceType } from '@univerjs/core';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { EMBED_CONTENT_ROOT_ATTRIBUTE, EMBED_OVERLAY_ROOT_ATTRIBUTE } from '../../common/embed-runtime-slots';
import { createEmbedChildRuntimeScope } from '../embed-child-runtime-scope';

describe('createEmbedChildRuntimeScope', () => {
    it('uses the render scope content root as the runtime content root', () => {
        const root = document.createElement('div');
        const content = document.createElement('div');
        const overlay = document.createElement('div');

        root.append(content, overlay);

        const { runtimeScope, disposable } = createEmbedChildRuntimeScope(createContext(root, {
            contentRoot: content,
            overlayRoot: overlay,
        }), () => {});

        expect(runtimeScope.roots.root).toBe(root);
        expect(runtimeScope.roots.content).toBe(content);
        expect(runtimeScope.roots.overlay).toBe(overlay);

        disposable.dispose();
    });

    it('falls back to the declared content slot before using the root element', () => {
        const root = document.createElement('div');
        const content = document.createElement('div');
        const overlay = document.createElement('div');

        content.setAttribute(EMBED_CONTENT_ROOT_ATTRIBUTE, 'true');
        overlay.setAttribute(EMBED_OVERLAY_ROOT_ATTRIBUTE, 'true');
        root.append(content, overlay);

        const { runtimeScope, disposable } = createEmbedChildRuntimeScope(createContext(root), () => {});

        expect(runtimeScope.roots.content).toBe(content);
        expect(runtimeScope.roots.overlay).toBe(overlay);

        disposable.dispose();
    });

    it('uses the root element as the content root when no content slot exists', () => {
        const root = document.createElement('div');

        const { runtimeScope, disposable } = createEmbedChildRuntimeScope(createContext(root), () => {});

        expect(runtimeScope.roots.content).toBe(root);

        disposable.dispose();
    });
});

function createContext(
    rootElement: HTMLElement,
    overrides: Partial<EmbedChildRuntimeScopeCreateContext['renderScope']> = {}
): EmbedChildRuntimeScopeCreateContext {
    const descriptor: IEmbedDescriptor = {
        embedId: 'embed-1',
        hostUnitId: 'host-1',
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-sheet-tab',
        hostAnchorId: 'anchor-1',
        source: {
            unitType: UniverInstanceType.UNIVER_DOC,
            ref: { file: { kind: 'self' }, unit: { selector: 'child-1', type: 'doc' } },
        },
        childUnitId: 'child-1',
        childType: UniverInstanceType.UNIVER_DOC,
        sourceMeta: {
            tab: { enabled: true },
        },
    };

    return {
        descriptor,
        layout: 'tab-peer',
        injector: new Injector(),
        hostElement: rootElement,
        container: rootElement,
        hostUnitId: descriptor.hostUnitId,
        embedId: descriptor.embedId,
        childUnitId: descriptor.childUnitId!,
        childType: descriptor.childType!,
        renderScope: {
            hostUnitId: descriptor.hostUnitId,
            hostAnchorId: descriptor.hostAnchorId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId!,
            childType: descriptor.childType!,
            layout: 'tab-peer',
            mode: 'tab',
            rootElement,
            active$: of(true),
            ...overrides,
        },
    };
}
