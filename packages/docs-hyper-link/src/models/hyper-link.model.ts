/**
 * Copyright 2023-present DreamNum Inc.
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

import { Disposable } from '@univerjs/core';
import { Subject } from 'rxjs';
import type { IDocHyperLink } from '../types/interfaces/i-doc-hyper-link';

export type DocLinkUpdate = {
    type: 'add';
    link: IDocHyperLink;
    unitId: string;
} | {
    type: 'update';
    oldPayload: string;
    link: IDocHyperLink;
    unitId: string;
} | {
    type: 'delete';
    link: IDocHyperLink;
    unitId: string;
} | {
    type: 'delete-unit';
    unitId: string;
};

export class DocHyperLinkModel extends Disposable {
    private readonly _links = new Map<string, Map<string, IDocHyperLink>>();
    private readonly _linkUpdate$ = new Subject<DocLinkUpdate>();

    readonly linkUpdate$ = this._linkUpdate$.asObservable();

    constructor() {
        super();

        this.disposeWithMe(() => {
            this._linkUpdate$.complete();
        });
    }

    private _ensureMap(unitId: string) {
        let map = this._links.get(unitId);

        if (!map) {
            map = new Map();
            this._links.set(unitId, map);
        }
        return map;
    }

    addLink(unitId: string, link: IDocHyperLink) {
        const map = this._ensureMap(unitId);
        map.set(link.id, link);

        this._linkUpdate$.next({
            type: 'add',
            link,
            unitId,
        });

        return true;
    }

    updateLink(unitId: string, id: string, payload: string) {
        const map = this._ensureMap(unitId);
        const link = map.get(id);
        if (!link) {
            return false;
        }
        const oldPayload = link.payload;
        link.payload = payload;
        this._linkUpdate$.next({
            type: 'update',
            link,
            oldPayload,
            unitId,
        });
        return true;
    }

    deleteLink(unitId: string, id: string) {
        const map = this._ensureMap(unitId);
        const link = map.get(id);

        if (!link) {
            return true;
        }

        map.delete(id);
        this._linkUpdate$.next({
            type: 'delete',
            link,
            unitId,
        });
        return false;
    }

    getLink(unitId: string, linkId: string) {
        const map = this._ensureMap(unitId);
        return map.get(linkId);
    }

    getUnit(unitId: string) {
        const map = this._ensureMap(unitId);

        return Array.from(map.values());
    }

    deleteUnit(unitId: string) {
        this._links.delete(unitId);
        this._linkUpdate$.next({
            unitId,
            type: 'delete-unit',
        });
    }
}

