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

export const EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE = 'data-embed-interaction-boundary-owner';

interface IEmbedBoundaryElementLike {
    getAttribute: (name: string) => string | null;
    closest: (selector: string) => IEmbedBoundaryElementLike | null;
}

export function getEmbedBoundaryOwner(target: EventTarget | null): string | undefined {
    if (!hasClosest(target)) {
        return undefined;
    }

    const ownerElement = target.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`);

    return getAttributeValue(target, EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE) ??
        getAttributeValue(ownerElement, EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE) ??
        undefined;
}

export function isEmbedBoundaryTarget(target: EventTarget | null): boolean {
    return hasClosest(target) && target.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`) != null;
}

export function keepInteractionInsideSameEmbedBoundary(event: {
    currentTarget: EventTarget | null;
    target: EventTarget | null;
    preventDefault: () => void;
}): void {
    const owner = getEmbedBoundaryOwner(event.currentTarget);
    if (!owner) {
        return;
    }

    if (getEmbedBoundaryOwner(event.target) === owner) {
        event.preventDefault();
    }
}

function hasClosest(target: EventTarget | null): target is EventTarget & Pick<IEmbedBoundaryElementLike, 'closest'> {
    return !!target &&
        typeof (target as Partial<IEmbedBoundaryElementLike>).closest === 'function';
}

function getAttributeValue(target: unknown, name: string): string | undefined {
    const getAttribute = (target as Partial<IEmbedBoundaryElementLike> | null | undefined)?.getAttribute;
    return typeof getAttribute === 'function'
        ? getAttribute.call(target, name) ?? undefined
        : undefined;
}
