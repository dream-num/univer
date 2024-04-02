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

import type { ICommandInfo, IExecutionOptions, Nullable } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import type { IFunctionInfo } from '@univerjs/engine-formula';
import { FunctionType, IDefinedNamesService } from '@univerjs/engine-formula';
import { SetWorksheetActiveOperation } from '@univerjs/sheets';
import { IDescriptionService } from '../services/description.service';

export const SCOPE_WORKBOOK_VALUE = 'AllDefaultWorkbook';
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
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService

    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._descriptionListener();

        this._changeUnitListener();

        this._changeSheetListener();
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

    private _changeSheetListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo, options?: IExecutionOptions) => {
                if (options?.fromCollab) {
                    return;
                }

                if (command.id === SetWorksheetActiveOperation.id) {
                    this._unregisterDescriptionsForNotInSheetId();
                    this._registerDescriptions();
                }
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
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        if (workbook == null) {
            return;
        }
        const worksheet = workbook.getActiveSheet();

        if (worksheet == null) {
            return;
        }

        const unitId = workbook.getUnitId();
        const sheetId = worksheet.getSheetId();

        const definedNames = this._definedNamesService.getDefinedNameMap(unitId);
        if (!definedNames) {
            return;
        }

        const functionList: IFunctionInfo[] = [];

        this._preUnitId = unitId;

        Array.from(Object.values(definedNames)).forEach((value) => {
            const { name, comment, formulaOrRefString, localSheetId } = value;
            if (!this._descriptionService.hasDescription(name) && (localSheetId == null || localSheetId === SCOPE_WORKBOOK_VALUE || localSheetId === sheetId)) {
                functionList.push({
                    functionName: name,
                    description: formulaOrRefString + (comment || ''),
                    abstract: formulaOrRefString,
                    functionType: FunctionType.DefinedName,
                    functionParameter: [],
                });
            }
        });

        this._descriptionService.registerDescriptions(functionList);
    }

    private _unregisterDescriptionsForNotInSheetId() {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        if (workbook == null) {
            return;
        }
        const worksheet = workbook.getActiveSheet();

        if (worksheet == null) {
            return;
        }

        const unitId = workbook.getUnitId();
        const sheetId = worksheet.getSheetId();

        const definedNames = this._definedNamesService.getDefinedNameMap(unitId);
        if (!definedNames) {
            return;
        }

        const functionList: string[] = [];

        Array.from(Object.values(definedNames)).forEach((value) => {
            const { name, localSheetId } = value;
            if (localSheetId !== SCOPE_WORKBOOK_VALUE && localSheetId !== sheetId) {
                functionList.push(name);
            }
        });

        this._descriptionService.unregisterDescriptions(functionList);
    }
}
