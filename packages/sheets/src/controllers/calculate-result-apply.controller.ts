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

import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { ISetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { SetFormulaCalculationResultMutation } from '@univerjs/engine-formula';

import { SetRangeValuesMutation } from '../commands/mutations/set-range-values.mutation';

@OnLifecycle(LifecycleStages.Ready, CalculateResultApplyController)
export class CalculateResultApplyController extends Disposable {
    constructor(@ICommandService private readonly _commandService: ICommandService) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== SetFormulaCalculationResultMutation.id) {
                    return;
                }

                const params = command.params as ISetFormulaCalculationResultMutation;

                const { unitData, unitOtherData } = params;

                const unitIds = Object.keys(unitData);

                // Update each calculated value, possibly involving all cells
                const redoMutationsInfo: ICommandInfo[] = [];

                unitIds.forEach((unitId) => {
                    const sheetData = unitData[unitId];

                    if (sheetData == null) {
                        return true;
                    }

                    const sheetIds = Object.keys(sheetData);

                    sheetIds.forEach((sheetId) => {
                        const cellData = sheetData[sheetId];

                        // const arrayFormula = arrayFormulaRange[unitId][sheetId];

                        if (cellData == null) {
                            return true;
                        }

                        const setRangeValuesMutation = {
                            subUnitId: sheetId,
                            unitId,
                            cellValue: cellData,
                        };

                        redoMutationsInfo.push({
                            id: SetRangeValuesMutation.id,
                            params: setRangeValuesMutation,
                        });
                    });
                });

                const result = redoMutationsInfo.every((m) =>
                    this._commandService.executeCommand(m.id, m.params, {
                        onlyLocal: true,
                    })
                );
                return result;
            })
        );
    }
}
