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

export interface IEmbedOverlayRootRegistration {
    childUnitId: string;
    embedId?: string;
    hostAnchorId?: string;
    root: HTMLElement;
}

export class EmbedOverlayRootService {
    private readonly _rootsByChildUnitId = new Map<string, IEmbedOverlayRootRegistration>();
    private readonly _rootsByEmbedId = new Map<string, IEmbedOverlayRootRegistration>();
    private readonly _rootsByHostAnchorId = new Map<string, IEmbedOverlayRootRegistration>();

    register(childUnitId: string, root: HTMLElement): IDisposable;
    register(registration: IEmbedOverlayRootRegistration): IDisposable;
    register(registrationOrChildUnitId: IEmbedOverlayRootRegistration | string, root?: HTMLElement): IDisposable {
        const registration = typeof registrationOrChildUnitId === 'string'
            ? { childUnitId: registrationOrChildUnitId, root: root! }
            : registrationOrChildUnitId;

        this._rootsByChildUnitId.set(registration.childUnitId, registration);
        if (registration.embedId) {
            this._rootsByEmbedId.set(registration.embedId, registration);
        }
        if (registration.hostAnchorId) {
            this._rootsByHostAnchorId.set(registration.hostAnchorId, registration);
        }

        return toDisposable(() => {
            if (this._rootsByChildUnitId.get(registration.childUnitId) === registration) {
                this._rootsByChildUnitId.delete(registration.childUnitId);
            }
            if (registration.embedId && this._rootsByEmbedId.get(registration.embedId) === registration) {
                this._rootsByEmbedId.delete(registration.embedId);
            }
            if (registration.hostAnchorId && this._rootsByHostAnchorId.get(registration.hostAnchorId) === registration) {
                this._rootsByHostAnchorId.delete(registration.hostAnchorId);
            }
        });
    }

    get(childUnitId: string): HTMLElement | null {
        return this._rootsByChildUnitId.get(childUnitId)?.root ?? null;
    }

    getByEmbedId(embedId: string): HTMLElement | null {
        return this._rootsByEmbedId.get(embedId)?.root ?? null;
    }

    getByHostAnchorId(hostAnchorId: string): HTMLElement | null {
        return this._rootsByHostAnchorId.get(hostAnchorId)?.root ?? null;
    }

    contains(target: EventTarget | Node | null | undefined, query: { childUnitId?: string; embedId?: string; hostAnchorId?: string }): boolean {
        if (!(target instanceof Node)) {
            return false;
        }

        const root = query.embedId
            ? this.getByEmbedId(query.embedId)
            : query.hostAnchorId
                ? this.getByHostAnchorId(query.hostAnchorId)
                : query.childUnitId
                    ? this.get(query.childUnitId)
                    : null;

        return Boolean(root?.contains(target));
    }
}
