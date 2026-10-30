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

import type { CustomData, IAccessor, ICellData, ICommand, IRange } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '../utils/interface';
import {
    CommandType,
    ICommandService,
    IUniverInstanceService,
    ObjectMatrix,
    Tools,
} from '@univerjs/core';
import { SetRangeValuesMutation } from '../mutations/set-range-values.mutation';
import { getSheetCommandTarget } from './utils/target-util';

interface ICustomMetadata {
    custom: CustomData;
};

export interface ISetRangeCustomMetadataCommandParams extends Partial<ISheetCommandSharedParams> {
    range: IRange;
    customMetadata: ICustomMetadata | ICustomMetadata[][];
}

/**
 * The command to set custom metadata for a range of cells, and not support undo/redo.
 */
export const SetRangeCustomMetadataCommand: ICommand = {
    id: 'sheet.command.set-range-custom-metadata',
    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params: ISetRangeCustomMetadataCommandParams) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

        const commandService = accessor.get(ICommandService);
        const { unitId, subUnitId } = target;
        const { range, customMetadata } = params;

        const { startRow, startColumn, endRow, endColumn } = range;
        const isArray = Tools.isArray(customMetadata);
        const cellValue = new ObjectMatrix<ICellData>();

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const value = isArray ? (customMetadata as ICustomMetadata[][])[r - startRow][c - startColumn] : (customMetadata as ICustomMetadata);
                cellValue.setValue(r, c, value);
            }
        }

        return commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId,
            subUnitId,
            cellValue: cellValue.getMatrix(),
        });
    },
};
