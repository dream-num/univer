import { SelectionManagerService } from '@univerjs/base-sheets';
import { ISidebarService } from '@univerjs/base-ui';
import {
    CellValueType,
    CommandType,
    ICommand,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    Range,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SHEET_NUMFMT_PLUGIN } from '../../base/const/PLUGIN_NAME';
import { SheetNumfmtPanelProps } from '../../components';
import { NumfmtService } from '../../service/numfmt.service';
import { getPatternType } from '../../utils/pattern';
import { SetNumfmtCommand, SetNumfmtCommandParams } from '../commands/set.numfmt.command';
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
        const localeService = accessor.get(LocaleService);

        const selections = selectionManagerService.getSelectionRanges() || [];
        const range = selections[0];

        if (!range) {
            return false;
        }
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();

        const cellValue = sheet.getCellRaw(range.startRow, range.startColumn);
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
        // eslint-disable-next-line no-magic-numbers
        const defaultValue = (cellValue?.t === CellValueType.NUMBER ? cellValue.v : 12345678) as number;

        const props: SheetNumfmtPanelProps = {
            onChange: (config) => {
                if (config.type === 'change') {
                    const selections = selectionManagerService.getSelectionRanges() || [];
                    const params: SetNumfmtCommandParams = { values: [] };
                    const patternType = getPatternType(config.value);

                    selections.forEach((rangeInfo) => {
                        Range.foreach(rangeInfo, (row, col) => {
                            params.values.push({
                                row,
                                col,
                                pattern: config.value,
                                type: patternType,
                            });
                        });
                    });
                    commandService.executeCommand(SetNumfmtCommand.id, params);
                }
                commandService.executeCommand(CloseNumfmtPanelOperator.id);
            },
            value: { defaultPattern: pattern, defaultValue },
        };

        sidebarService.open({
            header: { title: localeService.t('sheet.numfmt.title') },
            children: {
                label: SHEET_NUMFMT_PLUGIN,
                ...(props as any),
            },
        });
        return true;
    },
};
