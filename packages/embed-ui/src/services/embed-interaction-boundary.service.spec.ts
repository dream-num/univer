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

import { describe, expect, it, vi } from 'vitest';
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, EmbedInteractionBoundaryService } from './embed-interaction-boundary.service';

describe('EmbedInteractionBoundaryService', () => {
    it('treats registered roots as part of the embed interaction boundary', () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const child = document.createElement('button');
        root.appendChild(child);
        document.body.appendChild(root);

        const disposable = service.registerRoot('embed-1', root);

        expect(service.contains('embed-1', child)).toBe(true);
        expect(service.contains('embed-2', child)).toBe(false);
        expect(root.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');

        disposable.dispose();

        expect(service.contains('embed-1', child)).toBe(false);
        expect(root.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        root.remove();
    });

    it('can detect any embed-owned boundary when the host does not know the embed id', () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const child = document.createElement('button');
        root.appendChild(child);
        document.body.appendChild(root);

        const disposable = service.registerRoot('embed-1', root);

        expect(service.contains(undefined, child)).toBe(true);
        expect(service.contains(undefined, document.body)).toBe(false);

        disposable.dispose();
        root.remove();
    });

    it('honors owner attributes in the event composed path', () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        const child = document.createElement('button');
        root.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        root.appendChild(child);

        const event = {
            composedPath: () => [child, root, document.body, document],
        } as unknown as Event;

        expect(service.contains('embed-1', document.body, event)).toBe(true);
        expect(service.contains('embed-2', document.body, event)).toBe(false);
    });

    it('marks body portals created immediately after interaction inside a registered root', async () => {
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        document.body.appendChild(root);
        const disposable = service.registerRoot('embed-1', root);

        expect(service.hasRecentInteraction(document)).toBe(false);
        root.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(service.hasRecentInteraction(document)).toBe(true);
        const portal = document.createElement('div');
        document.body.appendChild(portal);
        await Promise.resolve();

        expect(portal.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(service.contains('embed-1', portal)).toBe(true);

        disposable.dispose();
        portal.remove();
        root.remove();
    });

    it('expires recent interaction state after the portal claim ttl', () => {
        vi.useFakeTimers();
        const service = new EmbedInteractionBoundaryService();
        const root = document.createElement('div');
        document.body.appendChild(root);
        const disposable = service.registerRoot('embed-1', root);

        root.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(service.hasRecentInteraction(document)).toBe(true);

        vi.advanceTimersByTime(1001);
        expect(service.hasRecentInteraction(document)).toBe(false);

        disposable.dispose();
        root.remove();
        vi.useRealTimers();
    });
});
