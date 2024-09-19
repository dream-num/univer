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

import {
    Disposable,
    Inject,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    UniverInstanceType,
} from '@univerjs/core';
import { handleRefStringInfo, IDefinedNamesService, RemoveDefinedNameMutation, SetDefinedNameMutation } from '@univerjs/engine-formula';
import { RemoveSheetCommand, SheetInterceptorService } from '@univerjs/sheets';
import type { ICommandInfo, IMutationInfo, Workbook } from '@univerjs/core';
import type { ISetDefinedNameMutationParam } from '@univerjs/engine-formula';
import type { IRemoveSheetCommandParams } from '@univerjs/sheets';

@OnLifecycle(LifecycleStages.Rendered, DefinedNameUpdateController)
export class DefinedNameUpdateController extends Disposable {
    constructor(
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService

    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        // remove defined name when sheet is removed
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (command) => this._getUpdateDefinedName(command),
            })
        );
    }

    private _getUpdateDefinedName(command: ICommandInfo) {
        const { id } = command;

        if (id === RemoveSheetCommand.id) {
            const { unitId, subUnitId } = command.params as IRemoveSheetCommandParams;

            if (!unitId || !subUnitId) {
                return {
                    redos: [],
                    undos: [],
                };
            }

            const definedNames = this._definedNamesService.getDefinedNameMap(unitId);
            if (!definedNames) {
                return {
                    redos: [],
                    undos: [],
                };
            }

            const redoMutations: IMutationInfo<ISetDefinedNameMutationParam>[] = [];
            const undoMutations: IMutationInfo<ISetDefinedNameMutationParam>[] = [];
            Array.from(Object.values(definedNames)).forEach((value) => {
                const { formulaOrRefString } = value;

                const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                if (workbook == null) {
                    return;
                }

                // Do not use localSheetId. localSheetId may be SCOPE_WORKBOOK_VALUE, which cannot indicate the sheet where the current defined name is located.
                const { sheetName } = handleRefStringInfo(formulaOrRefString);
                const sheetId = workbook.getSheetBySheetName(sheetName)?.getSheetId();

                if (sheetId === subUnitId) {
                    redoMutations.push({
                        id: RemoveDefinedNameMutation.id,
                        params: {
                            unitId,
                            ...value,
                        },
                    });

                    undoMutations.push({
                        id: SetDefinedNameMutation.id,
                        params: {
                            unitId,
                            ...value,
                        },
                    });
                }
            });
            return {
                redos: redoMutations,
                undos: undoMutations,
            };
        }

        return {
            redos: [],
            undos: [],
        };
    }
}
