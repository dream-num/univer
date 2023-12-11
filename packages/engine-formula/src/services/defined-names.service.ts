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

import type { Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

export interface IDefinedNamesService {
    registerDefinedName(unitId: string, name: string, formulaOrRefString: string): void;

    getDefinedNameMap(unitId: string): Nullable<Map<string, string>>;

    getValue(unitId: string, name: string): Nullable<string>;

    removeDefinedName(unitId: string, name: string): void;

    hasDefinedName(unitId: string): boolean;
}

export class DefinedNamesService extends Disposable implements IDefinedNamesService {
    // 18.2.6 definedNames (Defined Names)
    private _definedNameMap: Map<string, Map<string, string>> = new Map();

    override dispose(): void {
        this._definedNameMap.clear();
    }

    registerDefinedName(unitId: string, name: string, formulaOrRefString: string) {
        const unitMap = this._definedNameMap.get(unitId);

        if (unitMap == null) {
            this._definedNameMap.set(unitId, new Map());
        }

        this._definedNameMap.get(unitId)?.set(name, formulaOrRefString);
    }

    removeDefinedName(unitId: string, name: string) {
        this._definedNameMap.get(unitId)?.delete(name);
    }

    getDefinedNameMap(unitId: string) {
        return this._definedNameMap.get(unitId);
    }

    getValue(unitId: string, name: string) {
        return this._definedNameMap.get(unitId)?.get(name);
    }

    hasDefinedName(unitId: string) {
        const size = this._definedNameMap.get(unitId)?.size || 0;
        return size !== 0;
    }
}

export const IDefinedNamesService = createIdentifier<DefinedNamesService>('univer.formula.defined-names.service');
