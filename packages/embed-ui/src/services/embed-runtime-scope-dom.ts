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

import type { UniverInstanceType } from '@univerjs/core';
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE } from './embed-interaction-boundary.service';

export const EMBED_FLOAT_DOM_ATTRIBUTE = 'data-embed-float-dom';
export const EMBED_ID_ATTRIBUTE = 'data-embed-id';
export const EMBED_HOST_UNIT_ID_ATTRIBUTE = 'data-embed-host-unit-id';
export const EMBED_CHILD_UNIT_ID_ATTRIBUTE = 'data-embed-child-unit-id';
export const EMBED_CHILD_TYPE_ATTRIBUTE = 'data-embed-child-type';

export interface IEmbedRuntimeDomScope {
    embedId: string;
    hostUnitId?: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
}

export function resolveEmbedRuntimeDomScope(element: HTMLElement | null | undefined): IEmbedRuntimeDomScope | undefined {
    if (!element) {
        return undefined;
    }

    const embedId = element.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`)
        ?.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE) ?? undefined;
    const container = resolveEmbedFloatDomContainer(element, embedId);
    const resolvedEmbedId = container?.getAttribute(EMBED_ID_ATTRIBUTE) ?? embedId;
    if (!resolvedEmbedId) {
        return undefined;
    }

    return {
        embedId: resolvedEmbedId,
        hostUnitId: container?.getAttribute(EMBED_HOST_UNIT_ID_ATTRIBUTE) ?? undefined,
        childUnitId: container?.getAttribute(EMBED_CHILD_UNIT_ID_ATTRIBUTE) ?? undefined,
        childType: readChildType(container),
    };
}

export function resolveActiveEmbedRuntimeDomScope(ownerDocument: Document = document): IEmbedRuntimeDomScope | undefined {
    const activeContainer = ownerDocument.querySelector<HTMLElement>(
        `[${EMBED_FLOAT_DOM_ATTRIBUTE}="true"][data-embed-float-stage="stage2"]`
    );
    if (!activeContainer) {
        return undefined;
    }

    return resolveEmbedRuntimeDomScope(activeContainer);
}

export function resolveEmbedFloatDomContainer(
    element: HTMLElement | null | undefined,
    embedId?: string
): HTMLElement | undefined {
    const ownContainer = element?.closest<HTMLElement>(`[${EMBED_FLOAT_DOM_ATTRIBUTE}="true"]`);
    if (ownContainer && (!embedId || ownContainer.getAttribute(EMBED_ID_ATTRIBUTE) === embedId)) {
        return ownContainer;
    }

    const ownerDocument = element?.ownerDocument ?? (typeof document === 'undefined' ? undefined : document);
    if (!ownerDocument || !embedId) {
        return ownContainer ?? undefined;
    }

    return ownerDocument.querySelector<HTMLElement>(
        `[${EMBED_FLOAT_DOM_ATTRIBUTE}="true"][${EMBED_ID_ATTRIBUTE}="${escapeAttributeValue(embedId)}"]`
    ) ?? undefined;
}

function escapeAttributeValue(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function readChildType(container: HTMLElement | undefined): UniverInstanceType | undefined {
    const value = container?.getAttribute(EMBED_CHILD_TYPE_ATTRIBUTE);
    if (value == null || value === '') {
        return undefined;
    }

    return Number(value) as UniverInstanceType;
}
