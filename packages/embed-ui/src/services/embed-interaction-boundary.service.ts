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

export const EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE = 'data-embed-interaction-boundary-owner';

const PORTAL_OWNER_CLAIM_TTL = 1000;

export class EmbedInteractionBoundaryService {
    private readonly _roots = new Map<string, Set<HTMLElement>>();
    private readonly _portalObservers = new WeakMap<Document, MutationObserver>();
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
        const claimPortals = () => this._claimBodyPortals(embedId, root.ownerDocument);
        root.addEventListener('pointerdown', claimPortals, true);
        root.addEventListener('mousedown', claimPortals, true);
        root.addEventListener('focusin', claimPortals, true);

        return toDisposable(() => {
            root.removeEventListener('pointerdown', claimPortals, true);
            root.removeEventListener('mousedown', claimPortals, true);
            root.removeEventListener('focusin', claimPortals, true);
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
        const owner = this._pendingPortalOwner;
        if (!owner || Date.now() > owner.expiresAt) {
            return false;
        }

        return !ownerDocument || owner.document === ownerDocument;
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
            const owner = this._pendingPortalOwner;
            if (!owner || owner.document !== ownerDocument || Date.now() > owner.expiresAt) {
                return;
            }

            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof view.HTMLElement) {
                        this._markBodyPortalOwner(node, owner.embedId, ownerDocument);
                    }
                });
            });
        });
        observer.observe(ownerDocument.body, { childList: true, subtree: true });
        this._portalObservers.set(ownerDocument, observer);
    }

    private _markBodyPortalOwner(element: HTMLElement, embedId: string, ownerDocument: Document): void {
        if (!this._isBodyPortalCandidate(element, ownerDocument)) {
            return;
        }

        if (!element.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)) {
            element.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, embedId);
        }
    }

    private _isBodyPortalCandidate(element: HTMLElement, ownerDocument: Document): boolean {
        if (!ownerDocument.body.contains(element)) {
            return false;
        }

        if (element.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`)) {
            return false;
        }

        const parent = element.parentElement;
        return parent === ownerDocument.body || parent?.closest('[data-radix-popper-content-wrapper]') != null;
    }
}
