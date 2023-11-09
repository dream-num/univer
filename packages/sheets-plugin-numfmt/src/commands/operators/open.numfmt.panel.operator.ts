import { SelectionManagerService } from '@univerjs/base-sheets';
import { ISidebarService } from '@univerjs/base-ui';
import { CommandType, ICommand, ICommandService, IUniverInstanceService, Range } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SHEET_NUMFMT_PLUGIN } from '../../base/const/PLUGIN_NAME';
import { SheetNumfmtPanelProps } from '../../components';
import { NumfmtService } from '../../service/numfmt.service';
import { SetNumfmtMutation, SetNumfmtMutationParams } from '../mutations/set.numfmt.mutation';
import { CloseNumfmtPanelOperator } from './close.numfmt.panel.operator';

export const OpenNumfmtPanelOperator: ICommand = {
    id: 'sheet.open.numfmt.panel.operator',
    type: CommandType.MUTATION,
    handler: async (accessor: IAccessor) => {
        const sidebarService = accessor.get(ISidebarService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const numfmtService = accessor.get(NumfmtService);

        const selections = selectionManagerService.getSelectionRanges() || [];
        const range = selections[0];

        if (!range) {
            return false;
        }
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();

        const cellValue = sheet.getCell(range.startRow, range.startColumn);
        const numfmtValue = numfmtService.getValue(
            workbook.getUnitId(),
            sheet.getSheetId(),
            range.startRow,
            range.startColumn
        );
        let pattern = '';

        if (numfmtValue) {
            pattern = numfmtValue.pattern;
        }
        const props: SheetNumfmtPanelProps = {
            onChange: (config) => {
                if (config.type === 'change') {
                    const selections = selectionManagerService.getSelectionRanges() || [];
                    const params: SetNumfmtMutationParams = { values: [] };
                    selections.forEach((rangeInfo) => {
                        Range.foreach(rangeInfo, (row, col) => {
                            params.values.push({ row: String(row), col: String(col), pattern: config.value });
                        });
                    });
                    commandService.executeCommand(SetNumfmtMutation.id, params);
                }
                commandService.executeCommand(CloseNumfmtPanelOperator.id);
            },
            value: { defaultPattern: pattern, defaultValue: Number(cellValue?.v || '12345678') },
        };

        sidebarService.open({
            header: { title: '数据格式' },
            children: {
                label: SHEET_NUMFMT_PLUGIN,
                ...(props as any),
            },
        });
        return true;
    },
};
