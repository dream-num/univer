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
import type { IFunctionInfo, ISetSuperTableMutationParam, ISetSuperTableMutationSearchParam } from '@univerjs/engine-formula';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { FunctionType, ISuperTableService, RemoveSuperTableMutation, serializeRangeWithSheet, SetSuperTableMutation } from '@univerjs/engine-formula';
import { SetWorksheetActiveOperation } from '@univerjs/sheets';

import { IDescriptionService } from '../services/description.service';

/**
 * header highlight
 * column menu: show, hover and mousedown event
 */
export class SuperTableController extends Disposable {
    private _preUnitId: Nullable<string> = null;

    constructor(
        @IDescriptionService private readonly _descriptionService: IDescriptionService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @ISuperTableService private readonly _superTableService: ISuperTableService

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
            this._superTableService.update$.subscribe(() => {
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
                else if (command.id === SetSuperTableMutation.id) {
                    const param = command.params as ISetSuperTableMutationParam;
                    this._registerDescription(param);
                } else if (command.id === RemoveSuperTableMutation.id) {
                    const param = command.params as ISetSuperTableMutationSearchParam;
                    this._unregisterDescription(param);
                }
            })
        );
    }

    private _registerDescription(param: ISetSuperTableMutationParam) {
        const { unitId, sheetId } = this._getUnitIdAndSheetId();

        if (unitId == null || sheetId == null) {
            return;
        }

        const { tableName, reference } = param;
        if (!this._descriptionService.hasDescription(tableName)) {
            const sheetName = this._univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetId(reference.sheetId)?.getName() || '';
            const refString = serializeRangeWithSheet(sheetName, reference.range);
            this._descriptionService.registerDescriptions([{
                functionName: tableName,
                description: refString,
                abstract: refString,
                functionType: FunctionType.Table,
                functionParameter: [],
            }]);
        }
    }

    private _unregisterDescription(param: ISetSuperTableMutationSearchParam) {
        const { tableName } = param;
        this._descriptionService.unregisterDescriptions([tableName]);
    }

    private _unRegisterDescriptions() {
        if (this._preUnitId == null) {
            return;
        }
        const superTables = this._superTableService.getTableMap(this._preUnitId);

        if (superTables == null) {
            return;
        }

        const functionList: string[] = [];
        superTables.forEach((_, tableName) => {
            functionList.push(tableName);
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

        const superTables = this._superTableService.getTableMap(unitId);
        if (!superTables) {
            return;
        }

        const functionList: IFunctionInfo[] = [];

        this._preUnitId = unitId;

        superTables.forEach((table, tableName) => {
            const sheetName = this._univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetId(table.sheetId)?.getName() || '';
            const refString = serializeRangeWithSheet(sheetName, table.range);
            if (!this._descriptionService.hasDescription(tableName)) {
                functionList.push({
                    functionName: tableName,
                    description: refString,
                    abstract: refString,
                    functionType: FunctionType.Table,
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

        const superTables = this._superTableService.getTableMap(unitId);
        if (!superTables) {
            return;
        }

        const functionList: string[] = [];

        superTables.forEach((_, tableName) => {
            functionList.push(tableName);
        });

        this._descriptionService.unregisterDescriptions(functionList);
    }
}
