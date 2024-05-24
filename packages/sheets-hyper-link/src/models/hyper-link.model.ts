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

import { Subject } from 'rxjs';
import { ObjectMatrix } from '@univerjs/core';
import type { ICellHyperLink, ICellLinkContent } from '../types/interfaces/i-hyper-link';

type LinkUpdate = {
    type: 'add';
    payload: ICellHyperLink;
    unitId: string;
    subUnitId: string;
} | {
    type: 'remove';
    payload: ICellHyperLink;
    unitId: string;
    subUnitId: string;
} | {
    type: 'update';
    unitId: string;
    subUnitId: string;
    payload: ICellLinkContent;
    id: string;
};

export class HyperLinkModel {
    private _linkUpdate$ = new Subject<LinkUpdate>();
    linkUpdate$ = this._linkUpdate$.asObservable();

    private _linkMap: Map<string, Map<string, ObjectMatrix<ICellHyperLink>>> = new Map();
    private _linkPositionMap: Map<string, Map<string, Map<string, { row: number;column: number }>>> = new Map();

    private _ensureMap(unitId: string, subUnitId: string) {
        let unitMap = this._linkMap.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._linkMap.set(unitId, unitMap);
        }
        let matrix = unitMap.get(subUnitId);
        if (!matrix) {
            matrix = new ObjectMatrix();
            unitMap.set(subUnitId, matrix);
        }

        let positionUnitMap = this._linkPositionMap.get(unitId);
        if (!positionUnitMap) {
            positionUnitMap = new Map();
            this._linkPositionMap.set(unitId, positionUnitMap);
        }

        let positionSubUnitMap = positionUnitMap.get(subUnitId);
        if (!positionSubUnitMap) {
            positionSubUnitMap = new Map();
            positionUnitMap.set(subUnitId, positionSubUnitMap);
        }
        return {
            matrix,
            positionMap: positionSubUnitMap,
        };
    }

    addHyperLink(unitId: string, subUnitId: string, link: ICellHyperLink) {
        const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
        matrix.setValue(link.row, link.column, link);
        positionMap.set(link.id, { row: link.row, column: link.column });
        this._linkUpdate$.next({
            unitId,
            subUnitId,
            payload: link,
            type: 'add',
        });
        return true;
    }

    updateHyperLink(unitId: string, subUnitId: string, id: string, payload: ICellLinkContent) {
        const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
        // const current = matrix.getValue();
        const position = positionMap.get(id);
        if (!position) {
            return false;
        }
        const link = matrix.getValue(position.row, position.column);
        if (!link) {
            return false;
        }
        Object.assign(link, payload);
        this._linkUpdate$.next({
            unitId,
            subUnitId,
            payload,
            id,
            type: 'update',
        });
        return true;
    }

    removeHyperLink(unitId: string, subUnitId: string, id: string) {
        const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
        const position = positionMap.get(id);
        if (!position) {
            return false;
        }
        positionMap.delete(id);
        const link = matrix.getValue(position.row, position.column);
        if (!link) {
            return false;
        }

        matrix.realDeleteValue(position.row, position.column);
        this._linkUpdate$.next({
            unitId,
            subUnitId,
            payload: link,
            type: 'remove',
        });
        return true;
    }

    getHyperLink(unitId: string, subUnitId: string, id: string) {
        const { matrix, positionMap } = this._ensureMap(unitId, subUnitId);
        const position = positionMap.get(id);
        if (!position) {
            return undefined;
        }
        positionMap.delete(id);
        return matrix.getValue(position.row, position.column);
    }
}
