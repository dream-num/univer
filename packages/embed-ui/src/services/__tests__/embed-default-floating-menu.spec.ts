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
import type { IEmbedFloatingMenuMountContext } from '../../types/embed-ui';
import { Injector, UniverInstanceType } from '@univerjs/core';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import {
    createDefaultEmbedFloatingMenuContributions,
    mountDefaultEmbedFloatingMenu,
} from '../embed-default-floating-menu';

describe('default embed floating menu', () => {
    it('does not register a default floating menu after fullscreen moved into the float chrome', () => {
        expect(createDefaultEmbedFloatingMenuContributions()).toEqual([]);
    });

    it('keeps the legacy mount helper as a no-op', () => {
        const root = document.createElement('div');
        const overlay = document.createElement('div');
        const content = document.createElement('div');
        const injector = new Injector([]);

        root.append(content, overlay);

        const disposable = mountDefaultEmbedFloatingMenu(createContext(root, content, overlay, injector));

        expect(overlay.querySelector('[data-embed-floating-menu="true"]')).toBeNull();
        disposable.dispose();
        expect(overlay.querySelector('[data-embed-floating-menu="true"]')).toBeNull();
    });
});

function createContext(
    rootElement: HTMLElement,
    contentRoot: HTMLElement,
    overlayRoot: HTMLElement,
    injector: Injector
): IEmbedFloatingMenuMountContext {
    const descriptor: IEmbedDescriptor = {
        embedId: 'embed-1',
        hostUnitId: 'host-1',
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-floating-object',
        hostAnchorId: 'anchor-1',
        source: {
            unitType: UniverInstanceType.UNIVER_DOC,
            ref: { file: { kind: 'self' }, unit: { selector: 'child-1', type: 'doc' } },
        },
        childUnitId: 'child-1',
        childType: UniverInstanceType.UNIVER_DOC,
        sourceMeta: {
            floating: {
                enabled: true,
                layout: 'doc-width-scale',
                fullscreen: true,
            },
        },
    };

    return {
        descriptor,
        layout: 'doc-width-scale',
        injector,
        hostElement: rootElement,
        container: rootElement,
        hostUnitId: descriptor.hostUnitId,
        embedId: descriptor.embedId,
        childUnitId: descriptor.childUnitId!,
        childType: descriptor.childType!,
        active: null,
        renderScope: {
            hostUnitId: descriptor.hostUnitId,
            hostAnchorId: descriptor.hostAnchorId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId!,
            childType: descriptor.childType!,
            layout: 'doc-width-scale',
            mode: 'float',
            rootElement,
            contentRoot,
            overlayRoot,
            active$: of(true),
        },
        runtimeScope: {
            descriptor,
            host: {
                unitId: descriptor.hostUnitId,
                type: descriptor.hostType,
                anchorId: descriptor.hostAnchorId,
                entry: descriptor.entry,
                layout: 'float',
            },
            child: {
                unitId: descriptor.childUnitId!,
                type: descriptor.childType!,
            },
            injector,
            roots: {
                root: rootElement,
                content: contentRoot,
                overlay: overlayRoot,
                popup: overlayRoot,
            },
            activate: () => {},
            deactivate: () => {},
            dispose: () => {},
        },
    };
}
