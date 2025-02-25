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

import type { ICommandInfo, IExecutionOptions, Nullable, Workbook } from '@univerjs/core';
import type { IFunctionInfo, ISetDefinedNameMutationParam } from '@univerjs/engine-formula';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { FunctionType, IDefinedNamesService, RemoveDefinedNameMutation, SetDefinedNameMutation } from '@univerjs/engine-formula';
import { SCOPE_WORKBOOK_VALUE_DEFINED_NAME, SetWorksheetActiveOperation } from '@univerjs/sheets';

import { IDescriptionService } from '../services/description.service';

/**
 * header highlight
 * column menu: show, hover and mousedown event
 */
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
            this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe(() => {
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
                // Since command interception will supplement mutation, it is necessary to monitor mutation changes here
                // SetDefinedNameMutation and RemoveDefinedNameMutation already cover all possible Defined Name updates
                else if (command.id === SetDefinedNameMutation.id) {
                    const param = command.params as ISetDefinedNameMutationParam;
                    this._registerDescription(param);
                } else if (command.id === RemoveDefinedNameMutation.id) {
                    const param = command.params as ISetDefinedNameMutationParam;
                    this._unregisterDescription(param);
                }
            })
        );
    }

    private _registerDescription(param: ISetDefinedNameMutationParam) {
        const { unitId, sheetId } = this._getUnitIdAndSheetId();

        if (unitId == null || sheetId == null) {
            return;
        }

        const { name, comment, formulaOrRefString, localSheetId } = param;
        if (!this._descriptionService.hasDescription(name) && (localSheetId == null || localSheetId === SCOPE_WORKBOOK_VALUE_DEFINED_NAME || localSheetId === sheetId)) {
            this._descriptionService.registerDescriptions([{
                functionName: name,
                description: formulaOrRefString + (comment || ''),
                abstract: formulaOrRefString,
                functionType: FunctionType.DefinedName,
                functionParameter: [],
            }]);
        }
    }

    private _unregisterDescription(param: ISetDefinedNameMutationParam) {
        const { name } = param;
        this._descriptionService.unregisterDescriptions([name]);
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
            functionList.push(name);
        });

        this._descriptionService.unregisterDescriptions(functionList);

        this._preUnitId = null;
    }

    private _getUnitIdAndSheetId() {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        if (workbook == null) {
            return {};
        }
        const worksheet = workbook.getActiveSheet();

        if (worksheet == null) {
            return {};
        }

        return {
            unitId: workbook.getUnitId(),
            sheetId: worksheet.getSheetId(),
        };
    }

    private _registerDescriptions() {
        const { unitId, sheetId } = this._getUnitIdAndSheetId();

        if (unitId == null || sheetId == null) {
            return;
        }

        const definedNames = this._definedNamesService.getDefinedNameMap(unitId);
        if (!definedNames) {
            return;
        }

        const functionList: IFunctionInfo[] = [];

        this._preUnitId = unitId;

        Array.from(Object.values(definedNames)).forEach((value) => {
            const { name, comment, formulaOrRefString, localSheetId } = value;
            if (!this._descriptionService.hasDescription(name) && (localSheetId == null || localSheetId === SCOPE_WORKBOOK_VALUE_DEFINED_NAME || localSheetId === sheetId)) {
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
        const { unitId, sheetId } = this._getUnitIdAndSheetId();

        if (unitId == null || sheetId == null) {
            return;
        }

        const definedNames = this._definedNamesService.getDefinedNameMap(unitId);
        if (!definedNames) {
            return;
        }

        const functionList: string[] = [];

        Array.from(Object.values(definedNames)).forEach((value) => {
            const { name, localSheetId } = value;
            if (localSheetId !== SCOPE_WORKBOOK_VALUE_DEFINED_NAME && localSheetId !== sheetId) {
                functionList.push(name);
            }
        });

        this._descriptionService.unregisterDescriptions(functionList);
    }
}
