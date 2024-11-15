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

import type { ICommandInfo, IDisposable, IUnitRange, Nullable } from '@univerjs/core';
import type { IDirtyUnitFeatureMap, IDirtyUnitOtherFormulaMap, IDirtyUnitSheetDefinedNameMap, IDirtyUnitSheetNameMap } from '../basics/common';
import { createIdentifier, Disposable } from '@univerjs/core';

// TODO: this interface deserver better naming.
export interface IDirtyConversionManagerParams {
    commandId: string;
    getDirtyData: (command: ICommandInfo) => {
        dirtyRanges?: IUnitRange[];
        dirtyNameMap?: IDirtyUnitSheetNameMap;
        dirtyDefinedNameMap?: IDirtyUnitSheetDefinedNameMap;
        dirtyUnitFeatureMap?: IDirtyUnitFeatureMap;
        dirtyUnitOtherFormulaMap?: IDirtyUnitOtherFormulaMap;
        clearDependencyTreeCache?: IDirtyUnitSheetNameMap;
    };
}

/**
 * This service is to calculate the dirty area based on the {@link CommandType.MUTATION} executed. Features can
 * register callback functions to calculate the dirty area.
 * @deprecated This service is unnecessary to be abstract.
 */
export const IActiveDirtyManagerService = createIdentifier<ActiveDirtyManagerService>('univer.formula.active-dirty-manager.service');
/**
 * This service is to calculate the dirty area based on the {@link CommandType.MUTATION} executed. Features can
 * register callback functions to calculate the dirty area.
 * @deprecated This service is unnecessary to be abstract.
 */
export interface IActiveDirtyManagerService extends IDisposable {
    /** @deprecated `register` should return an observable. */
    remove(commandId: string): void;
    /** @deprecated No one need to check if a feature id exists. */
    get(commandId: string): Nullable<IDirtyConversionManagerParams>;
    /** @deprecated No one need to check if a feature id exists. */
    has(featureId: string): boolean;

    register(featureId: string, dirtyConversion: IDirtyConversionManagerParams): void;

    // TODO: should not expose internal implementation. A `onMutationExecuted` method would be much better.
    getDirtyConversionMap(): Map<string, IDirtyConversionManagerParams>;
}

/**
 * Actively mark as dirty, calculate the dirty area based on the command,
 * and plugins can register the ref range they affect into the formula engine.
 */
export class ActiveDirtyManagerService extends Disposable implements IActiveDirtyManagerService {
    private _dirtyConversionMap: Map<string, IDirtyConversionManagerParams> = new Map();

    override dispose(): void {
        this._dirtyConversionMap.clear();
    }

    remove(commandId: string) {
        this._dirtyConversionMap.delete(commandId);
    }

    get(commandId: string) {
        return this._dirtyConversionMap.get(commandId);
    }

    has(commandId: string) {
        return this._dirtyConversionMap.has(commandId);
    }

    register(commandId: string, dirtyConversion: IDirtyConversionManagerParams) {
        this._dirtyConversionMap.set(commandId, dirtyConversion);
    }

    getDirtyConversionMap() {
        return this._dirtyConversionMap;
    }
}

