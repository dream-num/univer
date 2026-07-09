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
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, getEmbedBoundaryOwner, isEmbedBoundaryTarget, keepInteractionInsideSameEmbedBoundary } from '../embed-boundary';

describe('embed boundary utilities', () => {
    it('returns undefined for non-element targets so non-embed UI keeps the default behavior', () => {
        expect(getEmbedBoundaryOwner(null)).toBeUndefined();
        expect(getEmbedBoundaryOwner(new EventTarget())).toBeUndefined();
        expect(isEmbedBoundaryTarget(new EventTarget())).toBe(false);
    });

    it('resolves the nearest embed boundary owner from a descendant target', () => {
        const owner = document.createElement('div');
        const target = document.createElement('button');

        owner.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        owner.appendChild(target);

        expect(getEmbedBoundaryOwner(target)).toBe('embed-1');
        expect(isEmbedBoundaryTarget(target)).toBe(true);
    });

    it('prevents outside handling only when both targets belong to the same embed boundary', () => {
        const currentOwner = document.createElement('div');
        const current = document.createElement('button');
        const sameOwner = document.createElement('div');
        const sameTarget = document.createElement('input');
        const otherOwner = document.createElement('div');
        const otherTarget = document.createElement('input');
        const preventDefault = vi.fn();

        currentOwner.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        sameOwner.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        otherOwner.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-2');
        currentOwner.appendChild(current);
        sameOwner.appendChild(sameTarget);
        otherOwner.appendChild(otherTarget);

        keepInteractionInsideSameEmbedBoundary({
            currentTarget: current,
            target: sameTarget,
            preventDefault,
        });

        expect(preventDefault).toHaveBeenCalledTimes(1);

        keepInteractionInsideSameEmbedBoundary({
            currentTarget: current,
            target: otherTarget,
            preventDefault,
        });

        keepInteractionInsideSameEmbedBoundary({
            currentTarget: document.createElement('button'),
            target: sameTarget,
            preventDefault,
        });

        expect(preventDefault).toHaveBeenCalledTimes(1);
    });
});
