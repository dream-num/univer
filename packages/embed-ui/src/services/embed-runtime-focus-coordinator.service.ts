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
import { toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE } from './embed-interaction-boundary.service';

export const EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE = 'data-embed-runtime-focus-role';

export type EmbedRuntimeFocusRole = 'runtime' | 'child-session' | 'child-editor' | 'child-popup' | 'floating-menu';
export type EmbedRuntimeSessionMode = 'host-passive' | 'child-keyboard' | 'child-fullscreen' | 'child-tab';

export interface IEmbedRuntimeFocusLeaseOptions {
    embedId: string;
    role: EmbedRuntimeFocusRole;
    owner?: string;
    sessionMode?: EmbedRuntimeSessionMode;
    hostUnitId?: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
    associatedChildUnitIds?: string[];
}

export interface IEmbedRuntimeFocusElementRegistration {
    embedId: string;
    role: EmbedRuntimeFocusRole;
    element: HTMLElement;
}

export interface IEmbedRuntimeScopeRegistration {
    embedId: string;
    hostUnitId?: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
    sessionMode?: EmbedRuntimeSessionMode;
}

export interface IEmbedRuntimeFocusLeaseQueryOptions {
    ignoreOwners?: string[];
}

interface IEmbedRuntimeFocusLease {
    role: EmbedRuntimeFocusRole;
    owner?: string;
    sessionMode?: EmbedRuntimeSessionMode;
    hostUnitId?: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
    associatedChildUnitIds?: string[];
    sequence: number;
}

interface IEmbedRuntimeScope {
    hostUnitId?: string;
    childUnitId?: string;
    childType?: UniverInstanceType;
    sessionMode?: EmbedRuntimeSessionMode;
}

export class EmbedRuntimeFocusCoordinator {
    private readonly _leases = new Map<string, Set<IEmbedRuntimeFocusLease>>();
    private readonly _elements = new Map<string, Set<HTMLElement>>();
    private readonly _runtimeScopes = new Map<string, IEmbedRuntimeScope>();
    private _leaseSequence = 0;
    readonly runtimeFocusChanged$ = new Subject<void>();
    readonly runtimeSessionChanged$ = new Subject<void>();

    acquireLease(options: IEmbedRuntimeFocusLeaseOptions): IDisposable {
        const lease: IEmbedRuntimeFocusLease = {
            role: options.role,
            owner: options.owner,
            sessionMode: options.sessionMode,
            hostUnitId: options.hostUnitId,
            childUnitId: options.childUnitId,
            childType: options.childType,
            associatedChildUnitIds: options.associatedChildUnitIds,
            sequence: ++this._leaseSequence,
        };
        let leases = this._leases.get(options.embedId);
        if (!leases) {
            leases = new Set();
            this._leases.set(options.embedId, leases);
        }

        leases.add(lease);
        if (lease.role !== 'runtime') {
            this._notifyRuntimeFocusChanged();
        }
        if (lease.role === 'child-session') {
            this._notifyRuntimeSessionChanged();
        }

        return toDisposable(() => {
            leases?.delete(lease);
            if (leases?.size === 0) {
                this._leases.delete(options.embedId);
            }
            if (lease.role !== 'runtime') {
                this._notifyRuntimeFocusChanged();
            }
            if (lease.role === 'child-session') {
                this._notifyRuntimeSessionChanged();
            }
        });
    }

    hasChildInteractionLease(embedId: string | undefined): boolean {
        if (!embedId) {
            return false;
        }

        const leases = this._leases.get(embedId);
        if (leases && [...leases].some((lease) => lease.role !== 'runtime')) {
            return true;
        }

        return this.containsElement(embedId, this._getActiveElement(embedId));
    }

    hasBlockingChildFocusLease(embedId: string | undefined, options?: IEmbedRuntimeFocusLeaseQueryOptions): boolean {
        if (!embedId) {
            return false;
        }

        const leases = this._leases.get(embedId);
        if (leases && [...leases].some((lease) => this._isBlockingLease(lease, options))) {
            return true;
        }

        return this.containsElement(embedId, this._getActiveElement(embedId));
    }

    hasAnyChildInteractionLease(): boolean {
        return [...this._leases.values()].some((leases) => [...leases].some((lease) => lease.role !== 'runtime')) ||
            this._getActiveOwnedRuntimeFocusInfo() != null;
    }

    hasAnyBlockingChildFocusLease(options?: IEmbedRuntimeFocusLeaseQueryOptions): boolean {
        if ([...this._leases.values()].some((leases) => [...leases].some((lease) => this._isBlockingLease(lease, options)))) {
            return true;
        }

        const info = this._getActiveOwnedRuntimeFocusInfo();
        return info != null && this._isBlockingRole(info.role);
    }

    hasHostPreservingChildFocusLease(embedId: string | undefined, options?: IEmbedRuntimeFocusLeaseQueryOptions): boolean {
        if (!embedId) {
            return false;
        }

        const leases = this._leases.get(embedId);
        if (leases && [...leases].some((lease) => this._isHostPreservingLease(lease, options))) {
            return true;
        }

        return this.containsElement(embedId, this._getActiveElement(embedId));
    }

    hasAnyHostPreservingChildFocusLease(options?: IEmbedRuntimeFocusLeaseQueryOptions): boolean {
        if ([...this._leases.values()].some((leases) => [...leases].some((lease) => this._isHostPreservingLease(lease, options)))) {
            return true;
        }

        return this._getActiveOwnedRuntimeFocusInfo() != null;
    }

    hasHostPreservingChildFocusLeaseForHost(hostUnitId: string | undefined, options?: IEmbedRuntimeFocusLeaseQueryOptions): boolean {
        if (!hostUnitId) {
            return this.hasAnyHostPreservingChildFocusLease(options);
        }

        if ([...this._leases.values()].some((leases) => [...leases].some((lease) => (
            this._isHostPreservingLease(lease, options) && this._leaseAppliesToHostUnit(lease, hostUnitId)
        )))) {
            return true;
        }

        const info = this._getActiveOwnedRuntimeFocusInfo();
        if (!info) {
            return false;
        }

        const leases = this._leases.get(info.embedId);
        return !!leases && [...leases].some((lease) => (
            this._isHostPreservingLease(lease, options) && this._leaseAppliesToHostUnit(lease, hostUnitId)
        ));
    }

    isChildUnitInActiveSession(unitId: string | undefined): boolean {
        if (!unitId) {
            return false;
        }

        return [...this._leases.values()].some((leases) => [...leases].some((lease) => (
            this._leaseAppliesToChildUnit(lease, unitId) && lease.role !== 'runtime'
        )));
    }

    registerRuntimeScope(options: IEmbedRuntimeScopeRegistration): IDisposable {
        const scope: IEmbedRuntimeScope = {
            hostUnitId: options.hostUnitId,
            childUnitId: options.childUnitId,
            childType: options.childType,
            sessionMode: options.sessionMode,
        };
        this._runtimeScopes.set(options.embedId, scope);
        this._notifyRuntimeFocusChanged();
        this._notifyRuntimeSessionChanged();

        return toDisposable(() => {
            if (this._runtimeScopes.get(options.embedId) === scope) {
                this._runtimeScopes.delete(options.embedId);
                this._notifyRuntimeFocusChanged();
                this._notifyRuntimeSessionChanged();
            }
        });
    }

    resolveRuntimeScopeByChildUnitId(childUnitId: string | undefined): IEmbedRuntimeScopeRegistration | undefined {
        if (!childUnitId) {
            return undefined;
        }

        for (const [embedId, scope] of this._runtimeScopes) {
            if (scope.childUnitId === childUnitId) {
                return {
                    embedId,
                    hostUnitId: scope.hostUnitId,
                    childUnitId: scope.childUnitId,
                    childType: scope.childType,
                    sessionMode: scope.sessionMode,
                };
            }
        }

        return undefined;
    }

    resolveActiveChildSessionRuntimeScope(): IEmbedRuntimeScopeRegistration | undefined {
        let best: { embedId: string; lease: IEmbedRuntimeFocusLease; priority: number } | undefined;
        for (const [embedId, leases] of this._leases) {
            for (const lease of leases) {
                if (lease.role !== 'child-session' || !lease.childUnitId) {
                    continue;
                }

                const priority = this._getChildSessionPriority(lease);
                if (!best || priority > best.priority || (priority === best.priority && lease.sequence > best.lease.sequence)) {
                    best = { embedId, lease, priority };
                }
            }
        }

        return best
            ? {
                embedId: best.embedId,
                hostUnitId: best.lease.hostUnitId,
                childUnitId: best.lease.childUnitId,
                childType: best.lease.childType,
                sessionMode: this._resolveChildSessionMode(best.lease),
            }
            : undefined;
    }

    isChildUnitRuntimeEvent(unitId: string | undefined, target: EventTarget | null | undefined, event?: Event): boolean {
        if (!unitId) {
            return false;
        }

        const embedId = this._getOwnedEmbedIdFromTarget(target, event);
        if (!embedId) {
            return false;
        }

        return this._ownedEmbedAppliesToChildUnit(embedId, unitId);
    }

    shouldSuppressHostInteraction(
        unitId: string | undefined,
        target?: EventTarget | null,
        event?: Event,
        options?: IEmbedRuntimeFocusLeaseQueryOptions
    ): boolean {
        if (this.isChildUnitRuntimeEvent(unitId, target, event)) {
            return false;
        }

        if (this.isChildUnitInActiveSession(unitId)) {
            return false;
        }

        return this.hasHostPreservingChildFocusLeaseForHost(unitId, options);
    }

    registerElement(options: IEmbedRuntimeFocusElementRegistration): IDisposable {
        let elements = this._elements.get(options.embedId);
        if (!elements) {
            elements = new Set();
            this._elements.set(options.embedId, elements);
        }

        elements.add(options.element);
        const previousRole = options.element.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
        options.element.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, options.role);

        return toDisposable(() => {
            elements?.delete(options.element);
            if (elements?.size === 0) {
                this._elements.delete(options.embedId);
            }
            if (previousRole == null) {
                options.element.removeAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
            } else {
                options.element.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, previousRole);
            }
        });
    }

    containsElement(embedId: string | undefined, target: EventTarget | null | undefined, event?: Event): boolean {
        if (!embedId) {
            return false;
        }

        const elements = this._elements.get(embedId);

        const path = typeof event?.composedPath === 'function' ? event.composedPath() : undefined;
        if (elements?.size && path?.some((entry) => entry instanceof HTMLElement && this._containsRegisteredElement(elements, entry))) {
            return true;
        }

        if (path?.some((entry) => entry instanceof HTMLElement && this._isOwnedBoundaryElement(embedId, entry))) {
            return true;
        }

        return target instanceof HTMLElement &&
            ((!!elements?.size && this._containsRegisteredElement(elements, target)) || this._isOwnedBoundaryElement(embedId, target));
    }

    private _containsRegisteredElement(elements: Set<HTMLElement>, target: HTMLElement): boolean {
        return [...elements].some((element) => element === target || element.contains(target));
    }

    private _isBlockingLease(lease: IEmbedRuntimeFocusLease, options?: IEmbedRuntimeFocusLeaseQueryOptions): boolean {
        if (lease.owner && options?.ignoreOwners?.includes(lease.owner)) {
            return false;
        }

        return this._isBlockingRole(lease.role);
    }

    private _isHostPreservingLease(lease: IEmbedRuntimeFocusLease, options?: IEmbedRuntimeFocusLeaseQueryOptions): boolean {
        if (lease.owner && options?.ignoreOwners?.includes(lease.owner)) {
            return false;
        }

        return lease.role !== 'runtime';
    }

    private _leaseAppliesToHostUnit(lease: IEmbedRuntimeFocusLease, hostUnitId: string): boolean {
        return lease.hostUnitId == null || lease.hostUnitId === hostUnitId;
    }

    private _leaseAppliesToChildUnit(lease: IEmbedRuntimeFocusLease, unitId: string): boolean {
        return lease.childUnitId === unitId || lease.associatedChildUnitIds?.includes(unitId) === true;
    }

    private _ownedEmbedAppliesToChildUnit(embedId: string, unitId: string): boolean {
        if (this._runtimeScopes.get(embedId)?.childUnitId === unitId) {
            return true;
        }

        const leases = this._leases.get(embedId);
        return !!leases && [...leases].some((lease) => this._leaseAppliesToChildUnit(lease, unitId));
    }

    private _isBlockingRole(role: EmbedRuntimeFocusRole): boolean {
        return role !== 'runtime';
    }

    private _getChildSessionPriority(lease: IEmbedRuntimeFocusLease): number {
        const sessionMode = this._resolveChildSessionMode(lease);
        if (sessionMode === 'child-fullscreen') {
            return 30;
        }

        if (sessionMode === 'child-keyboard') {
            return 20;
        }

        if (sessionMode === 'child-tab') {
            return 10;
        }

        return 0;
    }

    private _resolveChildSessionMode(lease: IEmbedRuntimeFocusLease): EmbedRuntimeSessionMode {
        if (lease.sessionMode) {
            return lease.sessionMode;
        }

        if (lease.owner === 'fullscreen-runtime') {
            return 'child-fullscreen';
        }

        if (lease.owner === 'stage2-runtime' || lease.owner === 'doc-block-stage2-runtime') {
            return 'child-keyboard';
        }

        if (lease.owner === 'tab-peer-runtime') {
            return 'child-tab';
        }

        return lease.role === 'child-session' ? 'child-keyboard' : 'host-passive';
    }

    private _isOwnedBoundaryElement(embedId: string, target: HTMLElement): boolean {
        return target.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}="${embedId}"]`) != null;
    }

    private _getOwnedEmbedIdFromTarget(target: EventTarget | null | undefined, event?: Event): string | undefined {
        const path = typeof event?.composedPath === 'function' ? event.composedPath() : undefined;
        const ownerFromPath = path
            ?.find((entry) => this._isHTMLElement(entry as Element | null) && (entry as HTMLElement).hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)) as HTMLElement | undefined;
        const owner = ownerFromPath ?? (this._isHTMLElement(target as Element | null)
            ? (target as HTMLElement).closest<HTMLElement>(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`) ?? undefined
            : undefined);

        return owner?.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE) ??
            this._getOwnedEmbedIdFromEventPoint(event);
    }

    private _getOwnedEmbedIdFromEventPoint(event?: Event): string | undefined {
        const point = this._getEventClientPoint(event);
        if (!point) {
            return undefined;
        }

        let candidate: { embedId: string; area: number } | undefined;
        for (const [embedId, elements] of this._elements) {
            for (const element of elements) {
                const rect = element.getBoundingClientRect();
                if (!this._rectContainsPoint(rect, point.clientX, point.clientY)) {
                    continue;
                }

                const area = rect.width * rect.height;
                if (!candidate || area < candidate.area) {
                    candidate = { embedId, area };
                }
            }
        }

        return candidate?.embedId;
    }

    private _getEventClientPoint(event?: Event): { clientX: number; clientY: number } | undefined {
        const maybeEvent = event as Partial<MouseEvent> | undefined;
        if (!maybeEvent) {
            return undefined;
        }

        if (Number.isFinite(maybeEvent.clientX) && Number.isFinite(maybeEvent.clientY)) {
            return {
                clientX: maybeEvent.clientX!,
                clientY: maybeEvent.clientY!,
            };
        }

        if (Number.isFinite(maybeEvent.x) && Number.isFinite(maybeEvent.y)) {
            return {
                clientX: maybeEvent.x!,
                clientY: maybeEvent.y!,
            };
        }

        return undefined;
    }

    private _rectContainsPoint(rect: DOMRect, clientX: number, clientY: number): boolean {
        return rect.width > 0 &&
            rect.height > 0 &&
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom;
    }

    private _getActiveOwnedRuntimeFocusInfo(): { embedId: string; role: EmbedRuntimeFocusRole } | undefined {
        const activeElement = this._getAnyActiveElement();
        if (!this._isHTMLElement(activeElement)) {
            return undefined;
        }

        const owner = activeElement.closest<HTMLElement>(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`);
        if (!owner) {
            return undefined;
        }

        const embedId = owner.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
        const role = activeElement.closest<HTMLElement>(`[${EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE}]`)
            ?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE) as EmbedRuntimeFocusRole | null;

        return embedId && this._isRuntimeFocusRole(role) ? { embedId, role } : undefined;
    }

    private _isHTMLElement(element: Element | null): element is HTMLElement {
        if (!element) {
            return false;
        }

        const view = element.ownerDocument?.defaultView;
        return view ? element instanceof view.HTMLElement : typeof HTMLElement !== 'undefined' && element instanceof HTMLElement;
    }

    private _isRuntimeFocusRole(role: string | null | undefined): role is EmbedRuntimeFocusRole {
        return role === 'runtime' ||
            role === 'child-session' ||
            role === 'child-editor' ||
            role === 'child-popup' ||
            role === 'floating-menu';
    }

    private _getAnyActiveElement(): Element | null {
        for (const elements of this._elements.values()) {
            const ownerDocument = elements.values().next().value?.ownerDocument;
            if (ownerDocument?.activeElement) {
                return ownerDocument.activeElement;
            }
        }

        return typeof document === 'undefined' ? null : document.activeElement;
    }

    private _getActiveElement(embedId: string): Element | null {
        const elements = this._elements.get(embedId);
        const ownerDocument = elements?.values().next().value?.ownerDocument;

        return ownerDocument?.activeElement ?? (typeof document === 'undefined' ? null : document.activeElement);
    }

    private _notifyRuntimeFocusChanged(): void {
        this.runtimeFocusChanged$.next();
    }

    private _notifyRuntimeSessionChanged(): void {
        this.runtimeSessionChanged$.next();
    }
}
