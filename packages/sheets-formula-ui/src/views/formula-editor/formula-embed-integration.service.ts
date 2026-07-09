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

import type { IDisposable } from '@univerjs/core';
import { createIdentifier } from '@univerjs/core';

export const FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE = 'data-embed-interaction-boundary-owner';
export const FORMULA_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE = 'data-embed-runtime-focus-role';
export const FORMULA_EMBED_ID_ATTRIBUTE = 'data-embed-id';
export const FORMULA_EMBED_HOST_UNIT_ID_ATTRIBUTE = 'data-embed-host-unit-id';
export const FORMULA_EMBED_CHILD_UNIT_ID_ATTRIBUTE = 'data-embed-child-unit-id';

export interface IFormulaEmbedRuntimeDomScope {
    embedId: string;
    hostUnitId?: string;
    childUnitId?: string;
}

export interface IFormulaEmbedRuntimeFocusCoordinator {
    resolveRuntimeScopeByChildUnitId(childUnitId: string): IFormulaEmbedRuntimeDomScope | undefined;
    acquireLease(options: {
        embedId: string;
        role: string;
        owner: string;
        hostUnitId?: string;
        childUnitId?: string;
        associatedChildUnitIds?: string[];
    }): IDisposable;
    registerElement(options: {
        embedId: string;
        role: string;
        element: HTMLElement;
    }): IDisposable;
}

export const IFormulaEmbedRuntimeFocusCoordinator = createIdentifier<IFormulaEmbedRuntimeFocusCoordinator>('sheets-formula-ui.embed-runtime-focus-coordinator');

export interface IFormulaEmbedInteractionBoundaryService {
    registerOwnedElement(embedId: string, element: Element): IDisposable;
}

export const IFormulaEmbedInteractionBoundaryService = createIdentifier<IFormulaEmbedInteractionBoundaryService>('sheets-formula-ui.embed-interaction-boundary.service');

export function resolveFormulaEmbedRuntimeDomScope(root: HTMLElement | null | undefined): IFormulaEmbedRuntimeDomScope | undefined {
    const scopeElement = root?.closest<HTMLElement>(`[${FORMULA_EMBED_ID_ATTRIBUTE}]`);
    const embedId = scopeElement?.getAttribute(FORMULA_EMBED_ID_ATTRIBUTE);
    if (!scopeElement || !embedId) {
        return undefined;
    }

    return {
        embedId,
        hostUnitId: scopeElement.getAttribute(FORMULA_EMBED_HOST_UNIT_ID_ATTRIBUTE) ?? undefined,
        childUnitId: scopeElement.getAttribute(FORMULA_EMBED_CHILD_UNIT_ID_ATTRIBUTE) ?? undefined,
    };
}

export function resolveActiveFormulaEmbedRuntimeDomScope(ownerDocument: Document | undefined): IFormulaEmbedRuntimeDomScope | undefined {
    const activeElement = ownerDocument?.activeElement;
    return activeElement instanceof HTMLElement ? resolveFormulaEmbedRuntimeDomScope(activeElement) : undefined;
}

export function isEventTargetInSameFormulaEmbedInteractionBoundary(left: EventTarget | null | undefined, right: EventTarget | null | undefined): boolean {
    const leftOwner = resolveFormulaEmbedInteractionOwnerId(left);
    return Boolean(leftOwner && leftOwner === resolveFormulaEmbedInteractionOwnerId(right));
}

function resolveFormulaEmbedInteractionOwnerId(target: EventTarget | null | undefined): string | undefined {
    if (!(target instanceof Element)) {
        return undefined;
    }

    return target.closest(`[${FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`)
        ?.getAttribute(FORMULA_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE) ?? undefined;
}
