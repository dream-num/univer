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

import type { ICommand, Workbook } from '@univerjs/core';
import { BooleanNumber, CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { ISetWorksheetHideMutationParams } from '../mutations/set-worksheet-hide.mutation';
import { SetWorksheetHideMutation, SetWorksheetHideMutationFactory } from '../mutations/set-worksheet-hide.mutation';
import type { ISetWorksheetActiveOperationParams } from '../operations/set-worksheet-active.operation';
import {
    SetWorksheetActiveOperation,
    // SetWorksheetUnActivateMutationFactory,
} from '../operations/set-worksheet-active.operation';
import { getSheetCommandTarget } from './__tests__/broken-test-functions';

export interface ISetWorksheetShowCommandParams {
    unitId: string;
    subUnitId: string;
    value?: string;
}

export class BranchCoverage {
    static coverage = new BranchCoverage("SetWorksheetShowCommand", 11)

    branches: boolean[];
    functionName: string;

    constructor(functionName: string, branchCount: number) {
        this.functionName = functionName;
        this.branches = new Array<boolean>(branchCount).fill(false);
    }

    public printCoverage(): void {
        const totalCovered = this.branches.filter(Boolean).length;
        console.log("--- COVERAGE REPORT ---")
        console.log(`Function         : ${this.functionName}`)
        console.log(`Branches covered : ${totalCovered}`)
        console.log(`Branches total   : ${this.branches.length}`)
        console.log(`Percentage       : ${totalCovered * 100 / this.branches.length}%`)
        this.branches.forEach((value, index) => {
            console.log(`Branch ${index}: ${value ? "Hit" : "Miss"}`)
        })
    }
}

export const SetWorksheetShowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-show',

    handler: async (accessor: IAccessor, params: ISetWorksheetShowCommandParams) => {
        BranchCoverage.coverage.branches[0] = true;

        const { unitId, subUnitId } = params;

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) {
            BranchCoverage.coverage.branches[1] = true;
            return false;
        } else {
            BranchCoverage.coverage.branches[2] = true;
        }

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        if (!workbook) {
            BranchCoverage.coverage.branches[3] = true;
            return false;
        } else {
            BranchCoverage.coverage.branches[4] = true;
        }
        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            BranchCoverage.coverage.branches[5] = true;
            return false;
        } else {
            BranchCoverage.coverage.branches[6] = true;
        }

        const hidden = worksheet.getConfig().hidden;
        if (hidden === BooleanNumber.FALSE) {
            BranchCoverage.coverage.branches[7] = true;
            return false;
        } else {
            BranchCoverage.coverage.branches[8] = true;
        }

        const redoMutationParams: ISetWorksheetHideMutationParams = {
            unitId,
            subUnitId,
            hidden: BooleanNumber.FALSE,
        };

        const undoMutationParams = SetWorksheetHideMutationFactory(accessor, redoMutationParams);
        const result = commandService.syncExecuteCommand(SetWorksheetHideMutation.id, redoMutationParams);

        const activeSheetMutationParams: ISetWorksheetActiveOperationParams = {
            unitId,
            subUnitId,
        };

        // const unActiveMutationParams = SetWorksheetUnActivateMutationFactory(accessor, activeSheetMutationParams);
        const activeResult = commandService.syncExecuteCommand(
            SetWorksheetActiveOperation.id,
            activeSheetMutationParams
        );

        if (result && activeResult) {
            BranchCoverage.coverage.branches[9] = true;
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    { id: SetWorksheetHideMutation.id, params: undoMutationParams },
                    // { id: SetWorksheetActiveOperation.id, params: unActiveMutationParams },
                ],
                redoMutations: [
                    // { id: SetWorksheetActiveOperation.id, params: activeSheetMutationParams },
                    { id: SetWorksheetHideMutation.id, params: redoMutationParams },
                ],
            });
            return true;
        } else {
            BranchCoverage.coverage.branches[10] = true;
        }

        return false;
    },
};
