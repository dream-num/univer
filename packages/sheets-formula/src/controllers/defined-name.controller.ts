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

import type { ICommandInfo, IExecutionOptions, Workbook } from '@univerjs/core';
import type { IDefinedNamesUpdateEvent, IFunctionInfo, ISetDefinedNameMutationParam } from '@univerjs/engine-formula';
import type { ISetWorksheetActiveOperationParams } from '@univerjs/sheets';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import {
    FunctionType,
    IDefinedNamesService,
    RemoveDefinedNameMutation,
    SetDefinedNameMutation,
} from '@univerjs/engine-formula';
import {
    getSheetCommandTarget,
    SCOPE_WORKBOOK_VALUE_DEFINED_NAME,
    SetWorksheetActiveOperation,
} from '@univerjs/sheets';
import { IDescriptionService } from '../services/description.service';

/**
 * header highlight
 * column menu: show, hover and mousedown event
 */
export class DefinedNameController extends Disposable {
    private _preUnitId: string | null = null;

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
        this.disposeWithMe(
            toDisposable(
                this._definedNamesService.update$.subscribe((event) => {
                    this._updateDescriptions(event);
                })
            )
        );
    }

    private _changeUnitListener() {
        this.disposeWithMe(
            toDisposable(
                this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
                    this._unRegisterDescriptions();
                    if (workbook) {
                        this._initRegisterDescriptions(workbook.getUnitId());
                    }
                })
            )
        );
    }

    private _changeSheetListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo, options?: IExecutionOptions) => {
                if (options?.fromCollab) {
                    return;
                }

                if (command.id === SetWorksheetActiveOperation.id) {
                    const params = command.params as ISetWorksheetActiveOperationParams;
                    this._unregisterDescriptionsForNotInSheetId(params.unitId, params.subUnitId);
                    this._initRegisterDescriptions(params.unitId, params.subUnitId);
                } else if (command.id === SetDefinedNameMutation.id) {
                    // Since command interception will supplement mutation, it is necessary to monitor mutation changes here
                    // SetDefinedNameMutation and RemoveDefinedNameMutation already cover all possible Defined Name updates
                    const params = command.params as ISetDefinedNameMutationParam;
                    this._registerDescription(params);
                } else if (command.id === RemoveDefinedNameMutation.id) {
                    const params = command.params as ISetDefinedNameMutationParam;
                    this._unregisterDescription(params);
                }
            })
        );
    }

    private _updateDescriptions(event: IDefinedNamesUpdateEvent) {
        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) return;

        const { unitId, subUnitId } = target;
        const { type, unitId: updateUnitId, definedNames } = event;

        if (updateUnitId !== unitId) {
            return;
        }

        if (type === 'update') {
            const functionList: IFunctionInfo[] = [];

            definedNames.forEach((definedName) => {
                const { name, comment, formulaOrRefString, localSheetId } = definedName;
                if (localSheetId == null || localSheetId === SCOPE_WORKBOOK_VALUE_DEFINED_NAME || localSheetId === subUnitId) {
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
        } else if (type === 'remove') {
            const functionList: string[] = [];

            definedNames.forEach((definedName) => {
                functionList.push(definedName.name);
            });

            this._descriptionService.unregisterDescriptions(functionList);
        }
    }

    private _registerDescription(params: ISetDefinedNameMutationParam) {
        const target = getSheetCommandTarget(this._univerInstanceService, params);
        if (!target) return;

        const { subUnitId } = target;
        const { name, comment, formulaOrRefString, localSheetId } = params;

        if (this._descriptionService.hasDescription(name)) {
            return;
        }

        if (localSheetId == null || localSheetId === SCOPE_WORKBOOK_VALUE_DEFINED_NAME || localSheetId === subUnitId) {
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
        if (this._preUnitId === null) {
            return;
        }

        const definedNames = this._definedNamesService.getDefinedNameMap(this._preUnitId);
        if (!definedNames) {
            return;
        }

        const functionList: string[] = [];
        Object.values(definedNames).forEach((value) => {
            const { name } = value;
            functionList.push(name);
        });

        this._descriptionService.unregisterDescriptions(functionList);

        this._preUnitId = null;
    }

    private _initRegisterDescriptions(unitId: string, subUnitId?: string) {
        const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
        if (!target) return;

        const { unitId: _unitId, subUnitId: _subUnitId } = target;

        const definedNames = this._definedNamesService.getDefinedNameMap(_unitId);
        if (!definedNames) {
            return;
        }

        const functionList: IFunctionInfo[] = [];

        this._preUnitId = _unitId;

        Object.values(definedNames).forEach((value) => {
            const { name, comment, formulaOrRefString, localSheetId } = value;

            if (this._descriptionService.hasDescription(name)) {
                return;
            }

            if (localSheetId == null || localSheetId === SCOPE_WORKBOOK_VALUE_DEFINED_NAME || localSheetId === _subUnitId) {
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

    private _unregisterDescriptionsForNotInSheetId(unitId: string, subUnitId: string) {
        const definedNames = this._definedNamesService.getDefinedNameMap(unitId);
        if (!definedNames) {
            return;
        }

        const functionList: string[] = [];

        Object.values(definedNames).forEach((value) => {
            const { name, localSheetId } = value;
            if (localSheetId !== SCOPE_WORKBOOK_VALUE_DEFINED_NAME && localSheetId !== subUnitId) {
                functionList.push(name);
            }
        });

        this._descriptionService.unregisterDescriptions(functionList);
    }
}
