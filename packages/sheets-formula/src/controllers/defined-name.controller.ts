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
import {
    Disposable,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import type { IFunctionInfo } from '@univerjs/engine-formula';
import { FunctionType, IDefinedNamesService } from '@univerjs/engine-formula';
import { IDescriptionService } from '../services/description.service';

/**
 * header highlight
 * column menu: show, hover and mousedown event
 */
@OnLifecycle(LifecycleStages.Rendered, DefinedNameController)
export class DefinedNameController extends Disposable {
    private _preUnitId: Nullable<string> = null;

    constructor(
        @IDescriptionService private readonly _descriptionService: IDescriptionService,
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService

    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._descriptionListener();

        this._changeUnitListener();
    }

    private _descriptionListener() {
        toDisposable(
            this._definedNamesService.update$.subscribe(() => {
                this._registerDescriptions();
            })
        );
    }

    private _changeUnitListener() {
        toDisposable(
            this._univerInstanceService.currentSheet$.subscribe(() => {
                this._unRegisterDescriptions();
                this._registerDescriptions();
            })
        );
    }

    private _unRegisterDescriptions() {
        if (this._preUnitId == null) {
            return;
        }
        const definedNames = this._definedNamesService.getDefinedNameMap(this._preUnitId);

        if (definedNames == null) {
            return;
        }

        const functionList: string[] = [];
        Array.from(Object.values(definedNames)).forEach((value) => {
            const { name } = value;
            if (this._descriptionService.hasDescription(name)) {
                functionList.push(name);
            }
        });

        this._descriptionService.unregisterDescriptions(functionList);

        this._preUnitId = null;
    }

    private _registerDescriptions() {
        const unitId = this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const definedNames = this._definedNamesService.getDefinedNameMap(unitId);
        if (!definedNames) {
            return;
        }

        const functionList: IFunctionInfo[] = [];

        this._preUnitId = unitId;

        Array.from(Object.values(definedNames)).forEach((value) => {
            const { name, comment, formulaOrRefString } = value;
            if (!this._descriptionService.hasDescription(name)) {
                functionList.push({
                    functionName: name,
                    description: formulaOrRefString + (comment || ''),
                    abstract: formulaOrRefString,
                    functionType: FunctionType.definedName,
                    functionParameter: [],
                });
            }
        });

        this._descriptionService.registerDescriptions(functionList);
    }
}
