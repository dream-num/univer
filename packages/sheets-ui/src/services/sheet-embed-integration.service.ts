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

import type { IDisposable, UniverInstanceType } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { createIdentifier, toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';

export const SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE = 'data-embed-interaction-boundary-owner';
export const SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE = 'data-embed-runtime-focus-role';
export const EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE = SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE;
export const EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE = SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE;
export const SHEET_EMBED_FLOAT_DOM_ATTRIBUTE = 'data-embed-float-dom';
export const SHEET_EMBED_ID_ATTRIBUTE = 'data-embed-id';
export const SHEET_EMBED_HOST_UNIT_ID_ATTRIBUTE = 'data-embed-host-unit-id';
export const SHEET_EMBED_CHILD_UNIT_ID_ATTRIBUTE = 'data-embed-child-unit-id';
export const SHEET_EMBED_CHILD_TYPE_ATTRIBUTE = 'data-embed-child-type';

export interface ISheetEmbedRuntimeDomScope {
    embedId: string;
    hostUnitId?: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
}

export interface ISheetEmbedInteractionBoundaryService {
    registerOwnedElement(embedId: string, element: HTMLElement): IDisposable;
}

export const ISheetEmbedInteractionBoundaryService = createIdentifier<ISheetEmbedInteractionBoundaryService>('sheets-ui.embed-interaction-boundary.service');

export interface ISheetEmbedRuntimeFocusCoordinator {
    readonly runtimeSessionChanged$: Observable<void>;
    acquireLease(options: {
        embedId: string;
        role: string;
        owner?: string;
        hostUnitId?: string;
        childUnitId?: string;
        childType?: UniverInstanceType;
        associatedChildUnitIds?: string[];
    }): IDisposable;
    registerElement(options: {
        embedId: string;
        role: string;
        element: HTMLElement;
    }): IDisposable;
    resolveRuntimeScopeByChildUnitId(childUnitId: string | undefined): ISheetEmbedRuntimeDomScope | undefined;
    resolveActiveChildSessionRuntimeScope(): ISheetEmbedRuntimeDomScope | undefined;
    isChildUnitInActiveSession(unitId: string | undefined): boolean;
    isChildUnitRuntimeEvent(unitId: string | undefined, target: EventTarget | null | undefined, event?: Event): boolean;
}

export const ISheetEmbedRuntimeFocusCoordinator = createIdentifier<ISheetEmbedRuntimeFocusCoordinator>('sheets-ui.embed-runtime-focus-coordinator');

export interface ISheetEmbedFloatingGeometryService {
    readonly geometryInvalidated$: Observable<unknown>;
    getRegistrationByChildUnitId(childUnitId: string): {
        root: HTMLElement;
        viewport?: HTMLElement | null;
        contentRoot?: HTMLElement | null;
    } | undefined;
}

export const ISheetEmbedFloatingGeometryService = createIdentifier<ISheetEmbedFloatingGeometryService>('sheets-ui.embed-floating-geometry.service');

export class EmbedInteractionBoundaryService implements ISheetEmbedInteractionBoundaryService {
    private readonly _roots = new Map<string, Set<HTMLElement>>();

    registerOwnedElement(embedId: string, element: HTMLElement): IDisposable {
        this._mark(embedId, element);
        element.querySelectorAll<HTMLElement>('*').forEach((child) => this._mark(embedId, child));
        let roots = this._roots.get(embedId);
        if (!roots) {
            roots = new Set();
            this._roots.set(embedId, roots);
        }
        roots.add(element);

        return toDisposable(() => {
            roots?.delete(element);
            element.removeAttribute(SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
            element.removeAttribute(SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
            element.querySelectorAll<HTMLElement>('*').forEach((child) => {
                child.removeAttribute(SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
                child.removeAttribute(SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
            });
        });
    }

    contains(embedId: string | undefined, target: EventTarget | null | undefined): boolean {
        if (!(target instanceof HTMLElement)) {
            return false;
        }

        if (!embedId) {
            return [...this._roots.values()].some((roots) => [...roots].some((root) => root.contains(target)));
        }

        return this._roots.get(embedId) != null && [...this._roots.get(embedId)!].some((root) => root.contains(target));
    }

    private _mark(embedId: string, element: HTMLElement): void {
        element.setAttribute(SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, embedId);
        element.setAttribute(SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, 'child-editor');
    }
}

export class EmbedRuntimeFocusCoordinator implements ISheetEmbedRuntimeFocusCoordinator {
    private readonly _leases = new Set<{
        embedId: string;
        role: string;
        owner?: string;
        childUnitId?: string;
        hostUnitId?: string;
        childType?: UniverInstanceType;
        associatedChildUnitIds?: string[];
    }>();

    private readonly _elements = new Map<string, Set<HTMLElement>>();
    readonly runtimeSessionChanged$ = new Subject<void>();

    acquireLease(options: {
        embedId: string;
        role: string;
        owner?: string;
        childUnitId?: string;
        hostUnitId?: string;
        childType?: UniverInstanceType;
        associatedChildUnitIds?: string[];
    }): IDisposable {
        this._leases.add(options);
        if (options.role === 'child-session') {
            this.runtimeSessionChanged$.next();
        }

        return toDisposable(() => {
            this._leases.delete(options);
            if (options.role === 'child-session') {
                this.runtimeSessionChanged$.next();
            }
        });
    }

    registerElement(options: { embedId: string; role: string; element: HTMLElement }): IDisposable {
        options.element.setAttribute(SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, options.embedId);
        options.element.setAttribute(SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, options.role);
        let elements = this._elements.get(options.embedId);
        if (!elements) {
            elements = new Set();
            this._elements.set(options.embedId, elements);
        }
        elements.add(options.element);

        return toDisposable(() => {
            elements?.delete(options.element);
            options.element.removeAttribute(SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
            options.element.removeAttribute(SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
        });
    }

    containsElement(embedId: string, element: HTMLElement | null | undefined): boolean {
        return !!element && this._elements.get(embedId)?.has(element) === true;
    }

    registerRuntimeScope(options: { embedId: string; hostUnitId?: string; childUnitId?: string; childType?: UniverInstanceType }): IDisposable {
        const lease = { ...options, role: 'runtime' };
        this._leases.add(lease);
        this.runtimeSessionChanged$.next();

        return toDisposable(() => {
            this._leases.delete(lease);
            this.runtimeSessionChanged$.next();
        });
    }

    hasChildInteractionLease(embedId: string | undefined): boolean {
        return [...this._leases].some((lease) => lease.embedId === embedId && lease.role !== 'runtime');
    }

    hasHostPreservingChildFocusLeaseForHost(hostUnitId: string | undefined): boolean {
        return [...this._leases].some((lease) => lease.role !== 'runtime' && (!hostUnitId || lease.hostUnitId === hostUnitId));
    }

    resolveRuntimeScopeByChildUnitId(childUnitId: string | undefined): ISheetEmbedRuntimeDomScope | undefined {
        const lease = [...this._leases].find((item) => matchesChildUnitId(item, childUnitId));
        return lease ? { embedId: lease.embedId, hostUnitId: lease.hostUnitId, childUnitId: lease.childUnitId, childType: lease.childType } : undefined;
    }

    resolveActiveChildSessionRuntimeScope(): ISheetEmbedRuntimeDomScope | undefined {
        const lease = [...this._leases].find((item) => item.role === 'child-session');
        return lease ? { embedId: lease.embedId, hostUnitId: lease.hostUnitId, childUnitId: lease.childUnitId, childType: lease.childType } : undefined;
    }

    isChildUnitInActiveSession(unitId: string | undefined): boolean {
        return [...this._leases].some((lease) => lease.role !== 'runtime' && (!lease.childUnitId || matchesChildUnitId(lease, unitId)));
    }

    isChildUnitRuntimeEvent(unitId: string | undefined, target: EventTarget | null | undefined): boolean {
        return this.isChildUnitInActiveSession(unitId) || (
            target instanceof HTMLElement &&
            target.closest(`[${SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`) != null
        );
    }
}

function matchesChildUnitId(lease: { childUnitId?: string; associatedChildUnitIds?: string[] }, unitId: string | undefined): boolean {
    return unitId != null && (lease.childUnitId === unitId || lease.associatedChildUnitIds?.includes(unitId) === true);
}

export class EmbedFloatingGeometryService implements ISheetEmbedFloatingGeometryService {
    private readonly _registrations = new Map<string, { childUnitId?: string; root: HTMLElement; viewport?: HTMLElement | null; contentRoot?: HTMLElement | null }>();
    private readonly _geometryInvalidated$ = new Subject<unknown>();
    readonly geometryInvalidated$ = this._geometryInvalidated$.asObservable();

    register(registration: { embedId: string; childUnitId?: string; root: HTMLElement; viewport?: HTMLElement | null; contentRoot?: HTMLElement | null }): IDisposable {
        this._registrations.set(registration.embedId, registration);
        this._geometryInvalidated$.next({});

        return toDisposable(() => {
            this._registrations.delete(registration.embedId);
            this._geometryInvalidated$.next({});
        });
    }

    getRegistrationByChildUnitId(childUnitId: string) {
        return [...this._registrations.values()].find((registration) => registration.childUnitId === childUnitId);
    }
}

export function resolveSheetEmbedRuntimeDomScope(element: HTMLElement | null | undefined): ISheetEmbedRuntimeDomScope | undefined {
    if (!element) {
        return undefined;
    }

    const embedId = element.closest(`[${SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`)
        ?.getAttribute(SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE) ?? undefined;
    const container = resolveSheetEmbedFloatDomContainer(element, embedId);
    const resolvedEmbedId = container?.getAttribute(SHEET_EMBED_ID_ATTRIBUTE) ?? embedId;
    if (!resolvedEmbedId) {
        return undefined;
    }

    return {
        embedId: resolvedEmbedId,
        hostUnitId: container?.getAttribute(SHEET_EMBED_HOST_UNIT_ID_ATTRIBUTE) ?? undefined,
        childUnitId: container?.getAttribute(SHEET_EMBED_CHILD_UNIT_ID_ATTRIBUTE) ?? undefined,
        childType: readChildType(container),
    };
}

export function resolveActiveSheetEmbedRuntimeDomScope(ownerDocument: Document = document): ISheetEmbedRuntimeDomScope | undefined {
    const activeContainer = ownerDocument.querySelector<HTMLElement>(
        `[${SHEET_EMBED_FLOAT_DOM_ATTRIBUTE}="true"][data-embed-float-stage="stage2"]`
    );
    if (!activeContainer) {
        return undefined;
    }

    return resolveSheetEmbedRuntimeDomScope(activeContainer);
}

function resolveSheetEmbedFloatDomContainer(element: HTMLElement | null | undefined, embedId?: string): HTMLElement | undefined {
    const ownContainer = element?.closest<HTMLElement>(`[${SHEET_EMBED_FLOAT_DOM_ATTRIBUTE}="true"]`);
    if (ownContainer && (!embedId || ownContainer.getAttribute(SHEET_EMBED_ID_ATTRIBUTE) === embedId)) {
        return ownContainer;
    }

    const ownerDocument = element?.ownerDocument ?? (typeof document === 'undefined' ? undefined : document);
    if (!ownerDocument || !embedId) {
        return ownContainer ?? undefined;
    }

    return ownerDocument.querySelector<HTMLElement>(
        `[${SHEET_EMBED_FLOAT_DOM_ATTRIBUTE}="true"][${SHEET_EMBED_ID_ATTRIBUTE}="${escapeAttributeValue(embedId)}"]`
    ) ?? undefined;
}

function escapeAttributeValue(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function readChildType(container: HTMLElement | undefined): UniverInstanceType | undefined {
    const value = container?.getAttribute(SHEET_EMBED_CHILD_TYPE_ATTRIBUTE);
    if (value == null || value === '') {
        return undefined;
    }

    return Number(value) as UniverInstanceType;
}
