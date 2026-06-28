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
import { EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE } from './embed-runtime-focus-coordinator.service';

export const EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE = 'data-embed-interaction-boundary-owner';

const PORTAL_OWNER_CLAIM_TTL = 1000;

export function getEmbedInteractionBoundaryOwnerId(element: HTMLElement | null | undefined): string | undefined {
    return element?.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`)?.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE) ?? undefined;
}

export function isEventTargetInSameEmbedInteractionBoundary(scopeElement: HTMLElement | null | undefined, target: EventTarget | null | undefined): boolean {
    if (!scopeElement || !(target instanceof HTMLElement)) {
        return false;
    }

    const embedId = getEmbedInteractionBoundaryOwnerId(scopeElement);
    if (!embedId) {
        return false;
    }

    return getEmbedInteractionBoundaryOwnerId(target) === embedId;
}

export class EmbedInteractionBoundaryService {
    private readonly _roots = new Map<string, Set<HTMLElement>>();
    private readonly _portalObservers = new WeakMap<Document, MutationObserver>();
    private readonly _activePortalOwners = new WeakMap<Document, Array<{ embedId: string; token: symbol }>>();
    private _pendingPortalOwner: { embedId: string; document: Document; expiresAt: number } | undefined;

    registerRoot(embedId: string, root: HTMLElement): IDisposable {
        let roots = this._roots.get(embedId);
        if (!roots) {
            roots = new Set();
            this._roots.set(embedId, roots);
        }

        roots.add(root);
        const previousOwner = root.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
        root.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, embedId);
        const popupDescendantRolesDisposable = this._registerRootPopupDescendantFocusRoles(embedId, root);
        const claimPortals = () => this._claimBodyPortals(embedId, root.ownerDocument);
        root.addEventListener('pointerdown', claimPortals, true);
        root.addEventListener('mousedown', claimPortals, true);
        root.addEventListener('focusin', claimPortals, true);

        return toDisposable(() => {
            popupDescendantRolesDisposable.dispose();
            root.removeEventListener('pointerdown', claimPortals, true);
            root.removeEventListener('mousedown', claimPortals, true);
            root.removeEventListener('focusin', claimPortals, true);
            if (this._pendingPortalOwner?.embedId === embedId && this._pendingPortalOwner.document === root.ownerDocument) {
                this._pendingPortalOwner = undefined;
            }
            roots?.delete(root);
            if (roots && roots.size === 0) {
                this._roots.delete(embedId);
            }
            if (previousOwner == null) {
                root.removeAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
            } else {
                root.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, previousOwner);
            }
        });
    }

    private _registerRootPopupDescendantFocusRoles(embedId: string, root: HTMLElement): IDisposable {
        const ownerDocument = root.ownerDocument;
        const view = ownerDocument.defaultView;
        const previousOwners = new Map<HTMLElement, string | null>();
        const previousRoles = new Map<HTMLElement, string | null>();
        let observer: MutationObserver | undefined;
        let disposed = false;

        const remember = (element: HTMLElement) => {
            if (!previousOwners.has(element)) {
                previousOwners.set(element, element.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE));
            }
            if (!previousRoles.has(element)) {
                previousRoles.set(element, element.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE));
            }
        };
        const mark = (element: HTMLElement) => {
            remember(element);
            element.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, embedId);
            element.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, 'child-popup');
        };
        const markPopupTree = (element: HTMLElement) => {
            if (!this._isUniverPortalTreeElement(element)) {
                return;
            }

            mark(element);
            element.querySelectorAll<HTMLElement>('*').forEach(mark);
        };
        const sync = (start: HTMLElement) => {
            if (disposed) {
                return;
            }

            markPopupTree(start);
            start.querySelectorAll<HTMLElement>('*').forEach((element) => markPopupTree(element));
        };

        sync(root);
        if (view?.MutationObserver) {
            observer = new view.MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof view.HTMLElement) {
                            sync(node);
                        }
                    });
                });
            });
            observer.observe(root, { childList: true, subtree: true });
        }

        return toDisposable(() => {
            disposed = true;
            observer?.disconnect();
            previousOwners.forEach((previousOwner, element) => {
                if (previousOwner == null) {
                    element.removeAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
                    return;
                }

                element.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, previousOwner);
            });
            previousRoles.forEach((previousRole, element) => {
                if (previousRole == null) {
                    element.removeAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
                    return;
                }

                element.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, previousRole);
            });
        });
    }

    registerOwnedElement(embedId: string, element: HTMLElement): IDisposable {
        let roots = this._roots.get(embedId);
        if (!roots) {
            roots = new Set();
            this._roots.set(embedId, roots);
        }

        roots.add(element);
        const ownerDisposable = this._markInteractionBoundaryOwnerTree(embedId, element);

        return toDisposable(() => {
            roots?.delete(element);
            if (roots && roots.size === 0) {
                this._roots.delete(embedId);
            }
            ownerDisposable.dispose();
        });
    }

    contains(embedId: string | undefined, target: EventTarget | null | undefined, event?: Event): boolean {
        const path = typeof event?.composedPath === 'function' ? event.composedPath() : undefined;
        if (path?.some((entry) => entry instanceof HTMLElement && this._isOwnedElement(embedId, entry))) {
            return true;
        }

        if (!(target instanceof HTMLElement)) {
            return false;
        }

        if (this._isOwnedElement(embedId, target)) {
            return true;
        }

        if (!embedId) {
            return Array.from(this._roots.values()).some((roots) => [...roots].some((root) => root.isConnected && root.contains(target)));
        }

        const roots = this._roots.get(embedId);
        return !!roots && [...roots].some((root) => root.isConnected && root.contains(target));
    }

    hasRecentInteraction(ownerDocument?: Document): boolean {
        const activeOwnerStack = ownerDocument
            ? this._activePortalOwners.get(ownerDocument)
            : typeof document !== 'undefined' ? this._activePortalOwners.get(document) : undefined;
        if (activeOwnerStack?.length) {
            return true;
        }

        const owner = this._pendingPortalOwner;
        if (!owner || Date.now() > owner.expiresAt) {
            return false;
        }

        return !ownerDocument || owner.document === ownerDocument;
    }

    hasRecentInteractionFor(embedId: string | undefined, ownerDocument?: Document): boolean {
        if (!embedId) {
            return false;
        }

        const activeOwnerStack = ownerDocument
            ? this._activePortalOwners.get(ownerDocument)
            : typeof document !== 'undefined' ? this._activePortalOwners.get(document) : undefined;
        if (activeOwnerStack?.some((owner) => owner.embedId === embedId)) {
            return true;
        }

        const owner = this._pendingPortalOwner;
        if (!owner || owner.embedId !== embedId || Date.now() > owner.expiresAt) {
            return false;
        }

        return !ownerDocument || owner.document === ownerDocument;
    }

    closeOwnedFloatingSurfaces(embedId: string | undefined, ownerDocument: Document | undefined): void {
        if (!embedId || !ownerDocument?.body) {
            return;
        }

        const roots = this._collectOwnedFloatingSurfaceRoots(embedId, ownerDocument);
        roots.forEach((root) => this._dispatchEscapeToFloatingSurface(root, ownerDocument));
    }

    activatePortalScope(embedId: string, ownerDocument: Document | undefined): IDisposable {
        if (!ownerDocument?.body) {
            return toDisposable(() => {});
        }

        const token = Symbol(embedId);
        const activeOwnerStack = this._activePortalOwners.get(ownerDocument) ?? [];
        activeOwnerStack.push({ embedId, token });
        this._activePortalOwners.set(ownerDocument, activeOwnerStack);
        this._ensurePortalObserver(ownerDocument);
        this._markExistingBodyPortals(embedId, ownerDocument, {
            includeAppShellEditorPortal: true,
            allowOwnedPortalReassignment: true,
            allowDirectBodyPortal: false,
        });
        this._cleanupOrdinaryBodyChromeClaims(embedId, ownerDocument);
        ownerDocument.defaultView?.setTimeout(() => {
            const owner = this._getLatestActivePortalOwner(ownerDocument);
            if (owner?.embedId === embedId && owner.token === token) {
                this._markExistingBodyPortals(embedId, ownerDocument, {
                    includeAppShellEditorPortal: true,
                    allowOwnedPortalReassignment: true,
                    allowDirectBodyPortal: false,
                });
                this._cleanupOrdinaryBodyChromeClaims(embedId, ownerDocument);
            }
        }, 0);

        return toDisposable(() => {
            const owners = this._activePortalOwners.get(ownerDocument);
            let hasSameEmbedScope = false;
            if (owners) {
                const index = owners.findIndex((owner) => owner.embedId === embedId && owner.token === token);
                if (index >= 0) {
                    owners.splice(index, 1);
                }
                hasSameEmbedScope = owners.some((owner) => owner.embedId === embedId);
                if (owners.length === 0) {
                    this._activePortalOwners.delete(ownerDocument);
                }
            }
            if (!hasSameEmbedScope) {
                this._releaseBodyPortalClaims(embedId, ownerDocument);
            }

            const latestOwner = this._getLatestActivePortalOwner(ownerDocument);
            if (latestOwner) {
                this._markExistingBodyPortals(latestOwner.embedId, ownerDocument, {
                    includeAppShellEditorPortal: true,
                    allowOwnedPortalReassignment: true,
                    allowDirectBodyPortal: false,
                });
                this._cleanupOrdinaryBodyChromeClaims(latestOwner.embedId, ownerDocument);
            }
        });
    }

    private _collectOwnedFloatingSurfaceRoots(embedId: string, ownerDocument: Document): HTMLElement[] {
        const roots = new Set<HTMLElement>();
        const collect = (element: HTMLElement) => {
            const root = this._resolveFloatingSurfaceRoot(element);
            if (!root || !this._isOwnedElement(embedId, root)) {
                return;
            }

            roots.add(root);
        };

        ownerDocument.body
            .querySelectorAll<HTMLElement>(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}="${embedId}"]`)
            .forEach(collect);
        this._roots.get(embedId)?.forEach((root) => {
            if (!root.isConnected) {
                return;
            }

            collect(root);
            root.querySelectorAll<HTMLElement>('*').forEach(collect);
        });

        return [...roots].sort((left, right) => {
            if (left.contains(right)) {
                return 1;
            }
            if (right.contains(left)) {
                return -1;
            }

            return 0;
        });
    }

    private _resolveFloatingSurfaceRoot(element: HTMLElement): HTMLElement | undefined {
        if (element.closest('[data-embed-floating-menu="true"]')) {
            return undefined;
        }

        if (!this._isUniverPortalTreeElement(element)) {
            return undefined;
        }

        return element.closest<HTMLElement>('.univer-popup, .univer-popover, .univer-dropdown, [data-radix-popper-content-wrapper], [data-u-comp="rect-popup"], [role="dialog"], [role="listbox"], [role="menu"], [role="tooltip"]') ?? element;
    }

    private _dispatchEscapeToFloatingSurface(root: HTMLElement, ownerDocument: Document): void {
        const view = ownerDocument.defaultView;
        const target = ownerDocument.activeElement instanceof HTMLElement && root.contains(ownerDocument.activeElement)
            ? ownerDocument.activeElement
            : root;
        const event = view?.KeyboardEvent
            ? new view.KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                bubbles: true,
                cancelable: true,
            })
            : new Event('keydown', { bubbles: true, cancelable: true });

        target.dispatchEvent(event);
    }

    private _isOwnedElement(embedId: string | undefined, element: HTMLElement): boolean {
        const owner = element.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`);
        const ownerEmbedId = owner?.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
        if (ownerEmbedId && (!embedId || ownerEmbedId === embedId)) {
            return true;
        }

        if (!embedId) {
            return Array.from(this._roots.values()).some((roots) => [...roots].some((root) => root === element || root.contains(element)));
        }

        const roots = this._roots.get(embedId);
        return !!roots && [...roots].some((root) => root === element || root.contains(element));
    }

    private _claimBodyPortals(embedId: string, ownerDocument: Document | undefined): void {
        if (!ownerDocument?.body) {
            return;
        }

        this._pendingPortalOwner = {
            embedId,
            document: ownerDocument,
            expiresAt: Date.now() + PORTAL_OWNER_CLAIM_TTL,
        };
        this._ensurePortalObserver(ownerDocument);
        this._markExistingBodyPortals(embedId, ownerDocument, { includeAppShellEditorPortal: false });
        ownerDocument.defaultView?.setTimeout(() => {
            const owner = this._pendingPortalOwner;
            if (owner?.embedId === embedId && owner.document === ownerDocument && Date.now() <= owner.expiresAt) {
                this._markExistingBodyPortals(embedId, ownerDocument, { includeAppShellEditorPortal: false });
            }
        }, 0);
    }

    private _ensurePortalObserver(ownerDocument: Document): void {
        if (this._portalObservers.has(ownerDocument) || !ownerDocument.body) {
            return;
        }

        const view = ownerDocument.defaultView;
        if (!view?.MutationObserver) {
            return;
        }

        const observer = new view.MutationObserver((mutations) => {
            const owner = this._getBodyPortalOwner(ownerDocument);
            if (!owner) {
                return;
            }

            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof view.HTMLElement) {
                        this._markBodyPortalOwner(node, owner.embedId, ownerDocument, {
                            includeAppShellEditorPortal: true,
                            allowOwnedPortalReassignment: owner.stable,
                            allowDirectBodyPortal: !owner.stable,
                        });
                        node.querySelectorAll<HTMLElement>('*').forEach((element) => {
                            this._markBodyPortalOwner(element, owner.embedId, ownerDocument, {
                                includeAppShellEditorPortal: true,
                                allowOwnedPortalReassignment: owner.stable,
                                allowDirectBodyPortal: !owner.stable,
                            });
                        });
                    }
                });
            });
            if (owner.stable) {
                this._cleanupOrdinaryBodyChromeClaims(owner.embedId, ownerDocument);
            }
        });
        observer.observe(ownerDocument.body, { childList: true, subtree: true });
        observer.takeRecords();
        this._portalObservers.set(ownerDocument, observer);
    }

    private _markBodyPortalOwner(
        element: HTMLElement,
        embedId: string,
        ownerDocument: Document,
        options: { includeAppShellEditorPortal?: boolean; allowOwnedPortalReassignment?: boolean; allowDirectBodyPortal?: boolean } = {}
    ): void {
        if (
            options.allowDirectBodyPortal === false &&
            element.parentElement === ownerDocument.body &&
            !this._isUniverPortalCandidate(element) &&
            !this._isAppShellEditorPortalCandidate(element)
        ) {
            return;
        }

        if (!this._isBodyPortalCandidate(element, ownerDocument, options)) {
            return;
        }

        if (!this._isAppShellEditorPortalCandidate(element) && this._isDetachedOffscreenPortalCandidate(element, ownerDocument)) {
            return;
        }

        this._blurActiveElementBeforePortalReassignment(element, embedId, ownerDocument);
        this._markInteractionBoundaryOwnerTree(embedId, element, { transient: true });
        this._markRuntimeFocusRole(element, options);
    }

    private _markExistingBodyPortals(
        embedId: string,
        ownerDocument: Document,
        options: { includeAppShellEditorPortal?: boolean; allowOwnedPortalReassignment?: boolean; allowDirectBodyPortal?: boolean } = {}
    ): void {
        ownerDocument.body.querySelectorAll<HTMLElement>('*').forEach((element) => {
            this._markBodyPortalOwner(element, embedId, ownerDocument, {
                includeAppShellEditorPortal: options.includeAppShellEditorPortal,
                allowOwnedPortalReassignment: options.allowOwnedPortalReassignment,
                allowDirectBodyPortal: options.allowDirectBodyPortal,
            });
        });
    }

    private _isBodyPortalCandidate(
        element: HTMLElement,
        ownerDocument: Document,
        options: { includeAppShellEditorPortal?: boolean; allowOwnedPortalReassignment?: boolean; allowDirectBodyPortal?: boolean } = {}
    ): boolean {
        if (!ownerDocument.body.contains(element)) {
            return false;
        }

        const isAppShellEditorPortal = !!options.includeAppShellEditorPortal && this._isAppShellEditorPortalCandidate(element);
        const isUniverPortal = this._isUniverPortalCandidate(element);

        if (!options.allowOwnedPortalReassignment && !isAppShellEditorPortal && element.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`)) {
            return false;
        }

        if (element.id === 'app') {
            return false;
        }

        const parent = element.parentElement;
        return (!!options.allowDirectBodyPortal && parent === ownerDocument.body) ||
            parent?.closest('[data-radix-popper-content-wrapper]') != null ||
            isUniverPortal ||
            isAppShellEditorPortal;
    }

    private _isAppShellEditorPortalCandidate(element: HTMLElement): boolean {
        if (element.parentElement?.id !== 'app' && element.closest('#app')?.parentElement !== element.ownerDocument.body) {
            return false;
        }

        return element.id.startsWith('univer-doc-selection-container-__INTERNAL_EDITOR__') ||
            element.id.startsWith('__editor___INTERNAL_EDITOR__') ||
            element.closest('[id^="univer-doc-selection-container-__INTERNAL_EDITOR__"]') != null ||
            element.closest('[id^="__editor___INTERNAL_EDITOR__"]') != null;
    }

    private _isHostDocEditorPortal(element: HTMLElement): boolean {
        return element.id.startsWith('__editor_docs-') ||
            element.id.startsWith('univer-doc-selection-container-docs-') ||
            element.closest('[id^="univer-doc-selection-container-docs-"]') != null ||
            element.closest('[id^="__editor_docs-"]') != null;
    }

    private _isUniverPortalCandidate(element: HTMLElement): boolean {
        const className = typeof element.className === 'string' ? element.className : '';
        if (element.getAttribute('data-u-comp') === 'rect-popup') {
            return true;
        }

        if (element.classList.contains('univer-popup') ||
            element.classList.contains('univer-popover') ||
            element.classList.contains('univer-dropdown')) {
            return true;
        }

        if (/\buniver-(popup|popover|dropdown|calendar|tooltip|menu)\b/.test(className)) {
            return true;
        }

        const role = element.getAttribute('role');
        return role === 'dialog' ||
            role === 'listbox' ||
            role === 'menu' ||
            role === 'tooltip' ||
            element.hasAttribute('data-radix-popper-content-wrapper');
    }

    private _isDetachedOffscreenPortalCandidate(element: HTMLElement, ownerDocument: Document): boolean {
        if (!this._isUniverPortalTreeElement(element)) {
            return false;
        }

        const portalRoot = element.closest<HTMLElement>('.univer-popup, .univer-popover, .univer-dropdown, [data-radix-popper-content-wrapper], [data-u-comp="rect-popup"], [role="dialog"], [role="listbox"], [role="menu"], [role="tooltip"]') ?? element;
        const appShellRoot = portalRoot.closest<HTMLElement>('#app') ?? portalRoot.parentElement;
        if (portalRoot.parentElement !== ownerDocument.body && appShellRoot?.parentElement !== ownerDocument.body) {
            return false;
        }

        const view = ownerDocument.defaultView;
        if (!view) {
            return false;
        }

        const rect = portalRoot.getBoundingClientRect();
        const isOutsideViewport = rect.right < 0 ||
            rect.bottom < 0 ||
            rect.left > view.innerWidth ||
            rect.top > view.innerHeight;
        if (isOutsideViewport) {
            return true;
        }

        if (rect.width <= 0 || rect.height <= 0) {
            return rect.left < 0 ||
                rect.top < 0 ||
                rect.left > view.innerWidth ||
                rect.top > view.innerHeight;
        }

        return false;
    }

    private _markRuntimeFocusRole(
        element: HTMLElement,
        options: { includeAppShellEditorPortal?: boolean } = {}
    ): void {
        const resolvedRole = options.includeAppShellEditorPortal && this._isAppShellEditorPortalCandidate(element)
            ? 'child-editor'
            : this._isUniverPortalTreeElement(element) ? 'child-popup' : undefined;
        if (!resolvedRole) {
            return;
        }

        element.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, resolvedRole);
        element.querySelectorAll<HTMLElement>('*').forEach((child) => {
            child.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, resolvedRole);
        });
    }

    private _markInteractionBoundaryOwnerTree(embedId: string, element: HTMLElement, options: { transient?: boolean } = {}): IDisposable {
        const previousValues = new Map<HTMLElement, string | null>();
        const mark = (target: HTMLElement) => {
            if (!options.transient) {
                previousValues.set(target, target.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE));
            }
            target.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, embedId);
        };

        mark(element);
        element.querySelectorAll<HTMLElement>('*').forEach(mark);

        return toDisposable(() => {
            previousValues.forEach((previousValue, target) => {
                if (previousValue == null) {
                    target.removeAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
                    return;
                }

                target.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, previousValue);
            });
        });
    }

    private _isUniverPortalTreeElement(element: HTMLElement): boolean {
        return this._isUniverPortalCandidate(element) ||
            element.closest('.univer-popup, .univer-popover, .univer-dropdown, [data-radix-popper-content-wrapper], [data-u-comp="rect-popup"], [role="dialog"], [role="listbox"], [role="menu"], [role="tooltip"]') != null;
    }

    private _getBodyPortalOwner(ownerDocument: Document): { embedId: string; stable: boolean } | undefined {
        const activeOwner = this._getLatestActivePortalOwner(ownerDocument);
        if (activeOwner) {
            return { embedId: activeOwner.embedId, stable: true };
        }

        const pendingOwner = this._pendingPortalOwner;
        if (pendingOwner && pendingOwner.document === ownerDocument && Date.now() <= pendingOwner.expiresAt) {
            return { embedId: pendingOwner.embedId, stable: false };
        }

        return undefined;
    }

    private _getLatestActivePortalOwner(ownerDocument: Document): { embedId: string; token: symbol } | undefined {
        const owners = this._activePortalOwners.get(ownerDocument);
        return owners?.[owners.length - 1];
    }

    private _cleanupOrdinaryBodyChromeClaims(embedId: string, ownerDocument: Document): void {
        const roots = this._roots.get(embedId);
        ownerDocument.body.querySelectorAll<HTMLElement>(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}="${embedId}"]`).forEach((element) => {
            if (element.parentElement !== ownerDocument.body) {
                return;
            }
            if (roots && [...roots].some((root) => root === element || root.contains(element))) {
                return;
            }
            if (this._isUniverPortalCandidate(element) || this._isAppShellEditorPortalCandidate(element)) {
                return;
            }
            element.removeAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
        });
    }

    private _blurActiveElementBeforePortalReassignment(element: HTMLElement, embedId: string, ownerDocument: Document): void {
        const previousOwner = element.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
        if (!previousOwner || previousOwner === embedId) {
            return;
        }

        const activeElement = ownerDocument.activeElement;
        if (!(activeElement instanceof HTMLElement) || (activeElement !== element && !element.contains(activeElement))) {
            return;
        }

        activeElement.blur();
        if (ownerDocument.activeElement === activeElement) {
            this._focusDocumentBody(ownerDocument);
        }
    }

    private _releaseBodyPortalClaims(embedId: string, ownerDocument: Document): void {
        const roots = this._roots.get(embedId);
        const claimedElements = ownerDocument.body.querySelectorAll<HTMLElement>(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}="${embedId}"]`);
        const shouldKeep = (element: HTMLElement) => roots != null && [...roots].some((root) => root === element || root.contains(element));
        const releasedElements: HTMLElement[] = [];

        claimedElements.forEach((element) => {
            if (shouldKeep(element)) {
                return;
            }

            releasedElements.push(element);
            element.removeAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
            this._removeRuntimeFocusRoleTree(element);
        });

        const activeElement = ownerDocument.activeElement;
        if (
            activeElement instanceof HTMLElement &&
            releasedElements.some((element) => element === activeElement || element.contains(activeElement))
        ) {
            activeElement.blur();
            if (ownerDocument.activeElement === activeElement) {
                this._focusDocumentBody(ownerDocument);
            }
        }
    }

    private _focusDocumentBody(ownerDocument: Document): void {
        const body = ownerDocument.body;
        if (!body) {
            return;
        }

        const previousTabIndex = body.getAttribute('tabindex');
        if (previousTabIndex == null) {
            body.tabIndex = -1;
        }
        body.focus({ preventScroll: true });
        if (previousTabIndex == null) {
            body.removeAttribute('tabindex');
        } else {
            body.setAttribute('tabindex', previousTabIndex);
        }
        if (ownerDocument.activeElement !== body) {
            this._focusTemporarySink(ownerDocument);
        }
    }

    private _focusTemporarySink(ownerDocument: Document): void {
        const body = ownerDocument.body;
        if (!body) {
            return;
        }

        const sink = ownerDocument.createElement('span');
        sink.tabIndex = -1;
        sink.setAttribute('aria-hidden', 'true');
        sink.style.cssText = 'position:fixed;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;';
        body.appendChild(sink);
        sink.focus({ preventScroll: true });
        ownerDocument.defaultView?.setTimeout(() => sink.remove(), 0);
    }

    private _removeRuntimeFocusRoleTree(element: HTMLElement): void {
        if (element.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE) === 'child-editor' ||
            element.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE) === 'child-popup') {
            element.removeAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
        }

        element.querySelectorAll<HTMLElement>(`[${EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE}]`).forEach((child) => {
            const role = child.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
            if (role === 'child-editor' || role === 'child-popup') {
                child.removeAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
            }
        });
    }
}
