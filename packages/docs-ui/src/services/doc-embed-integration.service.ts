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
import { toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';

export const DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE = 'data-embed-interaction-boundary-owner';
export const EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE = DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE;

export interface IDocEmbedInteractionBoundaryService {
    contains(embedId: string | undefined, target: EventTarget | null | undefined, event?: Event): boolean;
    hasRecentInteraction(ownerDocument?: Document): boolean;
    hasRecentInteractionFor?(embedId: string | undefined, ownerDocument?: Document): boolean;
}

export interface IDocEmbedRuntimeFocusCoordinator {
    isChildUnitRuntimeEvent(unitId: string | undefined, target: EventTarget | null | undefined, event?: Event): boolean;
    isChildUnitInActiveSession(unitId: string | undefined): boolean;
    shouldSuppressHostInteraction(unitId: string | undefined, target?: EventTarget | null, event?: Event): boolean;
}

export class EmbedInteractionBoundaryService implements IDocEmbedInteractionBoundaryService {
    private readonly _roots = new Map<string, Set<HTMLElement>>();

    registerOwnedElement(embedId: string, element: HTMLElement): IDisposable {
        element.setAttribute(DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, embedId);
        element.querySelectorAll<HTMLElement>('*').forEach((child) => child.setAttribute(DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, embedId));
        let roots = this._roots.get(embedId);
        if (!roots) {
            roots = new Set();
            this._roots.set(embedId, roots);
        }
        roots.add(element);

        return toDisposable(() => {
            roots?.delete(element);
            element.removeAttribute(DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
            element.querySelectorAll<HTMLElement>('*').forEach((child) => child.removeAttribute(DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE));
        });
    }

    contains(embedId: string | undefined, target: EventTarget | null | undefined): boolean {
        if (!(target instanceof HTMLElement)) {
            return false;
        }

        if (!embedId) {
            return [...this._roots.values()].some((roots) => [...roots].some((root) => root.contains(target)));
        }

        return this._roots.get(embedId)?.has(target) === true ||
            (this._roots.get(embedId) != null && [...this._roots.get(embedId)!].some((root) => root.contains(target)));
    }

    hasRecentInteraction(): boolean {
        return false;
    }

    hasRecentInteractionFor(): boolean {
        return false;
    }
}

export const IDocEmbedInteractionBoundaryService = EmbedInteractionBoundaryService;

export class EmbedRuntimeFocusCoordinator implements IDocEmbedRuntimeFocusCoordinator {
    private readonly _leases = new Set<{ embedId?: string; childUnitId?: string; hostUnitId?: string; role: string; owner?: string }>();
    private readonly _elements = new Map<string, Set<HTMLElement>>();
    readonly runtimeSessionChanged$ = new Subject<void>();

    acquireLease(options: { embedId?: string; role: string; owner?: string; childUnitId?: string; hostUnitId?: string }): IDisposable {
        this._leases.add(options);
        this.runtimeSessionChanged$.next();

        return toDisposable(() => {
            this._leases.delete(options);
            this.runtimeSessionChanged$.next();
        });
    }

    registerElement(options: { embedId: string; role: string; element: HTMLElement }): IDisposable {
        options.element.setAttribute(DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, options.embedId);
        let elements = this._elements.get(options.embedId);
        if (!elements) {
            elements = new Set();
            this._elements.set(options.embedId, elements);
        }
        elements.add(options.element);

        return toDisposable(() => {
            elements?.delete(options.element);
            options.element.removeAttribute(DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
        });
    }

    registerRuntimeScope(_options: { embedId: string; hostUnitId?: string; childUnitId?: string }): IDisposable {
        return toDisposable(() => {});
    }

    isChildUnitRuntimeEvent(_unitId: string | undefined, target: EventTarget | null | undefined): boolean {
        return target instanceof HTMLElement &&
            target.closest(`[${DOC_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`) != null;
    }

    isChildUnitInActiveSession(unitId: string | undefined): boolean {
        return [...this._leases].some((lease) => lease.role !== 'runtime' && lease.childUnitId === unitId);
    }

    shouldSuppressHostInteraction(unitId: string | undefined, target?: EventTarget | null): boolean {
        if (this.isChildUnitRuntimeEvent(unitId, target)) {
            return false;
        }

        return [...this._leases].some((lease) => {
            if (lease.role === 'runtime' || lease.childUnitId === unitId) {
                return false;
            }

            return lease.hostUnitId === unitId || (!lease.hostUnitId && !lease.childUnitId);
        });
    }
}

export const IDocEmbedRuntimeFocusCoordinator = EmbedRuntimeFocusCoordinator;
