import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { FormatType } from '../../base/types';
import { NumfmtService } from '../../service/numfmt.service';

export const factorySetNumfmtUndoMutation = (
    accessor: IAccessor,
    option: SetNumfmtMutationParams
): SetNumfmtMutationParams => {
    const numfmtService = accessor.get(NumfmtService);
    const undos: SetNumfmtMutationParams = {
        ...option,
        values: option.values.map((item) => {
            const { row, col } = item;
            const oldValue = numfmtService.getValue(option.workbookId, option.worksheetId, row, col);
            return { pattern: oldValue?.pattern, type: oldValue?.type, row, col };
        }),
    };
    return undos;
};

export type SetNumfmtMutationParams = {
    values: Array<{ pattern?: string; row: number; col: number; type?: FormatType }>;
    workbookId: string;
    worksheetId: string;
};

export const SetNumfmtMutation: ICommand<SetNumfmtMutationParams> = {
    id: 'sheet.mutation.set-numfmt',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params) => {
        if (!params) {
            return false;
        }
        const values = params.values;
        const numfmtService = accessor.get(NumfmtService);
        const workbookId = params.workbookId;
        const sheetId = params.worksheetId;
        values.forEach((item) => {
            const value = item.pattern ? { pattern: item.pattern!, type: item.type! } : null;
            numfmtService.setValue(workbookId, sheetId, Number(item.row), Number(item.col), value);
        });
        return true;
    },
};
