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

import type { IAccessor, IRange } from '@univerjs/core';
import type { IAddSheetTableCommandParams } from '@univerjs/sheets-table';
import { CommandType, ICommandService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { expandToContinuousRange, getSheetCommandTarget, isSingleCellSelection, SheetsSelectionsService } from '@univerjs/sheets';
import { AddSheetTableCommand } from '@univerjs/sheets-table';
import { IDialogService } from '@univerjs/ui';
import { TABLE_SELECTOR_DIALOG } from '../../const';

export const OpenTableSelectorOperation = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.open-table-selector',
    async handler(accessor: IAccessor) {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) {
            return false;
        }

        const { unitId, subUnitId, worksheet } = target;
        const sheetsSelectionsService = accessor.get(SheetsSelectionsService);

        const lastSelection = sheetsSelectionsService.getCurrentLastSelection();
        const range = lastSelection?.range ?? { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };

        const isSingleCell = isSingleCellSelection(lastSelection);
        const extendedRange = isSingleCell ? expandToContinuousRange(range, { up: true, left: true, right: true, down: true }, worksheet) : range;

        const rangeInfo = await openRangeSelector(accessor, unitId, subUnitId, extendedRange);
        if (!rangeInfo) {
            return false;
        }

        commandService.executeCommand<IAddSheetTableCommandParams>(AddSheetTableCommand.id, { ...rangeInfo });

        return true;
    },
};

export interface ITableSelectionInfo {
    unitId: string;
    subUnitId: string;
    range: IRange;
    tableId?: string;
}

export async function openRangeSelector(
    accessor: IAccessor,
    unitId: string,
    subUnitId: string,
    range: IRange,
    tableId?: string
): Promise<ITableSelectionInfo | null> {
    const dialogService = accessor.get(IDialogService);
    const localeService = accessor.get(LocaleService);

    return new Promise((resolve) => {
        const dialogProps = {
            unitId,
            subUnitId,
            range,
            tableId,
            onConfirm: (info: ITableSelectionInfo) => {
                resolve(info);
                dialogService.close(TABLE_SELECTOR_DIALOG);
            },
            onCancel: () => {
                resolve(null);
                dialogService.close(TABLE_SELECTOR_DIALOG);
            },
        };
        dialogService.open({
            id: TABLE_SELECTOR_DIALOG,
            title: { title: localeService.t('sheets-table.selectRange') },
            draggable: true,
            destroyOnClose: true,
            mask: false,
            maskClosable: false,
            children: {
                label: {
                    name: TABLE_SELECTOR_DIALOG,
                    props: dialogProps,
                },
            },
            width: 300,
            onClose: () => {
                resolve(null);
                dialogService.close(TABLE_SELECTOR_DIALOG);
            },
        });
    });
}
