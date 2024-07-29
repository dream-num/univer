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

import { Disposable, Tools } from '@univerjs/core';
import type { IDocMention } from '../types/interfaces/i-mention';

export class DocMentionModel extends Disposable {
    private _mentionMaps = new Map<string, Map<string, IDocMention>>();

    private _ensureMap(unitId: string) {
        let unitMap = this._mentionMaps.get(unitId);

        if (!unitMap) {
            unitMap = new Map();
            this._mentionMaps.set(unitId, unitMap);
        }

        return unitMap;
    }

    addMention(unitId: string, mention: IDocMention) {
        const map = this._ensureMap(unitId);
        map.set(mention.id, mention);
    }

    getMention(unitId: string, id: string) {
        const map = this._ensureMap(unitId);
        return map.get(id);
    }

    copyMention(unitId: string, id: string) {
        const mention = this.getMention(unitId, id);

        if (!mention) {
            return undefined;
        }

        const newId = Tools.generateRandomId();
        const newMention = { ...mention, id: newId };
        return newMention;
    }

    deleteMention(unitId: string, id: string) {
        const map = this._ensureMap(unitId);
        return map.delete(id);
    }

    getUnit(unitId: string) {
        const map = this._mentionMaps.get(unitId);
        return Array.from(map?.values() ?? []);
    }

    deleteUnit(unitId: string) {
        this._mentionMaps.delete(unitId);
    }
}
