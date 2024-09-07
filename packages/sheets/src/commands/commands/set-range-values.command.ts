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

import type { IAccessor, ICellData, ICommand, IObjectMatrixPrimitiveType, IRange } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IPermissionService,
    isICellData,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    sequenceExecute,
    Tools,
} from '@univerjs/core';

import { SheetsSelectionsService } from '../../services/selections/selection-manager.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';
import type { ISheetCommandSharedParams } from '../utils/interface';
import { WorksheetEditPermission } from '../../services/permission/permission-point';
import { getSheetCommandTarget } from './utils/target-util';

export interface ISetRangeValuesCommandParams extends Partial<ISheetCommandSharedParams> {
    range?: IRange;

    /**
     * 1. ICellData: Normal cell data
     * 2. ICellData[][]: The two-dimensional array indicates the data of multiple cells
     * 3. IObjectMatrixPrimitiveType<ICellData>: Bring the row/column information MATRIX, indicating the data of multiple cells
     */
    value: ICellData | ICellData[][] | IObjectMatrixPrimitiveType<ICellData>;
}

/**
 * The command to set values for ranges.
 */
export const SetRangeValuesCommand: ICommand = {
    id: 'sheet.command.set-range-values',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: (accessor: IAccessor, params: ISetRangeValuesCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const permissionService = accessor.get(IPermissionService);

        // use subUnitId and unitId from params first
        const target = getSheetCommandTarget(univerInstanceService, {
            subUnitId: params.subUnitId,
            unitId: params.unitId,
        });
        if (!target) {
            return false;
        }
        const { subUnitId, unitId } = target;

        const { value, range } = params;
        const currentSelections = range ? [range] : selectionManagerService.getCurrentSelections()?.map((s) => s.range);

        if (!currentSelections || !currentSelections.length) {
            return false;
        }

        if (!permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)) {
            return false;
        }

        const cellValue = new ObjectMatrix<ICellData>();
        let realCellValue: IObjectMatrixPrimitiveType<ICellData> | undefined;

        if (Tools.isArray(value)) {
            for (let i = 0; i < currentSelections.length; i++) {
                const { startRow, startColumn, endRow, endColumn } = currentSelections[i];

                for (let r = 0; r <= endRow - startRow; r++) {
                    for (let c = 0; c <= endColumn - startColumn; c++) {
                        cellValue.setValue(r + startRow, c + startColumn, value[r][c]);
                    }
                }
            }
        } else if (isICellData(value)) {
            for (let i = 0; i < currentSelections.length; i++) {
                const { startRow, startColumn, endRow, endColumn } = currentSelections[i];

                for (let r = startRow; r <= endRow; r++) {
                    for (let c = startColumn; c <= endColumn; c++) {
                        cellValue.setValue(r, c, value);
                    }
                }
            }
        } else {
            realCellValue = value as IObjectMatrixPrimitiveType<ICellData>;
        }

        const setRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: realCellValue ?? cellValue.getMatrix(),
        };
        const undoSetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(accessor, setRangeValuesMutationParams);

        // if (
        //     !sheetInterceptorService.fetchThroughInterceptors(INTERCEPTOR_POINT.PERMISSION)(null, {
        //         id: SetRangeValuesCommand.id,
        //         params: setRangeValuesMutationParams,
        //     })
        // ) {
        //     return false;
        // }

        const setValueMutationResult = commandService.syncExecuteCommand(
            SetRangeValuesMutation.id,
            setRangeValuesMutationParams
        );

        // may cause performance issues
        const { undos, redos } = sheetInterceptorService.onCommandExecute({
            id: SetRangeValuesCommand.id,
            params: { ...setRangeValuesMutationParams, range: currentSelections },
        });

        const result = sequenceExecute([...redos], commandService);

        if (setValueMutationResult && result.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetRangeValuesMutation.id, params: undoSetRangeValuesMutationParams }, ...undos],
                redoMutations: [{ id: SetRangeValuesMutation.id, params: setRangeValuesMutationParams }, ...redos],
            });

            return true;
        }

        return false;
    },
};
